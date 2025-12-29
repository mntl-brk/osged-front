import React, { useState, useEffect, useRef } from 'react';
import { Mic, ArrowRight, StopCircle, Send, CheckCircle2, MessageSquareQuote, RotateCcw } from 'lucide-react';

interface AssessmentMoodTGDSPageProps {
  onComplete: (score: number) => void;
}

const TGDS_QUESTIONS = [
  { id: 1, text: "คุณพอใจกับชีวิตความเป็นอยู่ของคุณตอนนี้หรือไม่?", scoreTarget: false },
  { id: 2, text: "คุณไม่อยากทำกิจกรรมที่เคยชอบทำหรือเลิกทำไปหรือไม่?", scoreTarget: true },
  { id: 3, text: "คุณรู้สึกว่าชีวิตของคุณว่างเปล่าหรือไม่?", scoreTarget: true },
  { id: 4, text: "คุณรู้สึกเบื่อหน่ายบ่อย ๆ หรือไม่?", scoreTarget: true },
  { id: 5, text: "คุณหวังว่าจะมีสิ่งดี ๆ เกิดขึ้นในวันข้างหน้าหรือไม่?", scoreTarget: false },
  { id: 6, text: "คุณมีเรื่องกังวลตลอดเวลา และเลิกคิดไม่ได้หรือไม่?", scoreTarget: true },
  { id: 7, text: "ส่วนใหญ่แล้วคุณรู้สึกอารมณ์ดีหรือไม่?", scoreTarget: false },
  { id: 8, text: "คุณรู้สึกกลัวว่าจะมีเรื่องไม่ดีเกิดขึ้นกับคุณหรือไม่?", scoreTarget: true },
  { id: 9, text: "ส่วนใหญ่คุณชอบอยู่กับบ้าน มากกว่าที่จะออกไปข้างนอกหรือไม่?", scoreTarget: true },
  { id: 10, text: "คุณรู้สึกว่าความจำของคุณไม่ดีเท่าคนอื่นหรือไม่?", scoreTarget: true },
  { id: 11, text: "คุณรู้สึกว่าการที่มีชีวิตอยู่ถึงปัจจุบันนี้ เป็นเรื่องที่ดีหรือไม่?", scoreTarget: false },
  { id: 12, text: "คุณรู้สึกว่าตัวเองไม่มีค่าหรือไม่?", scoreTarget: true },
  { id: 13, text: "คุณรู้สึกว่าตนเองมีพลังเต็มที่หรือไม่?", scoreTarget: false },
  { id: 14, text: "คุณรู้สึกว่าเหตุการณ์ปัจจุบันสิ้นหวังหรือไม่?", scoreTarget: true },
  { id: 15, text: "คุณรู้สึกว่าคนอื่นโชคดีกว่าคุณหรือไม่?", scoreTarget: true },
];

type AssessmentPhase = 'READING' | 'ANSWERING';

