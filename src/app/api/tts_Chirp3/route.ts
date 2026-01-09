import { NextResponse } from 'next/server';
import { v1beta1 } from '@google-cloud/text-to-speech';

const client = new v1beta1.TextToSpeechClient();

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const request = {
      input: {
        text: text,
      },
      voice: {
        languageCode: 'th-TH',
        name: 'th-TH-Chirp3-HD-Enceladus', 
      },
      audioConfig: {
        audioEncoding: 'MP3' as const, 
        pitch: 0,
        speakingRate: 1,
      },
    };

    const [response] = await client.synthesizeSpeech(request);

    if (!response.audioContent) {
      throw new Error('No audio content received');
    }

    const audioBuffer = Buffer.from(response.audioContent);

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