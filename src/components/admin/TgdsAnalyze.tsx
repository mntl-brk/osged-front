'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Activity, ChevronDown, BarChart3, Mic, Smile, Video, Loader2 } from 'lucide-react'
import { SecureVideo } from '../SecureVideo'
import { TGDS_QUESTIONS } from '@/data/tgdsQuestions'
import { EmotionQuestionCard } from './EmotionQuestionCard'
import { AnalyzeResponse, CardState, Segment } from '@/interface/video_emotions'
import { makeEmptyDurations, normalizeEmotion } from '@/utils/emotion-utils'

interface Props {
  tgds: any
  patient: any
  hasCompleteTGDS: boolean
  open: boolean
  onToggle: () => void
}

function emptyCard(): CardState {
  return {
    loadingVideo: false,
    videoURL: null,
    analyzing: false,
    error: null,
    result: null,
  }
}

export default function TGDSAnalyze({
  tgds,
  patient,
  hasCompleteTGDS,
  open,
  onToggle,
}: Props) {

const totalQuestions = tgds?.answers?.length ?? 0
const [analyzingAll, setAnalyzingAll] = useState(false);

const [overallEmotion, setOverallEmotion] = useState<{
  positive: number
  negative: number
  neutral: number
  dominant: string
} | null>(null)

const [cards, setCards] = React.useState<Record<number, CardState>>(
  Object.fromEntries(
    (tgds?.answers ?? []).map((a: any) => [a.question_no, emptyCard()])
  )
)


 useEffect(() => {
    if (!tgds?.answers) return

    setCards(prev => {
        const next = { ...prev }

        tgds.answers.forEach((a: any) => {
        if (a.video_url) {
            next[a.question_no] = {
            ...next[a.question_no],
            videoURL: a.video_url,
            }
        }
        })

        return next
    })
 }, [tgds])

const analyzeOne = async (q: number) => {
  setCards(prev => ({
    ...prev,
    [q]: { ...prev[q], analyzing: true, error: null }
  }))

  try {
    const videoPath = cards[q]?.videoURL
    if (!videoPath) throw new Error("ไม่พบวิดีโอ")

    const res = await fetch("/api/analyze_segments", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        path: videoPath
    })
    })

    const data = await res.json()

    setCards(prev => ({
      ...prev,
      [q]: { ...prev[q], analyzing: false, result: data }
    }))

  } catch (e: any) {
    setCards(prev => ({
      ...prev,
      [q]: { ...prev[q], analyzing: false, error: e.message }
    }))
  }
}

const combinedBarData = useMemo(() => {
  const rows: any[] = []

  tgds?.answers?.forEach((a: any) => {
    const q = a.question_no
    const st = cards[q]
    const segs = st?.result?.segments
    if (!segs) return

    const totalByEmotion = makeEmptyDurations()

    for (const s of segs) {
      const dur = Math.max(0, (s.end ?? 0) - (s.start ?? 0))
      const emo = normalizeEmotion(s.emotion)
      totalByEmotion[emo] += dur
    }

    totalByEmotion.Surprise = 0

    rows.push({
      question: `Q${q}`,
      ...totalByEmotion
    })
  })

  return rows
}, [cards, tgds])

const questionMap = useMemo(() => {
  return Object.fromEntries(
    TGDS_QUESTIONS.map((q) => [Number(q.id), q])
  )
}, [])


const analyzeAll = async () => {
  if (!tgds?.answers || analyzingAll) return

  setAnalyzingAll(true)

  try {
    const qs = tgds.answers
      .filter((a: any) => !!cards[a.question_no]?.videoURL)
      .map((a: any) => a.question_no)

    await Promise.all(qs.map((q: number) => analyzeOne(q)))

    setTimeout(() => {
      computeOverallEmotion()
    }, 0)

  } finally {
    setAnalyzingAll(false)
  }
}

