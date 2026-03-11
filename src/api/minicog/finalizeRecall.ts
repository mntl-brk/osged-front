import { apiAction } from '@/api/apiAction'
import { object, string, array, number, optional } from 'valibot'
import { post } from '@/services/httpRequest'

/* ================= Schema ================= */

const FinalizeRecallResponseSchema = object({
  recall_score: number(),
  recall_json_path: string(),
})

/* ================= API ================= */

interface FinalizeRecallInput {
  session_id: string
  user_transcript: string
  segments: {
    text: string
    confidence?: number
  }[]
}

export const finalizeRecall = (data: FinalizeRecallInput) =>
  apiAction<FinalizeRecallInput, any>(
    data,
    object({}),
    FinalizeRecallResponseSchema,
    async () => {
      const res = await post(
        `/api/minicog/${data.session_id}/recall`,
        {
          user_transcript: data.user_transcript,
          segments: data.segments,
        }
      )

      return res.data
    }
  )