import React from 'react';
import { X, Shield, AlertTriangle, Info, HelpCircle } from 'lucide-react';
import { ModalProps } from '../types';

export const Modal: React.FC<ModalProps> = ({ type, onClose }) => {
  const getContent = () => {
    switch (type) {
      case 'pdpa':
        return {
          icon: <Shield className="text-green-500" size={32} />,
          title: 'ความปลอดภัยของข้อมูล (PDPA)',
          body: (
            <div className="space-y-4 text-gray-600">
              <p className="font-medium text-gray-800">
                เราให้ความสำคัญสูงสุดกับการปกป้องข้อมูลส่วนบุคคลของผู้สูงอายุและครอบครัว
              </p>
              <p>
                ข้อมูลทั้งหมดที่ท่านให้ใน <strong>ระบบคัดกรองภาวะสมองเสื่อมและสุขภาพจิต (OSGED)</strong> 
                จะถูกเก็บรักษาเป็นความลับอย่างเคร่งครัด และนำไปใช้เพื่อวัตถุประสงค์ในการประเมินผลทางการแพทย์และการวิจัยเพื่อพัฒนาการดูแลผู้สูงอายุเท่านั้น
              </p>
              <ul className="space-y-3 mt-4 bg-green-50 p-4 rounded-xl border border-green-100">
                <li className="flex gap-2"><span className="text-green-500">✓</span> ข้อมูลจะไม่ถูกเปิดเผยต่อสาธารณะในรูปแบบที่ระบุตัวตนได้</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span> ท่านมีสิทธิ์ในการขอเพิกถอนความยินยอมได้ตลอดเวลา</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span> ระบบใช้มาตรฐานการรักษาความปลอดภัยของข้อมูลระดับสากล</li>
              </ul>
            </div>
          )
        };
      case 'info':
        return {
          icon: <AlertTriangle className="text-amber-500" size={32} />,
          title: 'ข้อควรรู้ก่อนเริ่มต้น',
          body: (
            <div className="space-y-4 text-gray-600">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-900 font-medium">
                เครื่องมือนี้เป็นเพียง "แบบคัดกรองเบื้องต้น" ไม่ใช่การวินิจฉัยทางการแพทย์
              </div>
              <p>
                <strong>แบบประเมินสุขภาพจิตและภาวะรู้คิด</strong> นี้ ออกแบบมาเพื่อช่วยคัดกรองความเสี่ยงเบื้องต้น 
                หากผลการประเมินพบว่ามีความเสี่ยง ระบบจะแนะนำให้ท่านเข้ารับการปรึกษาแพทย์เฉพาะทางเพื่อการตรวจวินิจฉัยที่ละเอียดและแม่นยำยิ่งขึ้น
              </p>
              <p className="text-gray-500 italic">
                * โปรดตอบคำถามตามความเป็นจริง โดยอ้างอิงจากอาการในช่วง 1-2 สัปดาห์ที่ผ่านมา เพื่อให้ผลลัพธ์มีประโยชน์สูงสุดต่อการดูแลผู้สูงอายุ
              </p>
            </div>
          )
        };
      case 'project-info':
        return {
          icon: <Info className="text-blue-500" size={32} />,
          title: 'เกี่ยวกับโครงการ OSGED',
          body: (
            <div className="space-y-4 text-gray-600">
              <h3 className="text-xl font-bold text-gray-900 text-blue-700">นวัตกรรมเพื่อการดูแลผู้สูงอายุไทย</h3>
              <p>
                <strong>OSGED (Online Screening for Geriatric Cognitive and Emotional Disorders)</strong> 
                คือโครงการวิจัยและพัฒนา <strong>ระบบคัดกรองภาวะสมองเสื่อมและภาวะซึมเศร้าในผู้สูงอายุผ่านระบบออนไลน์</strong>
              </p>
              <p>
                พัฒนาโดยทีมแพทย์ นักวิจัย และผู้เชี่ยวชาญด้านสุขภาพจิต เพื่อสร้างเครื่องมือที่เข้าถึงง่าย ใช้งานสะดวก 
                และช่วยให้ครอบครัวสามารถเฝ้าระวังสุขภาพสมองและอารมณ์ของผู้สูงอายุได้จากที่บ้าน ลดข้อจำกัดในการเดินทางมาโรงพยาบาล
              </p>
            </div>
          )
        };
      case 'faq':
        return {
          icon: <HelpCircle className="text-purple-500" size={32} />,
          title: 'คำถามที่พบบ่อย (FAQ)',
          body: (
            <div className="space-y-4 text-gray-600">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <strong className="block text-gray-900 mb-2 flex items-center gap-2">
                  <span className="bg-purple-100 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">Q</span>
                  ต้องมีลูกหลานช่วยทำหรือไม่?
                </strong>
                <p className="pl-8 text-gray-600">
                  ผู้สูงอายุสามารถทำแบบทดสอบได้ด้วยตนเอง หากสามารถใช้สมาร์ทโฟนหรือแท็บเล็ตได้ 
                  หรืออาจให้ผู้ดูแล/ลูกหลานช่วยอ่านคำถามและกดตอบแทนได้เช่นกัน
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <strong className="block text-gray-900 mb-2 flex items-center gap-2">
                  <span className="bg-purple-100 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">Q</span>
                  ใช้เวลาในการประเมินนานเท่าไหร่?
                </strong>
                <p className="pl-8 text-gray-600">
                  ใช้เวลาโดยเฉลี่ยเพียง <strong>10-15 นาที</strong> ขึ้นอยู่กับความเร็วในการตอบคำถามของแต่ละท่าน
                </p>
              </div>
            </div>
          )
        };
      default:
        return { icon: null, title: '', body: null };
    }
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 sm:p-8 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-2xl">
              {content.icon}
            </div>
            <h2 id="modal-title" className="text-2xl sm:text-3xl font-black text-gray-900">
              {content.title}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0"
            aria-label="ปิดหน้าต่าง"
          >
            <X size={28} />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 sm:p-8 overflow-y-auto text-lg leading-relaxed flex-grow custom-scrollbar">
          {content.body}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-4 bg-primary text-white rounded-2xl text-xl font-bold hover:bg-primaryHover hover:shadow-lg hover:-translate-y-0.5 transition-all min-w-[140px]"
          >
            รับทราบและปิด
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; 
        }
      `}</style>
    </div>
  );
};