import { NextRequest, NextResponse } from "next/server"
import { SpeechClient, protos } from "@google-cloud/speech"

export const runtime = "nodejs"

const client = new SpeechClient()

export async function POST(req: NextRequest) {

  const formData = await req.formData()
  const file = formData.get("file") as File

  if (!file) {
    return NextResponse.json(
      { error: "No audio file provided" },
      { status: 400 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const request = {
    audio: {
      content: buffer.toString("base64")
    },
    config: {
      encoding:
        protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
      sampleRateHertz: 48000,
      languageCode: "th-TH",
      model: "latest_short"
    }
  }

  const res = await client.recognize(request)
  const response = res[0]

  const transcript =
    response.results
      ?.map(r => r.alternatives?.[0]?.transcript)
      .join(" ") || ""

  return NextResponse.json({ transcript })
}