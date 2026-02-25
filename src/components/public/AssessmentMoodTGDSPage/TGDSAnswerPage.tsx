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
import { useTGDSAudioRecorder } from '@/hooks/useTGDSAudioRecorder'

interface Props {
  question: string
  index: number
  total: number
  progressPercent: number
  sessionId: string
  onAnswer: (answer: boolean, videoMediaId?: string, audioMediaId?: string) => void
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

const uploadTGDSSound = useCallback(
  async (blob: Blob): Promise<string> => {
    const result = await uploadMedia({
      sessionId,
      purpose: 'tgds_audio',
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


  const {
    start: startAudio,
    stop: stopAudio,
    isRecording: isAudioRecording,
  } = useTGDSAudioRecorder()

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


  const processTranscriptForAnswer = (fullTranscript: string) => {
    if (!fullTranscript) return null

    // 1. ทำความสะอาดข้อความและตัดคำสร้อย (เพิ่มคำที่ผู้สูงอายุมักใช้)
    let cleaned = fullTranscript
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[.,!?]/g, '')
      .replace(/ครับ|ค่ะ|จ้ะ|จ้า|นะ|เลย|แหละ|หรอก|ลูก|หลาน/g, '')

    // 2. ถ้าผู้สูงอายุอ่านคำถามด้วย (มีคำว่า 'หรือไม่') ให้ตัดข้อความข้างหน้าทิ้ง เอาเฉพาะสิ่งที่พูดหลัง 'หรือไม่'
    if (cleaned.includes('หรือไม่')) {
      const parts = cleaned.split('หรือไม่')
      cleaned = parts[parts.length - 1] // เอาส่วนสุดท้ายหลัง 'หรือไม่'
    }

    // ถ้าพูดแค่คำถามแล้วหยุด 'cleaned' จะกลายเป็น string ว่างเปล่า
    if (!cleaned) return null

    // 3. เช็คคำปฏิเสธ (Negative) -> ต้องเช็คก่อน!
    // ครอบคลุม: ไม่ใช่, ไม่มี, ไม่จริง, ไม่เป็น, ไม่ได้, เปล่า
    const negativeRegex = /ไม่(ใช่|มี|จริง|เป็น|ได้|ค่อย)|เปล่า/
    if (negativeRegex.test(cleaned)) {
      return false
    }

    // 4. เช็คคำตอบรับ (Positive)
    // ครอบคลุม: ใช่, มี, จริง, เป็น, ถูก, ลด (สำหรับข้อลดกิจกรรม)
    const positiveRegex = /ใช่|มี|จริง|เป็น|ถูก|ลด/
    if (positiveRegex.test(cleaned)) {
      return true
    }

    return null
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
      const result = e.results[e.results.length - 1]
      const transcript = result[0].transcript.trim()

      accumulatedTranscriptRef.current += ' ' + transcript
      const fullTranscript = accumulatedTranscriptRef.current

      // ใช้ฟังก์ชันใหม่ประมวลผล
      const detected = processTranscriptForAnswer(fullTranscript)

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

  const toggleListening = async () => {
    if (isListening) {
      listeningIntentRef.current = false
      recognitionRef.current?.stop()

      await stopAudio()
      setIsListening(false)

    } else {
      await startAudio()

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
      const videoMediaId = await stopRecordingAndUpload()
      const audioBlob = await stopAudio()

      let audioMediaId: string | undefined

      if (audioBlob) {
        audioMediaId = await uploadTGDSSound(audioBlob)
      }

      await onAnswer(finalAnswer, videoMediaId, audioMediaId)

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