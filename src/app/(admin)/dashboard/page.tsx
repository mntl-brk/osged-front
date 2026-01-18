'use client'

import { useRouter } from 'next/navigation'
import { DoctorDashboardPage } from '@/components/admin/DoctorDashboardPage'
import { useAssessmentStore } from '@/store/assessmentStore'

export default function DoctorRoute() {
  const router = useRouter()
  const resetAll = useAssessmentStore((s) => s.resetAll)

  return (
    <DoctorDashboardPage
      onLogout={() => {
        resetAll()
        router.push('/')
      }}
      onGoToVolunteerManagement={() => {
        router.push('/dashboard/volunteers')
      }}
    />
  )
}