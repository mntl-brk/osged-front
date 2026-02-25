import { useCallback, useRef, useState } from 'react'

interface Options {
  enabled?: boolean
}

export function useTGDSAudioRecorder({ enabled = true }: Options = {}) {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* ================= MIME SAFE ================= */

  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return ''
  }

  /* ================= START ================= */

  const start = useCallback(async () => {
    if (!enabled) return
    if (isRecording) return

    try {
      setError(null)
      chunksRef.current = []

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        },
      })

      streamRef.current = stream

      const mimeType = getSupportedMimeType()

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onerror = () => {
        setError('recording_error')
      }

      recorder.start()

      recorderRef.current = recorder
      setIsRecording(true)

    } catch (err) {
      console.error(err)
      setError('permission_denied')
    }
  }, [enabled, isRecording])

  /* ================= STOP ================= */

  const stop = useCallback(async (): Promise<Blob | null> => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') {
      return null
    }

    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const finalBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })
        resolve(finalBlob)
      }

      recorder.stop()
    })

    // cleanup stream
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    recorderRef.current = null
    setIsRecording(false)

    return blob
  }, [])

  /* ================= FORCE STOP ================= */

  const forceStop = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }

    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    recorderRef.current = null
    setIsRecording(false)
  }, [])

  return {
    start,
    stop,
    forceStop,
    isRecording,
    error,
  }
}