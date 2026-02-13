import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params
  const filePath = path.join('/')

  const backendRes = await fetch(
    `${process.env.BACKEND_API_URL}/doctor/video/${filePath}`,
    {
      headers: {
        cookie: req.headers.get('cookie') || '',
        range: req.headers.get('range') || '',
      },
      cache: 'no-store',
    }
  )

  return new NextResponse(backendRes.body, {
    status: backendRes.status,
    headers: {
      'Content-Type': backendRes.headers.get('content-type') || '',
      'Content-Range': backendRes.headers.get('content-range') || '',
      'Accept-Ranges': backendRes.headers.get('accept-ranges') || '',
      'Content-Length': backendRes.headers.get('content-length') || '',
    },
  })
}