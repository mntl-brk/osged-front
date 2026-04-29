'use client'

import { Video, ShieldCheck, HeartPulse } from 'lucide-react'

interface Props {
  open: boolean
  onConfirm: () => void
}

export default function DataCollectionNoticeModal({ open, onConfirm }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/70 backdrop-blur-sm px-4 sm:px-6 animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full p-0 shadow-2xl overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Section */}
        <div className="bg-blue-50/50 p-6 sm:p-8 border-b border-blue-100 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100 shrink-0 relative">
            <Video className="text-blue-600" size={36} strokeWidth={2.5} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              แจ้งเตือนสำคัญ: <br className="sm:hidden" /> การบันทึกภาพและเสียง
            </h2>
            <p className="text-gray-600">
              ในการทำแบบประเมินสุขภาพจิตและคัดกรองสมองเสื่อมนี้ ระบบจำเป็นต้อง
              <strong className="text-red-600 font-bold mx-1">บันทึกภาพและเสียงวิดีโอ</strong> 
              ตลอดการทำแบบสอบถาม
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <HeartPulse className="text-primary" size={20} />
              ข้อมูลของท่านจะถูกนำไปใช้อย่างปลอดภัยเพื่อ:
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <ShieldCheck className="text-green-500 shrink-0 mt-0.5" size={18} />
                <span className="text-gray-700">การประเมินและวิเคราะห์ผลทางการแพทย์อย่างแม่นยำ</span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="text-green-500 shrink-0 mt-0.5" size={18} />
                <span className="text-gray-700">การศึกษาและวิจัยเพื่อพัฒนานวัตกรรมการดูแลผู้สูงอายุ</span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="text-green-500 shrink-0 mt-0.5" size={18} />
                <span className="text-gray-700">การพัฒนาคุณภาพบริการและระบบวิเคราะห์ทางการแพทย์ (OSGED)</span>
              </li>
            </ul>
          </div>
          
          <p className="text-center text-gray-500 text-sm italic">
            * ข้อมูลทั้งหมดจะถูกเก็บรักษาเป็นความลับตามนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)
          </p>
        </div>

        {/* Footer / Action */}
        <div className="p-6 sm:p-8 border-t border-gray-100 bg-gray-50 flex flex-col items-center">
          <button
            onClick={onConfirm}
            className="
              w-full sm:w-auto px-8 py-4
              rounded-2xl
              bg-primary text-white
              font-bold text-lg
              shadow-[0_8px_30px_rgba(37,99,235,0.2)]
              hover:bg-primaryHover hover:shadow-[0_8px_30px_rgba(37,99,235,0.3)]
              hover:-translate-y-0.5
              transition-all duration-300
            "
          >
            รับทราบและดำเนินการต่อ
          </button>
        </div>

      </div>
    </div>
  )
}