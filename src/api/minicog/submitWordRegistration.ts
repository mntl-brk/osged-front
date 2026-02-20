
export interface SubmitWordRegistrationPayload {
  session_id: string
  transcript: string
}

export interface SubmitWordRegistrationResponse {
  attempt: number
  completed: boolean
  correct: boolean
}

export async function submitWordRegistration(
  payload: SubmitWordRegistrationPayload
): Promise<SubmitWordRegistrationResponse> {

  const res = await fetch(`/api/minicog/${payload.session_id}/word_registration`, {
    method: 'POST',
    body: JSON.stringify(payload),
})

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to submit word registration')
  }

  return res.json()
}