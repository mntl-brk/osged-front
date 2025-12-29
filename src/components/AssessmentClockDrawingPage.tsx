import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight, RotateCcw, Move, MousePointer2 } from 'lucide-react';
import { AssessmentProgress } from './AssessmentProgress';

interface AssessmentClockDrawingPageProps {
  onNext: (data: string) => void;
}

interface ClockNumber {
  value: number;
  x: number; 
  y: number; 
  isPlaced: boolean;
}

interface ClockHand {
  type: 'hour' | 'minute';
  angle: number; 
  isPlaced: boolean;
}

export const AssessmentClockDrawingPage: React.FC<AssessmentClockDrawingPageProps> = ({ onNext }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [numbers, setNumbers] = useState<ClockNumber[]>(
    Array.from({ length: 14 }, (_, i) => ({ value: i, x: 50, y: 50, isPlaced: false }))
  );
  
  const [hourHand, setHourHand] = useState<ClockHand>({ type: 'hour', angle: 0, isPlaced: false });
  const [minuteHand, setMinuteHand] = useState<ClockHand>({ type: 'minute', angle: 0, isPlaced: false });
  const [draggingId, setDraggingId] = useState<number | 'hour' | 'minute' | null>(null);
  
  const handlePointerDown = (e: React.PointerEvent, id: number | 'hour' | 'minute') => {
    e.preventDefault();
    setDraggingId(id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    if (typeof draggingId === 'number') {
      setNumbers(prev => prev.map(n => 
        n.value === draggingId ? { ...n, x: clampedX, y: clampedY, isPlaced: true } : n
      ));
    } else {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const radians = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      let degrees = radians * (180 / Math.PI) + 90;
      if (draggingId === 'hour') setHourHand(prev => ({ ...prev, angle: degrees, isPlaced: true }));
      else setMinuteHand(prev => ({ ...prev, angle: degrees, isPlaced: true }));
    }
  };

  const handlePointerUp = () => setDraggingId(null);

  const placeFromPalette = (id: number | 'hour' | 'minute') => {
    if (typeof id === 'number') {
       setNumbers(prev => prev.map(n => n.value === id ? { ...n, x: 50, y: 50, isPlaced: true } : n));
       setDraggingId(id);
    } else {
       if (id === 'hour') setHourHand(prev => ({ ...prev, isPlaced: true, angle: 0 }));
       if (id === 'minute') setMinuteHand(prev => ({ ...prev, isPlaced: true, angle: 0 }));
    }
  };

  const handleReset = () => {
    setNumbers(prev => prev.map(n => ({ ...n, isPlaced: false })));
    setHourHand({ type: 'hour', angle: 0, isPlaced: false });
    setMinuteHand({ type: 'minute', angle: 0, isPlaced: false });
  };

  const generateClockImage = () => {
    const canvas = document.createElement('canvas');
    const size = 600;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    const center = size / 2;
    const radius = size * 0.45;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 12;
    ctx.stroke();

    ctx.font = 'bold 45px Prompt, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000000';
    numbers.forEach(n => {
      if (n.isPlaced) ctx.fillText(n.value.toString(), (n.x / 100) * size, (n.y / 100) * size);
    });

    const drawHand = (hand: ClockHand, length: number, width: number, color: string) => {
      if (!hand.isPlaced) return;
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate((hand.angle - 90) * Math.PI / 180);
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(length - 20, 0); 
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(length, 0);
      ctx.lineTo(length - 25, -15);
      ctx.lineTo(length - 25, 15);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    drawHand(hourHand, radius * 0.55, 15, '#2563EB');
    drawHand(minuteHand, radius * 0.85, 10, '#DC2626');

    ctx.beginPath();
    ctx.arc(center, center, 12, 0, 2 * Math.PI);
    ctx.fillStyle = '#000000';
    ctx.fill();

    return canvas.toDataURL('image/png');
  };

  return (
    <div 
      className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in flex flex-col items-center pb-24 select-none touch-none"
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      <AssessmentProgress currentStep={2} />

      <h1 className="text-3xl md:text-5xl font-bold text-center mb-4 text-gray-900">
        สร้างนาฬิกา
      </h1>
      
      <p className="text-xl md:text-2xl text-gray-600 text-center mb-10">
        ลากตัวเลขและเข็มนาฬิกา เพื่อบอกเวลา <span className="text-primary font-black text-3xl">11 โมง 10 นาที</span>
      </p>

      <div className="flex flex-col lg:flex-row w-full gap-10 items-start justify-center">
        
        <div className="w-full lg:w-3/5 flex justify-center">
          <div 
            ref={containerRef}
            className="relative w-full max-w-[500px] aspect-square bg-white rounded-full border-[10px] border-gray-900 shadow-2xl"
          >
            <div className="absolute top-1/2 left-1/2 w-5 h-5 bg-black rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />

            {numbers.filter(n => n.isPlaced).map(n => (
              <div
                key={n.value}
                onPointerDown={(e) => handlePointerDown(e, n.value)}
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
                className={`
                   absolute -translate-x-1/2 -translate-y-1/2
                   w-14 h-14 flex items-center justify-center
                   text-4xl font-black cursor-move
                   bg-white rounded-full select-none
                   ${draggingId === n.value ? 'scale-125 z-50 text-primary shadow-xl ring-4 ring-primary/20' : 'text-gray-900'}
                `}
              >
                {n.value}
              </div>
            ))}

            {/* Hour Hand */}
            {hourHand.isPlaced && (
               <div
                 className="absolute top-1/2 left-1/2 origin-left h-4 bg-blue-600 z-20 cursor-grab active:cursor-grabbing"
                 style={{ 
                    width: '35%', 
                    transform: `rotate(${hourHand.angle - 90}deg) translateY(-50%)`
                 }}
                 onPointerDown={(e) => handlePointerDown(e, 'hour')}
               >
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 border-l-[20px] border-l-blue-600 border-y-[15px] border-y-transparent" />
               </div>
            )}

            {/* Minute Hand */}
            {minuteHand.isPlaced && (
               <div
                 className="absolute top-1/2 left-1/2 origin-left h-2.5 bg-red-600 z-30 cursor-grab active:cursor-grabbing"
                 style={{ 
                    width: '45%', 
                    transform: `rotate(${minuteHand.angle - 90}deg) translateY(-50%)`
                 }}
                 onPointerDown={(e) => handlePointerDown(e, 'minute')}
               >
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 border-l-[25px] border-l-red-600 border-y-[12px] border-y-transparent" />
               </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-2/5 bg-gray-100 p-8 rounded-[40px] border-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Move size={32}/> อุปกรณ์นาฬิกา
            </h3>
            
            <div className="flex gap-4 mb-8">
                {!hourHand.isPlaced && (
                    <button
                        onPointerDown={() => placeFromPalette('hour')}
                        className="flex-1 h-24 bg-white border-4 border-blue-200 rounded-3xl flex flex-col items-center justify-center hover:border-blue-500 shadow-md active:scale-95 transition-all"
                    >
                        <div className="w-12 h-3 bg-blue-600 rounded-full mb-1"></div>
                        <span className="text-blue-700 font-bold">เข็มสั้น</span>
                    </button>
                )}
                {!minuteHand.isPlaced && (
                    <button
                        onPointerDown={() => placeFromPalette('minute')}
                        className="flex-1 h-24 bg-white border-4 border-red-200 rounded-3xl flex flex-col items-center justify-center hover:border-red-500 shadow-md active:scale-95 transition-all"
                    >
                         <div className="w-16 h-2 bg-red-600 rounded-full mb-1"></div>
                        <span className="text-red-700 font-bold">เข็มยาว</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-4 gap-3">
                {numbers.map((n) => (
                    <button
                        key={n.value}
                        disabled={n.isPlaced}
                        onPointerDown={() => placeFromPalette(n.value)}
                        className={`
                            h-16 rounded-2xl text-3xl font-black flex items-center justify-center border-4 transition-all
                            ${n.isPlaced 
                                ? 'bg-gray-200 text-gray-300 border-gray-200 opacity-50' 
                                : 'bg-white text-gray-900 border-white hover:border-primary shadow-sm hover:scale-105'}
                        `}
                    >
                        {n.value}
                    </button>
                ))}
            </div>

            <button 
                onClick={handleReset}
                className="mt-8 w-full py-4 text-red-500 font-bold text-xl hover:bg-red-50 rounded-2xl flex items-center justify-center gap-2 border-2 border-dashed border-red-200"
            >
                <RotateCcw size={24} /> ล้างกระดาน
            </button>
        </div>

      </div>

      <div className="mt-14 w-full max-w-sm">
        <button 
          onClick={() => onNext(generateClockImage())}
          className="
            w-full bg-primary hover:bg-primaryHover text-white h-24 rounded-3xl text-3xl font-black shadow-xl hover:-translate-y-2 transform transition-all flex items-center justify-center gap-4
          "
        >
          <span>เสร็จสิ้น</span>
          <ArrowRight size={40} strokeWidth={4} />
        </button>
      </div>

    </div>
  );
};