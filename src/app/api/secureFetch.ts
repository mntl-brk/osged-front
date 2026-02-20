export function secureFetch(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'CF-Access-Client-Id': process.env.CF_ACCESS_CLIENT_ID!,
      'CF-Access-Client-Secret': process.env.CF_ACCESS_CLIENT_SECRET!,
    },
  })
}