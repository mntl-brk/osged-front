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
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)

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

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp9', // browser-safe
    })

    mediaRecorderRef.current = recorder
    chunksRef.current = []
    setRecordedBlob(null)

    recorder.ondataavailable = e => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: 'video/webm',
      })

      setRecordedBlob(blob)
      setHasRecorded(true)
      chunksRef.current = []
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
    recordedBlob,     
    startCamera,
    startRecording,
    stopRecording,
    cleanup,
  }
}