import { apiAction } from '@/api/apiAction'
import { post } from '@/services/httpRequest'
import { object, string, array } from 'valibot'

export const completeClockDrawing = (payload: {
  session_id: string
  video_media_id: string
  image_media_id: string
  events_media_id: string
}) =>
  apiAction(
    payload,
    object({
      session_id: string(),
      video_media_id: string(),
      image_media_id: string(),
      events_media_id: string()
    }),
    object({}),
    async (v) => {
      const res = await post(
        `/api/minicog/${v.session_id}/clock/complete`,
        v
      )
      return res.data
    }
  )