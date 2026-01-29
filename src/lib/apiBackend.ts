const BACKEND_BASE = process.env.BACKEND_API_URL;

export async function backendFetch(
  path: string,
  options?: RequestInit
) {
  const res = await fetch(`${BACKEND_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Backend error');
  }

  return res.json();
}