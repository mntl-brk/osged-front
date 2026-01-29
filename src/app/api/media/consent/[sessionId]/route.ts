import { NextResponse } from 'next/server'

export async function POST(
  req: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await context.params

  const backendUrl =
    `${process.env.BACKEND_API_URL}/media/upload-consent-video/${sessionId}`

  const res = await fetch(backendUrl, {
    method: 'POST',
    body: req.body,
    duplex: 'half',
    headers: {
      ...Object.fromEntries(req.headers),
    },
  } as any)

  const text = await res.text()

  return new NextResponse(text, {
    status: res.status,
    headers: {
      'Content-Type':
        res.headers.get('Content-Type') ?? 'application/json',
    },
  })
}