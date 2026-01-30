import { apiAction } from '@/api/apiAction'
import { post, get } from '@/services/httpRequest'
import { object, string } from 'valibot'

export const createClockDrawing = (minicog_id: string) =>
  apiAction(
    { minicog_id },
    object({ minicog_id: string() }),
    object({}),
    async () => {
      const res = await post(`/api/minicog/clock/${minicog_id}/create`)
      return res
    }
  )