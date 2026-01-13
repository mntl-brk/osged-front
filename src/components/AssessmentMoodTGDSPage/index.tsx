import React, { useState } from 'react';
import { TGDS_QUESTIONS } from '@/data/tgdsQuestions';
import { TGDSReadingPage } from './TGDSReadingPage';
import { TGDSAnswerPage } from './TGDSAnswerPage';

interface Props {
  onComplete: (score: number) => void;
}

export const AssessmentMoodTGDSPage: React.FC<Props> = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [step, setStep] = useState<'READ' | 'ANSWER'>('READ');

  const question = TGDS_QUESTIONS[currentIdx];
  const progressPercent = ((currentIdx + 1) / TGDS_QUESTIONS.length) * 100;

  const handleAnswer = (answer: boolean) => {
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);

    if (currentIdx < TGDS_QUESTIONS.length - 1) {
      setCurrentIdx(i => i + 1);
      setStep('READ');
    } else {
      let score = 0;
      nextAnswers.forEach((ans, i) => {
        if (ans === TGDS_QUESTIONS[i].scoreTarget) score++;
      });
      onComplete(score);
    }
  };

  return (
    <>
      {step === 'READ' && (
        <TGDSReadingPage
          question={question.text}
          index={currentIdx}
          total={TGDS_QUESTIONS.length}
          progressPercent={progressPercent}
          onDone={() => setStep('ANSWER')}
        />
      )}

      {step === 'ANSWER' && (
        <TGDSAnswerPage
          question={question.text}
          index={currentIdx}
          total={TGDS_QUESTIONS.length}
          progressPercent={progressPercent}
          onAnswer={handleAnswer}
        />
      )}
    </>
  );
};