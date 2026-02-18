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
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/sessions/${session_id}/tgds_json/state`
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to get TGDS state')
  }

  return res.json()
}
