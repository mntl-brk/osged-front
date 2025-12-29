import React from 'react';
import { Clock, Volume2, Users, PauseCircle, Play } from 'lucide-react';

interface InstructionPageProps {
  onStart: () => void;
}

export const InstructionPage: React.FC<InstructionPageProps> = ({ onStart }) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-8 animate-fade-in flex flex-col items-center pb-32">
      
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">
        ก่อนเริ่มทำแบบคัดกรอง
      </h1>

      {/* Instruction Card */}
      <div className="w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 mb-10">
        <ul className="space-y-8">
            <li className="flex items-start gap-6">
                <div className="bg-blue-100 p-3 rounded-full text-primary shrink-0 mt-1">
                    <Clock size={32} strokeWidth={2.5} />
                </div>
                <div>
                    <span className="text-xl md:text-2xl font-medium text-gray-700 leading-relaxed block">
                        ใช้เวลาประเมินประมาณ <span className="text-primary font-bold">5–10 นาที</span>
                    </span>
                </div>
            </li>

            <li className="flex items-start gap-6">
                <div className="bg-green-100 p-3 rounded-full text-green-600 shrink-0 mt-1">
                    <Volume2 size={32} strokeWidth={2.5} />
                </div>
                <div>
                    <span className="text-xl md:text-2xl font-medium text-gray-700 leading-relaxed block">
                        ควรอยู่ในที่ <span className="text-gray-900 font-semibold">เงียบ สงบ</span> และมีแสงสว่างเพียงพอ
                    </span>
                </div>
            </li>

            <li className="flex items-start gap-6">
                 <div className="bg-orange-100 p-3 rounded-full text-orange-600 shrink-0 mt-1">
                    <Users size={32} strokeWidth={2.5} />
                </div>
                <div>
                    <span className="text-xl md:text-2xl font-medium text-gray-700 leading-relaxed block">
                        ถ้ามีผู้ดูแล สามารถช่วย <span className="text-gray-900 font-semibold">อ่านคำสั่ง</span> ให้ได้
                    </span>
                </div>
            </li>

             <li className="flex items-start gap-6">
                 <div className="bg-purple-100 p-3 rounded-full text-purple-600 shrink-0 mt-1">
                    <PauseCircle size={32} strokeWidth={2.5} />
                </div>
                <div>
                    <span className="text-xl md:text-2xl font-medium text-gray-700 leading-relaxed block">
                        หากไม่สะดวก สามารถหยุดและทำต่อในภายหลังได้
                    </span>
                </div>
            </li>
        </ul>
      </div>

      {/* CTA Button */}
      <button 
        onClick={onStart}
        className="
          w-full max-w-md
          bg-primary hover:bg-primaryHover text-white 
          py-6 px-8 rounded-2xl 
          text-2xl md:text-3xl font-bold 
          shadow-lg hover:shadow-xl hover:-translate-y-1
          transform transition-all duration-200
          flex items-center justify-center gap-4
          mb-8
        "
      >
        <span>เริ่มทำแบบคัดกรอง</span>
        <Play size={32} fill="currentColor" />
      </button>

      {/* Security Note */}
      <p className="text-gray-500 text-center text-sm md:text-base max-w-xl leading-relaxed bg-gray-50 p-4 rounded-xl">
        <span className="inline-block mr-2">🔒</span>
        ข้อมูลการทำแบบคัดกรองจะถูกเก็บเป็นความลับและเข้ารหัสตามมาตรฐานทางการแพทย์
      </p>

    </div>
  );
};