import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
  onOpenInfo: () => void;
  onOpenPDPA: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart, onOpenInfo, onOpenPDPA }) => {
  return (
    <section className="flex flex-col items-center justify-center flex-grow min-h-[90vh] py-12 px-6 text-center max-w-4xl mx-auto w-full animate-fade-in">
      
      {/* 1. Header (H1) - Large and Bold */}
      <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight md:leading-snug mb-6">
        OSGED – ระบบคัดกรอง<br className="hidden md:block" />
        <span className="text-primary">การรู้คิดและอารมณ์</span>สำหรับผู้สูงอายุ
      </h1>

      {/* 2. Description - Simple language, readable */}
      <div className="text-lg md:text-2xl text-gray-600 font-medium mb-10 max-w-2xl leading-relaxed">
        <p>ช่วยประเมินเบื้องต้นด้านความจำ การคิด และอารมณ์</p>
        <p>เหมาะสำหรับผู้สูงอายุและผู้ดูแล</p>
        <p className="mt-2 text-gray-500 text-base md:text-xl">
          (ใช้เวลาทำประมาณ 5–10 นาที)
        </p>
      </div>

      {/* 3. Primary Button (CTA) - Very large, accessible target area */}
      <button 
        onClick={onStart}
        className="
          w-full max-w-md 
          bg-primary hover:bg-primaryHover 
          text-white 
          text-xl md:text-2xl font-semibold 
          py-5 px-8 
          rounded-2xl 
          shadow-lg hover:shadow-xl 
          transform transition-all duration-200 active:scale-95
          flex items-center justify-center gap-3
          mb-6
        "
        aria-label="เริ่มทำแบบคัดกรอง"
      >
        <span>เริ่มคัดกรองสำหรับผู้สูงอายุ</span>
        <ArrowRight size={28} strokeWidth={3} />
      </button>

      {/* 4. PDPA & Disclaimer - Smaller text but readable, clear links */}
      <div className="text-sm md:text-base text-gray-500 bg-gray-50 p-4 rounded-lg">
        <p className="mb-1">
          การกด “เริ่มคัดกรองสำหรับผู้สูงอายุ” ถือว่าท่านได้อ่านและยอมรับ
        </p>
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-1">
          <button 
            onClick={onOpenInfo}
            className="text-primary hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-primary rounded px-1"
          >
            [ข้อควรรู้ก่อนยืนยันข้อมูล]
          </button>
          <span className="text-gray-400">·</span>
          <button 
            onClick={onOpenPDPA}
            className="text-primary hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-primary rounded px-1"
          >
            [นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)]
          </button>
        </div>
      </div>

    </section>
  );
};