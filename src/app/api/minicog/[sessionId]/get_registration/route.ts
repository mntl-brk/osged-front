import { NextResponse } from 'next/server'


const BACKEND_BASE = process.env.BACKEND_API_URL!
const id = process.env.CF_ACCESS_CLIENT_ID
const secret = process.env.CF_ACCESS_CLIENT_SECRET

export async function GET(
  req: Request,
  context: { params: Promise<{ sessionId: string }> }
) {

  const { sessionId } = await context.params


  if (!id || !secret) {
    throw new Error('Cloudflare Access credentials missing')
  }

  const res = await fetch(
    `${BACKEND_BASE}/minicog/${sessionId}/get_registration`,
    {
      headers: {
        'CF-Access-Client-Id': id,
        'CF-Access-Client-Secret': secret,
      },
      cache: 'no-store',
    }
  )

  const data = await res.json()

  return NextResponse.json(data, { status: res.status })
}