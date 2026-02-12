'use client'

import { AlertTriangle } from 'lucide-react'

interface RequireChromeModalProps {
  open: boolean
}

export const RequireChromeModal: React.FC<RequireChromeModalProps> = ({
  open,
}) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="
        relative z-10
        bg-white
        w-[90%] max-w-md
        rounded-3xl
        shadow-2xl
        p-8
        text-center
        animate-fade-in
      ">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertTriangle className="text-red-600 w-10 h-10" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          กรุณาใช้ Google Chrome
        </h2>

        <p className="text-gray-600 mb-6 leading-relaxed">
          ระบบประเมินนี้รองรับเฉพาะ Google Chrome
          <br />
          เพื่อให้การรู้จำเสียงทำงานได้ถูกต้อง
        </p>

        <a
          href="https://www.google.com/chrome/"
          target="_blank"
          className="
            inline-block
            bg-primary
            hover:bg-primaryHover
            text-white
            font-bold
            py-3 px-6
            rounded-full
            transition
          "
        >
          ดาวน์โหลด Google Chrome
        </a>
      </div>
    </div>
  )
}