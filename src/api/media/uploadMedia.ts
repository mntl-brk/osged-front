import { postForm } from '@/services/httpRequest'
import { apiAction } from '@/api/apiAction'
import { object, string } from 'valibot'
import { Media } from '@/types/media'

export const uploadMedia = (payload: {
  sessionId: string
  purpose:  'consent_video' | 'minicog_clock_video' | 'minicog_clock_image' | 'minicog_clock_events' | 'tgds_test'
  file: Blob,
  questionNo?: number 
}) => {
  const { file } = payload

  return apiAction(
    payload,
    object({
      sessionId: string(),
      purpose: string(),
    }),
    object({
      media_id: string(),
      content_type: string(),
    }),
    async ({ sessionId, purpose }) => {
      const form = new FormData()

      let filename = 'file'
      if (purpose === 'minicog_clock_video') filename = 'clock.webm'
      if (purpose === 'minicog_clock_image') filename = 'clock.png'
      if (purpose === 'minicog_clock_events') filename = 'events.json'
      if (purpose === 'tgds_test') filename = 'tgds.webm'

      form.append('file', file, filename)

      let url = `/api/media/upload/${purpose}/${sessionId}`

      if (purpose === 'tgds_test' && payload.questionNo) {
      url += `?question_no=${payload.questionNo}`
      }

      return await postForm<Media>(url, form)
      
    }
  )
}