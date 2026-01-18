import React from 'react';
import { HeartPulse } from 'lucide-react';
import Link from 'next/link';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-6 md:px-12 border-b border-gray-100 bg-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center">
        {/* Logo Area */}
        <Link href="/" className="inline-block">
          <div className="flex items-center gap-3 text-primary select-none cursor-pointer">
            <HeartPulse size={32} strokeWidth={2.5} />
            <span className="text-2xl font-bold tracking-tight">OSGED</span>
          </div>
        </Link>
        
      </div>
    </header>
  );
};