export async function POST(req: Request) {
  try {
    const backend = process.env.BACKEND_API_URL!;
    const body = await req.json();

    const resp = await fetch(`${backend}/emotions/analyze_segments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CF-Access-Client-Id": process.env.CF_ACCESS_CLIENT_ID!,
        "CF-Access-Client-Secret": process.env.CF_ACCESS_CLIENT_SECRET!,
      },
      body: JSON.stringify(body),
    });

    const contentType = resp.headers.get("content-type") || "application/json";
    const text = await resp.text();

    return new Response(text, {
      status: resp.status,
      headers: { "content-type": contentType },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Proxy failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    });
  }
}