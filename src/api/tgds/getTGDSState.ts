export interface TGDSStateResponse {
  current_question_no: number
  answers: {
    question_no: number
    answer: number
  }[]
  completed: boolean
}

export async function getTGDSState({
  session_id,
}: {
  session_id: string
}): Promise<TGDSStateResponse> {
  const res = await fetch(`/api/tgds/${session_id}/state`)

  if (!res.ok) {
    throw new Error('Failed to get TGDS state')
  }

  return res.json()
}