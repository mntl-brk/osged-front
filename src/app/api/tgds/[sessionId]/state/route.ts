import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/apiBackend'

export async function GET(
  req: Request,
 context: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await context.params

  const data = await backendFetch(
    `/sessions/${sessionId}/tgds_json/state`,
    {
      method: 'GET',
    }
  )

  return NextResponse.json(data)
}