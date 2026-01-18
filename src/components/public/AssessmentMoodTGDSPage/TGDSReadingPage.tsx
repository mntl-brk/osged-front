import React, { useRef, useState, useEffect } from 'react';
import { BaseTGDSLayout } from './BaseTGDSLayout';

interface Props {
  question: string;
  index: number;
  total: number;
  progressPercent: number;
  onDone: () => void;
}

export const TGDSReadingPage: React.FC<Props> = ({
  question,
  index,
  total,
  progressPercent,
  onDone,
}) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const createRecognition = () => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const rec = new SR();
    rec.lang = 'th-TH';
    rec.continuous = false;
    rec.interimResults = false;
    return rec;
  };

  const toggleListening = () => {
    if (!isListening) {
      recognitionRef.current?.abort();
      recognitionRef.current = createRecognition();
      recognitionRef.current.start();
      setIsListening(true);
    } else {
      recognitionRef.current?.stop();
      setIsListening(false);
      onDone(); // ➜ ไปหน้า ANSWER (unmount)
    }
  };

  useEffect(() => {
    return () => recognitionRef.current?.abort();
  }, []);

  return (
    <BaseTGDSLayout
      index={index}
      total={total}
      progressPercent={progressPercent}
      questionText={question}
      isListening={isListening}
      onToggleListening={toggleListening}
    />
  );
};