
import React, { useState } from 'react';
import { Stethoscope, Lock, User, ArrowLeft, Eye, EyeOff, ShieldCheck, Activity } from 'lucide-react';

interface DoctorLoginPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export const DoctorLoginPage: React.FC<DoctorLoginPageProps> = ({ onLoginSuccess, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      if (!res.ok) {
        throw new Error('Invalid credentials')
      }

      onLoginSuccess()
    } catch (err) {
      setError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans animate-fade-in">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-5">
        <Stethoscope size={600} className="absolute text-gray-500 -bottom-20 -right-20 transform rotate-12" />
        <Activity size={400} className="absolute text-gray-500 top-20 -left-20 transform -rotate-12" />
      </div>

      <main className="flex-grow flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          
          {/* Back Button */}
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-8 font-bold group"
          >
            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 group-hover:border-primary/30">
                <ArrowLeft size={20} />
            </div>
            <span>กลับหน้าหลัก</span>
          </button>

          {/* Login Card */}
          <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
            <div className="p-10 text-center bg-slate-50 border-b border-slate-100">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary text-white rounded-3xl shadow-xl shadow-primary/30 mb-6">
                    <Stethoscope size={44} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Doctor Portal</h1>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">เข้าสู่ระบบสำหรับบุคลากร</p>
            </div>

            <form onSubmit={handleLogin} className="p-10 space-y-6">
              
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-2 animate-shake">
                    <ShieldCheck size={18} />
                    {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="ชื่อผู้ใช้งาน"
                        className="placeholder-gray-400 text-gray-500 w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white transition-all outline-none font-medium"
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="รหัสผ่าน"
                        className="placeholder-gray-400 text-gray-500 w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white transition-all outline-none font-medium"
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className={`
                    w-full py-5 rounded-2xl text-xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3
                    ${isLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-primary hover:bg-primaryHover shadow-primary/20'}
                `}
              >
                {isLoading ? (
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <>
                        <span>เข้าสู่ระบบ</span>
                        <ShieldCheck size={24} />
                    </>
                )}
              </button>

              <div className="pt-4 text-center">
                 <p className="text-slate-400 text-xs font-medium">
                    หากลืมรหัสผ่าน กรุณาติดต่อฝ่ายไอทีประจำโครงการ
                 </p>
              </div>
            </form>
          </div>
          
          <p className="mt-8 text-center text-slate-400 text-sm font-medium">
            &copy; 2026 OSGED Clinical Platform. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
};
