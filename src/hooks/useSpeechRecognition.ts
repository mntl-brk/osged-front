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
  // เปลี่ยนเป็นเก็บสถานะว่าควรพยายามรีสตาร์ทหรือไม่
  const shouldAutoRestartRef = useRef(true) 

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [words, setWords] = useState<string[]>([])
  const [segments, setSegments] = useState<SpeechSegment[]>([])
  const [error, setError] = useState<string | null>(null)

  const isEdge = typeof navigator !== 'undefined' && /edg/i.test(navigator.userAgent)
  // เช็คว่าเป็น iOS Safari หรือไม่ เพื่อจัดการ Auto-restart ให้เหมาะสม
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)

  useEffect(() => {
    if (!enabled) return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError('SpeechRecognition not supported')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.continuous = false // iOS บังคับให้หยุดบ่อย การใช้ false ถูกต้องแล้ว
    recognition.interimResults = false
    recognition.maxAlternatives = 3

    recognition.onstart = () => {
      startTimeRef.current = performance.now()
      listeningRef.current = true
      setIsListening(true)
      setError(null)
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
        bufferRef.current += ' ' + text
        const normalized = bufferRef.current.trim()

        const segment: SpeechSegment = {
          text,
          confidence,
          start_time: startTimeRef.current ? (startTimeRef.current / 1000) : undefined,
          end_time: now / 1000,
          alternatives: Array.from(result).slice(1).map((alt: any) => ({
            text: alt.transcript,
            confidence: alt.confidence ?? 0,
          })),
        }

        setSegments(prev => [...prev, segment])

        const parsedWords = normalized.split(/\s+/).filter(Boolean).slice(0, maxWords)
        setTranscript(normalized)
        setWords(parsedWords)
      }
    }

    recognition.onerror = (event: any) => {
      console.warn('Speech API Error:', event.error) // ช่วยให้คุณ Debug บน iPad ได้ง่ายขึ้น
      
      if (event.error === 'network') {
        shouldAutoRestartRef.current = false
        setError('Network error')
      } else if (event.error === 'not-allowed') {
        shouldAutoRestartRef.current = false
        setError('Microphone permission denied')
      } else if (event.error === 'no-speech') {
        // iOS มักจะโยน error นี้เวลาไม่มีเสียงพูดเข้ามาสักพัก
        // เราไม่ควรเซ็ตเป็น Error ร้ายแรง แต่ต้องรู้ว่ามันหยุดฟังแล้ว
      } else if (event.error === 'aborted') {
        shouldAutoRestartRef.current = false
      }
      
      // อัปเดต State ให้ตรงกับความเป็นจริง
      listeningRef.current = false
      setIsListening(false)
    }

    recognition.onend = () => {
      // อัปเดต State เสมอเมื่อจบ Session
      listeningRef.current = false
      setIsListening(false)

      // พยายาม Restart เฉพาะเมื่อไม่ได้เกิด Error ร้ายแรง และไม่ใช่ iOS หรือ Edge
      // การ Restart อัตโนมัติบน iOS ต้องอาศัย User interaction (กดปุ่มใหม่) เสมอ
      if (shouldAutoRestartRef.current && !isEdge && !isIOS) {
        try {
          recognition.start()
        } catch (e) {
          console.error('Failed to auto-restart', e)
        }
      } else if (isIOS) {
        // บน iOS บังคับให้ผู้ใช้กดปุ่ม Start ใหม่เพื่อป้องกัน Silent Failure
        shouldAutoRestartRef.current = false 
      }
    }

    recognitionRef.current = recognition

    return () => {
      shouldAutoRestartRef.current = false
      recognition.abort()
    }
  }, [enabled, lang, maxWords])

  const start = () => {
    if (!recognitionRef.current) return

    // เคลียร์ค่าเดิมก่อนเริ่มใหม่
    bufferRef.current = ''
    setTranscript('')
    setWords([])
    setSegments([])
    setError(null)
    shouldAutoRestartRef.current = true

    try {
      recognitionRef.current.start()
    } catch (e) {
      console.error('Failed to start recognition', e)
    }
  }

  const stop = () => {
    shouldAutoRestartRef.current = false
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