'use client'

import React, {
  useRef,
  useState,
  useEffect,
  useCallback
} from 'react'

import { BaseTGDSLayout } from './BaseTGDSLayout'
import { useTGDSRecordingUpload } from '@/hooks/useTGDSRecordingUpload'
import { uploadMedia } from '@/api/media/uploadMedia'
import { useTGDSAudioRecorder } from '@/hooks/useTGDSAudioRecorder'
import { useTGDSAutoSkipTimer } from '@/hooks/useTGDSAutoSkipTimer'
import { useRealtimeSpeech } from '@/hooks/useRealtimeSpeech'

interface Props {
  question: string
  index: number
  total: number
  progressPercent: number
  sessionId: string
  onAnswer: (
    answer: boolean | 'skip',
    videoMediaId?: string,
    audioMediaId?: string
  ) => void
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

  const [finalAnswer, setFinalAnswer] =
    useState<boolean | 'skip' | null>(null)

  const [hasDetectedAnswer, setHasDetectedAnswer] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const accumulatedTranscriptRef = useRef('')
  const audioBlobRef = useRef<Blob | null>(null)

  /* ================= REALTIME SPEECH ================= */

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript
  } = useRealtimeSpeech()

  /* ================= AUDIO ================= */

  const {
    start: startAudio,
    stop: stopAudio,
    getStream
  } = useTGDSAudioRecorder()

  /* ================= VIDEO ================= */

  const {
    stopAndUpload,
    startRecording,
    destroyCamera,
    isUploading
  } = useTGDSRecordingUpload({
    uploadFn: async (blob) => {

      const result = await uploadMedia({
        sessionId,
        purpose: 'tgds_test',
        questionNo: index + 1,
        file: blob
      })

      return result.match(
        (m) => m.media_id,
        (e) => { throw e }
      )

    }
  })

  /* ================= AUDIO UPLOAD ================= */

  const uploadTGDSSound = useCallback(
    async (blob: Blob): Promise<string> => {

      const result = await uploadMedia({
        sessionId,
        purpose: 'tgds_audio',
        questionNo: index + 1,
        file: blob
      })

      return result.match(
        (m) => m.media_id,
        (e) => { throw e }
      )

    },
    [sessionId, index]
  )

  /* ================= AUTOSKIP ================= */

  const { showHint, onUserActivity } = useTGDSAutoSkipTimer({
    isAiSpeaking: isSpeaking,
    isListening,
    isSubmitting,
    onSkip: () => onAnswer('skip')
  })

  /* ================= RESET ================= */

  const resetAnswer = useCallback(async () => {

    accumulatedTranscriptRef.current = ''
    audioBlobRef.current = null

    resetTranscript()

    setFinalAnswer(null)
    setHasDetectedAnswer(false)

    await stopListening()

    await stopAudio()

    await startRecording()

    
  }, [resetTranscript, stopListening, stopAudio, startRecording])

  useEffect(() => {
    resetAnswer()
  }, [question])

  useEffect(() => {
    return () => destroyCamera()
  }, [destroyCamera])

  /* ================= ANSWER DETECTION ================= */

  const processTranscriptForAnswer = (
    fullTranscript: string
  ): boolean | 'skip' | null => {

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

    if (/ข้าม|ไม่ตอบ|ผ่าน|ขอข้าม/.test(cleaned))
      return 'skip'

    if (cleaned === 'ไม่')
      return false

    if (/ไม่(ใช่|มี|จริง|เป็น|ได้)|เปล่า|ไม่มี/.test(cleaned))
      return false

    if (/ใช่|มี|จริง|เป็น|ถูก/.test(cleaned))
      return true

    return null
  }

  /* ================= TRANSCRIPT ================= */

  useEffect(() => {

    if (!transcript) return

    onUserActivity()

    accumulatedTranscriptRef.current += ' ' + transcript

    const detected =
      processTranscriptForAnswer(
        accumulatedTranscriptRef.current
      )

    if (detected !== null) {

      const finalize = async () => {

        await stopListening()

        const blob = await stopAudio()

        audioBlobRef.current = blob

        setHasDetectedAnswer(true)
        setFinalAnswer(detected)

      }

      finalize()

    }

  }, [transcript])

  /* ================= LISTEN ================= */

  const toggleListening = async () => {

    onUserActivity()

    if (isListening) {

      await stopListening()

      audioBlobRef.current = await stopAudio()

    } else {

      accumulatedTranscriptRef.current = ''

      resetTranscript()

      await startAudio()

      const stream = getStream()

      if (stream) {
        await startListening(stream)
      }

    }
  }

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {

    if (finalAnswer === null || isSubmitting)
      return

    setIsSubmitting(true)

    try {

      const videoPromise = stopAndUpload()

      const audioBlob = audioBlobRef.current
      console.log(audioBlob)
      console.log(audioBlob?.size)
      
      const audioPromise =
        audioBlob && audioBlob.size > 0
          ? uploadTGDSSound(audioBlob)
          : Promise.resolve(undefined)

      const [videoMediaId, audioMediaId] =
        await Promise.all([
          videoPromise,
          audioPromise
        ])

      await onAnswer(
        finalAnswer,
        videoMediaId,
        audioMediaId
      )

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