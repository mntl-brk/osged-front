interface SecureVideoProps {
  path: string | null
  className?: string
}

export function SecureVideo({ path, className }: SecureVideoProps) {
  if (!path) return null

  return (
    <video controls className={className}>
      <source src={`/api/media/video/${path}`} />
    </video>
  )
}