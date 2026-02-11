import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/apiBackend'

export async function POST(
  req: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await context.params
  const body = await req.json()

  const data = await backendFetch(
    `/sessions/${sessionId}/minicog/complete`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  )

  return NextResponse.json(data)
}