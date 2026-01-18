'use client'

import { useEffect } from 'react'
import { Header } from '@/components/public/Header'
import { Modal } from '@/components/Modal'
import { useAssessmentStore } from '@/store/assessmentStore'

export function AppShell({ children }: { children: React.ReactNode }) {
  const fontSize = useAssessmentStore((s) => s.fontSize)
  const modalContent = useAssessmentStore((s) => s.modalContent)
  const setModalContent = useAssessmentStore((s) => s.setModalContent)

  useEffect(() => {
    const root = document.documentElement
    root.style.fontSize =
      fontSize === 'small' ? '14px' : fontSize === 'large' ? '20px' : '16px'
  }, [fontSize])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow flex flex-col">{children}</main>

      {modalContent && (
        <Modal type={modalContent as any} onClose={() => setModalContent(null)} />
      )}
    </div>
  )
}