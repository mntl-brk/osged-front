interface SecureImageProps {
  path: string | null
  alt?: string
  className?: string
}

export function SecureImage({ path, alt, className }: SecureImageProps) {
  if (!path) return null

  return (
    <img
      src={`/api/media/${path}`}
      alt={alt}
      className={className}
    />
  )
}