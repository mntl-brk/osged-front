import React from 'react';
import { Brain, ArrowRight } from 'lucide-react';

interface IntroMiniCogPageProps {
  onStart: () => void;
}

export const IntroMiniCogPage: React.FC<IntroMiniCogPageProps> = ({ onStart }) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12 animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
      
      <div className="bg-blue-100 p-8 rounded-full text-primary mb-8 shadow-inner">
        <Brain size={80} strokeWidth={1.5} />
      </div>

      <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
        ส่วนที่ 1: การประเมินสมอง
      </h1>
      
      <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-xl leading-relaxed">
        ในส่วนนี้จะเป็นการทดสอบ <span className="text-primary font-bold">ความจำ</span> และ <span className="text-primary font-bold">การรู้คิด</span> (Mini-Cog)
      </p>

      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-10 w-full max-w-lg text-left">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">ประกอบด้วย 3 ขั้นตอน:</h3>
        <ul className="space-y-3 text-lg text-gray-600">
            <li className="flex items-center gap-3">
                <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
                ฟังและจำคำศัพท์ 3 คำ
            </li>
            <li className="flex items-center gap-3">
                <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
                วาดรูปนาฬิกา
            </li>
            <li className="flex items-center gap-3">
                <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
                บอกคำศัพท์ที่จำไว้
            </li>
        </ul>
      </div>

      <button 
        onClick={onStart}
        className="
          w-full max-w-md
          bg-primary hover:bg-primaryHover text-white 
          py-5 px-8 rounded-2xl 
          text-2xl font-bold 
          shadow-lg hover:shadow-xl hover:-translate-y-1
          transform transition-all duration-200
          flex items-center justify-center gap-3
        "
      >
        <span>เริ่มการทดสอบ</span>
        <ArrowRight size={32} strokeWidth={3} />
      </button>

    </div>
  );
};