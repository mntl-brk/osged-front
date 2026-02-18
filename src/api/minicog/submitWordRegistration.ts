
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
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/minicog/word-registration`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to submit word registration')
  }

  return res.json()
}