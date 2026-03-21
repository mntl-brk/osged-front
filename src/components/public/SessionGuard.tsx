'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAssessmentStore } from '@/store/assessmentStore'

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const sessionId = useAssessmentStore((s) => s.sessionId)
  const hasHydrated = useAssessmentStore((s) => s.hasHydrated)

  const allowWithoutSession = [
    '/',
    '/verification',
    '/consent'
  ]

  const isAllowed = allowWithoutSession.includes(pathname)

  useEffect(() => {
    if (!hasHydrated) return

    if (!sessionId && !isAllowed) {
      router.replace('/')
    }
  }, [hasHydrated, sessionId, pathname, router])

  if (!hasHydrated) {
    return null 
  }

  if (!sessionId && !isAllowed) {
    return null
  }

  return <>{children}</>
}