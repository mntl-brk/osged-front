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
import { useTGDSAutoSkipTimer } from '@/hooks/useTGDSAutoSkipTimer'

interface Props {
  question: string
  index: number
  total: number
  progressPercent: number
  sessionId: string
  onAnswer: (answer: boolean | 'skip' , videoMediaId?: string, audioMediaId?: string) => void
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
  const [finalAnswer, setFinalAnswer] = useState<boolean | 'skip' | null>(null)
  const accumulatedTranscriptRef = useRef('')
  const hasSpokenQuestionRef = useRef(false)
  /* ================= REFS ================= */

  const recognitionRef = useRef<any>(null)
  const listeningIntentRef = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  /* ================= Upload Helper ================= */

const { showHint, onUserActivity } = useTGDSAutoSkipTimer({
  isAiSpeaking: isSpeaking,
  isListening,
  isSubmitting,
  onSkip: () => {
      onAnswer('skip')
  },
})

useEffect(() => {
  onUserActivity()
}, [question])

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
    startRecording,
    destroyCamera,
    isUploading,
  } = useTGDSRecordingUpload({
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

  useEffect(() => {

    return () => {
      destroyCamera()
    }

  }, [destroyCamera])

  
  /* ================= RESET STATE WHEN QUESTION CHANGES ================= */

  useEffect(() => {
    resetAnswer()
  }, [question])


  const processTranscriptForAnswer = (fullTranscript: string) => {
    if (!fullTranscript) return null

    let cleaned = fullTranscript
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[.,!?]/g, '')
      .replace(/ครับ|ค่ะ|จ้ะ|จ้า|นะ|เลย|แหละ|หรอก|ลูก|หลาน/g, '')

    if (cleaned.includes('หรือไม่')) {
      const parts = cleaned.split('หรือไม่')
      cleaned = parts[parts.length - 1]
    }

    if (!cleaned) return null

    /* ===== skip detection ===== */

    const skipRegex = /ข้าม|ไม่ตอบ|ผ่าน|ขอข้าม|ไม่อยากตอบ/
    if (skipRegex.test(cleaned)) {
      return 'skip'
    }

    /* ===== negative ===== */
    if (cleaned === 'ไม่') return false

    const negativeRegex = /ไม่(ใช่|มี|จริง|เป็น|ได้|ค่อย)|เปล่า|ไม่มี/
    if (negativeRegex.test(cleaned)) {
      return false
    }

    /* ===== positive ===== */

    const positiveRegex = /ใช่|มี|จริง|เป็น|ถูก|ลด/
    if (positiveRegex.test(cleaned)) {
      return true
    }

    return null
  }
  
  /* ================= SPEECH RECOGNITION ================= */

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
      
      onUserActivity()

      accumulatedTranscriptRef.current += ' ' + transcript
      const fullTranscript = accumulatedTranscriptRef.current

      // ใช้ฟังก์ชันใหม่ประมวลผล
      const detected = processTranscriptForAnswer(fullTranscript)

      if (detected !== null) {

        listeningIntentRef.current = false
        setIsListening(false)
        rec.stop()

        if (detected === 'skip') {

          setHasDetectedAnswer(true)
          setFinalAnswer('skip')


        } else {

          setFinalAnswer(detected)
          setHasDetectedAnswer(true)

        }
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
    onUserActivity()

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
    await startRecording()
    setIsRecording(true)
  }

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (finalAnswer === null || isSubmitting) return

    setIsSubmitting(true)

    try {

      const videoPromise = stopRecordingAndUpload()
      const audioBlob = await stopAudio()

      const audioPromise = audioBlob
        ? uploadTGDSSound(audioBlob)
        : Promise.resolve(undefined)

      const [videoMediaId, audioMediaId] = await Promise.all([
        videoPromise,
        audioPromise,
      ])

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
          : finalAnswer === 'skip'
          ? 'ข้ามคำถามนี้'
          : undefined
      }
      hasDetectedAnswer={hasDetectedAnswer}
      onToggleListening={toggleListening}
      onResetAnswer={resetAnswer}
      onSubmitAnswer={handleSubmit}
      isUploading={isUploading}
      isSubmitting={isSubmitting}
      isSpeaking={isSpeaking}
      showHint={showHint}
    />
  )
}