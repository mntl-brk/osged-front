import React, { useEffect, useState, useRef } from 'react';
import { Volume2, ArrowRight, RefreshCcw, Mic, StopCircle, CheckCircle, XCircle, Send, RotateCcw, VolumeX } from 'lucide-react';
import { WordSet } from '../types';
import { stopAudio } from '@/lib/audioManager';
import { speakSequentialWithPreload } from '@/lib/speakSequentialWithPreload';
import { isAudioUnlocked } from '@/lib/audioUnlock';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useVoiceGuide } from '@/hooks/useVoiceGuide';

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
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [completeStatus, setCompleteStatus] = useState<CompleteStatus | null>(null);

    const {
      isSpeaking: isGuideSpeaking,
    } = useVoiceGuide(
        'ต่อไปเป็นการจำคำศัพท์ ผมจะอ่านคำศัพท์สามคำให้ฟัง ขอให้ตั้งใจฟังและจำคำเหล่านั้นไว้นะครับ เมื่อพร้อมแล้ว กดปุ่มลำโพงได้เลยครับ',
      {
        autoPlay: true,
        allowReplay: true,
      }
    )
  
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
      คำที่หนึ่งคือ ${wordSet.words[0]}
      คำที่สองคือ ${wordSet.words[1]}
      และคำสุดท้ายคือ ${wordSet.words[2]}
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
      มาครับลองกันอีกรอบ
      คำที่หนึ่งคือ ${wordSet.words[0]}
      คำที่สองคือ ${wordSet.words[1]}
      และคำสุดท้ายคือ ${wordSet.words[2]}
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


  const showPlayButton = !hasPlayedAudio;
  const showMicSection = hasPlayedAudio && !completed;
  const showNextButton = completed;
  const textshowMicSection = 'ขอให้พูดคำศัพท์ทั้งสามคำที่ได้ยินเมื่อครู่นี้นะครับ พูดต่อเนื่องกันทั้ง 3 คำได้เลย ไม่ต้องหยุดรอ เมื่อพูดครบแล้ว กดปุ่มส่งคำตอบได้เลยครับ';
  const [hasPlayedMicGuide, setHasPlayedMicGuide] = useState(false);

  const {
    isSpeaking: isMicGuideSpeaking,
  } = useVoiceGuide(
    textshowMicSection,
    {
      autoPlay: showMicSection && !hasPlayedMicGuide,
      allowReplay: false,
    }
  );

  useEffect(() => {
    if (showMicSection && !hasPlayedMicGuide) {
      setHasPlayedMicGuide(true);
    }
  }, [showMicSection, hasPlayedMicGuide]);
   
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


  const evaluateAnswer = () => {
    setIsEvaluating(false);
    
    if (!transcript.trim()) {
      alert("กรุณาพูดคำอย่างน้อย 1 คำครับ");
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

  const isBlocked = isSpeaking || isPlaying;

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8 animate-fade-in flex flex-col items-center pb-32">

    {!completed && (
      <div className="w-full max-w-2xl mx-auto text-center mt-10 mb-6 px-4">
        <h1 className="font-black text-gray-900 leading-tight
          text-2xl sm:text-3xl lg:text-5xl">
          {showMicSection
            ? 'พูดคำทั้ง 3 คำที่ได้ยินเมื่อสักครู่'
            : 'ฟังและจำคำ 3 คำต่อไปนี้'}
        </h1>
      </div>
    )}

    {/* รอบที่ 2 */}
    {attempt === 2 && !completed && (
      <div className="mx-auto mb-6 px-4">
        <div className="
          bg-orange-50 border-2 border-orange-200
          text-orange-600
          rounded-2xl px-5 py-4
          text-center font-semibold
          text-base sm:text-lg lg:text-2xl
        ">
          😊 ไม่เป็นไรนะครับ <br className="sm:hidden" />
          ลองฟังและพูดอีกครั้งได้เลยครับ
        </div>
      </div>
    )}

    {/* รอบสุดท้าย */}
    {attempt === 3 && !completed && (
      <div className="mx-auto mb-8 px-4">
        <div className="
          bg-red-50 border-2 border-red-300
          text-red-600
          rounded-2xl px-5 py-4
          text-center font-bold
          text-base sm:text-lg lg:text-2xl
        ">
          ⚠️ รอบสุดท้ายแล้วครับ <br className="sm:hidden" />
          ลองทำอีกครั้งอย่างเต็มที่นะครับ
        </div>
      </div>
    )}


      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        
        {showPlayButton ? (
            <div className="
              flex flex-col items-center gap-8
              w-full max-w-md
              bg-white px-6 py-8
              rounded-[32px]
              border-4 border-primary/20
              shadow-xl
              animate-fade-in
            ">

                <button
                  onClick={speakWords}
                  disabled={isPlaying || isGuideSpeaking}
                  className={`
                    w-40 h-40 rounded-full flex items-center justify-center shadow-2xl border-8 transition-all mt-4
                    ${
                      isPlaying || isGuideSpeaking
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
            <div className="
              flex flex-col items-center gap-6
              w-full max-w-md
              bg-white px-6 py-8
              rounded-[32px]
              border-4 border-primary/20
              shadow-xl
              animate-fade-in
            ">

          {/* ===== Progress ===== */}
          {isEvaluating && (
            <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
              <span className="text-lg font-medium">
                กำลังตรวจสอบให้ครับ
              </span>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150" />
                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          )}

            {transcript && (
              <div className="
                mt-2 px-6 py-2
                bg-gray-50 border-2 border-gray-200
                rounded-2xl text-center
              ">
                <p className="text-lg text-gray-600">
                  ได้ยินว่า:
                </p>
                <p className="text-2xl font-semibold text-gray-800 mt-2">
                  {transcript}
                </p>
              </div>
            )}

          {/* ===== Status ===== */}
          <div className="min-h-[56px] flex items-center justify-center text-center">
            {isMicGuideSpeaking ? (
              <span className="text-gray-500 text-lg font-semibold animate-pulse">
                กำลังอธิบาย กรุณารอฟัง
              </span>
            ) : isListening ? (
              <div className="flex items-center gap-3 bg-red-50 px-6 py-2 rounded-full border-2 border-red-200">
                <ListeningWave />
                <span className="text-red-600 font-bold text-lg">
                  กำลังฟังอยู่
                </span>
              </div>
            ) : (
              <span className="text-gray-400 text-base italic px-4">
                กดปุ่มแล้วพูดคำศัพท์ทั้ง 3 คำ ต่อเนื่องได้เลยครับ
              </span>
            )}
          </div>

          {/* ===== Mic Button (Primary) ===== */}
          <button
             onClick={() => {
                if (isListening) {
                  setIsEvaluating(true);
                  stop();
                  setTimeout(evaluateAnswer, 2000); 
                } else {
                  start();
                }
              }}
            disabled={isSpeaking}
            className={`
              w-44 h-44 rounded-full
              flex flex-col items-center justify-center
              shadow-2xl transition-all
              ${
                isSpeaking
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-red-500 text-white hover:scale-105 active:scale-95'
              }
            `}
          >
            {isListening ? <StopCircle size={72} /> : <Mic size={72} />}
            <span className="text-lg font-black mt-3">
                {isListening ? 'กดเมื่อพูดครบแล้ว' : 'กดเพื่อพูด'}
              </span>
          </button>

          {/* ===== Helper Text ===== */}
            <p className="text-gray-400 text-center text-base px-4">
              พูดเสร็จแล้วกดปุ่มสีแดงได้เลย ระบบจะตรวจสอบให้ทันที
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
              disabled={isBlocked}
              className={`
                mt-4
                w-full max-w-sm
                h-24
                rounded-3xl
                text-3xl
                font-black
                shadow-2xl
                flex items-center justify-center gap-4
                transition-all
                ${
                  isBlocked
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary hover:bg-primaryHover text-white'
                }
              `}
            >
              {isBlocked ? 'กำลังอธิบาย...' : 'ไปข้อถัดไป'}
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
              disabled={isBlocked}
              className={`
                mt-4 w-full max-w-sm h-24 rounded-3xl text-3xl font-black
                flex items-center justify-center gap-4
                transition-all
                ${
                  isBlocked
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

