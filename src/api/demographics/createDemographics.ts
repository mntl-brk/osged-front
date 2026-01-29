import { apiAction } from '@/api/apiAction'
import { post } from '@/services/httpRequest'
import {
  CreateDemographicsRequestSchema,
  CreateDemographicsResponseSchema,
} from '@/schemas/demographics.schema'

export const createDemographics = (payload: {
  session_id: string
  age_years: number
  sex: 'male' | 'female' | 'other'
  current_location: string
  education_level: 'below_p4' | 'p4_or_above'
  location_type: 'home' | 'nursing_home' | 'hospital'
}) =>
  apiAction(
    payload,
    CreateDemographicsRequestSchema,
    CreateDemographicsResponseSchema,
    async (v) => {
      const res = await post(`/api/demographics/${v.session_id}`, v)
      return res
    }
  )