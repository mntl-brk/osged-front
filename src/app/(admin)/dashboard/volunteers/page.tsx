'use client'

import { useRouter } from 'next/navigation'
import { VolunteerManagementPage } from '@/components/admin/VolunteerManagementPage'

export default function VolunteerManagementRoute() {
  const router = useRouter()

  return (
    <VolunteerManagementPage
      onBack={() => router.push('/dashboard')}
    />
  )
}