export const AssessmentMoodTGDSPage: React.FC<AssessmentMoodTGDSPageProps> = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<AssessmentPhase>('READING');
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; 
      recognitionRef.current.lang = 'th-TH';
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
           finalTranscript += event.results[i][0].transcript;
        }
        setRecordedText(finalTranscript);
      };

      recognitionRef.current.onerror = (e: any) => {
        console.error("Speech error:", e);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Reset transcript and state when index or phase changes
  useEffect(() => {
    setRecordedText('');
    setIsListening(false);
  }, [currentIdx, phase]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      
      // If we were in reading phase, transition to answering phase after stopping
      if (phase === 'READING') {
        setPhase('ANSWERING');
      }
    } else {
      setRecordedText('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition error:", e);
      }
    }
  };

  const resetCurrentStep = () => {
    if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
    }
    setRecordedText('');
  };

  const handleSendVoiceAnswer = () => {
    if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
    }
    
    if (phase === 'READING') {
        // This part shouldn't normally be reachable with the updated button logic, 
        // but as a fallback, transition to answer phase
        setPhase('ANSWERING');
    } else {
        processVoiceAnswer(recordedText);
    }
  };

  const processVoiceAnswer = (text: string) => {
    const t = text.trim().toLowerCase();
    
    if (!t) {
        alert("ยังไม่ได้ยินเสียงพูด กรุณาพูดว่า 'ใช่' หรือ 'ไม่ใช่'");
        return;
    }

    // Comprehensive Thai "No" checks
    const isNo = t.includes('ไม่') || t.includes('เปล่า') || t.includes('ไม่ได้');
    // Comprehensive Thai "Yes" checks
    const isYes = (t.includes('ใช่') || t.includes('ครับ') || t.includes('ค่ะ') || t.includes('ถูก')) && !t.includes('ไม่');

    if (isNo) {
        saveAnswerAndMove(false);
    } 
    else if (isYes) {
        saveAnswerAndMove(true);
    } 
    else {
        alert(`ระบบได้ยินว่า: "${text}"\n\nกรุณาตอบใหม่ให้ชัดเจนว่า "ใช่" หรือ "ไม่ใช่"`);
        setRecordedText('');
    }
  };

  const saveAnswerAndMove = (answer: boolean) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentIdx < TGDS_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setPhase('READING');
    } else {
      calculateScore(newAnswers);
    }
  };

  const calculateScore = (finalAnswers: boolean[]) => {
    let score = 0;
    finalAnswers.forEach((ans, idx) => {
      if (ans === TGDS_QUESTIONS[idx].scoreTarget) {
        score += 1;
      }
    });
    onComplete(score);
  };

  const currentQuestion = TGDS_QUESTIONS[currentIdx];
  const progressPercent = ((currentIdx + 1) / TGDS_QUESTIONS.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-8 animate-fade-in flex flex-col min-h-[85vh]">
      
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex justify-between items-end text-lg font-bold text-gray-400 mb-2">
            <div>
                <span className="text-primary block text-sm">การประเมินส่วนที่ 2</span>
                <span className="text-gray-900 text-2xl">ข้อที่ {currentIdx + 1} / {TGDS_QUESTIONS.length}</span>
            </div>
            <div className={`px-4 py-1 rounded-full text-sm ${phase === 'READING' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                {phase === 'READING' ? 'ขั้นตอน: อ่านโจทย์' : 'ขั้นตอน: ตอบคำถาม'}
            </div>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
                className={`h-full transition-all duration-500 ease-out ${phase === 'READING' ? 'bg-blue-500' : 'bg-green-500'}`}
                style={{ width: `${progressPercent}%` }}
            />
        </div>
      </div>

      {/* Main Question Bubble */}
      <div className="flex-grow flex flex-col justify-center mb-8">
        <div className={`
            relative bg-white border-[6px] rounded-[40px] p-8 md:p-12 shadow-2xl transition-all duration-300
            ${phase === 'READING' ? 'border-blue-500 shadow-blue-100' : 'border-green-500 shadow-green-100'}
        `}>
            <div className={`
                absolute -top-6 left-1/2 -translate-x-1/2 px-8 py-2 rounded-full text-white font-black text-xl shadow-lg
                ${phase === 'READING' ? 'bg-blue-600' : 'bg-green-600'}
            `}>
                {phase === 'READING' ? 'อ่านออกเสียงข้อความนี้' : 'ตอบว่า "ใช่" หรือ "ไม่ใช่"'}
            </div>

            <div className="flex flex-col items-center gap-6 text-center">
                <div className={`p-5 rounded-full ${phase === 'READING' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                    {phase === 'READING' ? <MessageSquareQuote size={56} /> : <CheckCircle2 size={56} />}
                </div>

                <p className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                    {currentQuestion.text}
                </p>
            </div>
        </div>
      </div>

      {/* Voice Transcription Display */}
      <div className="mb-8">
        {(isListening || recordedText) ? (
            <div className={`
                p-8 rounded-[32px] border-4 text-center min-h-[140px] flex flex-col items-center justify-center animate-fade-in transition-all
                ${isListening ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 shadow-inner'}
            `}>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">ระบบได้ยินว่า:</span>
                <p className="text-4xl text-gray-900 font-black">
                    {recordedText || (
                        <span className="flex items-center gap-3 text-red-600">
                            <span className="w-5 h-5 bg-red-600 rounded-full animate-ping"></span>
                            กำลังฟัง...
                        </span>
                    )}
                </p>
            </div>
        ) : (
            <div className="p-8 rounded-[32px] border-4 border-dashed border-gray-100 text-center text-gray-300 font-bold text-xl h-[140px] flex items-center justify-center">
                 {phase === 'READING' ? 'กรุณากดปุ่มเพื่อเริ่มอ่าน' : 'กรุณากดปุ่มเพื่อพูดคำตอบ'}
            </div>
        )}
      </div>

      {/* Controls Section */}
      <div className="flex flex-col gap-4 pb-12">
        
        {/* Main Recording Button */}
        <button
            onClick={toggleListening}
            className={`
                w-full py-8 rounded-[35px] flex items-center justify-center gap-6 text-4xl font-black shadow-2xl transition-all transform active:scale-95
                ${isListening 
                    ? 'bg-red-600 text-white animate-pulse' 
                    : phase === 'READING'
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'}
            `}
        >
            {isListening ? (
                <><StopCircle size={56} strokeWidth={3}/> กดเมื่อพูดจบ</>
            ) : (
                <><Mic size={56} strokeWidth={3}/> {phase === 'READING' ? 'เริ่มอ่านโจทย์' : 'เริ่มพูดคำตอบ'}</>
            )}
        </button>

        {/* Post-Recording Actions (Show only when not listening and has text) */}
        {!isListening && recordedText && (
            <div className="flex gap-4 w-full animate-fade-in-up">
                <button
                    onClick={resetCurrentStep}
                    className="flex-1 bg-white border-4 border-gray-300 text-gray-500 py-6 rounded-[30px] text-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all"
                >
                    <RotateCcw size={32} />
                    พูดใหม่
                </button>
                
                <button
                    onClick={handleSendVoiceAnswer}
                    className="flex-[2] bg-gray-900 text-white py-6 rounded-[30px] text-3xl font-black flex items-center justify-center gap-4 hover:bg-black shadow-xl transition-all"
                >
                    <span>ส่งคำตอบ</span>
                    <Send size={36} />
                </button>
            </div>
        )}

        {/* Skip/Manual Fallback Label (Disabled but kept for structure) */}
        {!isListening && !recordedText && (
            <p className="text-center text-gray-400 text-lg font-medium">
                {phase === 'READING' ? 'กดปุ่มสีน้ำเงินแล้วอ่านตามข้อความในกรอบ' : 'กดปุ่มสีเขียวแล้วตอบว่า "ใช่" หรือ "ไม่ใช่"'}
            </p>
        )}
      </div>

    </div>
  );
};