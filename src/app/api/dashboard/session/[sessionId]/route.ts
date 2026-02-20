import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {

  const {sessionId} = await context.params
  
  const backendRes = await fetch(
    `${process.env.BACKEND_API_URL}/sessions/${sessionId}`,
    {
      method: 'DELETE',
      headers: {
        cookie: req.headers.get("cookie") || "",
        'CF-Access-Client-Id': process.env.CF_ACCESS_CLIENT_ID!,
        'CF-Access-Client-Secret': process.env.CF_ACCESS_CLIENT_SECRET!,
      },
    }
  )

  if (!backendRes.ok) {
    return NextResponse.json({ message: 'Delete failed' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}