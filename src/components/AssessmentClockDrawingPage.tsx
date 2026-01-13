import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight, RotateCcw, ClockFading } from 'lucide-react';
import { AssessmentProgress } from './AssessmentProgress';
import { isAudioUnlocked } from '@/lib/audioUnlock';
import { speakSequentialWithPreload } from '@/lib/speakSequentialWithPreload';
import { stopAudio } from '@/lib/audioManager';

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

interface ClockSnapshot {
  numbers: ClockNumber[];
  hourHand: ClockHand;
  minuteHand: ClockHand;
}

export const AssessmentClockDrawingPage: React.FC<AssessmentClockDrawingPageProps> = ({ onNext }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<ClockSnapshot[]>([]);
  const [numbers, setNumbers] = useState<ClockNumber[]>(
    Array.from({ length: 16 }, (_, i) => ({
      value: i + 1,
      x: 50,
      y: 50,
      isPlaced: false,
    }))
  );

  const [hourHand, setHourHand] = useState<ClockHand>({ type: 'hour', angle: 0, isPlaced: false });
  const [minuteHand, setMinuteHand] = useState<ClockHand>({ type: 'minute', angle: 0, isPlaced: false });
  const [draggingId, setDraggingId] = useState<number | 'hour' | 'minute' | null>(null);
  const hasSpoken = useRef(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  

   useEffect(() => {
        if (!isAudioUnlocked()) return;
        if (hasSpoken.current) return;
    
        hasSpoken.current = true;
        speakSequentialWithPreload(
          'ต่อไปจะเป็นการสร้างนาฬิกานะครับ กรุณาลากตัวเลขและเข็มนาฬิกา เพื่อบอกเวลา สิบเอ็ดนาฬิกา สิบ นาที ค่อย ๆ ทำ ไม่ต้องรีบครับ',
          () => {
            setIsSpeaking(false); 
          },
          () => {
            setIsSpeaking(true);
          }
        );
      }, []);
    
      useEffect(() => {
        return () => {
          stopAudio();
        };
  }, []);

  const pushHistory = () => {
    historyRef.current.push({
      numbers: JSON.parse(JSON.stringify(numbers)),
      hourHand: { ...hourHand },
      minuteHand: { ...minuteHand },
    });
  };
  
  const handlePointerDown = (e: React.PointerEvent, id: number | 'hour' | 'minute') => {
    e.preventDefault();
    pushHistory();
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
    pushHistory();

    if (typeof id === 'number') {
      setNumbers(prev =>
        prev.map(n =>
          n.value === id ? { ...n, x: 50, y: 50, isPlaced: true } : n
        )
      );
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

  const handleBack = () => {
    const last = historyRef.current.pop();
    if (!last) return;

    setNumbers(last.numbers);
    setHourHand(last.hourHand);
    setMinuteHand(last.minuteHand);
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

    const drawHand = (hand: ClockHand, length: number) => {
      if (!hand.isPlaced) return;

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate((hand.angle - 90) * Math.PI / 180);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(length - 18, 0);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(length, 0);
      ctx.lineTo(length - 22, -12);
      ctx.lineTo(length - 22, 12);
      ctx.closePath();
      ctx.fillStyle = '#000';
      ctx.fill();

      ctx.restore();
    };

    drawHand(hourHand, radius * 0.55);
    drawHand(minuteHand, radius * 0.85);

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

      <h1 className="text-3xl md:text-5xl font-bold text-center mb-4 text-gray-900">
        สร้างนาฬิกา
      </h1>
      
      <p className="text-xl md:text-2xl text-gray-600 text-center mb-10">
        ลากตัวเลขและเข็มนาฬิกา เพื่อบอกเวลา <span className="text-primary font-black text-3xl">11 โมง 10 นาที</span>
      </p>

      <div className="flex flex-col lg:flex-row w-full gap-10 items-start justify-center">
          
          <div className="w-full lg:w-3/5 flex justify-center">
              <div
                className="
                  relative w-full max-w-[1200px]
                  p-6 rounded-[48px]
                  border-4 border-dashed border-gray-300
                  bg-gray-50/60
                  flex flex-col items-center
                "
              >        
                 {/* Label นำสายตา */}
                <div className="
                  absolute -top-4 left-8
                  bg-gray-50 px-4 py-1
                  text-lg font-semibold text-gray-500
                  rounded-full
                ">
                  พื้นที่สร้างนาฬิกา
                </div>

                {/* Clock wrapper */}
                <div
                  ref={containerRef}
                  className="
                    relative
                    w-full max-w-[500px]
                    aspect-square
                    bg-white
                    rounded-full
                    border-[10px] border-gray-900
                    shadow-2xl
                    flex items-center justify-center
                  "
                >


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

              </div>

           {/* Hour Hand */}
            {hourHand.isPlaced && (
              <div
                onPointerDown={(e) => handlePointerDown(e, 'hour')}
                className="absolute top-1/2 left-1/2 origin-left h-3 bg-black z-20 cursor-grab"
                style={{
                  width: hourHand.isPlaced ? '20%' : '40%',
                  transform: `rotate(${hourHand.angle - 90}deg) translateY(-50%)`,
                }}
              >
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 
                  border-l-[16px] border-l-black 
                  border-y-[8px] border-y-transparent" />
              </div>
            )}

            {/* Minute Hand */}
            {minuteHand.isPlaced && (
              <div
                onPointerDown={(e) => handlePointerDown(e, 'minute')}
                className="absolute top-1/2 left-1/2 origin-left h-3 bg-black z-30 cursor-grab"
                style={{
                  width: minuteHand.isPlaced ? '28%' : '55%',
                  transform: `rotate(${minuteHand.angle - 90}deg) translateY(-50%)`,
                }}
              >
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 
                  border-l-[16px] border-l-black 
                  border-y-[8px] border-y-transparent" />
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-2/5 bg-gray-100 p-8 rounded-[40px] border-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ClockFading size={32}/> ชิ้นส่วนนาฬิกา
            </h3>
            
           <div className="flex gap-4 mb-8">
              {!hourHand.isPlaced && (
                <button
                  onPointerDown={() => placeFromPalette('hour')}
                  className="flex-1 h-16 bg-white rounded-3xl
                    flex items-center justify-center border-4
                    hover:border-primaryHover shadow-md active:scale-95 transition-all"
                >
                  <div className="relative flex items-center">
                    {/* shaft */}
                    <div className="w-14 h-2 bg-black rounded-full" />
                    {/* arrow head */}
                    <div
                      className="ml-[-6px]
                        border-l-[16px] border-l-black
                        border-y-[8px] border-y-transparent"
                    />
                  </div>
                </button>
              )}

              {!minuteHand.isPlaced && (
                <button
                  onPointerDown={() => placeFromPalette('minute')}
                  className="flex-1 h-16 bg-white rounded-3xl
                    flex items-center justify-center border-4
                    hover:border-primaryHover shadow-md active:scale-95 transition-all"
                >
                  <div className="relative flex items-center">
                    {/* shaft */}
                    <div className="w-20 h-2 bg-black rounded-full" />
                    {/* arrow head */}
                    <div
                      className="ml-[-6px]
                        border-l-[16px] border-black
                        border-y-[7px] border-y-transparent"
                    />
                  </div>
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

           <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                onClick={handleReset}
                className="py-4 text-red-500 font-bold text-xl 
                  hover:bg-red-50 rounded-2xl 
                  flex items-center justify-center gap-2 
                  border-2 border-dashed border-red-200"
              >
                <RotateCcw size={24} /> ล้างกระดาน
              </button>

             <button
                onClick={handleBack}
                disabled={historyRef.current.length === 0}
                className="py-4 text-gray-700 font-bold text-xl 
                  hover:bg-gray-200 rounded-2xl 
                  flex items-center justify-center gap-2 
                  border-2 border-dashed border-gray-300
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← ย้อนกลับ
              </button>
            </div>
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