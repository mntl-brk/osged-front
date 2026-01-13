import { useEffect, useRef, useState } from 'react';

interface UseSpeechRecognitionOptions {
  lang?: string;
  maxWords?: number;
  enabled?: boolean;
}

export const useSpeechRecognition = ({
  lang = 'th-TH',
  maxWords = 3,
  enabled = true,
}: UseSpeechRecognitionOptions = {}) => {
  const recognitionRef = useRef<any>(null);
  const listeningRef = useRef(false);
  const bufferRef = useRef('');

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Init ---------- */
  useEffect(() => {
    if (!enabled) return;
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError('SpeechRecognition not supported');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      if (!result.isFinal) return;

      const text = result[0].transcript?.trim();
      if (!text) return;

      bufferRef.current += ' ' + text;

      const normalized = bufferRef.current.trim();
      const parsedWords = normalized
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, maxWords);

      setTranscript(normalized);
      setWords(parsedWords);
    };

    recognition.onerror = (e: any) => {
      setError(e.error || 'speech error');
    };

    recognition.onend = () => {
      if (listeningRef.current) {
        try {
          recognition.start();
        } catch {}
      }
    };

    recognitionRef.current = recognition;

    return () => recognition.abort();
  }, [enabled, lang, maxWords]);

  /* ---------- Controls ---------- */
  const start = () => {
    if (!recognitionRef.current) return;

    bufferRef.current = '';
    setTranscript('');
    setWords([]);
    setError(null);

    try {
      recognitionRef.current.stop();
    } catch {}

    setTimeout(() => {
      try {
        recognitionRef.current.start();
        listeningRef.current = true;
        setIsListening(true);
      } catch {}
    }, 150);
  };

  const stop = () => {
    listeningRef.current = false;
    setIsListening(false);
    try {
      recognitionRef.current?.stop();
    } catch {}
  };

  const reset = () => {
    bufferRef.current = '';
    setTranscript('');
    setWords([]);
  };

  return {
    isListening,
    transcript,
    words,
    error,
    start,
    stop,
    reset,
  };
};