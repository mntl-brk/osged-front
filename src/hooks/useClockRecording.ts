import { useEffect, useRef } from 'react'

export function useClockRecording(enabled: boolean) {
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const mimeTypeRef = useRef<string>('video/webm')

  useEffect(() => {
    if (!enabled) return

    let mounted = true

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640, max: 640 },
            height: { ideal: 480, max: 480 },
            frameRate: { ideal: 24, max: 30 },
            facingMode: 'user',
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            channelCount: 1,
          },
        })

        if (!mounted) return

        streamRef.current = stream

        // ===== MIME SAFE CHECK =====
        let mimeType = 'video/webm;codecs=vp8'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4'
        }

        mimeTypeRef.current = mimeType

        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 800_000, // ลดขนาดไฟล์
        })

        chunksRef.current = []

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data)
          }
        }

        recorder.start()
        recorderRef.current = recorder

      } catch (err) {
        console.error('Clock recording error:', err)
      }
    }

    start()

    return () => {
      mounted = false

      try {
        recorderRef.current?.stop()
      } catch {}

      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [enabled])

  const stopAndGetVideo = async (): Promise<Blob | null> => {
    const recorder = recorderRef.current
    if (!recorder) return null

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeTypeRef.current,
        })

        // 🔥 หยุดกล้องชัวร์อีกครั้ง
        streamRef.current?.getTracks().forEach(t => t.stop())
        streamRef.current = null

        resolve(blob)
      }

      if (recorder.state !== 'inactive') {
        recorder.stop()
      } else {
        resolve(null)
      }
    })
  }

  return { stopAndGetVideo }
}