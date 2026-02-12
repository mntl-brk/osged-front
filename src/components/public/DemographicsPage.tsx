import React, { useState } from 'react';
import { 
  MapPin, 
  Home, 
  Building2, 
  Hospital, 
  ArrowRight,
  Calendar,
  Users,
  GraduationCap
} from 'lucide-react';
import { Gender, Location, DemographicsData, EducationLevel } from '@/types';
import { useVoiceGuide } from '@/hooks/useVoiceGuide';
import { useAssessmentStore } from '@/store/assessmentStore';
import { createDemographics } from '@/api/demographics/createDemographics';
import { sleep } from '@/hooks/useSleepPage';


interface DemographicsPageProps {
  onSubmit: (data: DemographicsData) => void;
}

export const DemographicsPage: React.FC<DemographicsPageProps> = ({ onSubmit }) => {
  const [locationDescription, setLocationDescription] = useState('');
  const [age, setAge] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [gender, setGender] = useState<Gender | null>(null);
  const [locationType, setLocationType] = useState<Location | null>(null);
  const [educationLevel, setEducationLevel] = useState<EducationLevel | null>(null);
  const demographicsGuideText =
  `
    ต่อไปเป็นหน้าข้อมูลพื้นฐานนะครับ
    หน้านี้มีคำถามทั้งหมด 5 ข้อ
    กรุณาค่อย ๆ ตอบทีละข้อนะครับ

    เริ่มจาก พิมพ์ว่าขณะนี้ท่านอยู่ที่ไหน
    จากนั้น กรอกอายุ
    เลือกระดับการศึกษา
    เลือกเพศ
    และเลือกประเภทสถานที่ที่ท่านอยู่ในปัจจุบัน

    เมื่อกรอกข้อมูลครบแล้ว
    กรุณากดปุ่ม “ไปหน้าถัดไป” ด้านล่างได้เลยครับ
  `
  const { isSpeaking, replay } = useVoiceGuide(demographicsGuideText)
  
  const isFormComplete =
    locationDescription.trim() !== '' &&
    age !== '' &&
    gender !== null &&
    locationType !== null &&
    educationLevel !== null;

  const sessionId = useAssessmentStore((s) => s.sessionId)

  const handleSubmit = async () => {
     setIsLoading(true);

    if (!locationDescription.trim() || !age || !gender || !locationType || !educationLevel) {
      alert('กรุณากรอกข้อมูลให้ครบทุกข้อ')
      return
    }

    if (!sessionId) {
      alert('Session not found')
      return
    }

    try {
      await sleep(500);
      
      const result = await createDemographics({
        sessionId: sessionId,
        age_years: Number(age),
        sex: gender!,
        current_location: locationDescription,
        location_type: locationType!,
        education_level: educationLevel!,
      })

      result.match(
        () => {
          onSubmit({
            currentLocationDescription: locationDescription,
            age,
            sex: gender,
            locationType,
            educationLevel,
          })
        },
        (err) => {
          console.log(err)
          alert('ไม่สามารถบันทึกข้อมูลพื้นฐานได้ กรุณาลองใหม่อีกครั้ง')
        }
      )
    } catch (e) {
      alert('เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่')
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-8 animate-fade-in pb-32">
      
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">
        ข้อมูลพื้นฐานของคุณ
      </h1>

      <div className="space-y-12">

        {/* 1. Location Question */}
        <div className="space-y-4">
          <label className=" md:text-2xl text-xl  font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="text-primary md:block hidden"/> 1. ตอนนี้คุณกำลังทำแบบทดสอบอยู่ที่ไหน?
          </label>
          <textarea
            value={locationDescription}
            onChange={(e) => setLocationDescription(e.target.value)}
            placeholder="ตัวอย่าง: ที่บ้านในกรุงเทพฯ หรือที่ศูนย์ดูแลผู้สูงอายุ..."
            className="
              w-full p-6 md:text-2xl text-xl  text-black placeholder-zinc-500 rounded-2xl border-4 border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all outline-none min-h-[120px]
            "
          />
        </div>

        {/* 2. Age Input */}
        <div className="space-y-4">
          <label className=" md:text-2xl text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-primary md:block hidden"/> 2. อายุของคุณ (ปี)
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="เช่น 70"
            className="
              w-full p-5 md:text-2xl text-xl placeholder-zinc-500 text-black rounded-2xl border-4 border-gray-100 bg-gray-50 focus:bg-white focus:border-primary transition-all outline-none
            "
          />
        </div>
        
        {/* 4. Education Level (NEW) */}
        <div className="space-y-4">
          <label className=" md:text-2xl text-xl font-bold text-gray-800 flex items-center gap-2">
            <GraduationCap className="text-primary md:block hidden"/> 3. ระดับการศึกษา (โดยประมาณ)
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setEducationLevel('below_p4')}
              className={`
                p-6 rounded-3xl border-4 transition-all flex items-center justify-center h-24 md:text-2xl text-xl font-bold
                ${educationLevel === 'below_p4'
                  ? 'bg-primary text-white border-primary shadow-lg'
                  : 'bg-white text-gray-500 border-gray-100 hover:border-primary/50'}
              `}
            >
              ต่ำกว่าประถมศึกษาปีที่ 4
            </button>

            <button
              onClick={() => setEducationLevel('p4_or_above')}
              className={`
                p-6 rounded-3xl border-4 transition-all flex items-center justify-center h-24 md:text-2xl text-xl font-bold
                ${educationLevel === 'p4_or_above'
                  ? 'bg-primary text-white border-primary shadow-lg'
                  : 'bg-white text-gray-500 border-gray-100 hover:border-primary/50'}
              `}
            >
              ตั้งแต่ประถมศึกษาปีที่ 4 ขึ้นไป
            </button>
          </div>
        </div>

        {/* 3. Gender Selection */}
        <div className="space-y-4">
          <label className="md:text-2xl text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-primary md:block hidden"/> 4. เพศ
          </label>
          <div className="flex flex-wrap gap-4">
            {[
              { id: 'male', label: 'ชาย' },
              { id: 'female', label: 'หญิง' },
              { id: 'other', label: 'อื่น ๆ' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setGender(option.id as Gender)}
                className={`
                  flex-1 h-20 rounded-2xl md:text-2xl text-xl font-bold border-4 transition-all flex items-center justify-center gap-2
                  ${gender === option.id 
                    ? 'bg-primary text-white border-primary shadow-lg scale-105' 
                    : 'bg-white text-gray-500 border-gray-100 hover:border-primary/50'}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Location Type */}
        <div className="space-y-4">
          <label className="md:text-2xl text-xl font-bold text-gray-800 flex items-center gap-2">
            <Home className="text-primary md:block hidden"/> 5. ประเภทสถานที่ปัจจุบัน
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setLocationType('home')}
              className={`
                p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 h-44 justify-center
                ${locationType === 'home'
                  ? 'bg-blue-50 border-primary text-primary shadow-md'
                  : 'bg-white border-gray-100 text-gray-400 hover:text-primary'}
              `}
            >
              <Home size={42} />
              <span className="text-xl font-bold">ที่บ้าน</span>
            </button>

            <button
              onClick={() => setLocationType('nursing_home')}
              className={`
                p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 h-44 justify-center
                ${locationType === 'nursing_home'
                  ? 'bg-blue-50 border-primary text-primary shadow-md'
                  : 'bg-white border-gray-100 text-gray-400 hover:text-primary'}
              `}
            >
              <Building2 size={48} />
              <span className="text-xl font-bold">ศูนย์ดูแล</span>
            </button>

            <button
              onClick={() => setLocationType('hospital')}
              className={`
                p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 h-44 justify-center
                ${locationType === 'hospital'
                  ? 'bg-blue-50 border-primary text-primary shadow-md'
                  : 'bg-white border-gray-100 text-gray-400 hover:text-primary'}
              `}
            >
              <Hospital size={48} />
              <span className="text-xl font-bold">โรงพยาบาล</span>
            </button>
          </div>
        </div>

       

      </div>

      <div className="mt-16 flex justify-center">
            <button 
              onClick={handleSubmit}
              disabled={!isFormComplete}
              className={`
                w-full max-w-md
                py-6 px-8 rounded-2xl 
                text-2xl font-bold 
                flex items-center justify-center gap-3
                transition-all duration-200
                ${isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:-translate-y-2'}
                ${isFormComplete
                  ? 'bg-primary hover:bg-primaryHover text-white shadow-lg hover:shadow-xl hover:-translate-y-1'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
              `}
              
            >
              {isLoading ? (
          <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
            <>
              <span>ไปหน้าถัดไป</span>
              <ArrowRight size={32} strokeWidth={3} />
            </>
        )}
        </button>

      </div>
    </div>
  );
};