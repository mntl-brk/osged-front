import React, { useEffect, useRef, useState } from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { speakSequentialWithPreload } from '@/lib/speakSequentialWithPreload';
import { isAudioUnlocked } from '@/lib/audioUnlock';
import { stopAudio } from '@/lib/audioManager';

interface IntroTGDSPageProps {
  onStart: () => void;
}

export const IntroTGDSPage: React.FC<IntroTGDSPageProps> = ({ onStart }) => {
  const hasSpokenGuideRef = useRef(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  /* ================= AI GUIDE ================= */
  useEffect(() => {
    if (!isAudioUnlocked()) return;
    if (hasSpokenGuideRef.current) return;

    hasSpokenGuideRef.current = true;

    // 🔒 lock ก่อนพูด
    setIsSpeaking(true);

    speakSequentialWithPreload(
      `
      ต่อไปนะครับ จะเป็นการประเมินความรู้สึกของท่าน
      เป็นคำถามสั้น ๆ เกี่ยวกับความรู้สึกในช่วงสัปดาห์ที่ผ่านมา
      ไม่มีคำตอบที่ถูกหรือผิดนะครับ
      ขอให้ท่านอ่านคำถามให้จบก่อน
      แล้วจึงตอบว่า ใช่ หรือ ไม่ใช่
      ตามความรู้สึกจริงของตัวเอง
      ถ้าพร้อมแล้ว กดปุ่มเริ่มตอบคำถามได้เลยครับ
      `,
      () => {
        // 🔓 unlock หลังพูดจบ
        setIsSpeaking(false);
      },
      () => {
        // safety redundancy
        setIsSpeaking(true);
      }
    );

    return () => {
      stopAudio();
    };
  }, []);

  /* ================= UI ================= */
  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12 animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
      
      {/* Icon */}
      <div className="bg-red-100 p-8 rounded-full text-red-500 mb-8 shadow-inner">
        <Heart size={80} strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
        ส่วนที่ 2: การประเมินอารมณ์
      </h1>
      
      {/* Description */}
      <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-xl leading-relaxed">
        ในส่วนถัดไปจะเป็นแบบสอบถามเกี่ยวกับ
        <span className="text-red-500 font-bold"> ความรู้สึก </span>
        ของท่านในช่วงสัปดาห์ที่ผ่านมา (TGDS-15)
      </p>

      {/* Instruction Box */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-10 w-full max-w-lg">
        <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
          มีคำถามทั้งหมด <strong>15 ข้อ</strong><br/>
          ให้ตอบว่า <strong className='text-red-500'>"ใช่"</strong> หรือ <strong className='text-red-500'>"ไม่ใช่"</strong><br/>
          <span className="font-semibold text-red-500">
            กรุณาอ่านคำถามให้จบก่อนตอบ
          </span><br/>
          ตามความรู้สึกจริงของท่าน
        </p>
      </div>

      {/* Start Button */}
      <button 
        onClick={onStart}
        disabled={isSpeaking}
        className={`
          w-full max-w-md
          py-5 px-8 rounded-2xl 
          text-2xl font-bold 
          shadow-lg
          flex items-center justify-center gap-3
          transition-all duration-200
          ${
            isSpeaking
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary hover:bg-primaryHover text-white hover:-translate-y-1 hover:shadow-xl'
          }
        `}
      >
        <span>
          {isSpeaking ? 'กรุณารอฟังคำอธิบายให้จบ' : 'เริ่มตอบคำถาม'}
        </span>
        <ArrowRight size={32} strokeWidth={3} />
      </button>

    </div>
  );
};