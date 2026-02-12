'use client'

import { redirect, useRouter } from 'next/navigation'
import { DoctorDashboardPage } from '@/components/admin/DoctorDashboardPage'
import { useAssessmentStore } from '@/store/assessmentStore'

export default function DoctorRoute() {
  const router = useRouter()
  const resetAll = useAssessmentStore((s) => s.resetAll)

  const handleLogout = async () => {
    await fetch('/api/admin/logout', {
      method: 'POST',
    })

    resetAll()
    router.push('/login')
  }
    
  return (
    <DoctorDashboardPage
      onLogout={handleLogout}
      onGoToVolunteerManagement={() => {
        router.push('/dashboard/volunteers')
      }}
    />
  )
}