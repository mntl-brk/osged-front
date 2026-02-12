import { backendFetch } from '@/lib/apiBackend'
import { NextResponse } from 'next/server'

export async function POST() {
  await backendFetch('/admin/logout', {
    method: 'POST',
  })

  const response = NextResponse.json({ success: true })

  response.cookies.set('access_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  })
  return response
}