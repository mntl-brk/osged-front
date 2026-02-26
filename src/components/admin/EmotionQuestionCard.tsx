"use client";

import React, { useMemo } from "react";
import { Play, Download, FileText, Loader2 } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { ALL_EMOTIONS, EMO_COLORS } from "@/interface/emotions";
import { AnalyzeResponse, CardState, Segment } from "@/interface/video_emotions";
import { normalizeEmotion } from "@/utils/emotion-utils";
import { SecureMedia } from "../SecureMedia";

interface Props {
  q: number
  questionText?: string
  answerScore?: number | null
  answerValue?: number | null
  videoURL?: string | null
  audioURL?: string | null
  st: CardState
  analyzeOne: (q: number) => Promise<void>
  analyzeAudioOne: (q: number) => Promise<void>
  download: (mime: string, filename: string, data: string | Blob) => void
  toCSV: (segments: Segment[]) => string
}

export const EmotionQuestionCard: React.FC<Props> = ({
  q,
  questionText,
  answerScore,
  answerValue,
  videoURL,
  audioURL,
  st,
  analyzeOne,
  analyzeAudioOne,
  download,
  toCSV,
}) => {

  const answerLabel =
  answerValue == null
    ? null
    : answerValue === 1
    ? "ใช่"
    : "ไม่ใช่";
  const chartData = useMemo(() => {
    if (!st.result?.segments?.length) return [];

    const segs = st.result.segments;
    const last = Math.ceil(segs[segs.length - 1].end);
    const out = [];
    let i = 0;

    for (let t = 0; t <= last; t++) {
      while (i < segs.length - 1 && t >= segs[i].end) i++;
      const emo = normalizeEmotion(segs[i].emotion);

      const row: any = { t };
      ALL_EMOTIONS.forEach(e => (row[e] = 0));
      row[emo] = 1;
      row.Surprise = 0;
      out.push(row);
    }

    return out;
  }, [st.result?.segments]);

  return (
  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
    
    {/* ===== HEADER ===== */}
    <div className="bg-orange-50/40 border-b border-gray-100 px-5 py-4">
      <div className="flex flex-col gap-2">
        
        {/* Top row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        
        {/* ===== LEFT SIDE ===== */}
        <div className="flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
            ข้อ {q}
            </span>

            {answerLabel && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                คำตอบ: {answerLabel}
            </span>
            )}
        </div>

        {/* ===== RIGHT SIDE (BUTTON GROUP) ===== */}
        <div className="flex gap-2 flex-wrap justify-end">
            
            {/* AUDIO BUTTON */}
            <button
            onClick={() => analyzeAudioOne(q)}
            disabled={!audioURL || st.audioAnalyzing}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
            {st.audioAnalyzing ? (
                <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังวิเคราะห์...
                </>
            ) : (
                <>
                <Play className="h-4 w-4" />
                วิเคราะห์เสียง
                </>
            )}
            </button>

            {/* VIDEO BUTTON */}
            <button
            onClick={() => analyzeOne(q)}
            disabled={!videoURL || st.analyzing}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-black disabled:opacity-50 transition"
            >
            {st.analyzing ? (
                <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังวิเคราะห์...
                </>
            ) : (
                <>
                <Play className="h-4 w-4" />
                วิเคราะห์สีหน้า
                </>
            )}
            </button>

        </div>
        </div>

        {/* Question */}
        {questionText && (
          <div className="text-sm pt-2 text-gray-700 font-medium leading-relaxed">
            {questionText}
          </div>
        )}
      </div>
    </div>

    {/* ===== VIDEO SECTION ===== */}
    <div className="p-5 border-b border-gray-100">
      <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
        วิดีโอคำตอบ
      </div>

      <div className="rounded-xl bg-black/5 overflow-hidden">
        {videoURL ? (
          <SecureMedia
            key={videoURL}
            path={videoURL}
            className="aspect-video w-full bg-black object-contain"
          />
        ) : (
          <div className="aspect-video grid place-items-center bg-gray-100 text-sm text-gray-500">
            ไม่มีวิดีโอ
          </div>
        )}
      </div>

      {st.error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {st.error}
        </div>
      )}
    </div>

    {/* ===== AI RESULT SECTION ===== */}
    {st.result?.segments && (
      <div className="p-5 bg-gray-50/40">
        <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
          ผลวิเคราะห์อารมณ์โดย AI 
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="t" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {ALL_EMOTIONS.map((e) => (
                  <Line
                    key={e}
                    type="monotone"
                    dataKey={e}
                    stroke={EMO_COLORS[e]}
                    dot={false}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-2">ช่วงเวลา (วินาที)</th>
                <th className="px-4 py-2">อารมณ์หลัก</th>
                <th className="px-4 py-2">ความมั่นใจ</th>
              </tr>
            </thead>
            <tbody>
              {st.result.segments.map((s, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-2 font-mono text-gray-600">
                    {s.start.toFixed(2)} – {s.end.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-700">
                    {normalizeEmotion(s.emotion)}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {(s.confidence * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Download */}
        <div className="mt-4 flex gap-3 justify-end">
          <button
            onClick={() =>
              download(
                "text/csv;charset=utf-8",
                `tgds_q${String(q).padStart(2, "0")}.csv`,
                toCSV(st.result!.segments)
              )
            }
            className="rounded-xl bg-white px-4 py-2 text-xs ring-1 ring-gray-200 hover:bg-gray-100 text-gray-800"
          >
            <Download className="h-4 w-4 inline mr-1" />
            ดาวน์โหลด CSV
          </button>

          <button
            onClick={() =>
              download(
                "application/json",
                `tgds_q${String(q).padStart(2, "0")}.json`,
                JSON.stringify(st.result, null, 2)
              )
            }
            className="rounded-xl bg-white px-4 py-2 text-xs ring-1 ring-gray-200 hover:bg-gray-100 text-gray-800"
          >
            <FileText className="h-4 w-4 inline mr-1" />
            ดาวน์โหลด JSON
          </button>
        </div>
      </div>
    )}

    {/* ===== AUDIO SECTION ===== */}
    <div className="p-5 border-b border-gray-100">
        <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            เสียงคำตอบ
        </div>

        {audioURL ? (
            <>
            <SecureMedia
                key={audioURL}
                path={audioURL}
                className="w-full rounded-lg"
            >
            </SecureMedia>
            </>
        ) : (
            <div className="text-sm text-gray-500">
            ไม่มีไฟล์เสียง
            </div>
        )}

        {st.audioResult && (
            <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm font-semibold mb-2 text-gray-600">
                ผลวิเคราะห์เสียง
            </div>

            <div
                className={`text-lg font-black ${
                st.audioResult.prediction === 1
                    ? "text-red-600"
                    : "text-green-600"
                }`}
            >
                {st.audioResult.message}
            </div>

            <div className="text-xs text-gray-500 mt-1">
                ความยาวเสียง {st.audioResult.duration.toFixed(1)} วินาที
            </div>

        <div className="mt-3 flex justify-end">
            <button
            onClick={() =>
                download(
                "application/json",
                `tgds_audio_q${String(q).padStart(2, "0")}.json`,
                JSON.stringify(st.audioResult, null, 2)
                )
            }
            className="rounded-xl bg-white px-4 py-2 text-xs ring-1 ring-gray-200 hover:bg-gray-100 text-gray-800"
            >
            <Download className="h-4 w-4 inline mr-1" />
            ดาวน์โหลดผลเสียง
            </button>
        </div>
        </div>
    )}
    </div>
  </div>
  );
};