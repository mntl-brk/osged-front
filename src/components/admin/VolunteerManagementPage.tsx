import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  UserPlus, 
  Copy, 
  Check, 
  Trash2, 
  Search, 
  ClipboardList,
  Calendar,
  Key
} from 'lucide-react';
import { listParticipants } from '@/api/participant/listParticipants'
import { createParticipant } from '@/api/participant/createParticipant'
import { Participant } from '@/types/Participant';
import { deleteParticipant } from '@/api/participant/deleteParticipant';

interface VolunteerManagementPageProps {
  onBack: () => void;
}

export const VolunteerManagementPage: React.FC<VolunteerManagementPageProps> = ({ onBack }) => {
  const [codes, setCodes] = useState<Participant[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // =========================
  // LOAD PARTICIPANTS
  // =========================
useEffect(() => {
  const load = async () => {
    const result = await listParticipants()
    result.match(
      (data) => {
        setCodes(
          data.map((p) => ({
            id: p.id,
            code: p.code,
            status: p.status,
            created_at: p.created_at,
            within_two_months: p.within_two_months
          }))
        )
      },
      () => {
        alert('โหลดข้อมูลไม่สำเร็จ')
      }
    )
  }

  load()
}, [])

  // =========================
  // CREATE PARTICIPANT
  // =========================
  const generateCode = async () => {
    const result = await createParticipant()
    result.match(
      (p) => {
        const newCode: Participant = {
          id: p.id,
          code: p.code,
          status: p.status,
          created_at: p.created_at,
          within_two_months: p.within_two_months
        }

        setCodes((prev) => [newCode, ...prev])
      },
      () => {
        alert('สร้างรหัสไม่สำเร็จ')
      }
    )
  }

  // =========================
  // COPY
  // =========================
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // =========================
  // DELETE (UI ONLY ตอนนี้)
  // =========================
  const deleteCode = async (id: string) => {
    if (!confirm('คุณต้องการลบรหัสนี้ใช่หรือไม่?')) return

    const result = await deleteParticipant({ id })

    result.match(
      () => {
        setCodes((prev) => prev.filter((c) => c.id !== id))
      },
      () => {
        alert('ลบรหัสไม่สำเร็จ')
      }
    )
  }


  return (
    <div className="min-h-screen bg-gray-50 font-sans animate-fade-in">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
            <button 
                onClick={onBack}
                className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-all border border-transparent hover:border-gray-200"
            >
                <ArrowLeft size={24} strokeWidth={2.5} />
            </button>
            <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">จัดการรหัสอาสาสมัคร</h1>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Volunteer Access Keys</p>
            </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        
        {/* Generate Card */}
        <div className="bg-white rounded-[50px] p-12 border-2 border-blue-100 shadow-2xl shadow-blue-50 mb-12 text-center relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 p-8 text-blue-50 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Key size={240} />
            </div>
            
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">สร้างรหัสการประเมินชุดใหม่</h2>
            <p className="text-xl text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed font-medium">
                ให้อาสาสมัครใช้รหัสนี้ในการล็อกอินเข้าสู่ระบบ<br/>
                เพื่อเริ่มทำแบบประเมินให้แก่ผู้สูงอายุ (1 รหัสต่อ 1 เคส)
            </p>

            <button 
                onClick={generateCode}
                className="bg-primary hover:bg-primaryHover text-white px-12 py-6 rounded-[35px] text-2xl font-black shadow-2xl shadow-primary/20 hover:-translate-y-1.5 transition-all active:scale-95 flex items-center gap-4 mx-auto"
            >
                <UserPlus size={32} />
                สร้างรหัสเคสใหม่
            </button>
        </div>

        {/* List Section */}
        <div className="bg-white rounded-[45px] shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-gray-400 border border-gray-100">
                    <ClipboardList size={22} />
                </div>
                <h3 className="text-xl font-black text-gray-800 tracking-tight">ประวัติรหัสที่ถูกสร้าง</h3>
            </div>

            <div className="divide-y divide-gray-100">
                {codes.length === 0 ? (
                    <div className="p-24 text-center text-gray-300 font-black text-2xl italic">
                        ยังไม่มีรหัสที่ถูกสร้าง
                    </div>
                ) : (
                    codes.map((item) => (
                        <div key={item.id} className="p-8 flex items-center justify-between hover:bg-blue-50/10 transition-colors group">
                            <div className="flex items-center gap-8">
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center font-black text-xl border-4 transition-all ${item.status === 'unused' ? 'bg-green-50 text-green-600 border-green-100 shadow-sm shadow-green-100' : 'bg-gray-100 text-gray-400 border-gray-200 grayscale opacity-60'}`}>
                                    {item.status === 'unused' ? 'NEW' : 'USED'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-4xl font-black text-gray-900 font-mono tracking-wider">{item.code}</p>
                                        <button 
                                            onClick={() => copyToClipboard(item.code, item.id)}
                                            className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-primary hover:border-primary/20 rounded-2xl transition-all shadow-sm"
                                            title="Copy Code"
                                        >
                                            {copiedId === item.id ? <Check size={24} className="text-green-500" /> : <Copy size={24} />}
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-400 flex items-center gap-2 mt-2 font-bold uppercase tracking-widest">
                                        <Calendar size={16} />
                                        สร้างเมื่อ: {item.created_at ? new Date(item.created_at).toLocaleString('th-TH') : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => deleteCode(item.id)}
                                    className="p-4 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                >
                                    <Trash2 size={28} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

      </main>

    </div>
  );
};
