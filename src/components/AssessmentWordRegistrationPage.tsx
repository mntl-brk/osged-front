import React, { useEffect, useState, useRef } from 'react';
import { Volume2, ArrowRight, RefreshCcw, Mic, StopCircle, CheckCircle, XCircle, Send, RotateCcw, VolumeX } from 'lucide-react';
import { WordSet } from '../types';
import { AssessmentProgress } from './AssessmentProgress';

interface AssessmentWordRegistrationPageProps {
  wordSet: WordSet;
  onReroll: () => void;
  onNext: () => void;
}

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

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.lang = 'th-TH';
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        const results = event.results;
        const words: string[] = [];
        for (let i = 0; i < results.length; i++) {
            const transcript = results[i][0].transcript.trim();
            if (transcript) {
                 const subWords = transcript.split(/\s+/).filter((w: string) => w.length > 0);
                 words.push(...subWords);
            }
        }
        setRecognizedWords(words);
        setTempTranscript(words.join(' '));
      };

      recognitionRef.current.onerror = (e: any) => {
        console.error("Speech Recognition Error", e);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) setIsListening(false);
      };
    }

    return () => {
      if (fallbackTimeoutRef.current) window.clearTimeout(fallbackTimeoutRef.current);
      window.speechSynthesis.cancel();
    };
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
    if (fallbackTimeoutRef.current) window.clearTimeout(fallbackTimeoutRef.current);
  }, [wordSet]);

  const speakWords = () => {
    if (hasPlayedAudio || isPlaying) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const textToSpeak = `คำที่ 1... ${wordSet.words[0]}... คำที่ 2... ${wordSet.words[1]}... คำที่ 3... ${wordSet.words[2]}`;
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'th-TH';
      utterance.rate = 0.7; // Slower for elderly
      utterance.pitch = 1;
      
      utterance.onstart = () => {
        setIsPlaying(true);
        // Fallback timer: in case onend never fires (common browser bug)
        fallbackTimeoutRef.current = window.setTimeout(() => {
          if (isPlaying) {
            console.warn("TTS took too long, forcing end state.");
            handleAudioEnd();
          }
        }, 15000); // 15 seconds max
      };

      const handleAudioEnd = () => {
        setIsPlaying(false);
        setHasPlayedAudio(true);
        if (fallbackTimeoutRef.current) window.clearTimeout(fallbackTimeoutRef.current);
      };

      utterance.onend = handleAudioEnd;
      utterance.onerror = (e) => {
        console.error("Speech Synthesis Error", e);
        handleAudioEnd();
      };
      
      // Store reference to avoid garbage collection
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      setHasPlayedAudio(true);
    }
  };

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

  const handleResetRecording = () => {
     if (isListening) recognitionRef.current?.stop();
     setIsListening(false);
     setRecognizedWords([]);
     setTempTranscript('');
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
    setTempTranscript('');
    setRecognizedWords([]);
  };

  const handleRoundComplete = (transcript: string) => {
    const normalizedText = transcript.trim();
    const isCorrect = wordSet.words.every(word => normalizedText.includes(word));
    const roundNum = rounds.length + 1;
    
    const newResult: RoundResult = {
        roundNumber: roundNum,
        transcript: transcript,
        isCorrect: isCorrect
    };

    const newRounds = [...rounds, newResult];
    setRounds(newRounds);

    if (isCorrect || newRounds.length >= 3) {
        setCompleted(true);
    }
  };

  const showPlayButton = !hasPlayedAudio;
  const showMicSection = hasPlayedAudio && !completed;
  const showNextButton = completed;

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8 animate-fade-in flex flex-col items-center pb-32">
      <AssessmentProgress currentStep={1} />

      <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 text-gray-900 mt-2">
        กรุณาฟังและจำคำ 3 คำต่อไปนี้
      </h1>

      <div className="flex flex-wrap justify-center gap-4 mb-8 w-full max-w-3xl">
        {[0, 1, 2].map((i) => {
            const displayText = showMicSection ? (recognizedWords[i] || '...') : "???";
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

      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        
        {showPlayButton ? (
            <div className="flex flex-col items-center gap-6 animate-fade-in w-full">
                <button
                    onClick={speakWords}
                    disabled={isPlaying}
                    className={`
                        w-40 h-40 rounded-full flex items-center justify-center shadow-2xl border-8 transition-all
                        ${isPlaying 
                            ? 'bg-blue-100 border-blue-400 scale-110' 
                            : 'bg-primary text-white border-blue-200 hover:scale-105'}
                    `}
                >
                    <Volume2 size={80} className={isPlaying ? 'animate-pulse' : ''} />
                </button>
                <div className="text-center">
                    <p className="text-3xl font-bold text-gray-800 mb-2">
                        {isPlaying ? 'กำลังอ่านคำศัพท์ให้ฟัง...' : 'กดปุ่มสีฟ้าเพื่อฟังคำศัพท์'}
                    </p>
                    <p className="text-gray-500 text-lg">
                        ฟังได้เพียงครั้งเดียวเท่านั้น
                    </p>
                </div>

                <div className="flex flex-col gap-4 w-full max-w-xs">
                  <button
                      onClick={onReroll}
                      disabled={isPlaying}
                      className="flex items-center justify-center gap-2 text-gray-500 hover:text-primary py-2 px-4 border border-gray-200 rounded-xl hover:bg-white transition-all text-sm"
                  >
                      <RefreshCcw size={16} />
                      <span>สุ่มคำใหม่</span>
                  </button>
                  
                  <button
                      onClick={skipAudio}
                      className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 underline text-sm"
                  >
                      <VolumeX size={16} />
                      <span>ไม่ได้ยินเสียง? ข้ามไปพูดเลย</span>
                  </button>
                </div>
            </div>
        ) : null}

        {showMicSection ? (
             <div className="flex flex-col items-center gap-6 animate-fade-in w-full bg-white p-8 rounded-[40px] border-4 border-primary/20 shadow-2xl">
                <div className="text-center">
                    <p className="text-3xl font-black text-gray-900 mb-2">
                        พูดคำทั้ง 3 คำที่ได้ยินเมื่อครู่
                    </p>
                    <p className="text-gray-500 text-xl">
                        (เมื่อพูดครบแล้ว ให้กดปุ่ม "ส่งคำตอบ")
                    </p>
                </div>

                <div className="h-10 flex items-center justify-center">
                     {isListening ? (
                        <div className="flex items-center gap-3 bg-red-50 px-6 py-2 rounded-full border-2 border-red-200">
                             <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                             <span className="text-red-600 font-bold text-xl">กำลังตั้งใจฟัง...</span>
                        </div>
                     ) : (
                        <span className="text-gray-400 text-lg italic">กดปุ่มไมค์ด้านล่างเพื่อเริ่มพูด</span>
                     )}
                </div>

                <div className="flex items-center justify-center gap-8 w-full py-4">
                    {(recognizedWords.length > 0) && (
                         <button 
                            onClick={handleResetRecording}
                            className="w-20 h-20 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 flex items-center justify-center transition-all"
                            title="ล้างข้อมูล"
                         >
                            <RotateCcw size={32} />
                         </button>
                    )}

                    <button
                        onClick={toggleListening}
                        className={`
                            w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-2xl border-[6px] transition-all
                            ${isListening 
                                ? 'bg-white text-red-600 border-red-500 animate-pulse' 
                                : 'bg-red-500 text-white border-red-700 hover:scale-110 active:scale-95'}
                        `}
                    >
                        {isListening ? <StopCircle size={56} /> : <Mic size={56} />}
                        <span className="text-sm font-black mt-1 uppercase tracking-wider">
                            {isListening ? 'หยุด' : 'พูด'}
                        </span>
                    </button>

                    {(recognizedWords.length > 0) && (
                        <button
                            onClick={handleSendAnswer}
                            className="
                                w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-2xl border-[6px] transition-all
                                bg-green-500 border-green-700 text-white hover:bg-green-600 hover:scale-110 active:scale-95
                            "
                        >
                            <Send size={44} className="ml-1" />
                            <span className="text-sm font-black mt-1">ส่ง</span>
                        </button>
                    )}
                </div>
             </div>
        ) : null}

        {rounds.length > 0 && (
            <div className="w-full space-y-4 mt-4">
                {rounds.map((round) => (
                    <div 
                        key={round.roundNumber} 
                        className={`
                            w-full p-6 rounded-3xl border-4 flex flex-col md:flex-row items-center gap-4
                            ${round.isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-200'}
                        `}
                    >
                        <div className="shrink-0 w-14 h-14 rounded-full bg-white flex items-center justify-center font-black text-2xl shadow-md">
                            {round.roundNumber}
                        </div>
                        <div className="flex-grow text-center md:text-left">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">สิ่งที่คุณพูดไป:</p>
                            <p className="text-3xl font-bold text-gray-800">"{round.transcript}"</p>
                        </div>
                        <div className="shrink-0">
                             {round.isCorrect 
                                ? <CheckCircle size={48} className="text-green-600" />
                                : <XCircle size={48} className="text-red-400" />
                             }
                        </div>
                    </div>
                ))}
            </div>
        )}

        {showNextButton && (
            <button 
                onClick={onNext}
                className="
                    w-full max-w-sm mt-10
                    bg-primary hover:bg-primaryHover text-white 
                    h-24 rounded-3xl text-3xl font-black 
                    shadow-2xl hover:-translate-y-2
                    transform transition-all duration-200
                    flex items-center justify-center gap-4 animate-bounce-short
                "
            >
                <span>ไปข้อถัดไป</span>
                <ArrowRight size={44} strokeWidth={4} />
            </button>
        )}
      </div>
    </div>
  );
};