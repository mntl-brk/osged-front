import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  const backendRes = await fetch(
    `${process.env.BACKEND_API_URL}/admin/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Access-Client-Id': process.env.CF_ACCESS_CLIENT_ID!,
        'CF-Access-Client-Secret': process.env.CF_ACCESS_CLIENT_SECRET!,
      },
      body: JSON.stringify(body),
    }
  )

  if (!backendRes.ok) {
    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    )
  }

  const data = await backendRes.json()

  const response = NextResponse.json({ success: true })

  // set httpOnly cookie
  response.cookies.set('access_token', data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return response
}