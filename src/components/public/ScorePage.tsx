import React from 'react';
import { Home, Phone, FileText, Activity, Brain, AlertCircle, ClipboardCheck, Clock, CheckCircle2 } from 'lucide-react';

interface ScorePageProps {
  recallScore: number | null; // Max 3
  moodScore: number | null;   // Max 15
  onHome: () => void;
}

export const ScorePage: React.FC<ScorePageProps> = ({ 
  recallScore = 0, 
  moodScore = 0, 
  onHome 
}) => {
  const rScore = recallScore ?? 0;
  const mScore = moodScore ?? 0;

  // --- Assessment Logic ---
  const isHighRiskMood = mScore >= 11;
  const isMildRiskMood = mScore >= 6 && mScore < 11;
  const isHighRiskCog = rScore === 0;
  const isMildRiskCog = rScore > 0 && rScore < 3;

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 animate-fade-in pb-40">
      
      {/* 1. Success Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 text-green-600 rounded-full mb-6 shadow-sm">
          <CheckCircle2 size={64} strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
          บันทึกผลเรียบร้อยแล้ว
        </h1>
        <p className="text-2xl text-gray-500 font-medium">
          ขอบคุณที่ให้ข้อมูลที่เป็นประโยชน์กับทางโครงการ
        </p>
      </div>

      {/* 2. PROMINENT DOCTOR MESSAGE (IMPORTANT) */}
      <div className="relative overflow-hidden bg-blue-600 rounded-[45px] p-8 md:p-12 shadow-2xl shadow-blue-200 mb-12 text-white border-b-[10px] border-blue-800">
        {/* Decorative Background Icon */}
        <Clock className="absolute -right-10 -bottom-10 text-white/10" size={200} />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="bg-white/20 p-6 rounded-full backdrop-blur-sm shrink-0">
             <Clock size={60} strokeWidth={3} />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">กรุณารอผลจากคุณหมอ</h2>
            <p className="text-xl md:text-2xl font-medium leading-relaxed opacity-95">
              ข้อมูลการประเมินเบื้องต้นของท่าน <span className="font-black underline underline-offset-8">ถูกส่งเข้าสู่ระบบแล้ว</span><br className="hidden md:block" />
              ขณะนี้ทีมแพทย์ผู้เชี่ยวชาญกำลังตรวจสอบความถูกต้อง<br className="hidden md:block" />
              และจะสรุปผลให้ท่านทราบผ่านอาสาสมัครในภายหลัง
            </p>
          </div>
        </div>
      </div>

      {/* 3. Result Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        
        {/* Score Card: Memory (Mini-Cog) */}
        <div className="bg-white rounded-[40px] p-8 border-4 border-blue-50 shadow-xl flex flex-col items-center text-center">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl mb-4">
            <Brain size={48} strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-wide">คะแนนด้านความจำ</h3>
          <p className="text-sm text-gray-400 font-bold mb-4">(Word Recall)</p>
          
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-8xl font-black text-primary">{rScore}</span>
            <span className="text-3xl font-bold text-gray-300">/ 3</span>
          </div>

          <div className={`w-full py-3 px-6 rounded-2xl font-black text-xl border-2 ${isHighRiskCog ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
            {rScore === 3 ? 'ความจำดีเยี่ยม' : rScore > 0 ? 'ควรสังเกตเพิ่มเติม' : 'มีความเสี่ยงเบื้องต้น'}
          </div>
        </div>

        {/* Score Card: Mood (TGDS) */}
        <div className="bg-white rounded-[40px] p-8 border-4 border-orange-50 shadow-xl flex flex-col items-center text-center">
          <div className="p-4 bg-orange-50 text-orange-500 rounded-3xl mb-4">
            <Activity size={48} strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-wide">คะแนนสภาวะอารมณ์</h3>
          <p className="text-sm text-gray-400 font-bold mb-4">(TGDS-15)</p>
          
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-8xl font-black text-orange-500">{mScore}</span>
            <span className="text-3xl font-bold text-gray-300">/ 15</span>
          </div>

          <div className={`w-full py-3 px-6 rounded-2xl font-black text-xl border-2 ${isHighRiskMood ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
            {mScore < 6 ? 'อารมณ์ปกติ' : isMildRiskMood ? 'มีความเสี่ยงเล็กน้อย' : 'ภาวะซึมเศร้า'}
          </div>
        </div>

      </div>

      {/* 4. Action Buttons */}
      <div className="flex flex-col gap-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
                onClick={onHome}
                className="h-24 bg-white border-4 border-gray-200 text-gray-600 text-3xl font-black rounded-[30px] shadow-lg hover:bg-gray-50 flex items-center justify-center gap-4 transition-all active:scale-95"
            >
                <Home size={32} />
                กลับหน้าแรก
            </button>

            <button 
                onClick={() => alert("ระบบจัดเก็บข้อมูลสรุปไว้ในระบบของแพทย์เรียบร้อยแล้ว")}
                className="h-24 bg-gray-900 text-white text-3xl font-black rounded-[30px] shadow-xl hover:bg-black flex items-center justify-center gap-4 transition-all active:scale-95"
            >
                <FileText size={32} />
                ดูสรุปข้อมูล
            </button>
        </div>

        {/* Emergency Call - Conditional */}
        {(isHighRiskMood || isHighRiskCog) && (
            <a 
                href="tel:1323"
                className="w-full h-24 bg-red-600 text-white text-3xl font-black rounded-[30px] shadow-xl flex items-center justify-center gap-4 hover:bg-red-700 transition-all animate-pulse"
            >
                <Phone size={36} fill="white" />
                สายด่วนสุขภาพจิต 
            </a>
        )}
      </div>

      {/* 5. Bottom Disclaimer */}
      <p className="mt-12 text-center text-gray-400 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
        <AlertCircle size={20} className="inline-block mr-2 align-text-bottom" />
        ข้อมูลนี้เป็นเพียงผลการคัดกรองเบื้องต้นเพื่อใช้ในงานวิจัย 
        ความเห็นจากแพทย์ผู้เชี่ยวชาญคือบทสรุปที่แม่นยำที่สุด
      </p>

    </div>
  );
};
