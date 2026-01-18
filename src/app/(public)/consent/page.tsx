'use client'

import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/public/AppShell'
import { ConsentPage } from '@/components/public/ConsentPage'

export default function ConsentRoute() {
  const router = useRouter()

  return (
    <AppShell>
      <ConsentPage
        onNext={() => {
          router.push('/preferences')
        }}
      />
    </AppShell>
  )
}