import { NextResponse } from 'next/server'

const BACKEND_BASE = process.env.BACKEND_API_URL!
const id = process.env.CF_ACCESS_CLIENT_ID!
const secret = process.env.CF_ACCESS_CLIENT_SECRET!

export async function POST(
  req: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  const {sessionId} = await context.params

  const body = await req.json()

  const res = await fetch(`${BACKEND_BASE}/minicog/${sessionId}/word_registration`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CF-Access-Client-Id': id,
      'CF-Access-Client-Secret': secret,
    },
    body: JSON.stringify(body),
  })

  return new NextResponse(await res.text(), {
    status: res.status,
  })
}