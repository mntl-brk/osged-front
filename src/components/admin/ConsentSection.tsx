'use client'

import { FileText, ChevronDown, Video, Mic, Smile, BarChart3, Loader2 } from 'lucide-react'
import { SecureMedia } from '@/components/SecureMedia'
import { useState } from 'react'

interface Props {
  patient: any
  open: boolean
  onToggle: () => void
}

export default function ConsentSection({
  patient,
  open,
  onToggle,
}: Props) {

const given = patient?.consent?.given
const videoUrl = patient?.consent?.video_url
const [analyzingVideo, setAnalyzingVideo] = useState(false)
const [videoMood, setVideoMood] = useState<any>(null)
const [audioMood, setAudioMood] = useState<any>(null)
  
  
const normalize = (emo: string) => {
  const e = emo?.toLowerCase()

  if (e === "happy") return "Happy"
  if (e === "sad") return "Sad"
  if (e === "angry") return "Angry"
  if (e === "fear") return "Fear"
  if (e === "surprise") return "Neutral"

  return "Neutral"
}

const analyzeConsentVideo = async () => {
  if (!videoUrl) return

  setAnalyzingVideo(true)

  try {
    const res = await fetch("/api/analyze_media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: videoUrl })
    })

    const data = await res.json()

    /* ================= VIDEO ================= */
    const segments = data?.video?.segments ?? []

    const totals: any = {
      Happy: 0,
      Sad: 0,
      Angry: 0,
      Fear: 0,
      Neutral: 0
    }


    segments.forEach((s: any) => {
    const dur = Math.max(0, (s.end ?? 0) - (s.start ?? 0))
    const emo = normalize(s.emotion)
    totals[emo] += dur
    })

    const positive = totals.Happy
    const negative = totals.Sad + totals.Angry + totals.Fear
    const neutral = totals.Neutral
    const total = positive + negative + neutral

    if (total > 0) {
      setVideoMood({
        positive: positive / total,
        negative: negative / total,
        neutral: neutral / total,
        dominant:
          negative > positive
            ? "negative"
            : positive > negative
            ? "positive"
            : "neutral"
      })
    }

    /* ================= AUDIO ================= */

    const prediction = data?.audio?.prediction

    if (prediction !== undefined) {
      if (prediction === 1) {
        // 1 = เสี่ยงซึมเศร้า = negative
        setAudioMood({
          positive: 0,
          negative: 1,
          dominant: "negative"
        })
      } else {
        // 0 = ปกติ
        setAudioMood({
          positive: 1,
          negative: 0,
          dominant: "positive"
        })
      }
    }

  } catch (e) {
    console.error("Analyze consent video error:", e)
  } finally {
    setAnalyzingVideo(false)
  }
}

  return (
    <div className="space-y-6">

      {/* ===== HEADER ===== */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 border-l-8 border-purple-500 pl-6 pr-4 py-3 bg-purple-50/30 rounded-r-3xl hover:bg-purple-50 transition-all"
      >
        <div className="flex items-center gap-4">
          <FileText size={32} className="text-purple-600"/>
          <div className="text-left">
            <h3 className="text-2xl font-black text-purple-900 leading-none">
              ข้อมูลความยินยอม (Consent)
            </h3>
            <p className="text-purple-500 font-bold text-sm mt-1 uppercase tracking-widest">
              Consent & Media Records
            </p>
          </div>
        </div>

        <ChevronDown
          className={`text-gray-400 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
          size={28}
        />
      </button>

      {/* ===== CONTENT ===== */}
      {open && (
        <div className="bg-white rounded-[35px] border-2 border-gray-100 p-8 shadow-sm animate-fade-in">

          {/* ===== STATUS ===== */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-purple-500 uppercase tracking-widest">
                Consent Status
              </p>
              <p className="text-3xl font-black text-gray-900 mt-2">
                {given ? 'ให้ความยินยอมแล้ว' : 'ยังไม่ได้ให้ความยินยอม'}
              </p>
            </div>

            <span
              className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${
                given
                  ? 'bg-green-50 text-green-600 border-green-200'
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}
            >
              {given ? 'Granted' : 'Not Granted'}
            </span>
          </div>

          {/* ===== GRID SECTION ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* ===== VIDEO ===== */}
            <div className="space-y-3">
              <p className="text-sm font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                <Video size={16}/>
                Consent Video
              </p>

              <div className="aspect-video bg-black rounded-2xl overflow-hidden">
                {videoUrl ? (
                  <SecureMedia
                    path={videoUrl}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    ไม่มีวิดีโอ
                  </div>
                )}
              </div>
            </div>

            {/* ===== AI INSIGHTS ===== */}
            <div className="space-y-6 flex flex-col justify-center">
                  <h4 className="text-xl font-black text-gray-800 flex items-center gap-2 mb-2">
                    <BarChart3 size={24} className="text-orange-500" />
                    AI Mood Insights
                  </h4>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-orange-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl shadow-sm bg-orange-50 text-orange-500 transition-colors">
                          <Mic size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">
                            Voice Sentiment
                          </p>
                          <p className="text-xs text-gray-400 font-bold">
                            โทนเสียงและการสั่นไหว
                          </p>
                        </div>
                      </div>
                     <div className="text-right">
                    {audioMood ? (
                        <>
                        <p
                            className={`text-lg font-black ${
                            audioMood.dominant === "negative"
                                ? "text-red-600"
                                : audioMood.dominant === "positive"
                                ? "text-green-600"
                                : "text-gray-600"
                            }`}
                        >
                            {audioMood.dominant === "negative"
                            ? "แนวโน้มเสียงเชิงลบ"
                            : audioMood.dominant === "positive"
                            ? "แนวโน้มเสียงเชิงบวก"
                            : "เสียงค่อนข้างเป็นกลาง"}
                        </p>

                        <p className="text-xs text-gray-500 font-bold mt-1">
                            Positive {(audioMood.positive * 100).toFixed(0)}% ·
                            Negative {(audioMood.negative * 100).toFixed(0)}%
                        </p>
                        </>
                    ) : (
                        <span className="text-lg font-black text-orange-600">
                        ยังไม่วิเคราะห์
                        </span>
                    )}
                    </div>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-orange-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl shadow-sm bg-blue-50 text-blue-500 transition-colors">
                          <Smile size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">
                            Face Analysis
                          </p>
                          <p className="text-xs text-gray-400 font-bold">
                            การวิเคราะห์สีหน้า (Video)
                          </p>
                        </div>
                      </div>
                     <div className="text-right">
                        {videoMood ? (
                            <>
                            <p
                                className={`text-lg font-black ${
                                videoMood.dominant === "negative"
                                    ? "text-red-600"
                                    : videoMood.dominant === "positive"
                                    ? "text-green-600"
                                    : "text-gray-600"
                                }`}
                            >
                                {videoMood.dominant === "negative"
                                ? "แนวโน้มอารมณ์เชิงลบ"
                                : videoMood.dominant === "positive"
                                ? "แนวโน้มอารมณ์เชิงบวก"
                                : "อารมณ์เป็นกลาง"}
                            </p>

                            <p className="text-xs text-gray-500 font-bold mt-1">
                                Positive {(videoMood.positive * 100).toFixed(0)}% ·
                                Negative {(videoMood.negative * 100).toFixed(0)}%
                            </p>
                            </>
                        ) : (
                            <span className="text-lg font-black text-blue-600">
                            ยังไม่วิเคราะห์
                            </span>
                        )}
                        </div>
                    </div>

                  </div>
                 
                    <button
                    onClick={analyzeConsentVideo}
                    disabled={analyzingVideo || !videoUrl}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-3 transition-all hover:bg-blue-600 shadow-xl active:scale-95 disabled:opacity-50"
                    >
                    {analyzingVideo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Video size={24} />
                    )}
                    {analyzingVideo ? "กำลังวิเคราะห์..." : "วิเคราะห์วิดีโอ Consent"}
                    </button>
                </div>

          </div>

        </div>
      )}
    </div>
  )
}