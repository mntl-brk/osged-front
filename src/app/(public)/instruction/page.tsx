'use client'

import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/public/AppShell'
import { InstructionPage } from '@/components/public/InstructionPage'

export default function InstructionRoute() {
  const router = useRouter()

  return (
    <AppShell>
      <InstructionPage onStart={() => router.push('/minicog/intro')} />
    </AppShell>
  )
}