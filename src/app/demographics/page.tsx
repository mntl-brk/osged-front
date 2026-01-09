'use client'

import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { DemographicsPage } from '@/components/DemographicsPage'
import { useAssessmentStore } from '@/store/assessmentStore'
import type { DemographicsData } from '@/types'

export default function DemographicsRoute() {
  const router = useRouter()
  const setDemographics = useAssessmentStore((s) => s.setDemographics)

  return (
    <AppShell>
      <DemographicsPage
        onSubmit={(data: DemographicsData) => {
          setDemographics(data)
          router.push('/instruction')
        }}
      />
    </AppShell>
  )
}