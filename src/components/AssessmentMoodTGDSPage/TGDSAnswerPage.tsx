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
  const [rawTranscript, setRawTranscript] = useState('');
  const [hasDetectedAnswer, setHasDetectedAnswer] = useState(false);
  const [finalAnswer, setFinalAnswer] = useState<boolean | null>(null);

  const recognitionRef = useRef<any>(null);

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
      const t = transcript.toLowerCase();

      setRawTranscript(transcript);

      if (t.includes('ไม่') && !t.includes('ใช่')) {
        rec.stop();
        setFinalAnswer(false);
        setHasDetectedAnswer(true);
        setIsListening(false);
      }

      if (t.includes('ใช่') && !t.includes('ไม่')) {
        rec.stop();
        setFinalAnswer(true);
        setHasDetectedAnswer(true);
        setIsListening(false);
      }
    };

    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);

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
    }
  };

  const resetAnswer = () => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;

    setRawTranscript('');
    setFinalAnswer(null);
    setHasDetectedAnswer(false);
    setIsListening(false);
  };

  const getAnswerDisplayText = () => {
    if (finalAnswer === true) return 'ใช่';
    if (finalAnswer === false) return 'ไม่ใช่';
    return '';
    };

  useEffect(() => {
    return () => recognitionRef.current?.abort();
  }, []);

  return (
    <BaseTGDSLayout
      phase="ANSWERING"
      index={index}
      total={total}
      progressPercent={progressPercent}
      questionText={question}
      isListening={isListening}
      onToggleListening={toggleListening}
      recordedText={rawTranscript}
      hasDetectedAnswer={hasDetectedAnswer}
      getAnswerDisplayText={getAnswerDisplayText} 
      onResetAnswer={resetAnswer}
      onSubmitAnswer={() => {
        if (finalAnswer !== null) onAnswer(finalAnswer);
      }}
    />
  );
};