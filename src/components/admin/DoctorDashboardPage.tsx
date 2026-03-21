
import React, { useEffect, useState } from 'react';
import { 
  Search, 
  User, 
  Calendar, 
  Activity, 
  Brain, 
  FileText, 
  X, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  LogOut,
  Mic,
  Smile,
  Frown,
  BarChart3,
  Video,
  UserPlus,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  // Added AlertCircle to fix missing import error
  AlertCircle,
  Trash2
} from 'lucide-react';
import { PatientRecord, Gender } from '@/types';
import Link from 'next/link';
import { NewtonLoaderOverlay } from '../loading';

interface DoctorDashboardPageProps {
  onLogout: () => void;
  onGoToVolunteerManagement: () => void;
}

export const DoctorDashboardPage: React.FC<DoctorDashboardPageProps> = ({ 
  onLogout, 
  onGoToVolunteerManagement 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [clockScore, setClockScore] = useState<number>(0);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const total = patients.length;
  const highRisk = patients.filter(p => p.status === 'high-risk').length;
  const normal = total - highRisk;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchDashboard = async (
    searchValue = searchTerm,
    pageValue = page,
    limitValue = limit
    ) => {
    try {
        setLoading(true);

        const res = await fetch(
        `/api/dashboard?search=${encodeURIComponent(searchValue)}&page=${pageValue}&limit=${limitValue}`,
        { cache: 'no-store' }
        );

        const data = await res.json();

        setTotalCount(data.total);

        const mapped = data.patients.map((p: any) => ({
        id: p.session_id,
        volunteer_code: p.volunteer_code,
        completed_at: p.completed_at,
        demographics: {
            age: p.age,
            sex: p.sex,
            currentLocationDescription: '',
            locationType: 'home',
            educationLevel: 'below_p4',
        },
        miniCog: {
            recallScore: p.minicog_recall_score ?? 0,
            clockScore: p.minicog_clock_score,
            score: p.minicog_score ?? 0,
            wordRegistration: [],
            recalledWords: [],
            clockImage: null,
        },
        tgds: { score: p.tgds_score ?? 0 },
        status: p.status,
        }));
        setPatients(mapped);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
    };

    useEffect(() => {
        fetchDashboard();
    }, [page, limit]);

    const totalPages = Math.ceil(totalCount / limit);

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

    const [showLoader, setShowLoader] = useState(true)

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

    const handleConfirmDelete = async () => {

    if (!deleteTarget) return

    setIsDeleting(true)

    try {
        const res = await fetch(`/api/dashboard/session/${deleteTarget}`, {
            method: 'DELETE'
        })

        if (!res.ok) throw new Error('Delete failed')

        setPatients(prev => prev.filter(p => p.id !== deleteTarget))
        setDeleteTarget(null)

    } catch (err) {
        console.error(err)
        alert('ลบไม่สำเร็จ')
    } finally {
        setIsDeleting(false)
    }
    }

    


    {loading && (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-6">

            <div className="relative">
                <NewtonLoaderOverlay/>
            </div>

        </div>
        </div>
    )}

    {error && (
    <div className="p-8 text-center text-red-500 font-bold">
        {error}
    </div>
    )}

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans animate-fade-in">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
           <div className="bg-primary text-white p-2 rounded-lg">
             <Activity size={24} />
           </div>
           <div>
             <h1 className="text-xl font-bold text-gray-800 tracking-tight">OSGED Doctor Portal</h1>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Medical Analysis System</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
            <button 
                onClick={onGoToVolunteerManagement}
                className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-5 py-2.5 rounded-2xl transition-all font-bold border border-blue-100 shadow-sm active:scale-95"
            >
                <UserPlus size={18} />
                <span>จัดการรหัสอาสาสมัคร</span>
            </button>
            <div className="w-px h-8 bg-gray-200 mx-2 hidden md:block"></div>
            <button 
                onClick={onLogout}
                className="flex items-center gap-2 text-gray-500 hover:text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors font-medium"
            >
                <LogOut size={20} />
                <span className="hidden md:inline">ออกจากระบบ</span>
            </button>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8 max-w-375 mx-auto w-full">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">รวมผู้เข้ารับการประเมิน</p>
                    <p className="text-4xl font-black text-gray-900">{total}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                    <User size={32} />
                </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">ความเสี่ยงสูง</p>
                    <p className="text-4xl font-black text-red-600">{highRisk}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-2xl text-red-600">
                    <AlertTriangle size={32} />
                </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">สภาวะปกติ</p>
                    <p className="text-4xl font-black text-green-600">{normal}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-2xl text-green-600">
                    <CheckCircle size={32} />
                </div>
            </div>
        </div>

        {/* List Section */}
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">รายชื่อผู้ประเมิน</h2>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="ค้นหา V-ID เช่น ก001"
                        value={searchTerm}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearchTerm(value);
                            fetchDashboard(value);
                        }}
                        className="placeholder-gray-400 text-gray-600 w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg font-medium"
                    />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-[0.15em]">
                            <th className="p-6">Patient ID</th>
                            <th className="p-6">วันที่บันทึก</th>
                            <th className="p-6">ข้อมูลพื้นฐาน</th>
                            <th className="p-6 text-center">Recall (Cog)</th>
                            <th className="p-6 text-center">Clock (Cog)</th>
                            <th className="p-6 text-center">Mood (TGDS)</th>
                            <th className="p-6 text-center">Status</th>
                            <th className="p-6 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {patients.map((patient) => (
                            
                            <tr key={patient.id} className="hover:bg-blue-50/20 transition-colors group">
                                <td className="p-6 font-black text-gray-900 text-lg">{patient.volunteer_code}</td>
                                <td className="p-6 text-gray-500 text-sm font-medium">{formatDate(patient.completed_at)}</td>
                                <td className="p-6 text-gray-700 font-bold">
                                    <div className="flex flex-col">
                                        <span>{patient.demographics.age} ปี</span>
                                        <span className="text-xs text-gray-400">{mapGender(patient.demographics.sex)}</span>
                                    </div>
                                </td>
                                <td className="p-2 text-center">
                                <div
                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl font-black ${
                                    patient.miniCog.recallScore < 2
                                        ? 'bg-red-50 text-red-600'
                                        : 'bg-green-50 text-green-600'
                                    }`}
                                >
                                    <Brain size={16} />
                                    {patient.miniCog.recallScore}/3
                                </div>
                                </td>

                                {/* Clock Score */}
                                <td className="p-4 text-center">
                                {patient.miniCog.clockScore === null ? (
                                    <span className="px-3 py-1 rounded-xl bg-yellow-50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                    ยังไม่ได้ประเมิน
                                    </span>
                                ) : (
                                    <div
                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl font-black ${
                                        patient.miniCog.clockScore === 0
                                        ? 'bg-red-50 text-red-600'
                                        : 'bg-green-50 text-green-600'
                                    }`}
                                    >
                                    <Clock size={16} />
                                    {patient.miniCog.clockScore}/2
                                    </div>
                                )}
                                </td>
                                <td className="p-4 text-center">
                                     <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl font-black ${patient.tgds.score >= 6 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                        <Activity size={16} />
                                        {patient.tgds.score}/15
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${patient.status === 'high-risk' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                                        {patient.status}
                                    </span>
                                </td>
                             <td className="p-6 text-center">
                                <div className="flex justify-end gap-3">

                                    {/* ดูรายละเอียด */}
                                    <Link
                                    href={`/dashboard/patient/${patient.id}`}
                                    className="bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white p-3 rounded-2xl font-bold text-sm transition-all shadow-sm flex items-center gap-2"
                                    >
                                    <FileText size={20} />
                                    <span className="hidden md:inline">เปิดดู</span>
                                    </Link>

                                    {/* ปุ่มลบ */}
                                  <button
                                    onClick={() => setDeleteTarget(patient.id)}
                                    className="bg-white border-2 border-red-500 text-red-600 hover:bg-red-600 hover:text-white p-3 rounded-2xl font-bold text-sm transition-all shadow-sm flex items-center gap-2"
                                    >
                                    <Trash2 size={20} />
                                    <span className="hidden md:inline">ลบ</span>
                                  </button>

                                </div>
                                </td>
                                    
                            </tr>
                            
                        ))}
                    </tbody>
                </table>
                <div className="flex items-center justify-between px-8 py-6 border-t bg-gray-50">

            {/* Rows per page */}
            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 font-bold">
                แสดง
                </span>

                <select
                value={limit}
                onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1); // reset หน้า
                }}
                className="border rounded-lg px-3 py-1 font-bold text-primary"
                >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                 <option value={40}>40</option>
                  <option value={50}>50</option>
                   <option value={60}>60</option>
                </select>

                <span className="text-sm text-gray-500 font-bold">
                รายการต่อหน้า
                </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-4">

                <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-lg border font-bold disabled:opacity-40 text-primary"
                >
                ก่อนหน้า
                </button>

                <span className="font-bold text-gray-700">
                หน้า {page} / {totalPages}
                </span>

                <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg border text-primary font-bold disabled:opacity-40"
                >
                ถัดไป
                </button>
            </div>
            </div>
            </div>
        </div>
      </main>

        {deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">

                {/* Background overlay */}
                <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => !isDeleting && setDeleteTarget(null)}
                />

                {/* Modal box */}
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md animate-fade-in">

                <h2 className="text-2xl font-black text-gray-900 mb-4">
                    ยืนยันการลบข้อมูล
                </h2>

                <p className="text-gray-600 mb-6">
                    คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?
                    การลบจะไม่สามารถย้อนกลับได้
                </p>

                <div className="flex justify-end gap-4">

                    <button
                    disabled={isDeleting}
                    onClick={() => setDeleteTarget(null)}
                    className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition"
                    >
                    ยกเลิก
                    </button>

                    <button
                    disabled={isDeleting}
                    onClick={handleConfirmDelete}
                    className="px-6 py-3 rounded-xl bg-red-600 text-white font-black hover:bg-red-700 transition flex items-center gap-2"
                    >
                    {isDeleting && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    ลบข้อมูล
                    </button>

                </div>
                </div>
            </div>
            )}
    </div>

    
  );
};
