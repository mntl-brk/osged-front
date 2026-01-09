'use client'

import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { ConsentPage } from '@/components/ConsentPage'

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