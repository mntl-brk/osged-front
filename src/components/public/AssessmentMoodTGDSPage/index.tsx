import React, { useEffect, useState } from 'react';
import { TGDS_QUESTIONS } from '@/data/tgdsQuestions';
import { TGDSAnswerPage } from './TGDSAnswerPage';
import { useVoiceGuide } from '@/hooks/useVoiceGuide';
import { appendTGDSAnswer } from '@/api/tgds/appendTGDSAnswer';
import { useAssessmentStore } from '@/store/assessmentStore';
import { useLocalVoiceGuide } from '@/hooks/useLocalVoiceGuide';
import { getTGDSState } from '@/api/tgds/getTGDSState';

interface Props {
  onComplete: (score: number) => void;
}

export const AssessmentMoodTGDSPage: React.FC<Props> = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const sessionId = useAssessmentStore((s) => s.sessionId)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingState, setIsLoadingState] = useState(true)
  // useVoiceGuide(
  //   `
  //   เมื่อพร้อมแล้วคุณสามารถกดปุ่มพูด
  //   อ่านคำถามแล้วตอบว่า “ใช่” หรือ “ไม่ใช่” ได้เลยครับ
  //   `,
  //   {
  //     autoPlay: currentIdx === 0,
  //     allowReplay: false,
  //   }
  // );

  const { isSpeaking } = useLocalVoiceGuide(
    '/audio/tgds_guide.mp3',
    currentIdx === 0, // autoPlay เฉพาะข้อแรก
    {
      allowReplay: false,
    }
  )
    
  const question = TGDS_QUESTIONS[currentIdx]
  const progressPercent =
    ((currentIdx + 1) / TGDS_QUESTIONS.length) * 100


  useEffect(() => {
    if (!sessionId) return

    const loadState = async () => {
      try {
        const state = await getTGDSState({ session_id: sessionId })

        const safeIndex = Math.min(
          state.current_question_no - 1,
          TGDS_QUESTIONS.length - 1
        )

        setCurrentIdx(safeIndex)

        const restoredAnswers = state.answers.map(a => a.answer === 1)
        setAnswers(restoredAnswers)

        if (state.completed) {
          let score = 0
          restoredAnswers.forEach((ans, i) => {
            if (ans === TGDS_QUESTIONS[i].scoreTarget) score++
          })
          onComplete(score)
          return
        }

      } catch (err) {
        console.error('Failed to load TGDS state', err)
      } finally {
        setIsLoadingState(false)
      }
    }

    loadState()
  }, [sessionId, onComplete])

  if (!sessionId) return null
  if (isLoadingState) return null
  if (currentIdx >= TGDS_QUESTIONS.length) return null

  const handleAnswer = async (
    answer: boolean,
    mediaId?: string
  ) => {
    if (!sessionId) return
    if (isSaving) return
    setIsSaving(true)

    // append to backend
   try{
      await appendTGDSAnswer({
        session_id: sessionId,
        question_no: currentIdx + 1, // TGDS ใช้ 1-based
        answer: answer ? 1 : 0,
        media_id: mediaId,
      })

      // update local state
      const nextAnswers = [...answers, answer]
      setAnswers(nextAnswers)

      // next / complete
      if (currentIdx < TGDS_QUESTIONS.length - 1) {
        setCurrentIdx(i => i + 1)
      } else {
        let score = 0
        nextAnswers.forEach((ans, i) => {
          if (ans === TGDS_QUESTIONS[i].scoreTarget) score++
        })
        onComplete(score)
      }
    }
    finally{
      setIsSaving(false)
    }
  }

  return (
    <TGDSAnswerPage
      question={question.text}
      index={currentIdx}
      total={TGDS_QUESTIONS.length}
      progressPercent={progressPercent}
      onAnswer={handleAnswer} sessionId={sessionId}
      isSpeaking={isSpeaking}
    />
  );
};