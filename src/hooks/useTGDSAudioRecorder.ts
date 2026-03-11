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
      'audio/mp4;codecs=mp4a',
      'audio/mp4',
      'audio/aac'
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return ''
  }

  /* ================= INIT MIC ================= */

  const initStream = async () => {
    if (streamRef.current) return streamRef.current

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1,
      },
    })

    streamRef.current = stream
    return stream
  }

  /* ================= START ================= */

  const start = useCallback(async () => {

    if (!enabled) return
    if (isRecording) return

    try {

      setError(null)
      chunksRef.current = []

      const stream = await initStream()

      const mimeType = getSupportedMimeType()

      if (!mimeType) {
        console.warn("No supported audio mime type")
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
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

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || 'audio/webm',
      })

      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
      recorderRef.current = null
      setIsRecording(false)

      resolve(blob)
    }

    // บังคับให้เบราว์เซอร์ส่งข้อมูลที่บันทึกค้างไว้เข้า ondataavailable ทันที
    try {
      recorder.requestData()
    } catch (e) {
      // ดักเผื่อในกรณีที่เบราว์เซอร์บางตัวไม่รองรับ requestData()
    }

    recorder.stop()
  })
}, [])

  /* ================= FORCE STOP ================= */

  const forceStop = useCallback(() => {

    recorderRef.current?.stop()

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