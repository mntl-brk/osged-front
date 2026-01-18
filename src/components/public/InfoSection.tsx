import React from 'react';
import { BookOpen } from 'lucide-react';

interface InfoSectionProps {
  onReadMore: () => void;
}

export const InfoSection: React.FC<InfoSectionProps> = ({ onReadMore }) => {
  return (
    <section className="bg-gray-50 py-16 px-6 border-t border-gray-100">
      <div className="max-w-4xl mx-auto text-center">
        
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4 text-primary">
            <BookOpen size={32} />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          OSGED คืออะไร?
        </h2>
        
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          ระบบคัดกรองอัจฉริยะที่พัฒนาขึ้นเพื่อช่วยให้ผู้สูงอายุและครอบครัวสามารถตรวจสอบ
          ภาวะสุขภาพจิตเบื้องต้นได้ด้วยตนเอง สะดวก รวดเร็ว และแม่นยำ 
          โดยทีมแพทย์และนักวิจัยผู้เชี่ยวชาญ
        </p>

        <button 
          onClick={onReadMore}
          className="text-primary font-semibold text-lg hover:bg-blue-50 px-6 py-3 rounded-xl border-2 border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          อ่านข้อมูลโครงการ & คำถามที่พบบ่อย
        </button>

      </div>
    </section>
  );
};