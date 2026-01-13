import React, { useEffect, useRef, useState } from 'react';
import { Mic, StopCircle, Send, RotateCcw } from 'lucide-react';
import { WordSet } from '../types';
import { speakSequentialWithPreload } from '@/lib/speakSequentialWithPreload';
import { isAudioUnlocked } from '@/lib/audioUnlock';
import { stopAudio } from '@/lib/audioManager';

interface AssessmentWordRecallPageProps {
  correctWordSet: WordSet;
  onNext: (score: number, recalledWords: string[]) => void;
}

export const AssessmentWordRecallPage: React.FC<AssessmentWordRecallPageProps> = ({
  correctWordSet,
  onNext,
}) => {
  const recognitionRef = useRef<any>(null);
  const transcriptBufferRef = useRef('');
  const hasSpokenGuideRef = useRef(false);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognizedWords, setRecognizedWords] = useState<string[]>([]);
  const [hasSpoken, setHasSpoken] = useState(false);

  /* ================= AI GUIDE ================= */
  useEffect(() => {
    if (!isAudioUnlocked()) return;
    if (hasSpokenGuideRef.current) return;

    hasSpokenGuideRef.current = true;

    speakSequentialWithPreload(
      'ต่อไปนะครับ ขอให้พูดคำศัพท์ทั้งสามคำที่ขอให้จำไว้ก่อนหน้านี้ พูดทีละคำก็ได้ ไม่ต้องรีบ เมื่อพร้อมแล้ว กดปุ่มไมค์สีแดงเพื่อเริ่มพูดครับ',
      () => setIsSpeaking(false),
      () => setIsSpeaking(true)
    );

    return () => stopAudio();
  }, []);

  /* ================= Speech Recognition ================= */
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'th-TH';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      let newText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          newText += event.results[i][0].transcript + ' ';
        }
      }

      if (!newText) return;

      transcriptBufferRef.current += newText;

      const words = transcriptBufferRef.current
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 3);

      setRecognizedWords(words);
      setHasSpoken(true);
    };

    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;

    return () => recognition.abort();
  }, []);

  /* ================= Actions ================= */
  const toggleListening = () => {
    if (isSpeaking) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleUndoLastWord = () => {
    if (recognizedWords.length === 0) return;
    const updated = recognizedWords.slice(0, -1);
    setRecognizedWords(updated);
    transcriptBufferRef.current = updated.join(' ');
  };

  const calculateScore = () => {
    const targets = correctWordSet.words.map(w => w.trim());
    return recognizedWords.filter(w => targets.includes(w)).length;
  };

  const handleSubmit = () => {
    if (isListening) recognitionRef.current?.stop();
    onNext(calculateScore(), recognizedWords);
  };

  const displayWords = [
    recognizedWords[0] || '',
    recognizedWords[1] || '',
    recognizedWords[2] || '',
  ];

  /* ================= UI ================= */
  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-10 animate-fade-in flex flex-col items-center">

      <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 text-gray-900 mt-12">
        พูดคำทั้ง 3 คำที่ขอให้จำก่อนหน้านี้
      </h1>

      {/* Word Slots */}
        <div className="flex justify-center gap-6">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`
                w-40 h-24 rounded-2xl border-4
                flex flex-col items-center justify-center
                transition-all
                ${
                  displayWords[i]
                    ? 'bg-blue-50 border-primary text-primary shadow-lg scale-105'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }
              `}
            >
              <span className="text-base font-semibold opacity-70">
                คำที่ {i + 1}
              </span>
              <span className="text-4xl font-black">
                {displayWords[i] || '...'}
              </span>
            </div>
          ))}
        </div>

      {/* ================= Interaction Panel ================= */}
      <div
        className="
          w-full max-w-3xl
          bg-white
          border-4 border-primary/20
          rounded-[48px]
          shadow-2xl
          px-10 py-12
          mt-6
          flex flex-col items-center gap-10
        "
      >

        {/* Status */}
        <div className="text-center space-y-2">

               <div className={`${isSpeaking ? 'opacity-30 blur-sm' : ''} transition-all`}>
                <p className="text-xl text-gray-500">
                  คุณพูดได้ <span className="font-bold">{recognizedWords.length}</span> จาก 3 คำ
                </p>
              </div>
            </div>

            {/* ===== Status ===== */}
            <div className="h-4 flex items-center justify-center">
              {isSpeaking ? (
                <span className="text-gray-500 text-lg font-semibold animate-pulse">
                   กำลังอธิบาย กรุณารอฟังให้จบ
                </span>
              ) : isListening ? (
                <div className="flex items-center gap-4 bg-red-50 px-8 py-3 rounded-full border-2 border-red-200">
                  <ListeningWave />
                  <span className="text-red-600 font-bold text-xl">
                    กำลังฟังอยู่...
                  </span>
                </div>
              ) : (
                <span className="text-gray-400 text-lg italic">
                  กดปุ่มไมค์ด้านล่างเพื่อเริ่มพูด
                </span>
              )}
            </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-12">

          {/* Undo */}
          <button
            onClick={handleUndoLastWord}
            disabled={recognizedWords.length === 0}
            className={`
              w-20 h-20 rounded-full
              flex items-center justify-center
              shadow-md transition-all
              ${
                recognizedWords.length === 0
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }
            `}
          >
            <RotateCcw size={28} />
          </button>

          {/* Mic */}
          <button
            onClick={toggleListening}
            disabled={isSpeaking}
            className={`
              w-36 h-36 rounded-full flex flex-col items-center justify-center
              shadow-2xl border-[6px] transition-all
              ${
                isSpeaking
                  ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                  : isListening
                    ? 'bg-white text-red-600 border-red-500 animate-pulse'
                    : 'bg-red-500 text-white border-red-700 hover:scale-110 active:scale-95'
              }
            `}
          >
            {isListening ? <StopCircle size={64} /> : <Mic size={64} />}
            <span className="text-sm font-black mt-2">
              {isListening ? 'หยุดพูด' : 'พูด'}
            </span>
          </button>

          {/* Send */}
          <button
            onClick={handleSubmit}
            className={`
              w-28 h-28 rounded-full flex flex-col items-center justify-center
              shadow-2xl border-[6px] transition-all
              ${
                recognizedWords.length === 0
                  ? 'bg-gray-100 border-gray-300 text-gray-400'
                  : 'bg-green-500 border-green-700 text-white hover:scale-110 active:scale-95'
              }
            `}
          >
            <Send size={48} />
            <span className="text-sm font-black mt-2">
              ส่งคำตอบ
            </span>
          </button>


        </div>

          <p className="mt-2 text-gray-400 text-base">
            หากนึกไม่ออก สามารถกดส่งคำตอบได้เลยครับ
          </p>
      </div>

    </div>
  );
};

const ListeningWave = () => (
  <div className="flex items-center gap-1">
    {[1, 2, 3].map(i => (
      <span
        key={i}
        className="w-2 h-6 bg-red-500 rounded-full animate-wave"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

