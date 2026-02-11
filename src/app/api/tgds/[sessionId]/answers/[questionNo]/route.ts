import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/apiBackend'

export async function PATCH(
  req: Request,
  context: { params: Promise<{ sessionId: string; questionNo: string }> }
) {
  const body = await req.json()
  const {sessionId, questionNo} = await context.params

  const data = await backendFetch(
    `/sessions/${sessionId}/tgds_json/answer/${questionNo}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    }
  )

  return NextResponse.json(data)
}