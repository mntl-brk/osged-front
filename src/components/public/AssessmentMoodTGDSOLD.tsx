import React, { useState, useEffect, useRef } from 'react';
import { Mic, ArrowRight, StopCircle, Send, CheckCircle2, MessageSquareQuote, RotateCcw } from 'lucide-react';
import { TGDS_QUESTIONS } from '@/data/tgdsQuestions';
interface AssessmentMoodTGDSPageProps {
  onComplete: (score: number) => void;
}

type AssessmentPhase = 'READING' | 'ANSWERING';

export const AssessmentMoodTGDSPage: React.FC<AssessmentMoodTGDSPageProps> = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<AssessmentPhase>('READING');
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const hasSpokenGuideRef = useRef(false);
  const [hasDetectedAnswer, setHasDetectedAnswer] = useState(false);

  const [hasFinishedReading, setHasFinishedReading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const phaseRef = useRef<AssessmentPhase>(phase);

   // Reset transcript and state when index or phase changes
  useEffect(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;

    setRecordedText('');
    setIsListening(false);
    setHasDetectedAnswer(false);
  }, [currentIdx]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
      

    const createRecognition = () => {
      const SR =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      const recognition = new SR();
      recognition.lang = 'th-TH';
      recognition.continuous = false; // ⭐ สำคัญ
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const result = event.results[0];
        if (!result.isFinal) return;

        const transcript = result[0].transcript.trim();
        setRecordedText(transcript);

        const t = transcript.toLowerCase();
        const isNo =
          t.includes('ไม่ใช่') ||
          (t.includes('ไม่') && !t.includes('ใช่'));

        const isYes =
          t.includes('ใช่') &&
          !t.includes('ไม่');

        if (isYes || isNo) {
         
          setHasDetectedAnswer(true);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      return recognition;
    };

const toggleListening = () => {
  // ======================
  // READING
  // ======================
  if (phase === 'READING') {
    if (!isListening) {
      recognitionRef.current?.abort();
      recognitionRef.current = createRecognition();
      recognitionRef.current.start();

      setIsListening(true);
    } else {
      recognitionRef.current?.stop();
      setIsListening(false);

      setPhase('ANSWERING');
    }
    return;
  }

  // ======================
  // ANSWERING
  // ======================
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
    const resetCurrentStep = () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      setRecordedText('');
      setHasDetectedAnswer(false);
      setIsListening(false);
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

    const isNo =
      t.includes('ไม่ใช่') ||
      t.includes('ไม่') ||
      t.includes('เปล่า') ||
      t.includes('ไม่ได้');

    const isYes =
      (t.includes('ใช่') ||
      t.includes('ครับ') ||
      t.includes('ค่ะ') ||
      t.includes('ถูก')) &&
      !t.includes('ไม่');

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


  const getAnswerDisplayText = () => {
    if (phase !== 'ANSWERING') return '';

    const t = recordedText.trim().toLowerCase();
    if (!t) return '';

    const isNo =
      t.includes('ไม่ใช่') ||
      (t.includes('ไม่') && !t.includes('ใช่'));

    const isYes =
      t.includes('ใช่') &&
      !t.includes('ไม่');

    if (isYes) return 'ใช่';
    if (isNo) return 'ไม่ใช่';

    return ''; 
  };

  const hasFinalAnswer = phase === 'ANSWERING' && recordedText.trim() !== '';

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
                absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-2 rounded-full text-white font-black text-xl shadow-lg w-64 text-center
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
       {phase === 'ANSWERING' && (
          getAnswerDisplayText() ? (
            <div className="p-8 rounded-[32px] border-4 bg-white border-green-300 shadow-inner text-center min-h-[140px] flex flex-col items-center justify-center animate-fade-in">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">
                คำตอบของท่าน
              </span>

              <p className="text-5xl font-black text-green-700">
                {getAnswerDisplayText()}
              </p>
            </div>
          ) : isListening ? (
            <div className="p-8 rounded-[32px] border-4 bg-red-50 border-red-200 text-center min-h-[140px] flex flex-col items-center justify-center animate-fade-in">
              <span className="text-xl font-black text-red-600 mb-4">
                กำลังฟังเสียงของท่าน
              </span>
              <ListeningWave />
            </div>
          ) : (
            <div className="p-8 rounded-[32px] border-4 border-dashed border-gray-100 text-center text-gray-400 font-bold text-xl h-[140px] flex items-center justify-center">
              กรุณาตอบว่า “ใช่” หรือ “ไม่ใช่”
            </div>
          )
        )}
      </div>

      {/* Controls Section */}
      <div className="flex flex-col gap-4 pb-12">
        
        {/* Main Recording Button */}

      {!hasFinalAnswer && (
        <button
          onClick={toggleListening}
          className={`
            w-full py-8 rounded-[35px]
            flex items-center justify-center gap-6
            text-4xl font-black shadow-2xl transition-all
            ${isListening
              ? 'bg-red-600 text-white animate-pulse'
              : phase === 'READING'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-green-600 text-white hover:bg-green-700'}
          `}
        >
          {isListening ? (
            <><StopCircle size={56} /> กดเมื่อพูดจบ</>
          ) : (
            <><Mic size={56} /> {phase === 'READING' ? 'เริ่มอ่านโจทย์' : 'เริ่มพูดคำตอบ'}</>
          )}
        </button>
      )}
              

        {/* Post-Recording Actions (Show only when not listening and has text) */}
        {!isListening && hasDetectedAnswer && (
            <div className="flex gap-4 w-full animate-fade-in-up">
                <button
                    onClick={resetCurrentStep}
                    className="flex-1 bg-white border-4 border-gray-300 text-gray-500 px-2 rounded-[30px] text-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all"
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
            <p className="text-center text-gray-400 text-lg font-medium mt-6">
                {phase === 'READING' ? 'กดปุ่มสีน้ำเงินแล้วอ่านตามข้อความในกรอบ' : 'กดปุ่มสีเขียวแล้วตอบว่า "ใช่" หรือ "ไม่ใช่"'}
            </p>
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

