'use client'

import { useState } from 'react'
import { splitTextIntoChunks } from '@/utils/textSplitter'

export default function TTSGeneratorPage() {
  const [text, setText] = useState('')
  const [filename, setFilename] = useState('voice-guide')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('กรุณาใส่ข้อความ')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const chunks = splitTextIntoChunks(text)

      if (chunks.length === 0) {
        throw new Error('ไม่สามารถแบ่งข้อความได้')
      }

      const blobs: Blob[] = []

      for (const chunk of chunks) {
        const res = await fetch('/api/tts_Chirp3', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: chunk }),
        })

        if (!res.ok) {
          throw new Error('TTS fetch failed')
        }

        const blob = await res.blob()
        blobs.push(blob)
      }

      // รวม blobs เป็นไฟล์เดียว
      const combinedBlob = new Blob(blobs, {
        type: 'audio/mpeg',
      })

      // ดาวน์โหลด
      const url = URL.createObjectURL(combinedBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename || 'tts'}.mp3`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={containerStyle}>
      <h1>🎙 TTS MP3 Generator (Split Version)</h1>

      <label style={labelStyle}>ข้อความ</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        style={textareaStyle}
        placeholder="พิมพ์ข้อความที่ต้องการแปลงเป็นเสียง..."
      />

      <label style={labelStyle}>ชื่อไฟล์ (ไม่ต้องใส่ .mp3)</label>
      <input
        value={filename}
        onChange={(e) => setFilename(e.target.value)}
        style={inputStyle}
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={buttonStyle}
      >
        {loading ? 'กำลังสร้างเสียง...' : 'สร้างและดาวน์โหลด MP3'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}

/* ---------------- Styles ---------------- */

const containerStyle: React.CSSProperties = {
  maxWidth: 600,
  margin: '40px auto',
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  fontFamily: 'sans-serif',
}

const labelStyle: React.CSSProperties = {
  fontWeight: 600,
}

const textareaStyle: React.CSSProperties = {
  padding: 10,
  fontSize: 14,
}

const inputStyle: React.CSSProperties = {
  padding: 8,
  fontSize: 14,
}

const buttonStyle: React.CSSProperties = {
  padding: 12,
  backgroundColor: '#2563eb',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
}