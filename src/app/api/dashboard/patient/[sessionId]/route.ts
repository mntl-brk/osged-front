import { backendFetch } from '@/lib/apiBackend'
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_BASE = process.env.BACKEND_API_URL!

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {

  const { sessionId } = await context.params
  const data = await backendFetch(`/doctor/patients/${sessionId}`)

  return NextResponse.json(data)
}

