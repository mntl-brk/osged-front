import React, { useState } from 'react';
import { TGDS_QUESTIONS } from '@/data/tgdsQuestions';
import { TGDSAnswerPage } from './TGDSAnswerPage';
import { useVoiceGuide } from '@/hooks/useVoiceGuide';
import { appendTGDSAnswer } from '@/api/tgds/appendTGDSAnswer';
import { useAssessmentStore } from '@/store/assessmentStore';

interface Props {
  onComplete: (score: number) => void;
}

export const AssessmentMoodTGDSPage: React.FC<Props> = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const sessionId = useAssessmentStore((s) => s.sessionId)
   
  useVoiceGuide(
    `
    เมื่อพร้อมแล้วคุณสามารถกดปุ่มพูด
    อ่านคำถามแล้วตอบว่า “ใช่” หรือ “ไม่ใช่” ได้เลยครับ
    `,
    {
      autoPlay: currentIdx === 0,
      allowReplay: false,
    }
  );
  
  if (!sessionId) {
    return null
  }
  const question = TGDS_QUESTIONS[currentIdx]
  const progressPercent =
    ((currentIdx + 1) / TGDS_QUESTIONS.length) * 100

  const handleAnswer = async (
    answer: boolean,
    mediaId?: string
  ) => {
    if (!sessionId) return

    // append to backend
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

  return (
    <TGDSAnswerPage
      question={question.text}
      index={currentIdx}
      total={TGDS_QUESTIONS.length}
      progressPercent={progressPercent}
      onAnswer={handleAnswer} sessionId={sessionId}    />
  );
};