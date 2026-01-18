import React from 'react';
import { Check, Type, ArrowRight } from 'lucide-react';
import { FontSize } from '@/types';
import { useVoiceGuide } from '@/hooks/useVoiceGuide';

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
  const preferencesGuideText =
  'ต่อไปเป็นหน้าตั้งค่าการใช้งานครับ กรุณาเลือกขนาดตัวอักษรที่ท่านอ่านได้สบายที่สุด โดยสามารถเลือกได้ว่า เล็ก ปกติ หรือ ใหญ่ ด้านล่างจะมีตัวอย่างข้อความให้ลองอ่าน หากเลือกเรียบร้อยแล้ว กรุณากดปุ่ม ดำเนินการต่อ เพื่อไปขั้นตอนถัดไปครับ'

  const { isSpeaking, replay } = useVoiceGuide(preferencesGuideText)
  
  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-6 py-24 animate-fade-in pb-32">
      
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">
        ตั้งค่าการใช้งาน
      </h1>

      <section className="w-full mb-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center justify-center gap-2">
          <Type size={28} className="text-primary"/> ปรับขนาดตัวอักษร
        </h2>
        
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
            <Type size={24} />
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
            <Type size={40} />
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
            <Type size={56} />
            <span className="text-3xl font-bold">ใหญ่</span>
            {currentFontSize === 'large' && <Check size={24} className="mt-1" strokeWidth={3} />}
          </button>
        </div>

        <div className="bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-200 text-center shadow-inner">
          <p className="text-gray-400 text-sm mb-3">ตัวอย่างการแสดงผล</p>
          <p className="text-gray-800 leading-relaxed font-medium">
            "สวัสดีครับ/ค่ะ วันนี้คุณรู้สึกอย่างไรบ้าง? <br/>
            ระบบ OSGED ช่วยประเมินสุขภาพใจของคุณ"
          </p>
        </div>
      </section>

      <button 
        onClick={onContinue}
        className="
          w-full max-w-md
          bg-primary hover:bg-primaryHover text-white 
          py-6 px-8 rounded-2xl 
          text-2xl font-bold 
          shadow-lg hover:shadow-xl hover:-translate-y-1
          transform transition-all duration-200
          flex items-center justify-center gap-3
        "
      >
        <span>ดำเนินการต่อ</span>
        <ArrowRight size={32} strokeWidth={3} />
      </button>

    </div>
  );
};