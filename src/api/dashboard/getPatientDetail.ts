import { apiAction } from '@/api/apiAction'
import { PatientDetailSchema } from '@/schemas/dashboard.schema'
import { get } from '@/services/httpRequest'

export const getPatientDetail = (sessionId: string) =>
  apiAction(
    {},
    PatientDetailSchema,
    {},
    async () => {
      const res = await get(`/api/dashboard/patient/${sessionId}`)
      return res.data
    }
  )