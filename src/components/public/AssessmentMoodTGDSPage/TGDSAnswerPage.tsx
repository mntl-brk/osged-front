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
  const [isRecording, setIsRecording] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const accumulatedTranscriptRef = useRef('')

  /* ================= REALTIME SPEECH ================= */

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript
  } = useRealtimeSpeech()

  /* ================= AUTOSKIP TIMER ================= */

  const { showHint, onUserActivity } = useTGDSAutoSkipTimer({
    isAiSpeaking: isSpeaking,
    isListening,
    isSubmitting,
    onSkip: () => {
      onAnswer('skip')
    }
  })

  useEffect(() => {
    onUserActivity()
  }, [question])

  /* ================= MEDIA UPLOAD ================= */

  const uploadTGDSVideo = useCallback(
    async (blob: Blob): Promise<string> => {

      const result = await uploadMedia({
        sessionId,
        purpose: 'tgds_test',
        questionNo: index + 1,
        file: blob
      })

      return result.match(
        (media) => media.media_id,
        (error) => { throw error }
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
        file: blob
      })

      return result.match(
        (media) => media.media_id,
        (error) => { throw error }
      )

    },
    [sessionId, index]
  )

   /* ================= AUDIO RECORDING ================= */

    const {
      start: startAudio,
      stop: stopAudio
    } = useTGDSAudioRecorder()

    /* ================= VIDEO RECORDING ================= */

    const {
      stopAndUpload,
      startRecording,
      destroyCamera,
      isUploading
    } = useTGDSRecordingUpload({
      uploadFn: uploadTGDSVideo
    })


  /* ================= RECORD VIDEO ON QUESTION ================= */

  useEffect(() => {

    setIsRecording(true)

    return () => {
      setIsRecording(false)
    }

  }, [question])

  useEffect(() => {

    return () => destroyCamera()

  }, [destroyCamera])

  /* ================= RESET STATE ================= */

  useEffect(() => {
    resetAnswer()
  }, [question])

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

    /* skip */

    const skipRegex = /ข้าม|ไม่ตอบ|ผ่าน|ขอข้าม|ไม่อยากตอบ/
    if (skipRegex.test(cleaned)) return 'skip'

    /* negative */

    if (cleaned === 'ไม่') return false

    const negativeRegex = /ไม่(ใช่|มี|จริง|เป็น|ได้)|เปล่า|ไม่มี/
    if (negativeRegex.test(cleaned)) return false

    /* positive */

    const positiveRegex = /ใช่|มี|จริง|เป็น|ถูก/
    if (positiveRegex.test(cleaned)) return true

    return null
  }

  /* ================= TRANSCRIPT LISTENER ================= */

  useEffect(() => {

    if (!transcript) return

    onUserActivity()

    accumulatedTranscriptRef.current += ' ' + transcript

    const fullTranscript = accumulatedTranscriptRef.current

    const detected = processTranscriptForAnswer(fullTranscript)

    if (detected !== null) {

      stopListening()

      setHasDetectedAnswer(true)
      setFinalAnswer(detected)

    }

  }, [transcript])

  /* ================= LISTENING ================= */

  const toggleListening = async () => {

    onUserActivity()

    if (isListening) {

      await stopListening()
      await stopAudio()

    } else {

      accumulatedTranscriptRef.current = ''

      resetTranscript()

      await startAudio()
      await startListening()

    }

  }

  /* ================= RESET ================= */

  const resetAnswer = async () => {

    accumulatedTranscriptRef.current = ''

    resetTranscript()

    setFinalAnswer(null)
    setHasDetectedAnswer(false)

    await stopListening()
    await stopAudio()

    setIsRecording(false)

    await startRecording()

    setIsRecording(true)

  }

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {

    if (finalAnswer === null || isSubmitting) return

    setIsSubmitting(true)

    try {

      const videoPromise = stopAndUpload()

      const audioBlob = await stopAudio()

      const audioPromise =
        audioBlob && audioBlob.size > 0
          ? uploadTGDSSound(audioBlob)
          : Promise.resolve(undefined)

      const [videoMediaId, audioMediaId] = await Promise.all([
        videoPromise,
        audioPromise
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