import React, { useEffect, useState, useRef } from 'react';
import { Volume2, ArrowRight, RefreshCcw, Mic, StopCircle, CheckCircle, XCircle, Send, RotateCcw, VolumeX } from 'lucide-react';
import { WordSet } from '../types';
import { stopAudio } from '@/lib/audioManager';
import { speakSequentialWithPreload } from '@/lib/speakSequentialWithPreload';
import { isAudioUnlocked } from '@/lib/audioUnlock';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface AssessmentWordRegistrationPageProps {
  wordSet: WordSet;
  onReroll: () => void;
  onNext: () => void;
}

type CompleteStatus = 'correct' | 'attempted';
interface RoundResult {
  roundNumber: number;
  transcript: string;
  isCorrect: boolean;
}

export const AssessmentWordRegistrationPage: React.FC<AssessmentWordRegistrationPageProps> = ({ 
  wordSet, 
  onReroll,
  onNext 
}) => {
  // State
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempTranscript, setTempTranscript] = useState('');
  const [rounds, setRounds] = useState<RoundResult[]>([]);
  const [completed, setCompleted] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fallbackTimeoutRef = useRef<number | null>(null);
  
  const hasSpokenMicGuide = useRef(false);

  const transcriptBufferRef = useRef('');
  const hasSpokenCompletion = useRef(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const hasSpoken = useRef(false);

  const [isEncouraging, setIsEncouraging] = useState(false);

  const [autoReplay, setAutoReplay] = useState(false);
  const [attempt, setAttempt] = useState(1); // รอบที่ 1 หรือ 2
  const [needReplay, setNeedReplay] = useState(false);
  
  const [completeStatus, setCompleteStatus] = useState<CompleteStatus | null>(null);

    useEffect(() => {
      if (!isAudioUnlocked()) return;
      if (hasSpoken.current) return;
  
      hasSpoken.current = true;
      speakSequentialWithPreload(
        'ต่อไปเป็นการจำคำศัพท์ ผมจะอ่านคำศัพท์สามคำให้ฟัง ขอให้ตั้งใจฟังและจำคำเหล่านั้นไว้นะครับ เมื่อพร้อมแล้ว กดปุ่มลำโพงได้เลยครับ',
        () => {
          setIsSpeaking(false); 
        },
        () => {
          setIsSpeaking(true);
        }
      );
    }, []);
  
    useEffect(() => {
      return () => {
        stopAudio();
      };
    }, []);

  // Initialize Speech Recognition
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

  const speakWords = async () => {
    if (hasPlayedAudio || isPlaying) return;

    const textToSpeak = `
      คำที่หนึ่งคือ ${wordSet.words[0]}...
      คำที่สองคือ ${wordSet.words[1]}...
      และคำสุดท้ายคือ ${wordSet.words[2]}...
    `;

    setIsPlaying(true);

    speakSequentialWithPreload(
      textToSpeak,
      () => {
        setIsPlaying(false);
        setHasPlayedAudio(true);
      },
      () => {
        setIsPlaying(true);
      }
    );
  };

  useEffect(() => {
    if (!autoReplay) return;
    if (!isAudioUnlocked()) return;
    if (isPlaying) return;
    if (isEncouraging) return; 

    const textToSpeak = `
      ครั้งนี้ยังไม่ถูกต้องครับ ไม่เป็นไรนะครับ เดี๋ยวเราลองใหม่กันอีกครั้งนะครับ 
      มาครับลองกันอีกรอบนะครับ...
      คำที่หนึ่งคือ ${wordSet.words[0]}...
      คำที่สองคือ ${wordSet.words[1]}...
      และคำสุดท้ายคือ ${wordSet.words[2]}...
    `;

    setIsPlaying(true);

    speakSequentialWithPreload(
      textToSpeak,
      () => {
        setIsPlaying(false);
        setHasPlayedAudio(true);
        setAutoReplay(false);   
      },
      () => {
        setIsPlaying(true);
      }
    );
 }, [autoReplay, isEncouraging]);


  const skipAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setHasPlayedAudio(true);
    if (fallbackTimeoutRef.current) window.clearTimeout(fallbackTimeoutRef.current);
  };

  useEffect(() => {
    setHasPlayedAudio(false);
    setCompleted(false);
    setAttempt(1);
    reset();
    hasSpokenMicGuide.current = false;
    hasSpokenCompletion.current = false;
  }, [wordSet]);


  const handleSendAnswer = () => {
    stop();

    if (!transcript.trim()) {
      alert('กรุณาพูดคำศัพท์ก่อนกดส่ง');
      return;
    }

    const normalized = transcript.trim();
    const isCorrect = wordSet.words.every((w) =>
      normalized.includes(w)
    );

    if (isCorrect) {
      setCompleteStatus('correct');
      setCompleted(true);
      return;
    }

    if (attempt === 1) {
      setAttempt(2);
      setAutoReplay(true);
      setHasPlayedAudio(false);
      reset();
      return;
    }

    if (attempt === 2) {
      setAttempt(3);
      reset();
      return;
    }

    setCompleteStatus('attempted');
    setCompleted(true);
  };

  const showPlayButton = !hasPlayedAudio;
  const showMicSection = hasPlayedAudio && !completed;
  const showNextButton = completed;
    
  useEffect(() => {
      if (!showMicSection) return;
      if (!isAudioUnlocked()) return;
      if (hasSpokenMicGuide.current) return;

      hasSpokenMicGuide.current = true;

      speakSequentialWithPreload(
        'ขอให้พูดคำศัพท์ทั้งสามคำที่ได้ยินเมื่อครู่นี้นะครับ พูดทีละคำก็ได้ ไม่ต้องรีบ เมื่อพร้อมแล้ว กดปุ่มเพื่อเริ่มพูดได้เลยครับ',
        () => {
          setIsSpeaking(false);
        },
        () => {
          setIsSpeaking(true);
        }
      );
   }, [showMicSection]);

  const getDisplayWords = () => {
    return showMicSection ? recognizedWords : Array(3).fill('???');
  };

  useEffect(() => {
    if (!completed) return;
    if (hasSpokenCompletion.current) return;
    if (!isAudioUnlocked()) return;

    hasSpokenCompletion.current = true;

    stopAudio();

    let text = '';

    if (completeStatus === 'correct') {
      text = `
        เยี่ยมมากครับ คุณจำคำศัพท์ได้ถูกต้องครบทั้งสามคำ
        อย่าลืมจำคำเหล่านี้ไว้นะครับ
        เดี๋ยวผมจะกลับมาถามใหม่อีกครั้ง
      `;
    }

    if (completeStatus === 'attempted') {
      text = `
        ขอบคุณมากนะครับที่ตั้งใจทำแบบทดสอบ
        อย่าลืมจำคำศัพท์เหล่านี้ไว้นะครับ
        เดี๋ยวผมจะกลับมาถามใหม่อีกครั้ง
      `;
    }

    setIsSpeaking(true);
    speakSequentialWithPreload(
      text,
      () => {
        setIsSpeaking(false);
      },
      () => {
        setIsSpeaking(true);
      }
    );
  }, [completed, completeStatus]);


  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8 animate-fade-in flex flex-col items-center pb-32">

  {!completed && (
    <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 text-gray-900 mt-12">
      {showMicSection
        ? 'พูดคำทั้ง 3 คำที่ได้ยินเมื่อครู่'
        : 'กรุณาฟังและจำคำ 3 คำต่อไปนี้'}
    </h1>
  )}

   {attempt === 2 && !completed && (
      <div className="mb-6 flex justify-center">
        <p className="text-orange-500 font-semibold text-3xl">
          😊 ไม่เป็นไรนะครับ เดี๋ยวเราลองฟังและพูดอีกครั้งกัน
        </p>
      </div>
    )}

    {attempt === 3 && !completed && (
      <p className="text-red-500 font-semibold text-3xl mt-4 mb-8">
         ⚠️ รอบนี้เป็นรอบสุดท้าย มาลองกันอีกสักรอบกันครับ
      </p>
    )}

    {!completed && (
      <div className="flex flex-wrap justify-center gap-4 mb-8 w-full max-w-3xl">
        {[0, 1, 2].map((i) => {
            const displayWords = getDisplayWords();
            const displayText = showMicSection ? (displayWords[i] || '...') : '???';
            return (
                 <div key={i} className={`
                    w-40 h-24 rounded-2xl border-4 flex flex-col items-center justify-center transition-all
                    ${recognizedWords[i] 
                        ? 'bg-blue-50 border-primary text-primary shadow-lg scale-105' 
                        : 'bg-gray-50 border-gray-200 text-gray-400'}
                 `}>
                    <span className="text-base font-semibold opacity-70">คำที่ {i+1}</span>
                    <span className="text-4xl font-black">
                        {displayText}
                    </span>
                 </div>
            );
        })}
      </div>
      )}

      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        
        {showPlayButton ? (
            <div className="flex flex-col items-center gap-6 animate-fade-in w-full">
                <button
                  onClick={speakWords}
                  disabled={isPlaying || isSpeaking}
                  className={`
                    w-40 h-40 rounded-full flex items-center justify-center shadow-2xl border-8 transition-all mt-4
                    ${
                      isPlaying || isSpeaking
                        ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'bg-primary text-white border-blue-200 hover:scale-105'
                    }
                  `}
                >
                  <Volume2 size={80} className={isPlaying ? 'animate-pulse' : ''} />
                </button>
                <div className="text-center">
                    <p className="text-3xl font-bold text-gray-800 mb-2 mt-12">
                        {isPlaying ? 'กำลังอ่านคำศัพท์ให้ฟัง...' : 'กดปุ่มสีฟ้าเพื่อเริ่มฟังคำศัพท์'}
                    </p>
                    <p className="text-red-500 text-lg">
                        ฟังได้เพียงครั้งเดียวเท่านั้น โปรดตั้งใจฟัง
                    </p>
                </div>

                {/* <div className="flex flex-col gap-4 w-full max-w-xs">
                  <button
                      onClick={onReroll}
                      disabled={isPlaying || isSpeaking}
                      className={`
                        flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm transition-all
                        ${
                          isPlaying || isSpeaking
                            ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                            : 'text-gray-500 hover:text-primary border-gray-200 hover:bg-white'
                        }
                      `}
                  >
                      <RefreshCcw size={16} />
                      <span>สุ่มคำใหม่</span>
                  </button>
                  
                  <button
                      onClick={skipAudio}
                      disabled={isPlaying || isSpeaking}

                      className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 underline text-sm"
                  >
                      <VolumeX size={16} />
                      <span>ไม่ได้ยินเสียง? ข้ามไปพูดเลย</span>
                  </button>
                </div> */}
            </div>
        ) : null}

        {showMicSection && (
          <div className="flex flex-col items-center gap-10 animate-fade-in w-full min-w-3xl bg-white px-10 py-12 rounded-[40px] border-4 border-primary/20 shadow-2xl">

            {/* ===== Guide Text ===== */}
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

            {/* ===== Actions ===== */}
            <div className="flex items-center justify-center gap-12 w-full">

              {/* Mic Button */}
              <button
                onClick={() => (isListening ? stop() : start())}
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
                <span className="text-sm font-black mt-2 tracking-wider">
                  {isSpeaking ? 'รอฟัง' : isListening ? 'หยุดพูด' : 'พูด'}
                </span>
              </button>

              {/* Send Button (ไม่บล็อค) */}
              <button
                onClick={handleSendAnswer}
                className={`
                  w-28 h-28 rounded-full flex flex-col items-center justify-center
                  shadow-2xl border-[6px] transition-all
                  ${
                    recognizedWords.length === 0
                      ? 'bg-gray-100 border-gray-300 text-gray-400'
                      : 'bg-green-500 border-green-700 text-white hover:bg-green-600 hover:scale-110 active:scale-95'
                  }
                `}
              >
                <Send size={48} />
                <span className="text-sm font-black mt-2">
                  ส่งคำตอบ
                </span>
              </button>

            </div>
              <p className="text-gray-400 text-base">
                      หากนึกไม่ออก สามารถกดส่งคำตอบได้เลยครับ
              </p>
          </div>
        )}

       {completed && completeStatus === 'attempted' && (
          <div className="mt-42 flex flex-col items-center gap-6 animate-fade-in">

            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
              <CheckCircle size={56} className="text-blue-500" />
            </div>

            <p className="text-4xl font-bold text-blue-600 text-center">
              ทำครบตามขั้นตอนแล้วครับ
            </p>

            <p className="text-2xl text-gray-600 text-center max-w-md">
              ขอบคุณที่ตั้งใจทำแบบทดสอบนะครับ อย่าลืมจำคำเหล่านี้ไว้
            </p>

            <button
              onClick={onNext}
              className="
                mt-4
                w-full max-w-sm
                bg-primary hover:bg-primaryHover
                text-white h-24
                rounded-3xl text-3xl font-black
                shadow-2xl
                flex items-center justify-center gap-4
              "
            >
              ไปข้อถัดไป
              <ArrowRight size={44} strokeWidth={4} />
            </button>
          </div>
        )}

        {completed && completeStatus === 'correct' && (
          <div className="mt-42 flex flex-col items-center gap-6 animate-fade-in">
            <CheckCircle size={96} className="text-green-500" />

            <p className="text-4xl font-bold text-green-600">
              เยี่ยมมากครับ 🎉
            </p>

            <p className="text-2xl text-gray-600 text-center">
              คุณจำคำศัพท์ได้ถูกต้องครบทั้งสามคำ อย่าลืมจำคำเหล่านี้ไว้
            </p>

           <button
              onClick={onNext}
              disabled={isSpeaking}
              className={`
                mt-4 w-full max-w-sm h-24 rounded-3xl text-3xl font-black
                flex items-center justify-center gap-4
                transition-all
                ${
                  isSpeaking
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary hover:bg-primaryHover text-white'
                }
              `}
            >
              {isSpeaking ? 'กำลังอธิบาย...' : 'ไปข้อถัดไป'}
              <ArrowRight size={44} strokeWidth={4} />
            </button>
          </div>
        )}


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

