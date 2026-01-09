import { NextResponse } from 'next/server';
import textToSpeech from '@google-cloud/text-to-speech';

// สร้าง Client นอก function เพื่อลดการ connect ใหม่ซ้ำๆ
const client = new textToSpeech.TextToSpeechClient();

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
        return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // เรียก Google Cloud TTS ผ่าน Library โดยตรง
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: { languageCode: 'th-TH', name: 'th-TH-Neural2-C' },
      audioConfig: { audioEncoding: 'MP3' },
    });

    if (!response.audioContent) {
        throw new Error("No audio content received");
    }

    // แปลงเป็น Buffer
    const audioBuffer = Buffer.from(response.audioContent);

    // ส่งไฟล์เสียงกลับไป
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    });

  } catch (err: any) {
    console.error('TTS Error:', err);
    return NextResponse.json(
      { error: err.message || 'TTS failed' },
      { status: 500 }
    );
  }
}