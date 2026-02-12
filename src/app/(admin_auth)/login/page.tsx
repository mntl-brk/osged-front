'use client'

import { useRouter } from 'next/navigation'
import { DoctorLoginPage } from '@/components/admin/DoctorLoginPage'

export default function LoginRoute() {
  const router = useRouter()

  return (
    <DoctorLoginPage
      onBack={() => router.push('/')}
      onLoginSuccess={() => {
        router.push('/dashboard')
      }}
    />
  )
}