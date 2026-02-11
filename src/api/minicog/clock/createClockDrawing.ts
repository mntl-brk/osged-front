import { apiAction } from '@/api/apiAction'
import { post, get } from '@/services/httpRequest'
import { object, string } from 'valibot'

export const createClockDrawing = (session_id: string) =>
  apiAction(
    { session_id },
    object({ session_id: string() }),
    object({}),
    async () => {
      const res = await post(`/api/minicog/${session_id}/clock/create`)
      return res
    }
  )