import React from 'react';
import { Stethoscope } from 'lucide-react';

interface FooterProps {
  onOpenInfo: () => void;
  onOpenFAQ: () => void;
  onOpenPDPA: () => void;
  onOpenDoctorPortal?: () => void; // Optional prop
}

export const Footer: React.FC<FooterProps> = ({ onOpenInfo, onOpenFAQ, onOpenPDPA, onOpenDoctorPortal }) => {
  return (
    <footer className="bg-gray-800 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        <div className="text-center md:text-left">
          <h3 className="text-xl font-bold mb-2">OSGED Project</h3>
          <p className="text-gray-400 text-sm mb-4">
            © 2026 Research Team. All rights reserved.
          </p>
          {onOpenDoctorPortal && (
            <button 
                onClick={onOpenDoctorPortal}
                className="text-xs text-gray-600 hover:text-gray-400 flex items-center gap-1 transition-colors"
            >
                <Stethoscope size={14} /> สำหรับแพทย์ (Doctor Portal)
            </button>
          )}
        </div>

        <nav className="flex flex-col md:flex-row gap-6 text-center">
          <button onClick={onOpenInfo} className="text-gray-300 hover:text-white hover:underline py-2">
            ข้อมูลโครงการ
          </button>
          <button onClick={onOpenFAQ} className="text-gray-300 hover:text-white hover:underline py-2">
            คำถามที่พบบ่อย (FAQ)
          </button>
          <button onClick={onOpenPDPA} className="text-gray-300 hover:text-white hover:underline py-2">
            PDPA
          </button>
          <a href="mailto:contact@osged-research.com" className="text-gray-300 hover:text-white hover:underline py-2">
            ติดต่อทีมวิจัย
          </a>
        </nav>

      </div>
    </footer>
  );
};