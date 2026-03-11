import { useState } from "react"
import { useTGDSAudioRecorder } from "./useTGDSAudioRecorder"

export function useVoiceInput() {

  const {
    start,
    stop,
  } = useTGDSAudioRecorder()

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const startListening = async () => {

    setTranscript("")
    await start()
    setIsListening(true)

  }

  const stopListening = async () => {

    const blob = await stop()

    setIsListening(false)

    if (!blob) return null

    setIsProcessing(true)

    try {

      const form = new FormData()
      form.append("file", blob)

      const res = await fetch("/api/speech-to-text", {
        method: "POST",
        body: form
      })

      if (!res.ok) {
        throw new Error("speech failed")
       }


      const data = await res.json()

      setTranscript(data.transcript)

      return data.transcript

    } finally {

      setIsProcessing(false)

    }

  }

  return {
    transcript,
    isListening,
    isProcessing,
    startListening,
    stopListening
  }
}