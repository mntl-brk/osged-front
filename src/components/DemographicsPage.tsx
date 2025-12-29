import React, { useState } from 'react';
import { 
  MapPin, 
  Home, 
  Building2, 
  Hospital, 
  ArrowRight,
  CheckCircle2,
  Calendar,
  Users
} from 'lucide-react';
import { Gender, Location, DemographicsData } from '../types';

interface DemographicsPageProps {
  onSubmit: (data: DemographicsData) => void;
}

export const DemographicsPage: React.FC<DemographicsPageProps> = ({ onSubmit }) => {
  const [locationDescription, setLocationDescription] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [locationType, setLocationType] = useState<Location | null>(null);

  const handleSubmit = () => {
    if (!locationDescription.trim() || !age || !gender || !locationType) {
      alert('กรุณากรอกข้อมูลให้ครบทุกข้อ');
      return;
    }

    onSubmit({ 
      currentLocationDescription: locationDescription,
      age, 
      gender, 
      locationType 
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-8 animate-fade-in pb-32">
      
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">
        ข้อมูลพื้นฐานของคุณ
      </h1>

      <div className="space-y-12">
        
        {/* 1. Location Question */}
        <div className="space-y-4">
          <label className="block text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="text-primary"/> 1. ตอนนี้คุณกำลังทำแบบทดสอบอยู่ที่ไหน?
          </label>
          <textarea
            value={locationDescription}
            onChange={(e) => setLocationDescription(e.target.value)}
            placeholder="ตัวอย่าง: ที่บ้านในกรุงเทพฯ หรือที่ศูนย์ดูแลผู้สูงอายุ..."
            className="
              w-full p-6 text-xl rounded-2xl border-4 border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none min-h-[120px]
            "
          />
        </div>

        {/* 2. Age Input */}
        <div className="space-y-4">
          <label className="block text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-primary"/> 2. อายุของคุณ (ปี)
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="เช่น 70"
            className="
              w-full max-w-[200px] p-5 text-2xl font-bold rounded-2xl border-4 border-gray-100 bg-gray-50 focus:bg-white focus:border-primary transition-all outline-none
            "
          />
        </div>

        {/* 3. Gender Selection */}
        <div className="space-y-4">
          <label className="block text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-primary"/> 3. เพศ
          </label>
          <div className="flex flex-wrap gap-4">
            {[
              { id: 'male', label: 'ชาย', icon: '♂' },
              { id: 'female', label: 'หญิง', icon: '♀' },
              { id: 'other', label: 'อื่น ๆ', icon: '⚪' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setGender(option.id as Gender)}
                className={`
                  flex-1 min-w-[140px] h-20 rounded-2xl text-2xl font-bold border-4 transition-all flex items-center justify-center gap-2
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

        {/* 4. Location Type */}
        <div className="space-y-4">
          <label className="block text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Home className="text-primary"/> 4. ประเภทสถานที่ปัจจุบัน
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
              <Home size={48} />
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
          className="
            w-full max-w-md
            bg-primary hover:bg-primaryHover text-white 
            py-6 px-8 rounded-2xl 
            text-2xl font-bold 
            shadow-lg hover:shadow-xl hover:-translate-y-1
            transform transition-all duration-200
            flex items-center justify-center gap-3
          "
        >
          <span>ไปหน้าถัดไป</span>
          <ArrowRight size={32} strokeWidth={3} />
        </button>
      </div>

    </div>
  );
};