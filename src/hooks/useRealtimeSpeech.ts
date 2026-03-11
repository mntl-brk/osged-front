import { useRef, useState } from "react"

const BACKEND_SOCKET = 'osged-api.online'

export function useRealtimeSpeech() {

  const socketRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [transcript, setTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)

  const [connectionState, setConnectionState] = useState<
    "idle" | "connecting" | "connected"
  >("idle")

  const resetTranscript = () => {
    setTranscript("")
  }

  const connectSocket = () => {

    setConnectionState("connecting")

    const protocol =
      window.location.protocol === "https:" ? "wss" : "wss"

    socketRef.current = new WebSocket(`${protocol}://${BACKEND_SOCKET}/ws/speech`)

    socketRef.current.onopen = () => {
      console.log("WebSocket connected")
      setConnectionState("connected")
    }

    socketRef.current.onmessage = (event) => {

      const data = JSON.parse(event.data)

      if (!data.text) return

      // แสดงเฉพาะ final
      if (!data.isFinal) return

      setTranscript(prev => {

        if (!prev) return data.text

        if (data.text.startsWith(prev)) {
          return data.text
        }

        if (prev.includes(data.text)) {
          return prev
        }

        return `${prev} ${data.text}`

      })

    }

    socketRef.current.onerror = (err) => {
      console.error("WebSocket error", err)
    }

    socketRef.current.onclose = () => {

      console.warn("WebSocket closed")

      setConnectionState("idle")

      if (isListening) {
        reconnectTimerRef.current = setTimeout(() => {
          connectSocket()
        }, 1000)
      }

    }

  }

  const startListening = async () => {

    resetTranscript()

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    })

    connectSocket()

    const AudioContext =
      window.AudioContext ||
      (window as any).webkitAudioContext

    audioContextRef.current = new AudioContext({
      sampleRate: 16000
    })

    const source =
      audioContextRef.current.createMediaStreamSource(stream)

    processorRef.current =
      audioContextRef.current.createScriptProcessor(
        4096,
        1,
        1
      )

    source.connect(processorRef.current)
    processorRef.current.connect(audioContextRef.current.destination)

    processorRef.current.onaudioprocess = (e) => {

      const inputData = e.inputBuffer.getChannelData(0)

      const pcmData = new Int16Array(inputData.length)

      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] =
          Math.max(-1, Math.min(1, inputData[i])) * 0x7fff
      }

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(pcmData.buffer)
      }

    }

    setIsListening(true)

  }

  const stopListening = () => {

    processorRef.current?.disconnect()
    processorRef.current = null

    audioContextRef.current?.close()
    audioContextRef.current = null

    socketRef.current?.close()
    socketRef.current = null

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
    }

    setIsListening(false)

  }

  return {
    transcript,
    isListening,
    connectionState,
    startListening,
    stopListening,
    resetTranscript
  }

}