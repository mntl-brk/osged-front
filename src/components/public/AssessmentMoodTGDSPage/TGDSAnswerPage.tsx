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
}

export const TGDSAnswerPage: React.FC<Props> = ({
  question,
  index,
  total,
  progressPercent,
  sessionId,
  onAnswer,
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
  const detectAnswer = (fullTranscript: string) => {
    if (!fullTranscript) return null

    const cleaned = fullTranscript
      .replace(/\s+/g, '')
      .replace(/ครับ|ค่ะ|นะ|จ้า/g, '')

    const tail = cleaned.slice(-8)

    //  ตรวจ pattern รวมคำ
    if (tail.endsWith('ไม่ใช่')) {
      // ถ้า pattern ก่อนหน้าเป็น "หรือไม่ใช่"
      if (cleaned.endsWith('หรือไม่ใช่')) {
        return true   // แปลว่า "หรือไม่" + "ใช่"
      }
      return false
    }

    if (tail.endsWith('ใช่')) return true

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


    const detected = detectAnswer(fullTranscript)

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

    listeningIntentRef.current = false
    setFinalAnswer(null)
    setHasDetectedAnswer(false)
    setIsListening(false)

    // 🔥 Hard reset video recording
    await restartRecording()
  }

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (finalAnswer === null) return

    try {
      const mediaId = await stopRecordingAndUpload()

      if (mediaId) {
        onAnswer(finalAnswer, mediaId)
      } else {
        alert('ไม่สามารถบันทึกวิดีโอได้')
      }
    } catch (e) {
      console.error(e)
      alert('เกิดข้อผิดพลาด')
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
    />
  )
}