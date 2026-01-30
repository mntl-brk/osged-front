import { apiAction } from '@/api/apiAction'
import { post, get } from '@/services/httpRequest'
import { object, string } from 'valibot'

export const getClockDrawing = (minicogId: string) =>
  apiAction(
    { minicogId },
    object({ minicogId: string() }),
    object({}),
    async () => {
      const res = await get(`/api/minicog/clock/${minicogId}`)
      return res
    }
  )