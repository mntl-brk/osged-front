import { NextRequest, NextResponse } from 'next/server'

const BACKEND_BASE = process.env.BACKEND_API_URL!

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ purpose: string; sessionId: string }> }
) {
  const { purpose, sessionId } = await context.params

  const { searchParams } = new URL(req.url)
  const questionNo = searchParams.get('question_no') //  ดึง query param

  const formData = await req.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'File is required' },
      { status: 400 }
    )
  }

  const f = new FormData()
  f.append('file', file, file.name)

  // forward query param ไป backend
  let backendUrl = `${BACKEND_BASE}/media/upload/${purpose}/${sessionId}`

  if (questionNo) {
    backendUrl += `?question_no=${questionNo}`
  }

  const backendRes = await fetch(backendUrl, {
    method: 'POST',
    body: f,
  })

  const payload = await backendRes.json()

  if (!backendRes.ok) {
    return NextResponse.json(payload, { status: backendRes.status })
  }

  return NextResponse.json(payload)
}