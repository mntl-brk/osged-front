import React, { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { FontSize } from '@/types';
import { useLocalVoiceGuide } from '@/hooks/useLocalVoiceGuide';
import { stopAudio } from '@/lib/audioManager';

interface PreferencesPageProps {
  currentFontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  onContinue: () => void;
}

export const PreferencesPage: React.FC<PreferencesPageProps> = ({
  currentFontSize,
  setFontSize,
  onContinue,
}) => {
  // const preferencesGuideText =
  // 'ต่อไปเป็นหน้าตั้งค่าการใช้งานครับ กรุณาเลือกขนาดตัวอักษรที่ท่านอ่านได้สบายที่สุด โดยสามารถเลือกได้ว่า เล็ก. ปกติ หรือ ใหญ่ ด้านล่างจะมีตัวอย่างข้อความให้ลองอ่าน หากเลือกเรียบร้อยแล้ว กรุณากดปุ่ม ดำเนินการต่อ เพื่อไปขั้นตอนถัดไปครับ'

  // const { isSpeaking, replay } = useVoiceGuide(preferencesGuideText)
const { isSpeaking } = useLocalVoiceGuide('/audio/preferences.mp3')
  
const [isNavigating, setIsNavigating] = useState(false)
const handleContinue = () => {
  if (isSpeaking) return
  if (isNavigating) return

  setIsNavigating(true)

  stopAudio()
  onContinue()
}

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-6 py-24 animate-fade-in pb-32">
      
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">
        ตั้งค่าการใช้งาน ปรับขนาดตัวอักษร
      </h1>

      <section className="w-full mb-12">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <button
            onClick={() => setFontSize('small')}
            className={`
              h-32 rounded-3xl border-4 flex flex-col items-center justify-center gap-2 transition-all
              ${currentFontSize === 'small' 
                ? 'border-primary bg-blue-50 text-primary shadow-lg scale-105' 
                : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'}
            `}
          >
            <span className="text-xl font-medium">เล็ก</span>
            {currentFontSize === 'small' && <Check size={24} className="mt-1" strokeWidth={3} />}
          </button>

          <button
            onClick={() => setFontSize('medium')}
            className={`
              h-32 rounded-3xl border-4 flex flex-col items-center justify-center gap-2 transition-all
              ${currentFontSize === 'medium' 
                ? 'border-primary bg-blue-50 text-primary shadow-lg scale-105' 
                : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'}
            `}
          >
            <span className="text-2xl font-medium">ปกติ</span>
            {currentFontSize === 'medium' && <Check size={24} className="mt-1" strokeWidth={3} />}
          </button>

          <button
            onClick={() => setFontSize('large')}
            className={`
              h-32 rounded-3xl border-4 flex flex-col items-center justify-center gap-2 transition-all
              ${currentFontSize === 'large' 
                ? 'border-primary bg-blue-50 text-primary shadow-lg scale-105' 
                : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'}
            `}
          >
            <span className="text-3xl font-bold">ใหญ่</span>
            {currentFontSize === 'large' && <Check size={24} className="mt-1" strokeWidth={3} />}
          </button>
        </div>

        <div className="bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-200 text-center shadow-inner">
          <p className="text-gray-400 text-sm mb-3">ตัวอย่างการแสดงผล</p>
          <p className="text-gray-800 leading-relaxed font-medium">
            "สวัสดีครับ/ค่ะ วันนี้คุณรู้สึกอย่างไรบ้าง? <br/>
            ระบบจะ ช่วยประเมินสุขภาพใจของคุณ"
          </p>
        </div>
      </section>

      <button 
          onClick={handleContinue}
          disabled={isSpeaking}
          className={`
            w-full max-w-md
            py-6 px-8 rounded-2xl 
            text-2xl font-bold 
            shadow-lg transform transition-all duration-200
            flex items-center justify-center gap-3
            ${
              isSpeaking
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary hover:bg-primaryHover text-white hover:shadow-xl hover:-translate-y-1'
            }
          `}
        >
        <span>ดำเนินการต่อ</span>
        <ArrowRight size={32} strokeWidth={3} />
      </button>

    </div>
  );
};