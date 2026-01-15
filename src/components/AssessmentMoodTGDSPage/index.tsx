import React, { useState } from 'react';
import { TGDS_QUESTIONS } from '@/data/tgdsQuestions';
import { TGDSReadingPage } from './TGDSReadingPage';
import { TGDSAnswerPage } from './TGDSAnswerPage';
import { useVoiceGuide } from '@/hooks/useVoiceGuide';

interface Props {
  onComplete: (score: number) => void;
}

export const AssessmentMoodTGDSPage: React.FC<Props> = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const question = TGDS_QUESTIONS[currentIdx];
  const progressPercent = ((currentIdx + 1) / TGDS_QUESTIONS.length) * 100;

  const handleAnswer = (answer: boolean) => {
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);

    if (currentIdx < TGDS_QUESTIONS.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      let score = 0;
      nextAnswers.forEach((ans, i) => {
        if (ans === TGDS_QUESTIONS[i].scoreTarget) score++;
      });
      onComplete(score);
    }
  };
   
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

  return (
    <TGDSAnswerPage
      question={question.text}
      index={currentIdx}
      total={TGDS_QUESTIONS.length}
      progressPercent={progressPercent}
      onAnswer={handleAnswer}
    />
  );
};