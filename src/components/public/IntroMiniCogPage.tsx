import React, { useState } from 'react';
import { Brain, ArrowRight } from 'lucide-react';
import { useVoiceGuide } from '@/hooks/useVoiceGuide';
import { useLocalVoiceGuide } from '@/hooks/useLocalVoiceGuide';
import { stopAudio } from '@/lib/audioManager';

interface IntroMiniCogPageProps {
  onStart: () => void;
}

export const IntroMiniCogPage: React.FC<IntroMiniCogPageProps> = ({ onStart }) => {
  // const { status, isSpeaking } = useVoiceGuide(
  //     `
  //       ต่อไปจะเป็นการทดสอบความจำและการรู้คิดนะครับ
  //       แบบทดสอบนี้มีทั้งหมด 3 ขั้นตอน

  //       ขั้นแรก ผมจะให้ท่านฟังและพยายามจำคำ 3 คำ
  //       ขั้นที่สอง จะให้ท่านวาดรูปหน้าปัดนาฬิกา
  //       และขั้นสุดท้าย จะขอให้ท่านบอกคำ 3 คำที่จำไว้จากขั้นตอนแรกนะครับ

  //       ไม่ต้องกังวลนะครับ ทำเท่าที่ทำได้
  //       หากพร้อมแล้ว กรุณากดปุ่มด้านล่างเพื่อเริ่มทำแบบทดสอบได้เลยครับ
  //     `
  // )

  const { isSpeaking } = useLocalVoiceGuide('/audio/minicogintro.mp3')
  const [isNavigating, setIsNavigating] = useState(false)

  const handleStart = () => {
    if (isSpeaking || isNavigating) return

    setIsNavigating(true)

    stopAudio()
    onStart()
  }


  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12 animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
      
      <div className="bg-blue-100 p-8 rounded-full text-primary mb-8 shadow-inner">
        <Brain size={80} strokeWidth={1.5} />
      </div>

      <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
        ส่วนที่ 1: การประเมินสมอง
      </h1>
      
      <p className="text-lg md:text-2xl text-gray-600 mb-8 max-w-xl leading-relaxed">
        ในส่วนนี้จะเป็นการทดสอบ <span className="text-primary font-bold">ความจำ</span> และ <span className="text-primary font-bold">การรู้คิด</span>
      </p>

      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-10 w-full max-w-lg text-left">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">ประกอบด้วย 3 ขั้นตอน:</h3>
        <ul className="space-y-3 text-lg text-gray-600">
            <li className="flex items-center gap-3">
                <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
                ฟังและจำคำ 3 คำ
            </li>
            <li className="flex items-center gap-3">
                <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
                วาดรูปนาฬิกา
            </li>
            <li className="flex items-center gap-3">
                <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
                บอกคำ 3 คำที่จำไว้จากขั้นตอนแรก
            </li>
        </ul>
      </div>

     <button
        onClick={handleStart}
        disabled={isSpeaking || isNavigating}
        className={`
          w-full max-w-md
          py-5 px-8 rounded-2xl text-2xl font-bold
          flex items-center justify-center gap-3
          transition-all duration-200
          ${
            isSpeaking || isNavigating
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary hover:bg-primaryHover text-white shadow-lg hover:-translate-y-1'
          }
        `}
      >
        <span>
          {isSpeaking
            ? 'กำลังอธิบาย...'
            : isNavigating
            ? 'กำลังเริ่ม...'
            : 'เริ่มการทดสอบ'}
        </span>

        {!isSpeaking && !isNavigating && (
          <ArrowRight size={32} strokeWidth={3} />
        )}
      </button>

    </div>
  );
};