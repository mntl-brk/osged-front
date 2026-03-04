import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params
  const filePath = path.join('/')

  const range = req.headers.get('range');

  const backendRes = await fetch(
    `${process.env.BACKEND_API_URL}/doctor/video_audio/${filePath}`,
    {
      headers: {
        'CF-Access-Client-Id': process.env.CF_ACCESS_CLIENT_ID!,
        'CF-Access-Client-Secret': process.env.CF_ACCESS_CLIENT_SECRET!,
        ...(range && { range }),
      },
    }
  )

  if (!backendRes.ok && backendRes.status !== 206) {
    return new NextResponse("Error loading media", { status: backendRes.status });
  }

  const responseHeaders = new Headers();
    const headersToForward = [
    'content-type',
    'content-range',
    'accept-ranges',
    'content-length',
    'cache-control'
  ];

  headersToForward.forEach(header => {
    const value = backendRes.headers.get(header);
    if (value) responseHeaders.set(header, value);
  });

  return new NextResponse(backendRes.body, {
    status: backendRes.status,
    headers: responseHeaders,
  })
}