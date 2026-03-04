import { useEffect, useRef, useState, useCallback } from 'react'

interface Options {
  enabled: boolean
  uploadFn: (blob: Blob) => Promise<string>
}

export function useTGDSRecordingUpload({
  enabled,
  uploadFn,
}: Options) {
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const mimeTypeRef = useRef<string>('video/webm')

  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* ================= SAFE STOP ================= */

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      
      streamRef.current = null
    }
  }, [])

  const stopRecorder = useCallback(() => {
    const recorder = recorderRef.current
    if (!recorder) {
      stopStream()
      return
    }

    if (recorder.state !== 'inactive') {
      recorder.stop()
    }

    recorderRef.current = null
    stopStream()
  }, [stopStream])

  /* ================= START RECORDING ================= */

  const getSupportedMimeType = () => {
    const types = [
      'video/mp4;codecs=h264',
      'video/mp4',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return '' // browser default
  }

  const startRecording = useCallback(async () => {
    chunksRef.current = []
    setError(null)

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640, max: 640 },
        height: { ideal: 480, max: 480 },
        frameRate: { ideal: 24, max: 30 },
        facingMode: 'user',
      },
      audio: false,
    })

    streamRef.current = stream

    const mimeType = getSupportedMimeType()
    mimeTypeRef.current = mimeType

    const recorder = mimeType
      ? new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 1500000,
        })
      : new MediaRecorder(stream)

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    recorder.start()
    recorderRef.current = recorder
  }, [])

  /* ================= AUTO START ================= */

  useEffect(() => {
    if (!enabled) return

    startRecording()

    return () => {
      stopRecorder()
      stopStream()
    }
  }, [enabled, startRecording, stopRecorder, stopStream])

  /* ================= STOP + UPLOAD ================= */

  useEffect(() => {
    return () => {
      stopRecorder()
      stopStream()
    }
  }, [])

  const stopAndUpload = async (): Promise<string | undefined> => {
    const recorder = recorderRef.current
    if (!recorder) return undefined

    setIsUploading(true)

    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        resolve(
          new Blob(chunksRef.current, {
              type: mimeTypeRef.current || 'video/mp4',
          })
        )
      }

      if (recorder.state !== 'inactive') {
        recorder.stop()
      }
    })

    stopStream()
    recorderRef.current = null

    if (!blob || blob.size === 0) {
      setIsUploading(false)
      return undefined
    }

    try {
      const mediaId = await uploadFn(blob)
      return mediaId
    } catch {
      setError('upload_failed')
      return undefined
    } finally {
      setIsUploading(false)
    }
  }
  /* ================= HARD RESET ================= */

  const restartRecording = async () => {
    await stopRecorder()
    stopStream()

    chunksRef.current = []
    await startRecording()
  }

  return {
    stopAndUpload,
    restartRecording,
    isUploading,
    error,
  }
}