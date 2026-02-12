import { NextRequest, NextResponse } from 'next/server'

const BACKEND_BASE = process.env.BACKEND_API_URL!

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params

  const filePath = path.join('/')

  const backendRes = await fetch(
    `${BACKEND_BASE}/doctor/media/${filePath}`,
    {
      headers: {
        cookie: req.headers.get('cookie') || '',
      },
      cache: 'no-store',
    }
  )

  if (!backendRes.ok) {
    return new NextResponse(null, { status: backendRes.status })
  }

  const blob = await backendRes.arrayBuffer()

  return new NextResponse(blob, {
    headers: {
      'Content-Type': backendRes.headers.get('content-type') || 'application/octet-stream',
    },
  })
}