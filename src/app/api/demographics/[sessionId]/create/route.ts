import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/apiBackend'

export async function POST(
  req: Request,
  context : { params: Promise<{ sessionId: string }> }
) {
  const body = await req.json()
  const {sessionId} = await context.params

  const data = await backendFetch(
    `/sessions/${sessionId}/demographics/create`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  )

  return NextResponse.json(data)
}