import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/apiBackend'

export async function GET(
  _: Request,
   context: { params: Promise<{ minicogId: string }> }
) {

  const {minicogId} = await context.params
  const data = await backendFetch(
    `/minicog/${minicogId}/clock`
  )
  return NextResponse.json(data)
}