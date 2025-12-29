import React from 'react';
import { X } from 'lucide-react';
import { ModalProps } from '../types';

export const Modal: React.FC<ModalProps> = ({ type, onClose }) => {
  const getContent = () => {
    switch (type) {
      case 'pdpa':
        return {
          title: 'นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)',
          body: (
            <div className="space-y-4 text-gray-700">
              <p>
                โครงการ OSGED ตระหนักถึงความสำคัญของการคุ้มครองข้อมูลส่วนบุคคลของท่าน 
                ข้อมูลที่ท่านให้จะถูกเก็บรักษาเป็นความลับและใช้เพื่อวัตถุประสงค์ทางการวิจัย
                และการประเมินผลทางการแพทย์เท่านั้น
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>ข้อมูลจะไม่ถูกเปิดเผยต่อสาธารณะในรูปแบบที่ระบุตัวตนได้</li>
                <li>ท่านมีสิทธิ์ในการขอเพิกถอนความยินยอมได้ตลอดเวลา</li>
                <li>ระบบมีการรักษาความปลอดภัยของข้อมูลตามมาตรฐานสากล</li>
              </ul>
            </div>
          )
        };
      case 'info':
        return {
          title: 'ข้อควรรู้ก่อนยืนยันข้อมูล',
          body: (
            <div className="space-y-4 text-gray-700">
              <p>
                แบบประเมินนี้เป็นเพียงเครื่องมือคัดกรองเบื้องต้น 
                <strong> ไม่ใช่การวินิจฉัยโรคโดยแพทย์</strong>
              </p>
              <p>
                หากผลการประเมินมีความเสี่ยง ระบบจะแนะนำให้ท่านปรึกษาแพทย์เฉพาะทางเพื่อการตรวจวินิจฉัยที่ละเอียดขึ้น
              </p>
              <p>โปรดตอบคำถามตามความเป็นจริงเพื่อให้ผลลัพธ์มีความแม่นยำที่สุด</p>
            </div>
          )
        };
      case 'project-info':
        return {
          title: 'เกี่ยวกับโครงการ OSGED',
          body: (
            <div className="space-y-4 text-gray-700">
              <p>
                OSGED (Online Screening for Geriatric Cognitive and Emotional Disorders) 
                คือโครงการวิจัยเพื่อพัฒนาระบบคัดกรองภาวะสมองเสื่อมและภาวะซึมเศร้าในผู้สูงอายุผ่านระบบออนไลน์
              </p>
              <p>
                พัฒนาโดยทีมวิจัยร่วมระหว่างวิศวกรคอมพิวเตอร์และแพทย์ผู้เชี่ยวชาญด้านเวชศาสตร์ผู้สูงอายุ
              </p>
            </div>
          )
        };
      case 'faq':
        return {
          title: 'คำถามที่พบบ่อย (FAQ)',
          body: (
            <div className="space-y-4 text-gray-700">
              <div>
                <strong className="block text-gray-900 mb-1">Q: ต้องมีลูกหลานช่วยทำหรือไม่?</strong>
                <p>A: ผู้สูงอายุสามารถทำเองได้ หรือให้ผู้ดูแล/ลูกหลานช่วยอ่านคำถามและกดตอบแทนได้</p>
              </div>
              <div>
                <strong className="block text-gray-900 mb-1">Q: ใช้เวลานานเท่าไหร่?</strong>
                <p>A: ประมาณ 5-10 นาที ขึ้นอยู่กับความเร็วในการตอบ</p>
              </div>
            </div>
          )
        };
      default:
        return { title: '', body: null };
    }
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
            {content.title}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="ปิดหน้าต่าง"
          >
            <X size={28} />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto text-lg leading-relaxed">
          {content.body}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-primary text-white rounded-xl text-lg font-medium hover:bg-primaryHover transition-colors min-w-[120px]"
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
};