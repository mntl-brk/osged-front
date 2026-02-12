import { getPatientDetail } from '@/api/dashboard/getPatientDetail'
import PatientDetailClient from '@/components/admin/PatientDetailClient'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ParticipantRoute( context : PageProps) {
  const { id } = await context.params

  const res = await fetch(
    `${process.env.BACKEND_API_URL}/doctor/patients/${id}`,
    { cache: 'no-store' }
  )

  if (!res.ok) {
    notFound()
  }

  const patient = await res.json()

  return <PatientDetailClient patient={patient} />
}