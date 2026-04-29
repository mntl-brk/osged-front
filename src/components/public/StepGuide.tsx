import React from 'react';
import { ClipboardCheck, Mic, LineChart } from 'lucide-react';

export const StepGuide: React.FC = () => {
  const steps = [
    {
      icon: <ClipboardCheck size={32} />,
      title: "1. ยืนยันรหัส",
      description: "ใส่รหัสผู้รับการทดสอบที่ได้รับจากเจ้าหน้าที่"
    },
    {
      icon: <Mic size={32} />,
      title: "2. ทำแบบทดสอบ",
      description: "ทำแบบประเมินด้วยการพูดคุยและวาดรูปตามคำสั่ง"
    },
    {
      icon: <LineChart size={32} />,
      title: "3. ดูผลการประเมิน",
      description: "รับสรุปผลเบื้องต้นและคำแนะนำด้านสุขภาพ"
    }
  ];

  return (
    <section className="bg-blue-50/50 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            ขั้นตอนการคัดกรอง
          </h2>
          <p className="text-gray-500 text-lg">
            ทำตามขั้นตอนง่ายๆ เพื่อเริ่มต้นการประเมิน
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 justify-between relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-blue-200 -z-10" />

          {steps.map((s, i) => (
            <div key={i} className="flex-1 bg-white p-8 rounded-[32px] shadow-xl border border-blue-100/50 text-center relative">
              <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
                {s.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-500">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
