import { NextRequest, NextResponse } from "next/server"

const BACKEND_BASE = process.env.BACKEND_API_URL!

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params
    const body = await req.json()

    const backendRes = await fetch(
      `${BACKEND_BASE}/doctor/minicog/${sessionId}/clock-score`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.get("cookie") || "",
        },
        body: JSON.stringify(body),
      }
    )

    const data = await backendRes.json()

    return NextResponse.json(data, {
      status: backendRes.status,
    })
  } catch (err) {
    return NextResponse.json(
      { detail: "Internal API Gateway Error" },
      { status: 500 }
    )
  }
}