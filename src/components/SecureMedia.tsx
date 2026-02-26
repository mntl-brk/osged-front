interface SecureMediaProps {
  path: string | null
  className?: string
}

export function SecureMedia({ path, className }: SecureMediaProps) {
  if (!path) return null

  const ext = path.split(".").pop()?.toLowerCase()

  const isAudio = ["wav", "mp3", "m4a", "ogg"].includes(ext || "")
  const isVideo = ["webm", "mp4", "mov"].includes(ext || "")

  const src = `/api/media/video_audio/${path}`

  if (isAudio) {
    return (
      <audio
        src={src}
        controls
        preload="metadata"
        className={className}
      />
    )
  }

  if (isVideo) {
    return (
      <video
        src={src}
        controls
        preload="metadata"
        className={className}
      />
    )
  }

  return null
}