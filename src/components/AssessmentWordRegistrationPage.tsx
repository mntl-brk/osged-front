import React, { useEffect, useState, useRef } from 'react';
import { Volume2, ArrowRight, RefreshCcw, Mic, StopCircle, CheckCircle, XCircle, Send, RotateCcw, VolumeX } from 'lucide-react';
import { WordSet } from '../types';
import { stopAudio } from '@/lib/audioManager';
import { speakSequentialWithPreload } from '@/lib/speakSequentialWithPreload';
import { isAudioUnlocked } from '@/lib/audioUnlock';

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
  const [isListening, setIsListening] = useState(false);
  const [tempTranscript, setTempTranscript] = useState('');
  const [recognizedWords, setRecognizedWords] = useState<string[]>([]);
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
        'ขั้นตอนที่หนึ่ง การจำคำศัพท์ครับ ในอีกสักครู่ ผมจะอ่านคำศัพท์จำนวนสามคำให้ท่านฟัง ขอให้ท่านตั้งใจฟัง และพยายามจำคำศัพท์ทั้งสามคำไว้ให้ดีนะครับ เมื่อพร้อมแล้ว กรุณากดปุ่มลำโพงสีฟ้าตรงกลางหน้าจอ เพื่อเริ่มฟังได้เลยครับ',
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
 useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = 'th-TH';
    recognition.continuous = true;      
    recognition.interimResults = false;   
    recognition.maxAlternatives = 1;
    
    recognition.onresult = (event: any) => {
      let newText = '';

      // อ่านเฉพาะ result ที่เพิ่มเข้ามา
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          newText += event.results[i][0].transcript + ' ';
        }
      }

      if (!newText) return;

      transcriptBufferRef.current += newText;

      const finalTranscript = transcriptBufferRef.current.trim();
      const words = finalTranscript.split(/\s+/).filter(Boolean);

      setTempTranscript(finalTranscript);
      setRecognizedWords(words);
    };

    recognition.onerror = (e: any) => {
      console.warn('Speech error:', e.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => recognition.abort();
  }, []);

  // Reset state when wordSet changes
  useEffect(() => {
    setHasPlayedAudio(false);
    setIsPlaying(false);
    setRounds([]);
    setCompleted(false);
    setIsListening(false);
    setTempTranscript('');
    setRecognizedWords([]);
    hasSpokenMicGuide.current = false;

    if (fallbackTimeoutRef.current) window.clearTimeout(fallbackTimeoutRef.current);
  }, [wordSet]);

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

  const toggleListening = () => {
    if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
    } else {
        transcriptBufferRef.current = '';  
        setTempTranscript(''); 
        setRecognizedWords([]);
        try {
            recognitionRef.current?.start();
            setIsListening(true);
        } catch(e) {
            setTimeout(() => {
                try { recognitionRef.current.start(); setIsListening(true); } catch(err) {}
            }, 300);
        }
    }
  };

  const handleSendAnswer = () => {
    if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
    }
    if (!tempTranscript.trim()) {
        alert("กรุณาพูดคำศัพท์ก่อนกดส่ง");
        return;
    }
    handleRoundComplete(tempTranscript);

    transcriptBufferRef.current = '';
    setTempTranscript('');
    setRecognizedWords([]);
  };

  const handleRoundComplete = (transcript: string) => {
    const normalizedText = transcript.trim();
    const isCorrect = wordSet.words.every(word =>
      normalizedText.includes(word)
    );

    // ✅ ตอบถูก → จบทันที
    if (isCorrect) {
      setCompleteStatus('correct');
      setCompleted(true);
      return;
    }

    if (attempt === 1) {
      // รอบแรก → ปลอบ + replay
      setAttempt(2);
      setNeedReplay(true);        // AI พูด
      setAutoReplay(true);        // อ่านคำ 3 คำใหม่
      setHasPlayedAudio(false);   // กลับไปลำโพงฟ้า
      return;
    }

    if (attempt === 2) {
      // รอบสอง → พูดอย่างเดียว
      setAttempt(3);
      return;
    }

    if (attempt === 3) {
      // รอบสุดท้าย → แสดงว่าผิด
      setCompleteStatus('attempted');
      setCompleted(true);
    }
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
        'ต่อไปนะครับ ขอให้ท่านพูดคำศัพท์ทั้งสามคำที่ได้ยินเมื่อครู่นี้ พูดทีละคำก็ได้ ไม่ต้องรีบครับ เมื่อพร้อมแล้ว ให้กดปุ่มสีแดงตรงกลางด้านล่างเพื่อเริ่มพูด และเมื่อพูดครบแล้ว ให้กดปุ่มส่งคำตอบครับ',
        () => {
          setIsSpeaking(false);
        },
        () => {
          setIsSpeaking(true);
        }
      );
   }, [showMicSection]);

  const getDisplayWords = () => {
    const words = tempTranscript.trim().split(/\s+/).filter(Boolean);

    return [
      words[0] || '',
      words[1] || '',
      words[2] || '',
    ];
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

   {attempt === 2 && (
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
                    flex flex-col items-center justify-center
                    px-4 py-3 rounded-2xl border-4 min-w-[140px] h-[100px] transition-all
                    ${recognizedWords[i] 
                        ? 'bg-blue-50 border-primary text-primary shadow-lg scale-105' 
                        : 'bg-gray-50 border-gray-200 text-gray-300'}
                 `}>
                    <span className="text-sm font-bold opacity-70 mb-1">คำที่ {i+1}</span>
                    <span className="text-3xl font-black">
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

                <div className="flex flex-col gap-4 w-full max-w-xs">
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
                </div>
            </div>
        ) : null}

        {showMicSection && (
          <div className="flex flex-col items-center gap-10 animate-fade-in w-full bg-white p-10 rounded-[40px] border-4 border-primary/20 shadow-2xl">

            {/* ===== Guide Text ===== */}
            <div className="text-center space-y-2">

               <div className={`${isSpeaking ? 'opacity-30 blur-sm' : ''} transition-all`}>
                <p className="text-lg text-gray-500">
                  คุณพูดได้ <span className="font-bold">{recognizedWords.length}</span> จาก 3 คำ
                </p>

                {recognizedWords.length < 3 && (
                  <p className="text-gray-400 text-base">
                    หากนึกไม่ออก สามารถกดส่งคำตอบได้เลยครับ
                  </p>
                )}
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

