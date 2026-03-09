'use client'

import { AlertTriangle } from 'lucide-react'

interface Props {
  open: boolean
  onConfirm: () => void
}

export default function DataCollectionNoticeModal({ open, onConfirm }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">

      <div className="bg-white rounded-2xl max-w-xl w-full p-7 shadow-2xl animate-in fade-in zoom-in border border-yellow-200">

        {/* Header */}
        <div className="flex items-start gap-3 mb-5">

          <div className="bg-yellow-100 p-2 rounded-lg">
            <AlertTriangle className="text-yellow-600" size={30} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-yellow-700">
              การแจ้งการเก็บข้อมูลสำคัญ
            </h2>

            <p className="text-base text-gray-700 mt-1">
              เว็บไซต์นี้มีการเก็บข้อมูลส่วนบุคคลของผู้เข้าร่วม
              และมีการ <span className="font-semibold text-red-600">บันทึกภาพและเสียงวิดีโอ</span>
              ระหว่างการทำแบบทดสอบ
            </p>
          </div>

        </div>

        {/* Content */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-base text-gray-800 space-y-3">

          <p className="font-medium">
            ข้อมูลดังกล่าวจะถูกนำไปใช้เพื่อ
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li>การประเมินและวิเคราะห์ผลทางการแพทย์</li>
            <li>การศึกษาและการวิจัยทางการแพทย์</li>
            <li>การพัฒนาคุณภาพบริการและระบบวิเคราะห์ทางการแพทย์</li>
          </ul>

          <p className="pt-1 font-medium text-gray-700">
            กรุณาอ่านรายละเอียดและให้ความยินยอมก่อนดำเนินการต่อ
          </p>

        </div>

        {/* Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onConfirm}
            className="
              px-6 py-3
              rounded-xl
              bg-yellow-500
              text-white
              font-bold
              text-lg
              shadow-md
              hover:bg-yellow-600
              transition
            "
          >
            รับทราบและดำเนินการต่อ
          </button>
        </div>

      </div>

    </div>
  )
}