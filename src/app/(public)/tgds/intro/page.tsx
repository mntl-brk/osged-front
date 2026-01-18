'use client'

import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/public/AppShell'
import { IntroTGDSPage } from '@/components/public/IntroTGDSPage'

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