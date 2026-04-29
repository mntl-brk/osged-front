'use client'

import { AppShell } from '@/components/public/AppShell'
import { EquipmentCheckPage } from '@/components/public/EquipmentCheckPage'

export default function CheckReadinessRoute() {
  return (
    <AppShell>
      <EquipmentCheckPage />
    </AppShell>
  )
}
