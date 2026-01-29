import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/apiBackend'

export async function GET(
  req: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params 

  const data = await backendFetch(`/participants/verify/${code}`)

  return NextResponse.json(data)
}