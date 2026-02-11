export function base64ToBlob(
  base64: string,
  mime?: string
): Blob {
  const [header, data] = base64.split(',')
  const contentType =
    mime ??
    header.match(/data:(.*);base64/)?.[1] ??
    'application/octet-stream'

  const binary = atob(data)
  const len = binary.length
  const bytes = new Uint8Array(len)

  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return new Blob([bytes], { type: contentType })
}