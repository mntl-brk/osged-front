import { useRef, useState, useCallback } from 'react'

interface Options {
  uploadFn: (blob: Blob) => Promise<string>
}

export function useTGDSRecordingUpload({ uploadFn }: Options) {
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const mimeTypeRef = useRef<string>('video/webm')

  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const getSupportedMimeType = () => {
    const types = [
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ]

    for (const t of types) {
      if (MediaRecorder.isTypeSupported(t)) return t
    }

    return ''
  }

  /* ================= START ================= */

  const startRecording = useCallback(async () => {
    if (isRecording) return

    chunksRef.current = []

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 480 },
        height: { ideal: 360 },
        frameRate: { ideal: 24 },
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
          videoBitsPerSecond: 700000,
        })
      : new MediaRecorder(stream)

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    recorder.start()

    recorderRef.current = recorder
    setIsRecording(true)

  }, [isRecording])

  /* ================= STOP ================= */

  const stopAndUpload = useCallback(async (): Promise<string | undefined> => {
    const recorder = recorderRef.current
    if (!recorder) return

    setIsUploading(true)

    const blob = await new Promise<Blob>((resolve) => {

      recorder.onstop = () => {

        const videoBlob = new Blob(chunksRef.current, {
          type: mimeTypeRef.current || 'video/webm'
        })

        resolve(videoBlob)
      }

      recorder.stop()

    })

    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    recorderRef.current = null
    setIsRecording(false)

    try {

      const mediaId = await uploadFn(blob)
      return mediaId

    } finally {

      setIsUploading(false)

    }

  }, [uploadFn])

  const destroyCamera = useCallback(() => {

  const recorder = recorderRef.current

  if (recorder && recorder.state !== 'inactive') {
    try {
      recorder.stop()
    } catch {}
  }

  streamRef.current?.getTracks().forEach(t => t.stop())

  recorderRef.current = null
  streamRef.current = null
  chunksRef.current = []

  setIsRecording(false)

}, [])

  return {
    startRecording,
    stopAndUpload,
    destroyCamera,
    isRecording,
    isUploading
  }
}