import { backendFetch } from '@/lib/apiBackend'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await context.params
  const body = await req.json()

  const data = await backendFetch(
    `/sessions/${sessionId}/minicog/recall/finalize`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  return NextResponse.json(data)
}