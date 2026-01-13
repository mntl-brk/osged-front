'use client'

import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { IntroTGDSPage } from '@/components/IntroTGDSPage'

export default function TGDSIntroRoute() {
  const router = useRouter()

  return (
    <AppShell>
      <IntroTGDSPage
        onStart={() => router.push('/tgds/assessment')}
      />
    </AppShell>
  )
}