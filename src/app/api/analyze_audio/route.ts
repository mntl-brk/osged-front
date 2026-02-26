export async function POST(req: Request) {
  try {
    const backend = process.env.BACKEND_API_URL
    if (!backend) {
      throw new Error("Missing BACKEND_API_URL")
    }

    const body = await req.json()

    if (!body?.path) {
      return new Response(
        JSON.stringify({ error: "Missing audio path" }),
        { status: 400 }
      )
    }

    const resp = await fetch(`${backend}/emotions_audio/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CF-Access-Client-Id": process.env.CF_ACCESS_CLIENT_ID!,
        "CF-Access-Client-Secret": process.env.CF_ACCESS_CLIENT_SECRET!,
      },
      body: JSON.stringify({
        path: body.path
      }),
    })

    const contentType =
      resp.headers.get("content-type") || "application/json"

    const text = await resp.text()

    return new Response(text, {
      status: resp.status,
      headers: {
        "content-type": contentType,
        "cache-control": "no-store",
      },
    })

  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Audio analyze proxy failed"

    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
        },
      }
    )
  }
}