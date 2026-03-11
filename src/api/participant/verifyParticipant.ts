import { get } from '@/services/httpRequest'
import { boolean, object, string } from 'valibot'
import { apiAction } from '../apiAction'
import { Participant } from '@/types/Participant'


export const VerifyParticipantRequestSchema = object({
  code: string(),
})

export const VerifyParticipantResponseSchema = object({
  id: string(),
  within_two_months: boolean(),
})

export const verifyParticipantCode = async (payload: { code: string }) => {
  return apiAction(
    payload,
    VerifyParticipantRequestSchema,  
    VerifyParticipantResponseSchema, 
    async (v) => {
      const res = await get<Participant>(`/api/participants/verify/${v.code}`)
      return res.data
    }
  )
}