'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAssessmentStore } from '@/store/assessmentStore'

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const sessionId = useAssessmentStore((s) => s.sessionId)

  // หน้าที่ไม่ต้องมี session
  const allowWithoutSession = [
    '/',
    '/verification',
    '/consent'
  ]

  useEffect(() => {
    if (!sessionId && !allowWithoutSession.includes(pathname)) {
      router.replace('/')
    }
  }, [sessionId, pathname, router])

  if (!sessionId && !allowWithoutSession.includes(pathname)) {
    return null
  }

  return <>{children}</>
}