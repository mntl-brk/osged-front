export class BackendHttpError extends Error {
  constructor(
    public status: number,
    public payload: any
  ) {
    super(`Backend error ${status}`)
  }
}

export async function backendFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const BACKEND_BASE = process.env.BACKEND_API_URL!
  const id = process.env.CF_ACCESS_CLIENT_ID
  const secret = process.env.CF_ACCESS_CLIENT_SECRET

  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string> || {}),
    ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
  }

  // ใส่ CF header เฉพาะตอนที่มีค่า
  if (id && secret) {
    headers['CF-Access-Client-Id'] = id
    headers['CF-Access-Client-Secret'] = secret
  }

  const res = await fetch(`${BACKEND_BASE}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  })

  const contentType = res.headers.get('content-type')
  const payload = contentType?.includes('application/json')
    ? await res.json()
    : await res.text()

  if (!res.ok) {
    throw new BackendHttpError(res.status, payload)
  }

  return payload as T
}