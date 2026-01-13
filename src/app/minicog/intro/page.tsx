'use client'

import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { IntroMiniCogPage } from '@/components/IntroMiniCogPage'

export default function MiniCogIntroRoute() {
  const router = useRouter()

  return (
    <AppShell>
      <IntroMiniCogPage
        onStart={() => {
          router.push('/minicog/word-registration')
        }}
      />
    </AppShell>
  )
}