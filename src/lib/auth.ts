import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const token = (await cookies()).get('access_token')?.value

  if (!token) redirect('/login')

  const res = await fetch(
    `${process.env.BACKEND_API_URL}/admin/me`,
    {
      headers: { Cookie: `access_token=${token}` },
      cache: 'no-store',
    }
  )

  if (!res.ok) redirect('/login')

  return await res.json()
}