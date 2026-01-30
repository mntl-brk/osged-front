const BACKEND_BASE = process.env.BACKEND_API_URL!

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
  const res = await fetch(`${BACKEND_BASE}${path}`, {
    ...options,
    headers: {
      ...(options?.headers || {}),
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
    },
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