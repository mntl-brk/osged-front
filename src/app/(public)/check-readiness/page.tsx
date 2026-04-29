'use client'

import { AppShell } from '@/components/public/AppShell'
import { EquipmentCheckPage } from '@/components/public/EquipmentCheckPage'
import { useVoiceGuideControl } from '@/contexts/VoiceGuideContext'
import { useEffect } from 'react'

export default function CheckReadinessRoute() {
  const { setEnabled } = useVoiceGuideControl()

  useEffect(() => {
    setEnabled(false)

    return () => {
      setEnabled(true)
    }
  }, [])
  return (
    <AppShell>
      <EquipmentCheckPage />
    </AppShell>
  )
}
