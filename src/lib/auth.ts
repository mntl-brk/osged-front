import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const token = (await cookies()).get('access_token')?.value

  if (!token) redirect('/login')

  const res = await fetch(
    `${process.env.BACKEND_API_URL}/admin/me`,
    {
      headers: { 
        Cookie: `access_token=${token}`,
        'CF-Access-Client-Id': process.env.CF_ACCESS_CLIENT_ID!,
        'CF-Access-Client-Secret': process.env.CF_ACCESS_CLIENT_SECRET!,
     },
      cache: 'no-store',
      
    }
  )

  if (!res.ok) redirect('/login')

  return await res.json()
}