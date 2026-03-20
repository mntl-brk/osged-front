import React, { useEffect, useState } from 'react';
import { TGDS_QUESTIONS } from '@/data/tgdsQuestions';
import { TGDSAnswerPage } from './TGDSAnswerPage';
import { appendTGDSAnswer } from '@/api/tgds/appendTGDSAnswer';
import { useAssessmentStore } from '@/store/assessmentStore';
import { useLocalVoiceGuide } from '@/hooks/useLocalVoiceGuide';
import { getTGDSState } from '@/api/tgds/getTGDSState';

interface Props {
  onComplete: (score: number) => void;
}

export const AssessmentMoodTGDSPage: React.FC<Props> = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<(boolean | 'skip')[]>([])
  const sessionId = useAssessmentStore((s) => s.sessionId)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingState, setIsLoadingState] = useState(true)

  const { isSpeaking } = useLocalVoiceGuide(
    '/audio/tgds_guide.mp3',
    currentIdx === 0, 
    {
      allowReplay: true,
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
  }, [sessionId])

  if (!sessionId) return null
  if (isLoadingState) return null
  if (currentIdx >= TGDS_QUESTIONS.length) return null

  const handleAnswer = async (
  answer: boolean | 'skip',
  videoMediaId?: string,
  audioMediaId?: string
) => {
  if (!sessionId) return
  if (isSaving) return

  setIsSaving(true)

  try {
    await appendTGDSAnswer({
      session_id: sessionId,
      question_no: currentIdx + 1,
      answer: answer ? 1 : 0,
      video_media_id: videoMediaId,
      audio_media_id: audioMediaId,  
    })

    const nextAnswers = [...answers, answer]
    setAnswers(nextAnswers)

    if (currentIdx < TGDS_QUESTIONS.length - 1) {
      setCurrentIdx(i => i + 1)
    } else {
      let score = 0
      nextAnswers.forEach((ans, i) => {
        if (ans === TGDS_QUESTIONS[i].scoreTarget) score++
      })
      onComplete(score)
    }
  } finally {
    setIsSaving(false)
  }
}

  return (
    <TGDSAnswerPage
      question={question.text}
      index={currentIdx}
      total={TGDS_QUESTIONS.length}
      progressPercent={progressPercent}
      onAnswer={handleAnswer} 
      sessionId={sessionId}
      isSpeaking={isSpeaking}
    />
  );
};