import { NextRequest, NextResponse } from 'next/server'

const BACKEND_BASE = process.env.BACKEND_API_URL

export async function GET(req: NextRequest) {
  if (!BACKEND_BASE) {
    return NextResponse.json(
      { error: 'Backend URL not configured' },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(req.url)

  const search = searchParams.get('search') || ''
  const page = searchParams.get('page') || '1'
  const limit = searchParams.get('limit') || '20'

  const url = `${BACKEND_BASE}/doctor/dashboard?search=${encodeURIComponent(
    search
  )}&page=${page}&limit=${limit}`

  const backendRes = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
  })

  const payload = await backendRes.json()

  if (!backendRes.ok) {
    return NextResponse.json(payload, {
      status: backendRes.status,
    })
  }

  return NextResponse.json(payload)
}