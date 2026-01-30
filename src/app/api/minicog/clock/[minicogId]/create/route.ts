import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/apiBackend'

export async function POST(req: Request, context: { params: Promise<{ minicogId: string }> } ) {
  const body = await req.json()
  const {minicogId} = await context.params

  const data = await backendFetch(`/minicog/${minicogId}/clock/create`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  return NextResponse.json(data)
}