const computeOverallEmotion = () => {
  const totalByEmotion = makeEmptyDurations()

  Object.values(cards).forEach(st => {
    st.result?.segments?.forEach(s => {
      const dur = s.end - s.start
      const emo = normalizeEmotion(s.emotion)
      totalByEmotion[emo] += dur
    })
  })

  const positive = totalByEmotion.Happy
  const negative =
    totalByEmotion.Sad +
    totalByEmotion.Angry +
    totalByEmotion.Fear 
  const neutral = totalByEmotion.Neutral

  const total = positive + negative + neutral
  if (total === 0) return

  const result = {
    positive: positive / total,
    negative: negative / total,
    neutral: neutral / total,
    dominant:
      negative > positive
        ? "negative"
        : positive > negative
        ? "positive"
        : "neutral"
  }

  setOverallEmotion(result)
}

  return (
    <div className="space-y-6">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 border-l-8 border-orange-500 pl-6 pr-4 py-3 bg-orange-50/30 rounded-r-3xl hover:bg-orange-50 transition-all"
      >
        <div className="flex items-center gap-4">
          <Activity size={32} className="text-orange-600" />
          <div className="text-left">
            <h3 className="text-2xl font-black text-orange-900 leading-none">
              ผลการประเมินอารมณ์ (TGDS-15)
            </h3>
            <p className="text-orange-500 font-bold text-sm mt-1 uppercase tracking-widest">
              Emotional Assessment Details
            </p>
          </div>
        </div>

        <ChevronDown
          className={`text-gray-400 hover:text-gray-900 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
          size={28}
        />
      </button>

      {open && (
        <>
          {!hasCompleteTGDS ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center text-gray-400 font-bold shadow-sm">
              ยังไม่มีข้อมูล TGDS
            </div>
          ) : (
            <div className="space-y-10 animate-fade-in">
              <div className="bg-white rounded-[35px] border-2 border-gray-100 p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
                
                {/* Score Display */}
                <div className="flex flex-col items-center justify-center text-center p-6 bg-orange-50/20 rounded-[40px] border border-orange-100">
                  <div className="relative mb-6">
                    <svg className="w-56 h-56 transform -rotate-90">
                      <circle
                        className="text-white"
                        strokeWidth="14"
                        stroke="currentColor"
                        fill="transparent"
                        r="95"
                        cx="112"
                        cy="112"
                      />
                      <circle
                        className="text-orange-500"
                        strokeWidth="14"
                        strokeDasharray={596}
                        strokeDashoffset={
                          596 - (596 * patient.tgds.score) / 15
                        }
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="95"
                        cx="112"
                        cy="112"
                      />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <span className="text-7xl font-black text-orange-600 leading-none">
                        {patient.tgds.score}
                      </span>
                      <span className="block text-xs font-black text-orange-400 uppercase tracking-[0.2em] mt-2">
                        Points
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-white p-6 rounded-3xl shadow-sm border border-orange-50">
                    <p
                      className={`text-2xl font-black ${
                        patient.tgds.score >= 11
                          ? 'text-red-600'
                          : patient.tgds.score >= 6
                          ? 'text-orange-500'
                          : 'text-green-600'
                      }`}
                    >
                      {patient.tgds.score >= 11
                        ? 'ภาวะซึมเศร้าเด่นชัด'
                        : patient.tgds.score >= 6
                        ? 'เสี่ยงต่อภาวะซึมเศร้า'
                        : 'อารมณ์ปกติ'}
                    </p>
                    <p className="text-gray-400 font-bold text-xs uppercase mt-1 tracking-widest">
                      Geriatric Depression Scale Status
                    </p>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="space-y-6 flex flex-col justify-center">
                  <h4 className="text-xl font-black text-gray-800 flex items-center gap-2 mb-2">
                    <BarChart3 size={24} className="text-orange-500" />
                    AI Mood Insights
                  </h4>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-orange-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
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
                      <span className="text-lg font-black text-orange-600">
                        Coming Soon
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-orange-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
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
                        {overallEmotion ? (
                            <>
                            <p
                                className={`text-lg font-black ${
                                overallEmotion.dominant === "negative"
                                    ? "text-red-600"
                                    : overallEmotion.dominant === "positive"
                                    ? "text-green-600"
                                    : "text-gray-600"
                                }`}
                            >
                                {overallEmotion.dominant === "negative"
                                ? "แนวโน้มอารมณ์เชิงลบ"
                                : overallEmotion.dominant === "positive"
                                ? "แนวโน้มอารมณ์เชิงบวก"
                                : "อารมณ์ค่อนข้างเป็นกลาง"}
                            </p>

                            <p className="text-xs text-gray-500 font-bold mt-1">
                                Positive {(overallEmotion.positive * 100).toFixed(0)}% ·
                                Negative {(overallEmotion.negative * 100).toFixed(0)}%
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
                    onClick={analyzeAll}
                    disabled={analyzingAll}
                    className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-3 transition-all hover:bg-black shadow-xl active:scale-95 disabled:opacity-50"
                    >
                    
                    {analyzingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video size={24} />}
                    {analyzingAll ? "กำลังวิเคราะห์..." : "วิเคราะห์อารมณ์ทั้งหมด"}
                    </button>
                </div>
              </div>

              {/* Answer Section */}
              <div className="space-y-8 mt-10">
                <h4 className="text-xl font-black text-orange-900 flex items-center gap-2">
                  <Activity size={22} className="text-orange-500" />
                  รายละเอียดคำตอบรายข้อ (TGDS-15)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6">
                  {!tgds.answers || tgds.answers.length === 0 ? (
                    <div className="col-span-full text-center text-gray-400 font-bold py-10">
                      ยังไม่มีข้อมูล TGDS
                    </div>
                  ) : (
                    <>
                    {tgds.answers.map((item: any) => {
                        const question = questionMap[Number(item.question_no)]

                        if (!question) {
                            console.warn("TGDS question not found:", item.question_no)
                            return null
                        }

                        return (
                            <EmotionQuestionCard
                            key={item.question_no}
                            q={item.question_no}
                            questionText={question.text}
                            answerValue={item.answer}
                            answerScore={item.answer}
                            videoURL={item.video_url}
                            st={cards[item.question_no]}
                            analyzeOne={analyzeOne}
                            download={(mime, filename, data) => {
                                const blob =
                                data instanceof Blob ? data : new Blob([data], { type: mime })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement("a")
                                a.href = url
                                a.download = filename
                                a.click()
                                URL.revokeObjectURL(url)
                            }}
                            toCSV={(segments: Segment[]) =>
                                "start,end,emotion,confidence\n" +
                                segments
                                .map(
                                    (s) =>
                                    `${s.start.toFixed(2)},${s.end.toFixed(2)},${s.emotion},${s.confidence.toFixed(3)}`
                                )
                                .join("\n")
                            }
                            />
                        )
                        })}
                    </>
                )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}