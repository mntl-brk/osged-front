import React, { useState } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface VerificationPageProps {
  onSubmit: (code: string) => void;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({ onSubmit }) => {
  const [code, setCode] = useState('');

  const handleContinue = () => {
    if (!code.trim()) {
      alert('กรุณากรอกรหัสยืนยันอาสาสมัคร');
      return;
    }
    onSubmit(code);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-12 animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-primary/10 p-8 rounded-[40px] text-primary mb-10 shadow-inner">
        <ShieldCheck size={80} strokeWidth={1.5} />
      </div>

      <h1 className="text-3xl md:text-5xl font-black text-center mb-6 text-gray-900 tracking-tight">
        ยืนยันตัวตนอาสาสมัคร
      </h1>
      
      <p className="text-xl md:text-2xl text-gray-600 text-center mb-12 leading-relaxed font-medium">
        กรุณากรอกรหัส <span className="text-primary font-black">V-XXXX</span> ที่ท่านได้รับจากแพทย์<br/>
        หรือผู้ดูแลโครงการ เพื่อเริ่มต้นการประเมิน
      </p>

      <div className="w-full max-w-sm mb-12">
        <input 
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="V-XXXX"
          className="
            w-full py-6 px-8 
            text-4xl font-black tracking-[0.2em] text-center
            border-4 border-gray-100 rounded-[35px] bg-gray-50
            focus:border-primary focus:bg-white focus:ring-8 focus:ring-primary/5
            outline-none transition-all
            placeholder:text-gray-200 placeholder:text-2xl placeholder:tracking-normal placeholder:font-bold
          "
        />
      </div>

      <button 
        onClick={handleContinue}
        className="
          w-full max-w-sm
          bg-primary hover:bg-primaryHover text-white 
          py-6 px-10 rounded-[35px] 
          text-3xl font-black 
          shadow-2xl shadow-primary/20 hover:-translate-y-2
          transform transition-all duration-300
          flex items-center justify-center gap-4
        "
      >
        <span>ยืนยันรหัส</span>
        <ArrowRight size={40} strokeWidth={4} />
      </button>

      <p className="mt-12 text-gray-400 font-bold text-sm text-center italic">
        * รหัสอาสาสมัครจำเป็นสำหรับการเข้าใช้งานระบบ OSGED
      </p>
    </div>
  );
};
