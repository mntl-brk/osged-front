import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/apiBackend'

export async function POST(req: Request) {
  const body = await req.json()
  const { participant_id } = body
  
  if (!participant_id) {
    return NextResponse.json(
      { error: 'participant_id is required' },
      { status: 400 }
    )
  }
  
  const data = await backendFetch('/sessions/create', {
    method: 'POST',
    body: JSON.stringify({ participant_id }),
  })

  return NextResponse.json(data)
}