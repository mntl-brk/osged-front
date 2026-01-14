'use client'

import { useRef, useState, useEffect } from 'react'

export const useCameraRecorder = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [isRecording, setIsRecording] = useState(false)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [cameraError, setCameraError] = useState(false)

  /* =========================
     Camera Control
  ========================== */

  const startCamera = async () => {
    if (streamRef.current) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setCameraError(false)
    } catch (err) {
      console.error('Camera error:', err)
      setCameraError(true)
    }
  }

  const stopCamera = () => {
    if (!streamRef.current) return

    streamRef.current.getTracks().forEach(track => track.stop())
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  /* =========================
     Recording Control
  ========================== */

  const startRecording = async () => {
    if (isRecording) return

    if (!streamRef.current) {
      await startCamera()
    }

    if (!streamRef.current) return

    const recorder = new MediaRecorder(streamRef.current)
    mediaRecorderRef.current = recorder
    chunksRef.current = []

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.start()
    setIsRecording(true)
  }

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current

    if (recorder && recorder.state === 'recording') {
      recorder.stop()
    }

    mediaRecorderRef.current = null
    setIsRecording(false)
    setHasRecorded(true)
    stopCamera()
  }


  const cleanup = () => {
    try {
      stopRecording()
    } catch {}
    stopCamera()
  }

  useEffect(() => {
    return () => cleanup()
  }, [])

  return {
    videoRef,
    isRecording,
    hasRecorded,
    cameraError,
    startCamera,
    startRecording,
    stopRecording,
    cleanup,
  }
}