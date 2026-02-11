import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/apiBackend'

export async function GET(
  _: Request,
   context: { params: Promise<{ sessionId: string }> }
) {

  const {sessionId} = await context.params
  const data = await backendFetch(
    `/sessions/${sessionId}/clock`
  )
  return NextResponse.json(data)
}