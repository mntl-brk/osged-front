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
            width: { ideal: 480, max: 480 },
            height: { ideal: 360, max: 360 },
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
        const mimeTypes = [
          'video/webm;codecs=vp8,opus',
          'video/webm;codecs=vp8',
          'video/webm'
        ]

        const supported = mimeTypes.find(t =>
          MediaRecorder.isTypeSupported(t)
        )

        if (!supported) {
          console.error('No supported recording format')
          return
        }

        mimeTypeRef.current = supported

        const recorder = new MediaRecorder(stream, {
          mimeType: supported,
          videoBitsPerSecond: 800000,
        })

        chunksRef.current = []

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data)
          }
        }

        recorder.start(2000)
        recorderRef.current = recorder

      } catch (err) {
        console.error('Clock recording error:', err)
      }
    }

    start()

    return () => {
      mounted = false

      try {
        if (recorderRef.current?.state !== 'inactive') {
          recorderRef.current?.stop()
        }
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

        chunksRef.current = []

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