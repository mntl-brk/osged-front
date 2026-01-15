import React, { useRef, useState, useEffect } from 'react';
import { BaseTGDSLayout } from './BaseTGDSLayout';

interface Props {
  question: string;
  index: number;
  total: number;
  progressPercent: number;
  onAnswer: (answer: boolean) => void;
}

export const TGDSAnswerPage: React.FC<Props> = ({
  question,
  index,
  total,
  progressPercent,
  onAnswer,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [hasDetectedAnswer, setHasDetectedAnswer] = useState(false);
  const [finalAnswer, setFinalAnswer] = useState<boolean | null>(null);

  const recognitionRef = useRef<any>(null);

  /* ================= Answer Detection ================= */

  useEffect(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;

    setFinalAnswer(null);
    setHasDetectedAnswer(false);
    setIsListening(false);
  }, [question]);

 const detectAnswerWithQuestion = (
      transcript: string,
      questionText: string
    ): boolean | null => {

      const normalize = (s: string) =>
        s
          .toLowerCase()
          .replace(/\s+/g, '')
          .replace(/[.,!?]/g, '');

      const t = normalize(transcript);
      const q = normalize(questionText);

      const remaining = t.replace(q, '');

      if (!remaining) return null;

      const NEGATIVE = ['ไม่ใช่', 'ไม่เลย', 'เปล่า', 'ไม่ได้'];
      for (const w of NEGATIVE) {
        if (remaining.includes(w)) return false;
      }

      const POSITIVE = ['ใช่', 'ถูก'];
      for (const w of POSITIVE) {
        if (remaining.includes(w)) return true;
      }

      return null;
    };
  /* ================= Speech Recognition ================= */

  const createRecognition = () => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const rec = new SR();
    rec.lang = 'th-TH';
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript.trim();
      const detected = detectAnswerWithQuestion(
          transcript,
          question
        );

      if (detected !== null) {
        rec.stop();
        setFinalAnswer(detected);
        setHasDetectedAnswer(true);
        setIsListening(false);
      }
    };

    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);

    return rec;
  };

  /* ================= Actions ================= */

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.abort();
      recognitionRef.current = createRecognition();
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const resetAnswer = () => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;

    setFinalAnswer(null);
    setHasDetectedAnswer(false);
    setIsListening(false);
  };

  useEffect(() => {
    return () => recognitionRef.current?.abort();
  }, []);

  /* ================= Render ================= */

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
      onSubmitAnswer={() => {
        if (finalAnswer !== null) onAnswer(finalAnswer);
      }}
    />
  );
};