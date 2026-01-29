'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Gender, PatientRecord } from '@/types'
import { AlertCircle, ArrowLeft, BarChart3, Brain, Calendar, CheckCircle, Clock, FileText, Mic, Smile, TrendingUp, User, Video, Activity, X, ChevronDown } from 'lucide-react'

interface Props {
  patient: PatientRecord
}

export default function PatientDetailClient({ patient }: Props) {
  const router = useRouter()
  const [clockScore, setClockScore] = useState(0)

    const formatDate = (isoString: string) => {
      return new Date(isoString).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    };
  
    const mapGender = (g: Gender | null) => {
      if (g === 'male') return 'ชาย';
      if (g === 'female') return 'หญิง';
      return 'อื่นๆ';
    };

    const [openSections, setOpenSections] = useState({
    miniCog: true,
    tgds: true,
    })

    const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({
        ...prev,
        [key]: !prev[key],
    }))
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
                <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 sticky z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center shadow-lg shadow-primary/20">
                             <User size={40} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">V-ID: {patient.volunteersId}</h2>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${patient.status === 'high-risk' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                                    {patient.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-500 font-bold">
                                <span className="flex items-center gap-1.5"><Calendar size={18}/> {formatDate(patient.timestamp)}</span>
                                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                <span>{patient.demographics.age} ปี / {mapGender(patient.demographics.gender)}</span>
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

                        {/* Word Recall Detail */}
                        <div className="bg-white rounded-[35px] border-2 border-gray-100 p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-xl font-black text-gray-800 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-blue-500"/> รายละเอียดคำศัพท์ (3-Word Recall)
                                </h4>
                                <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl font-black">
                                    Score: {patient.miniCog.recallScore}/3
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {patient.miniCog.wordRegistration.map((word, i) => {
                                    const isRecalled = patient.miniCog.recalledWords.includes(word);
                                    return (
                                        <div 
                                            key={i} 
                                            className={`
                                                relative p-6 rounded-[30px] border-4 flex flex-col items-center justify-center gap-2 transition-all
                                                ${isRecalled 
                                                    ? 'bg-green-50 border-green-400 text-green-700 shadow-sm' 
                                                    : 'bg-red-50 border-red-200 text-red-500 opacity-80'}
                                            `}
                                        >
                                            <span className="absolute -top-3 left-6 px-3 py-0.5 bg-white border-2 border-inherit rounded-full text-[10px] font-black uppercase">Word {i+1}</span>
                                            {isRecalled ? <CheckCircle size={32} /> : <X size={32} />}
                                            <span className="text-3xl font-black">{word}</span>
                                            <span className="text-xs font-bold uppercase tracking-widest opacity-60">
                                                {isRecalled ? 'RECALLED' : 'NOT FOUND'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all border border-blue-200">
                                    <Mic size={20} /> ฟังเสียงผู้บันทึก (Recall Phase)
                                </button>
                                <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all border border-blue-200">
                                    <Smile size={20} /> วิเคราะห์ใบหน้า (Recall Phase)
                                </button>
                            </div>
                        </div>

                        {/* Clock Drawing Detail */}
                        <div className="bg-white rounded-[35px] border-2 border-gray-100 p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-xl font-black text-gray-800 flex items-center gap-2">
                                    <Clock size={20} className="text-blue-500"/> รูปวาดนาฬิกา (Clock Drawing Test)
                                </h4>
                                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-200">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">ประเมินคะแนน:</span>
                                    <select 
                                        value={clockScore}
                                        onChange={(e) => setClockScore(Number(e.target.value))}
                                        className="bg-transparent font-black text-gray-900 focus:outline-none cursor-pointer text-lg"
                                    >
                                        <option value={0}>0 - ผิด (Abnormal)</option>
                                        <option value={2}>2 - ถูก (Normal)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="w-full max-w-xl mx-auto aspect-square bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100 flex items-center justify-center overflow-hidden shadow-inner p-6">
                                {patient.miniCog.clockImage ? (
                                    <img src={patient.miniCog.clockImage} alt="Clock" className="w-full h-full object-contain" />
                                ) : (
                                    <div className="text-center text-gray-200">
                                        <Clock size={120} strokeWidth={1} className="mx-auto mb-4 opacity-20" />
                                        <p className="text-xl font-black">ไม่พบข้อมูลรูปวาด</p>
                                    </div>
                                )}
                            </div>
                            <p className="text-center text-gray-400 text-xs font-bold mt-4 italic uppercase tracking-widest">
                                * แพทย์พิจารณาความสมบูรณ์ของตัวเลขและเข็มนาฬิกา (11:10)
                            </p>
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
                                        <span className="text-lg font-black text-orange-600">62% Anxious</span>
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
                                        <span className="text-lg font-black text-blue-600">80% Flat Affect</span>
                                    </div>
                                </div>

                                <button className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-3 transition-all hover:bg-black shadow-xl active:scale-95">
                                    <Video size={24} /> เล่นวิดีโอระหว่างประเมิน (TGDS Phase)
                                </button>
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