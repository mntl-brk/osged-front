import { apiAction } from '@/api/apiAction'
import { post, get } from '@/services/httpRequest'
import { object, string } from 'valibot'

export const completeClockDrawing= (
  payload: {
    minicogId: string
    video_test: string
    final_image_media: string
    events_file_path: string
  }
) =>
  apiAction(
    payload,
    object({
      minicog_id: string(),
      video_test: string(),
      final_image_media: string(),
      events_file_path: string(),
    }),
    object({}),
    async (v) => {
      const res = await post(
        `/api/minicog/clock/${v.minicogId}/complete`,
        v
      )
      return res
    }
  )