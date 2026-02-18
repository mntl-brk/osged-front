import React, { useState } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { unlockAudio } from '@/lib/audioUnlock';
import { verifyParticipantCode } from '@/api/participant/verifyParticipant';
import { sleep } from '@/hooks/useSleepPage';

interface VerificationPageProps {
  onSubmit: (code: string) => void;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({ onSubmit }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!code.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const result = await verifyParticipantCode({ code });

      result.match(
        (participant) => {
          onSubmit(participant.id);
        },
        () => {
          alert('ไม่พบรหัสผู้เข้าร่วม กรุณาตรวจสอบรหัสอีกครั้ง');
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-12 animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-primary/10 p-8 rounded-[40px] text-primary mb-10 shadow-inner">
        <ShieldCheck size={80} strokeWidth={1.5} />
      </div>

      <h1 className="text-3xl md:text-5xl font-black text-center mb-6 text-gray-900 tracking-tight">
        ยืนยันตัวตนอาสาสมัคร
      </h1>
      
      <p className="text-base md:text-2xl text-gray-600 text-center mb-10 leading-relaxed font-medium">
        กรุณากรอกรหัส <span className="text-primary font-black">กXXX</span> ที่ท่านได้รับจากแพทย์<br/>
        หรือผู้ดูแลโครงการ เพื่อเริ่มต้นการประเมิน
      </p>

      <div className="w-full max-w-sm mb-8">
        <input 
          type="text"
          value={code}
          disabled={isLoading}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="กXXX"
          className="
            w-full py-6 px-8 
            text-4xl text-black tracking-[0.2em] text-center
            border-4 border-gray-100 rounded-[35px] bg-gray-50
            focus:border-primary focus:bg-white focus:ring-8 focus:ring-primary/5
            outline-none transition-all
            placeholder:text-gray-400 placeholder:text-2xl placeholder:tracking-normal placeholder:font-bold
            disabled:opacity-60
          "
        />
      </div>

      <button
        disabled={isLoading}
        onClick={async () => {
          await unlockAudio().catch(() => {});
          handleContinue();
        }}
        className={`
          w-full max-w-sm
          bg-primary hover:bg-primaryHover text-white 
          py-6 px-10 rounded-[35px] 
          text-3xl font-black 
          shadow-2xl shadow-primary/20
          transform transition-all duration-300
          flex items-center justify-center gap-4
          ${isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:-translate-y-2'}
        `}
      >
        {isLoading ? (
          <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>ยืนยันรหัส</span>
            <ArrowRight size={40} strokeWidth={4} />
          </>
        )}
      </button>

      <p className="mt-12 text-gray-400 font-bold text-sm text-center italic">
        * รหัสอาสาสมัครจำเป็นสำหรับการเข้าใช้งานระบบ OSGED
      </p>
    </div>
  );
};
