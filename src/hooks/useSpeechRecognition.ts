import { useEffect, useRef, useState } from 'react'

interface UseSpeechRecognitionOptions {
  lang?: string
  maxWords?: number
  enabled?: boolean
}

export interface SpeechSegment {
  text: string
  confidence: number
  start_time?: number
  end_time?: number
  alternatives?: {
    text: string
    confidence: number
  }[]
}

export const useSpeechRecognition = ({
  lang = 'th-TH',
  maxWords = 3,
  enabled = true,
}: UseSpeechRecognitionOptions = {}) => {
  const recognitionRef = useRef<any>(null)
  const listeningRef = useRef(false)
  const bufferRef = useRef('')
  const startTimeRef = useRef<number | null>(null)
  const hasNetworkErrorRef = useRef(false)

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [words, setWords] = useState<string[]>([])
  const [segments, setSegments] = useState<SpeechSegment[]>([])
  const [error, setError] = useState<string | null>(null)

  const isEdge =
    typeof navigator !== 'undefined' &&
    /edg/i.test(navigator.userAgent)

  useEffect(() => {
    if (!enabled) return

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError('SpeechRecognition not supported')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 3

    recognition.onstart = () => {
      startTimeRef.current = performance.now()
    }

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (!result.isFinal) continue

        const primary = result[0]
        const text = primary.transcript?.trim()
        const confidence = primary.confidence ?? 0

        if (!text) continue

        const now = performance.now()

        // รวม transcript
        bufferRef.current += ' ' + text
        const normalized = bufferRef.current.trim()

        // สร้าง segment object
        const segment: SpeechSegment = {
          text,
          confidence,
          start_time: startTimeRef.current
            ? (startTimeRef.current / 1000)
            : undefined,
          end_time: now / 1000,
          alternatives: Array.from(result)
            .slice(1)
            .map((alt: any) => ({
              text: alt.transcript,
              confidence: alt.confidence ?? 0,
            })),
        }

        setSegments(prev => [...prev, segment])

        const parsedWords = normalized
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, maxWords)

        setTranscript(normalized)
        setWords(parsedWords)
      }
    }

    recognition.onerror = (event: any) => {
      if (event.error === 'network') {
        hasNetworkErrorRef.current = true
        listeningRef.current = false
        setIsListening(false)
        recognition.stop()
        return
      }

      if (event.error === 'not-allowed') {
        setError('Microphone permission denied')
      }
    }

    recognition.onend = () => {
      if (
        listeningRef.current &&
        !hasNetworkErrorRef.current &&
        !isEdge
      ) {
        try {
          recognition.start()
        } catch {}
      }
    }

    recognitionRef.current = recognition

    return () => recognition.abort()
  }, [enabled, lang, maxWords])

  const start = () => {
    if (!recognitionRef.current) return

    bufferRef.current = ''
    setTranscript('')
    setWords([])
    setSegments([])
    setError(null)

    hasNetworkErrorRef.current = false
    listeningRef.current = true
    setIsListening(true)

    try {
      recognitionRef.current.start()
    } catch {}
  }

  const stop = () => {
    listeningRef.current = false
    setIsListening(false)
    recognitionRef.current?.stop()
  }

  const reset = () => {
    bufferRef.current = ''
    setTranscript('')
    setWords([])
    setSegments([])
  }

  return {
    isListening,
    transcript,
    words,
    segments,
    error,
    start,
    stop,
    reset,
  }
}