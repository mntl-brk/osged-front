import { useEffect, useRef, useState, useCallback } from 'react'

interface Options {
  enabled: boolean
  uploadFn: (blob: Blob) => Promise<string>
  maxRetry?: number
}

export function useTGDSRecordingUpload({
  enabled,
  uploadFn,
  maxRetry = 2,
}: Options) {
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* ================= Start Recording ================= */

  const startRecording = useCallback(async () => {
    chunksRef.current = []
    setError(null)

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: true,
    })

    streamRef.current = stream

    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm',
    })

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    recorder.start()
    recorderRef.current = recorder
  }, [])

  useEffect(() => {
    if (!enabled) return

    startRecording()

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [enabled, startRecording])

  /* ================= Stop + Upload ================= */

  const stopAndUpload = async (): Promise<string | null> => {
    const recorder = recorderRef.current
    if (!recorder) return null

    setIsUploading(true)

    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        resolve(new Blob(chunksRef.current, { type: 'video/webm' }))
      }

      if (recorder.state !== 'inactive') {
        recorder.stop()
      }
    })

    streamRef.current?.getTracks().forEach(t => t.stop())

    if (!blob || blob.size === 0) {
      setIsUploading(false)
      return null
    }

    try {
      const mediaId = await uploadFn(blob)
      setIsUploading(false)
      return mediaId
    } catch {
      setIsUploading(false)
      setError('upload_failed')
      return null
    }
  }

  /* ================= HARD RESET ================= */

  const restartRecording = async () => {
    const recorder = recorderRef.current

    if (recorder && recorder.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve()
        recorder.stop()
      })
    }

    streamRef.current?.getTracks().forEach(t => t.stop())

    chunksRef.current = [] //  discard old clip

    await startRecording() //  start fresh
  }

  return {
    stopAndUpload,
    restartRecording,
    isUploading,
    error,
  }
}