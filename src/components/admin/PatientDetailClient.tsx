'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Gender } from '@/types'
import { PatientDetail } from '@/types/Participant'
import { AlertCircle, ArrowLeft, BarChart3, Brain, Calendar, CheckCircle, Clock, FileText, Mic, Smile, TrendingUp, User, Video, Activity, X, ChevronDown, CheckCircle2, Film, FileJson } from 'lucide-react'
import { SecureImage } from '../SecureImage'
import { SecureVideo } from '../SecureVideo'
import { SecureJson } from '../SecureJson'
import { ScoreSelector } from '../ScoreSelector'
import { mapEducationTH, mapGenderTH, mapLocationTH } from '@/utils/demographicMapper'
import { TgdsDetail } from '@/types/tgds'
import { useTgds } from './useTgds'
import { TGDS_QUESTIONS } from '@/data/tgdsQuestions'
import { NewtonLoaderOverlay } from '../loading'

interface Props {
  patient: PatientDetail
}

export default function PatientDetailClient({ patient }: Props) {
    const router = useRouter()
    const [showLoader, setShowLoader] = useState(true)
    const [formattedDate, setFormattedDate] = useState('')
    const { tgds, loading, error } = useTgds(patient.id)
    const [openSection, setOpenSection] = useState<'video' | 'json' | null>(null)
    const [clockScore, setClockScore] = useState<0 | 1 | 2 | null>(
        patient.miniCog.clockScore as 0 | 1 | 2 | null
    )

    const [openSections, setOpenSections] = useState({
    miniCog: true,
    tgds: true,
    })

    useEffect(() => {
    let timer: NodeJS.Timeout

    if (!loading) {
        timer = setTimeout(() => {
        setShowLoader(false)
        }, 600) 
    } else {
        setShowLoader(true)
    }

    return () => clearTimeout(timer)
    }, [loading])

    useEffect(() => {
        setFormattedDate(
            new Date(patient.completed_at).toLocaleString('th-TH', {
            timeZone: 'Asia/Bangkok',
            })
        )
        }, [patient.completed_at])
        

    const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({
        ...prev,
        [key]: !prev[key],
    }))
    }

    const [totalScore, setTotalScore] = useState(
    patient.miniCog?.score ?? 0
    )

    const handleClockScore = async (score: 0 | 1 | 2) => {
    try {
        setClockScore(score)

        const res = await fetch(
        `/api/minicog/${patient.id}/clock/update`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clock_score: score }),
        }
        )

        if (!res.ok) throw new Error()

        const data = await res.json()

        if (data.total_score !== undefined) {
        setTotalScore(data.total_score)
        }

    } catch (err) {
        alert('ไม่สามารถบันทึกคะแนนได้')
        setClockScore(patient.miniCog.clockScore as 0 | 1 | 2 | null)
    }
    }


    if (showLoader)
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-6">

            <div className="relative">
                <NewtonLoaderOverlay/>
            </div>

        </div>
        </div>
    )   

    if (error || !tgds)
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-3xl p-10 text-center shadow-sm">

            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
            ⚠️
            </div>

            <h2 className="text-2xl font-black text-red-700">
            โหลดข้อมูลไม่สำเร็จ
            </h2>

            <p className="text-sm text-red-500 mt-3 font-semibold">
            ไม่สามารถดึงข้อมูลการประเมินได้
            </p>

            <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full bg-red-600 text-white py-3 rounded-2xl font-black hover:bg-red-700 transition-all"
            >
            ลองใหม่อีกครั้ง
            </button>
        </div>
        </div>
    )
    function calculateTGDSScore(
        answers: { question_no: number; answer: 0 | 1 }[]
        ) {
        return answers.reduce((total, item) => {
            const question = TGDS_QUESTIONS.find(
            (q) => q.id === item.question_no
            )

            if (!question) return total

            const isYes = item.answer === 1

            const isScored =
            (isYes && question.scoreTarget === true) ||
            (!isYes && question.scoreTarget === false)

            return total + (isScored ? 1 : 0)
        }, 0)
    }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
    
        <div className="flex items-center gap-4">
   
            <button 
                onClick={() => router.back()}
                className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-all border border-transparent hover:border-gray-200"
            >
                <ArrowLeft size={24} strokeWidth={2.5} />
            </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">รายงานข้อมูลการทดสอบ</h1>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
              Clinical Assessment Report
            </p>
          </div>
        </div>
      </header>

      {/* BODY */}
        <main className="w-full mx-auto p-12">
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-200 overflow-hidden">
                
                {/* Header Section */}
        <div className="p-8 border-b border-gray-100 bg-gray-50/60">

        <div className="flex items-start justify-between gap-10">

            {/* LEFT SIDE */}
            <div className="flex items-start gap-6">

            {/* Avatar */}
            <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center shadow-lg shadow-primary/20">
                <User size={40} />
            </div>

            {/* Identity + Demographics */}
            <div className="space-y-6">

                {/* ================= IDENTITY ================= */}
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                    V-ID: {patient.volunteer_code}
                    </h2>

                    <span
                    className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${
                        patient.status === 'high-risk'
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : 'bg-green-50 text-green-600 border-green-200'
                    }`}
                    >
                    {patient.status === 'high-risk' ? 'High Risk' : 'Normal'}
                    </span>
                </div>

                {/* ================= DEMOGRAPHICS ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-5">

                    {/* วันที่ทำแบบทดสอบ */}
                    <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        วันที่ประเมิน
                    </p>
                    <div className="flex items-center gap-2 text-gray-800 font-semibold">
                        {formattedDate}
                    </div>
                    </div>

                    {/* อายุ */}
                    <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        อายุ
                    </p>
                    <p className="text-gray-900 font-bold text-lg">
                        {patient.demographics.age} ปี
                    </p>
                    </div>

                    {/* เพศ */}
                    <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        เพศ
                    </p>
                    <p className="text-gray-900 font-bold text-lg">
                        {mapGenderTH(patient.demographics.sex)}
                    </p>
                    </div>

                    {/* การศึกษา */}
                    <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        ระดับการศึกษา
                    </p>
                    <p className="text-gray-900 font-bold text-lg">
                        {mapEducationTH(patient.demographics.educationLevel)}
                    </p>
                    </div>

                    {/* ประเภทที่อยู่อาศัย */}
                    <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        ประเภทที่อยู่อาศัย
                    </p>
                    <p className="text-gray-900 font-bold text-lg">
                        {mapLocationTH(patient.demographics.locationType)}
                    </p>
                    </div>

                </div>
                </div>
            </div>

        </div>
        </div>

                {/* Vertical Scrollable Body */}
                <div className="p-8 overflow-y-auto space-y-10 bg-white">
                    
                    {/* SECTION 1: Cognition (Mini-Cog) */}
                    <div className="space-y-6">
                    <button
                            onClick={() => toggleSection('miniCog')}
                            className="w-full flex items-center justify-between gap-4 border-l-8 border-blue-500 pl-6 pr-4 py-3 bg-blue-50/30 rounded-r-3xl hover:bg-blue-50 transition-all"
                        >
                            <div className="flex items-center gap-4">
                            <Brain size={32} className="text-blue-600"/>
                            <div className="text-left">
                                <h3 className="text-2xl font-black text-blue-900 leading-none">
                                ผลการประเมินการรู้คิด (Mini-Cog)
                                </h3>
                                <p className="text-blue-500 font-bold text-sm mt-1 uppercase tracking-widest">
                                Cognitive Assessment Details
                                </p>
                            </div>
                            </div>

                            <ChevronDown
                            className={`text-gray-400 hover:text-gray-900  transition-transform duration-300 ${
                                openSections.miniCog ? 'rotate-180' : ''
                            }`}
                            size={28}
                            />
                        </button>

                        {openSections.miniCog && (
                        <div className="space-y-10 animate-fade-in">

                            {/* ================= WORD RECALL ================= */}
                            <div className="bg-white rounded-[35px] border-2 border-gray-100 p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-xl font-black text-gray-800 flex items-center gap-2">
                                <TrendingUp size={20} className="text-blue-500" />
                                <span>รายละเอียดคำศัพท์ (3-Word Recall)</span>
                                </h4>

                                <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl font-black">
                                Score: {patient.miniCog?.recallScore ?? 0}/3
                                </div>
                            </div>

                            {/* Guard กัน undefined */}
                            {patient.miniCog?.wordRegistration?.length ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {patient.miniCog.wordRegistration.map((word, i) => {
                                    const isRecalled =
                                    patient.miniCog?.recalledWords?.includes(word)

                                    return (
                                    <div
                                        key={i}
                                        className={`
                                        relative p-6 rounded-[30px] border-4
                                        flex flex-col items-center justify-center gap-2
                                        transition-all
                                        ${
                                            isRecalled
                                            ? 'bg-green-50 border-green-400 text-green-700 shadow-sm'
                                            : 'bg-red-50 border-red-200 text-red-500 opacity-80'
                                        }
                                        `}
                                    >
                                        <span className="absolute -top-3 left-6 px-3 py-0.5 bg-white border-2 border-inherit rounded-full text-[10px] font-black uppercase">
                                        Word {i + 1}
                                        </span>

                                        {isRecalled ? (
                                        <CheckCircle size={32} />
                                        ) : (
                                        <X size={32} />
                                        )}

                                        <span className="text-3xl font-black">{word}</span>

                                        <span className="text-xs font-bold uppercase tracking-widest opacity-60">
                                        {isRecalled ? 'RECALLED' : 'NOT FOUND'}
                                        </span>
                                    </div>
                                    )
                                })}
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 font-bold py-10">
                                ไม่มีข้อมูลคำศัพท์
                                </div>
                            )}
                            </div>

                            {/* ================= CLOCK DRAWING ================= */}
                            <div className="grid grid-cols-2 p-6 gap-8 bg-white rounded-[40px] border border-gray-100 shadow-lg border-2">

                            {/* ================= LEFT: FINAL CLOCK ================= */}
                            <div className="xl:col-span-2 relative overflow-hidden">

                            {/* Subtle background glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-transparent pointer-events-none" />

                            <div className="relative z-10">

                                <h4 className="text-2xl font-black text-gray-800 mb-10 flex items-center gap-3">
                                <Clock size={26} className="text-blue-500" />
                                Clock Drawing – Final Result
                                </h4>

                                {/* Clock container */}
                                <div className="relative aspect-square max-w-xl mx-auto rounded-[40px] flex items-center justify-center overflow-hidden">

                                {patient.miniCog.clockImage ? (
                                    <SecureImage
                                    path={patient.miniCog.clockImage}
                                    alt="Clock drawing"
                                    className="w-full h-full object-contain p-10"
                                    />
                                ) : (
                                    <Clock size={180} strokeWidth={1} className="text-gray-200" />
                                )}

                                </div>

                            </div>
                            </div>

                            {/* ================= RIGHT: CONTROL + SUPPORTING DATA ================= */}
                            <div className="xl:col-span-2 space-y-6">

                                {/* ===== CLOCK SCORE (ACTION FIRST) ===== */}
                               
                                <div className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm">
                                <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <CheckCircle2 size={16} />
                                    Assign Clock Score
                                </p>

                                <ScoreSelector
                                    value={clockScore}
                                    onChange={handleClockScore}
                                />
                                </div>

                                {/* ===== VIDEO ===== */}
                                   <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

                                    <button
                                        onClick={() =>
                                        setOpenSection(openSection === 'video' ? null : 'video')
                                        }
                                        className="w-full flex items-center justify-between px-6 py-5"
                                    >
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600 uppercase tracking-widest">
                                        <Film size={16} />
                                        Drawing Video
                                        </div>

                                        <ChevronDown
                                        size={18}
                                        className={`transition-transform text-gray-400 ${
                                            openSection === 'video' ? 'rotate-180' : ''
                                        }`}
                                        />
                                    </button>

                                    {openSection === 'video' && (
                                        <div className="px-6 pb-12">
                                        <div className="aspect-video bg-black rounded-2xl overflow-hidden">
                                            {patient.miniCog.clock_video_url ? (
                                            <SecureVideo
                                                path={patient.miniCog.clock_video_url}
                                                className="w-full h-full object-contain"
                                            />
                                            ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                                ไม่มีวิดีโอ
                                            </div>
                                            )}
                                        </div>
                                        </div>
                                    )}
                                    </div>

                                {/* ===== JSON EVENT ===== */}
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

                                    <button
                                        onClick={() =>
                                        setOpenSection(openSection === 'json' ? null : 'json')
                                        }
                                        className="w-full flex items-center justify-between px-6 py-5"
                                    >
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600 uppercase tracking-widest">
                                        <FileJson size={16} />
                                        Stroke Metadata
                                        </div>

                                        <ChevronDown
                                        size={18}
                                        className={`transition-transform text-gray-400 ${
                                            openSection === 'json' ? 'rotate-180' : ''
                                        }`}
                                        />
                                    </button>

                                    {openSection === 'json' && (
                                        <div className="px-6 pb-12">
                                        <div className="h-56 border border-gray-200 rounded-2xl overflow-hidden">
                                            {patient.miniCog.clock_events_url ? (
                                            <SecureJson path={patient.miniCog.clock_events_url} />
                                            ) : (
                                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                                ไม่มี JSON
                                            </div>
                                            )}
                                        </div>
                                        </div>
                                    )}
                                </div>

                            </div>
                            </div>

                            {/* ================= TOTAL SCORE ================= */}
                            <div className="mt-12 bg-blue-50 border border-blue-100 rounded-3xl p-8 flex items-center justify-between">

                            <div>
                                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">
                                Mini-Cog Total Score
                                </p>
                                <p className="text-5xl font-black text-blue-800">
                                {totalScore} / 5
                                </p>
                            </div>

                            <Brain size={52} className="text-blue-300" />

                            </div>
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: Mood (TGDS) */}
                    <div className="space-y-6">
                     <button
                        onClick={() => toggleSection('tgds')}
                        className="w-full flex items-center justify-between gap-4 border-l-8 border-orange-500 pl-6 pr-4 py-3 bg-orange-50/30 rounded-r-3xl hover:bg-orange-50 transition-all"
                        >
                        <div className="flex items-center gap-4">
                            <Activity size={32} className="text-orange-600"/>
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
                            openSections.tgds ? 'rotate-180' : ''
                            }`}
                            size={28}
                        />
                        </button>


                        {openSections.tgds && (
                        <div className="space-y-10 animate-fade-in">
                        <div className="bg-white rounded-[35px] border-2 border-gray-100 p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Score Display */}
                            <div className="flex flex-col items-center justify-center text-center p-6 bg-orange-50/20 rounded-[40px] border border-orange-100">
                                <div className="relative mb-6">
                                    <svg className="w-56 h-56 transform -rotate-90">
                                        <circle className="text-white" strokeWidth="14" stroke="currentColor" fill="transparent" r="95" cx="112" cy="112" />
                                        <circle
                                            className="text-orange-500"
                                            strokeWidth="14"
                                            strokeDasharray={596}
                                            strokeDashoffset={596 - (596 * patient.tgds.score) / 15}
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="95"
                                            cx="112"
                                            cy="112"
                                        />
                                    </svg>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <span className="text-7xl font-black text-orange-600 leading-none">{patient.tgds.score}</span>
                                        <span className="block text-xs font-black text-orange-400 uppercase tracking-[0.2em] mt-2">Points</span>
                                    </div>
                                </div>
                                <div className="w-full bg-white p-6 rounded-3xl shadow-sm border border-orange-50">
                                    <p className={`text-2xl font-black ${patient.tgds.score >= 11 ? 'text-red-600' : patient.tgds.score >= 6 ? 'text-orange-500' : 'text-green-600'}`}>
                                        {patient.tgds.score >= 11 ? 'ภาวะซึมเศร้าเด่นชัด' : 
                                         patient.tgds.score >= 6 ? 'เสี่ยงต่อภาวะซึมเศร้า' : 'อารมณ์ปกติ'}
                                    </p>
                                    <p className="text-gray-400 font-bold text-xs uppercase mt-1 tracking-widest">Geriatric Depression Scale Status</p>
                                </div>
                            </div>

                            {/* AI Insights and Voice */}
                            <div className="space-y-6 flex flex-col justify-center">
                                <h4 className="text-xl font-black text-gray-800 flex items-center gap-2 mb-2">
                                    <BarChart3 size={24} className="text-orange-500"/> AI Mood Insights
                                </h4>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-orange-200 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                                                <Mic size={24}/>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">Voice Sentiment</p>
                                                <p className="text-xs text-gray-400 font-bold">โทนเสียงและการสั่นไหว</p>
                                            </div>
                                        </div>
                                        <span className="text-lg font-black text-orange-600">Coming Soon</span>
                                    </div>

                                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-orange-200 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                                <Smile size={24}/>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">Face Analysis</p>
                                                <p className="text-xs text-gray-400 font-bold">การวิเคราะห์สีหน้า (Video)</p>
                                            </div>
                                        </div>
                                        <span className="text-lg font-black text-blue-600">Coming Soon</span>
                                    </div>
                                </div>

                                <button className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-3 transition-all hover:bg-black shadow-xl active:scale-95">
                                    <Video size={24} /> Coming Soon
                                    {/* เล่นวิดีโอระหว่างประเมิน (TGDS Phase) */}
                                </button>
                            </div>
                        </div>
                    

                    <div className="space-y-8 mt-10">
                    <h4 className="text-xl font-black text-orange-900 flex items-center gap-2">
                        <Activity size={22} className="text-orange-500" />
                        รายละเอียดคำตอบรายข้อ (TGDS-15)
                    </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6">
                {tgds.answers.map((item) => {
                    const question = TGDS_QUESTIONS.find(
                        (q) => q.id === item.question_no
                    )

                    if (!question) return null

                    const isYes = item.answer === 1

                    //  คำนวณคะแนนตาม scoreTarget
                    const isScored =
                        (isYes && question.scoreTarget === true) ||
                        (!isYes && question.scoreTarget === false)

                    return (
                        <div
                        key={item.question_no}
                        className="bg-white rounded-[30px] border-2 border-orange-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all overflow-hidden flex flex-col"
                        >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 bg-orange-50/40 border-b border-orange-100">
                            <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-sm">
                                {item.question_no}
                            </div>
                            <span className="text-sm font-black text-orange-900">
                                Q{item.question_no}
                            </span>
                            </div>

                            {/* 🔥 แสดงผลตาม calculate */}
                            <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                isScored
                                ? 'bg-red-50 text-red-600 border-red-200'
                                : 'bg-green-50 text-green-600 border-green-200'
                            }`}
                            >
                            {isScored ? '+1' : '0'}
                            </span>
                        </div>

                        {/* Question Text */}
                        <div className="px-5 py-4 text-sm font-semibold text-gray-700 border-b border-gray-100">
                            {question.text}
                        </div>

                        {/* Video */}
                        <div className="aspect-video bg-black">
                            {item.video_url ? (
                            <SecureVideo
                                path={item.video_url}
                                className="w-full h-full object-contain"
                            />
                            ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">
                                ไม่มีวิดีโอ
                            </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 mt-auto">
                            <button
                            disabled
                            className="w-full bg-gray-200 text-gray-500 py-2 rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                            >
                            <BarChart3 size={16} />
                            วิเคราะห์ AI (เร็ว ๆ นี้)
                            </button>
                        </div>
                        </div>
                    )
                    })}
                    </div>
                    </div>


                     </div>
                    )}

                </div>

                </div>

                {/* Footer Section */}
                <div className="p-10 border-t border-gray-100 bg-gray-50/50 rounded-b-[45px] flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-gray-400 flex items-center gap-2">
                         <span className="text-sm font-bold italic tracking-wide">
                            
                         </span>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                         <button 
                            className="flex-1 md:flex-none bg-white border-2 border-gray-200 text-gray-600 px-8 py-4 rounded-3xl font-black text-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
                        >
                            <FileText size={22} /> บันทึก PDF
                        </button>
                      <button
                        onClick={() => router.back()}
                        className="bg-primary text-white px-12 py-4 rounded-3xl font-black"
                        >
                        ปิดหน้ารายงาน
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>
  )
}