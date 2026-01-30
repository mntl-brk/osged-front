import { object, string, union, literal, array, uuid, pipe, boolean } from 'valibot'

export const ParticipantStatusSchema = union([
  literal('unused'),
  literal('used'),
  literal('deleted'),
])

export const ParticipantSchema = object({
  id: pipe(string(), uuid()),
  code: string(),
  status: ParticipantStatusSchema,
  created_at: string()
})

export const ParticipantListResponseSchema = array(ParticipantSchema)

export const ParticipantResponseSchema =  ParticipantSchema
