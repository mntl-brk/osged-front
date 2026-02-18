'use client'

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { BaseTGDSLayout } from './BaseTGDSLayout'
import { useTGDSRecordingUpload } from '@/hooks/useTGDSRecordingUpload'
import { uploadMedia } from '@/api/media/uploadMedia'

interface Props {
  question: string
  index: number
  total: number
  progressPercent: number
  sessionId: string
  onAnswer: (answer: boolean, mediaId?: string) => void
  isSpeaking: boolean
}

export const TGDSAnswerPage: React.FC<Props> = ({
  question,
  index,
  total,
  progressPercent,
  sessionId,
  onAnswer,
  isSpeaking
}) => {
  /* ================= STATE ================= */

  const [isListening, setIsListening] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [hasDetectedAnswer, setHasDetectedAnswer] = useState(false)
  const [finalAnswer, setFinalAnswer] = useState<boolean | null>(null)
  const accumulatedTranscriptRef = useRef('')
  const hasSpokenQuestionRef = useRef(false)
  /* ================= REFS ================= */

  const recognitionRef = useRef<any>(null)
  const listeningIntentRef = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  /* ================= Upload Helper ================= */

 const uploadTGDSVideo = useCallback(
    async (blob: Blob): Promise<string> => {
      const result = await uploadMedia({
        sessionId,
        purpose: 'tgds_test',
        questionNo: index + 1,   
        file: blob,
      })

      return result.match(
        (media) => media.media_id,
        (error) => {
          throw error
        }
      )
    },
    [sessionId, index]  
  )

  /* ================= RECORDING HOOK (เรียกครั้งเดียว) ================= */

  const {
    stopAndUpload: stopRecordingAndUpload,
    restartRecording,
    isUploading,
  } = useTGDSRecordingUpload({
    enabled: isRecording,
    uploadFn: uploadTGDSVideo,
  })

  /* ================= START RECORDING WHEN QUESTION LOADS ================= */

  useEffect(() => {
    setIsRecording(true)

    return () => {
      setIsRecording(false)
    }
  }, [question])

  /* ================= RESET STATE WHEN QUESTION CHANGES ================= */

  useEffect(() => {
    resetAnswer()
  }, [question])

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[.,!?]/g, '')

  const extractAnswerPart = (fullTranscript: string, questionText: string) => {
    const t = normalize(fullTranscript)
    const q = normalize(questionText)

    const index = t.indexOf(q)

    if (index === -1) return null

    // ตัดคำถามออก
    const afterQuestion = t.substring(index + q.length)

    return afterQuestion
  }

  const isQuestionSpoken = (transcript: string, questionText: string) => {
    const t = normalize(transcript)
    const q = normalize(questionText)

    let matchCount = 0

    for (let i = 0; i < q.length - 2; i++) {
      const chunk = q.substring(i, i + 3)
      if (t.includes(chunk)) {
        matchCount++
      }
    }

    const ratio = matchCount / (q.length - 2)

    return ratio >= 0.5   
  }

  /* ================= SPEECH RECOGNITION ================= */
  const detectAnswer = (text: string) => {
    if (!text) return null

    const cleaned = text
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[.,!?]/g, '')
      .replace(/ครับ|ค่ะ|นะ|จ้า|เลย|แหละ/g, '')

    // ถ้าจบด้วย "หรือไม่" แสดงว่ายังอ่านคำถามอยู่
    if (cleaned.endsWith('หรือไม่')) {
      return null
    }

    if (cleaned.endsWith('ไม่ใช่')) return false
    if (cleaned.endsWith('ใช่')) return true

    return null
  }
  
  const createRecognition = () => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    const rec = new SR()
    rec.lang = 'th-TH'
    rec.continuous = true
    rec.interimResults = false

 
  rec.onresult = (e: any) => {
    // ดึง result ล่าสุด
    const result = e.results[e.results.length - 1]
    const transcript = result[0].transcript.trim()

    // สะสมข้อความ
    accumulatedTranscriptRef.current += ' ' + transcript

    const fullTranscript = accumulatedTranscriptRef.current


    const answerPart = extractAnswerPart(fullTranscript, question)

    if (!answerPart) return


    const detected = detectAnswer(answerPart)

    if (detected !== null) {
      listeningIntentRef.current = false
      setFinalAnswer(detected)
      setHasDetectedAnswer(true)
      setIsListening(false)
      rec.stop()
    }
  }

    rec.onend = () => {
      if (listeningIntentRef.current && !hasDetectedAnswer) {
        try {
          rec.start()
        } catch {}
      }
    }

    return rec
  }

  /* ================= ACTIONS ================= */

  const toggleListening = () => {
    if (isListening) {
      listeningIntentRef.current = false
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      recognitionRef.current?.abort()
      recognitionRef.current = createRecognition()
      listeningIntentRef.current = true
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  /* ================= HARD RESET ================= */

  const resetAnswer = async () => {
    recognitionRef.current?.abort()
    recognitionRef.current = null
    accumulatedTranscriptRef.current = ''
    listeningIntentRef.current = false
    setFinalAnswer(null)
    setHasDetectedAnswer(false)
    setIsListening(false)

    // Hard reset video recording
    setIsRecording(false)
    await restartRecording()
    setIsRecording(true)
  }

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (finalAnswer === null || isSubmitting) return

    setIsSubmitting(true)

    try {
      const mediaId = await stopRecordingAndUpload()

      if (mediaId) {
        await onAnswer(finalAnswer, mediaId)
      }
    } catch (e) {
      console.error(e)
      alert('เกิดข้อผิดพลาด')
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ================= RENDER ================= */

  return (
    <BaseTGDSLayout
      index={index}
      total={total}
      progressPercent={progressPercent}
      questionText={question}
      isListening={isListening}
      finalAnswerText={
        finalAnswer === true
          ? 'ใช่'
          : finalAnswer === false
          ? 'ไม่ใช่'
          : undefined
      }
      hasDetectedAnswer={hasDetectedAnswer}
      onToggleListening={toggleListening}
      onResetAnswer={resetAnswer}
      onSubmitAnswer={handleSubmit}
      isUploading={isUploading}
      isSubmitting={isSubmitting}
      isSpeaking={isSpeaking}
    />
  )
}