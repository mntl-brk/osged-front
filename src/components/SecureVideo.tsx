interface SecureVideoProps {
  path: string | null
  className?: string
}

export function SecureVideo({ path, className }: SecureVideoProps) {
  if (!path) return null

  return (
    <video
      src={`/api/media/video/${path}`}
      controls
      preload="metadata"
      className={className}
    />
  )
}