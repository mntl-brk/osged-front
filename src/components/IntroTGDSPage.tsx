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

    speakSequentialWithPreload(
      `
      ต่อไปนะครับ จะเป็นการประเมินความรู้สึกของท่าน
      เป็นคำถามสั้น ๆ เกี่ยวกับความรู้สึกในช่วงสัปดาห์ที่ผ่านมา
      ไม่มีคำตอบที่ถูกหรือผิดนะครับ
      ขอให้ท่านตอบตามความรู้สึกจริงของตัวเอง
      ถ้าพร้อมแล้ว กดปุ่มเริ่มตอบคำถามได้เลยครับ
      `,
      () => setIsSpeaking(false),
      () => setIsSpeaking(true)
    );

    return () => {
      stopAudio();
    };
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12 animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
      
      <div className="bg-red-100 p-8 rounded-full text-red-500 mb-8 shadow-inner">
        <Heart size={80} strokeWidth={1.5} />
      </div>

      <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
        ส่วนที่ 2: การประเมินอารมณ์
      </h1>
      
      <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-xl leading-relaxed">
        ในส่วนถัดไปจะเป็นแบบสอบถามเกี่ยวกับ
        <span className="text-red-500 font-bold"> ความรู้สึก </span>
        ของท่านในช่วงสัปดาห์ที่ผ่านมา (TGDS-15)
      </p>

      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-10 w-full max-w-lg">
        <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
          มีคำถามทั้งหมด <strong>15 ข้อ</strong><br/>
          ให้ตอบว่า <strong>"ใช่"</strong> หรือ <strong>"ไม่ใช่"</strong><br/>
          ตามความรู้สึกจริงของท่าน
        </p>
      </div>

      <button 
        onClick={onStart}
        disabled={isSpeaking}
        className={`
          w-full max-w-md
          bg-primary hover:bg-primaryHover text-white 
          py-5 px-8 rounded-2xl 
          text-2xl font-bold 
          shadow-lg hover:shadow-xl hover:-translate-y-1
          transform transition-all duration-200
          flex items-center justify-center gap-3
          ${isSpeaking ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span>{isSpeaking ? 'กรุณารอฟังคำอธิบาย' : 'เริ่มตอบคำถาม'}</span>
        <ArrowRight size={32} strokeWidth={3} />
      </button>

    </div>
  );
};