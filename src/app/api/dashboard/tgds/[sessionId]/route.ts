import { NextRequest, NextResponse } from 'next/server'

const BACKEND_BASE = process.env.BACKEND_API_URL!

export async function GET(
  req: NextRequest,
  context : { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params

    const backendRes = await fetch(
      `${BACKEND_BASE}/doctor/tgds/${sessionId}`,
      {
        method: 'GET',
        headers: {
          cookie: req.headers.get('cookie') ?? '',
          'CF-Access-Client-Id': process.env.CF_ACCESS_CLIENT_ID!,
          'CF-Access-Client-Secret': process.env.CF_ACCESS_CLIENT_SECRET!,
        },
        cache: 'no-store', 
      }
    )

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch TGDS detail' },
        { status: backendRes.status }
      )
    }

    const data = await backendRes.json()

    return NextResponse.json(data, {
      status: 200,
    })

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}