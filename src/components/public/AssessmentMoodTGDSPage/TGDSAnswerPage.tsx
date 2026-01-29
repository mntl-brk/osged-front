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
  const listeningIntentRef = useRef(false); // ⭐ สำคัญ

  /* ================= Reset on Question Change ================= */

  useEffect(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;

    listeningIntentRef.current = false;
    setFinalAnswer(null);
    setHasDetectedAnswer(false);
    setIsListening(false);
  }, [question]);

  /* ================= Answer Detection ================= */

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
      const detected = detectAnswerWithQuestion(transcript, question);

      if (detected !== null) {
        listeningIntentRef.current = false;
        setFinalAnswer(detected);
        setHasDetectedAnswer(true);
        setIsListening(false);
        rec.stop();
      }
    };

    rec.onerror = () => {
      // ❌ อย่าปิด listening
      // engine error → ปล่อยให้ onend จัดการ
    };

    rec.onend = () => {
      // ⭐ key logic
      if (listeningIntentRef.current && !hasDetectedAnswer) {
        try {
          rec.start(); // 🔁 ฟังต่อ
        } catch {
          /* Safari/Chrome บางครั้ง start ซ้ำเร็วเกิน */
        }
      }
    };

    return rec;
  };

  /* ================= Actions ================= */

  const toggleListening = () => {
    if (isListening) {
      listeningIntentRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.abort();
      recognitionRef.current = createRecognition();
      listeningIntentRef.current = true;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const resetAnswer = () => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;

    listeningIntentRef.current = false;
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