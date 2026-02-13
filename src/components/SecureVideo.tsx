interface SecureVideoProps {
  path: string | null
  className?: string
}

export function SecureVideo({ path, className }: SecureVideoProps) {
  if (!path) return null
  return (
    <video
      src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/doctor/video/${path}`}
      controls
      preload="metadata"
      className={className}
    />
  )
}