'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Gender } from '@/types'
import { PatientDetail } from '@/types/Participant'
import { AlertCircle, ArrowLeft, BarChart3, Brain, Calendar, CheckCircle, Clock, FileText, Mic, Smile, TrendingUp, User, Video, Activity, X, ChevronDown, CheckCircle2, Film, FileJson } from 'lucide-react'
import { SecureImage } from '../SecureImage'
import { SecureMedia } from "../SecureMedia";
import { SecureJson } from '../SecureJson'
import { ScoreSelector } from '../ScoreSelector'
import { mapEducationTH, mapGenderTH, mapLocationTH } from '@/utils/demographicMapper'
import { TgdsDetail } from '@/types/tgds'
import { useTgds } from './useTgds'
import { TGDS_QUESTIONS } from '@/data/tgdsQuestions'
import { NewtonLoaderOverlay } from '../loading'
import TGDSAnalyze from './TgdsAnalyze'
import ConsentSection from './ConsentSection'

interface Props {
  patient: PatientDetail
}

export default function PatientDetailClient({ patient }: Props) {
    const router = useRouter()
    const [showLoader, setShowLoader] = useState(true)
    const [formattedDate, setFormattedDate] = useState('')
    const { data: tgds, isLoading, error } = useTgds(patient.id)
    const [openSection, setOpenSection] = useState<'video' | 'json' | null>(null)
    const [clockScore, setClockScore] = useState<0 | 2 | null>(
        patient.miniCog.clockScore as 0 | 2 | null
    )
    const tgdsAnswers = tgds?.answers ?? []
    const hasCompleteTGDS = tgdsAnswers.length === 15   
    
    const [openSections, setOpenSections] = useState({
    miniCog: true,
    tgds: true,
    consent: true,
    })

    useEffect(() => {
    let timer: NodeJS.Timeout

    if (!isLoading) {
        timer = setTimeout(() => {
        setShowLoader(false)
        }, 600) 
    } else {
        setShowLoader(true)
    }

    return () => clearTimeout(timer)
    }, [isLoading])

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

    const handleClockScore = async (score: 0 | 2) => {
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
        setClockScore(patient.miniCog.clockScore as 0 | 2 | null)
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
        {/* SECTION : Consent */}
           <ConsentSection
                patient={patient}
                open={openSections.consent}
                onToggle={() => toggleSection("consent")}
                />        
                
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
                                            <SecureMedia
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
                
                    <TGDSAnalyze
                    tgds={tgds}
                    patient={patient}
                    hasCompleteTGDS={hasCompleteTGDS}
                    open={openSections.tgds}
                    onToggle={() => toggleSection('tgds')}
                    />     
                                  
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