import React, { useEffect, useRef, useState } from 'react';
import { Mic, StopCircle, Send, RotateCcw } from 'lucide-react';
import { WordSet } from '@/types';
import { useVoiceGuide } from '@/hooks/useVoiceGuide';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

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
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [hasSpoken, setHasSpoken] = useState(false);

  /* ================= AI GUIDE ================= */
  const { status, isSpeaking, replay } = useVoiceGuide(
      `ต่อไปนะครับ ขอให้พูดคำทั้งสามคำที่จำไว้ก่อนหน้านี้
        พูดต่อเนื่องกันได้เลย ไม่ต้องรีบนะครับ
        เมื่อพร้อมแล้ว กดปุ่มไมค์สีแดงเพื่อเริ่มพูดครับ`,
  )


  /* ================= Speech Recognition ================= */
  const {
    isListening,
    transcript,
    words: recognizedWords,
    start,
    stop,
    reset,
  } = useSpeechRecognition({
    lang: 'th-TH',
    maxWords: 3,
  });

  const calculateScore = () => {
    const transcriptText = transcript.replace(/\s+/g, '');
    return correctWordSet.words.filter(word =>
      transcriptText.includes(word)
    ).length;
  };

  const handleSubmit = () => {
    setIsEvaluating(false);

    if (isListening) stop();

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


      {/* ================= Interaction Panel ================= */}
     <div
        className="
          w-full max-w-md
          bg-white
          border-4 border-primary/20
          rounded-[32px]
          shadow-xl
          px-6 py-8
          mt-2
          flex flex-col items-center gap-4
        "
      >
    
        {/* Status */}

        {isEvaluating && (
            <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
              <span className="text-lg font-medium">
                ผมได้รับคำตอบแล้วครับ 
              </span>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150" />
                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          )}

        {transcript && (
            <div
              className="
                mt-2 mb-2 px-6 py-3
                bg-gray-50 border-2 border-gray-200
                rounded-2xl text-center
                animate-fade-in
              "
            >
              <p className="text-lg text-gray-500">
                ได้ยินว่า:
              </p>
              <p className="text-2xl font-semibold text-gray-800 mt-1">
                {transcript}
              </p>
            </div>
          )}

        <div className="text-center space-y-2  flex items-center justify-center">
          {isSpeaking ? (
            <p className="text-gray-400 animate-pulse font-semibold">
              กำลังอธิบาย
            </p>
          ) : isListening ? (
            <div className="flex items-center gap-3 bg-red-50 px-6 py-2 rounded-full border-2 border-red-200">
              <ListeningWave />
              <span className="text-red-600 font-bold text-lg">
                กำลังฟังอยู่
              </span>
            </div>
          ) : !isEvaluating ? (
            <p className="text-gray-400 italic text-sm px-4">
              กดปุ่มแล้วพูดคำทั้ง 3 คำ ต่อเนื่องได้เลยครับ
            </p>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-12">

          {/* Mic */}
             <button
                onClick={() => {
                  if (isListening) {
                    setIsEvaluating(true);
                    stop();   
                    setTimeout(handleSubmit, 2000); 
    
                  } else {
                    reset();     
                    start();    
                  }
                }}
                disabled={isSpeaking}
                className={`
                  w-40 h-40 rounded-full
                  flex flex-col items-center justify-center
                  shadow-2xl transition-all
                  ${
                    isSpeaking
                      ? 'bg-gray-200 text-gray-400'
                      : isListening
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-red-500 text-white hover:scale-105 active:scale-95'
                  }
                `}
              >
                {isListening ? <StopCircle size={72} /> : <Mic size={72} />}
                <span className="mt-3 text-lg font-black">
                  {isListening ? 'กดเมื่อพูดครบแล้ว' : 'กดเพื่อพูด'}
                </span>
              </button>
          {/* Send */}
          
        </div>
          <p className="mt-4 text-gray-400 text-base text-center">
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

