import { useRef, useState } from "react"

const BACKEND_SOCKET = "osged-api.online"

export function useRealtimeSpeech() {

  const socketRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<AudioWorkletNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [transcript, setTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)

  const resetTranscript = () => setTranscript("")

  /* ================= SOCKET ================= */

  const connectSocket = () => {

    const protocol =
      window.location.protocol === "https:" ? "wss" : "wss"

    socketRef.current =
      new WebSocket(`${protocol}://${BACKEND_SOCKET}/ws/speech`)

    socketRef.current.onmessage = (event) => {

      const data = JSON.parse(event.data)

      if (!data.text || !data.isFinal) return

      setTranscript(prev =>
        prev ? `${prev} ${data.text}` : data.text
      )
    }

    socketRef.current.onclose = () => {

      if (!isListening) return

      reconnectTimerRef.current = setTimeout(() => {
        connectSocket()
      }, 1000)

    }

  }

  /* ================= START ================= */

  const startListening = async (stream?: MediaStream) => {

    if (isListening) return

    if (!stream) {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1
        }
      })
    }

    streamRef.current = stream

    connectSocket()

    const AudioContext =
      window.AudioContext ||
      (window as any).webkitAudioContext

    audioContextRef.current = new AudioContext({
      sampleRate: 16000
    })

    const source =
      audioContextRef.current.createMediaStreamSource(stream)

    await audioContextRef.current.audioWorklet.addModule(
      "/audioProcessor.js"
    )

    const workletNode = new AudioWorkletNode(
      audioContextRef.current,
      "pcm-processor"
    )

    source.connect(workletNode)

    workletNode.port.onmessage = (event) => {

      const pcm = event.data

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(pcm.buffer)
      }

    }

    setIsListening(true)

  }

  /* ================= STOP ================= */

  const stopListening = () => {

    processorRef.current?.disconnect()
    processorRef.current = null

    audioContextRef.current?.close()
    audioContextRef.current = null

    socketRef.current?.close()
    socketRef.current = null

    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
    }

    setIsListening(false)

  }

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript
  }

}