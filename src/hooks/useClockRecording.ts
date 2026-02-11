import { useEffect, useRef } from 'react'

export function useClockRecording(enabled: boolean) {
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (!enabled) return

    let mounted = true

    const start = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }, 
        audio: true,
      })

      if (!mounted) return

      streamRef.current = stream
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
      })

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.start()
      recorderRef.current = recorder
    }

    start()

    return () => {
      mounted = false
      recorderRef.current?.stop()
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [enabled])

  const stopAndGetVideo = async (): Promise<Blob | null> => {
    const recorder = recorderRef.current
    if (!recorder) return null

    if (recorder.state !== 'inactive') {
      recorder.stop()
    }

    return new Blob(chunksRef.current, { type: 'video/webm' })
  }

  return { stopAndGetVideo }
}