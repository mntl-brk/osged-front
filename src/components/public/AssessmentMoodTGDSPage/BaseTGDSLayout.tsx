import {
  Mic,
  StopCircle,
  Send,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface BaseTGDSLayoutProps {
  // progress
  index: number;
  total: number;
  progressPercent: number;

  // content
  questionText: string;

  // speech state
  isListening: boolean;

  // answer state
  finalAnswerText?: string;
  hasDetectedAnswer?: boolean;

  // actions
  onToggleListening: () => void;
  onResetAnswer?: () => void;
  onSubmitAnswer?: () => void;
}

export const BaseTGDSLayout: React.FC<BaseTGDSLayoutProps> = ({
  index,
  total,
  progressPercent,
  questionText,
  isListening,
  finalAnswerText,
  hasDetectedAnswer = false,
  onToggleListening,
  onResetAnswer,
  onSubmitAnswer,
}) => {
  const hasFinalAnswer = Boolean(finalAnswerText);

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-8 animate-fade-in flex flex-col min-h-[85vh]">

      {/* ================= Progress Header ================= */}
      <div className="mb-6">
        <div className="flex justify-between items-end text-lg font-bold text-gray-400 mb-2">
          <div>
            <span className="text-primary block text-sm">
              การประเมินด้านอารมณ์
            </span>
            <span className="text-gray-900 text-2xl">
              ข้อที่ {index + 1} / {total}
            </span>
          </div>
        </div>

        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ================= Question ================= */}
      <div className="flex-grow flex flex-col justify-center mb-8 mt-6">
        <div
          className="
            relative bg-white border-[6px] border-primary
            rounded-[40px] p-8 md:p-12
            shadow-2xl text-center
          "
        >
          <div
            className="
              absolute -top-10 left-1/2 -translate-x-1/2
              px-4 py-2 rounded-full
              bg-primary text-white
              font-black text-lg shadow-lg
              
            "
          >
            อ่านคำถามแล้วตอบ "ใช่" หรือ "ไม่ใช่" ได้เลย
          </div>

          <p className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
            {questionText}
          </p>
        </div>
      </div>

      {/* ================= Answer / Listening Display ================= */}
      <div className="mb-8">
        {/* มีคำตอบแล้ว */}
        {hasFinalAnswer && (
          <div className="p-8 rounded-[32px] border-4 bg-white border-green-300 shadow-inner text-center min-h-[140px] flex flex-col items-center justify-center animate-fade-in">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">
              คำตอบของท่าน
            </span>
            <p className="text-5xl font-black text-green-700">
              {finalAnswerText}
            </p>
          </div>
        )}

        {/* กำลังฟัง */}
        {!hasFinalAnswer && isListening && (
          <div className="p-8 rounded-[32px] border-4 bg-red-50 border-red-200 text-center min-h-[140px] flex flex-col items-center justify-center animate-fade-in">
            <span className="text-xl font-black text-red-600 mb-4">
              กำลังฟังเสียงของท่าน
            </span>
            <ListeningWave />
          </div>
        )}

        {/* ยังไม่เริ่ม */}
        {!hasFinalAnswer && !isListening && (
          <div className="p-8 rounded-[32px] border-4 border-dashed border-gray-200 text-center text-gray-400 font-bold text-xl h-[140px] flex items-center justify-center">
            ตอบว่า “ใช่” หรือ “ไม่ใช่”
          </div>
        )}
      </div>

      {/* ================= Controls ================= */}
      <div className="flex flex-col gap-4 pb-12">

        {/* Main Mic Button */}
        {!hasFinalAnswer && (
          <button
            onClick={onToggleListening}
            className={`
              w-full py-8 rounded-[35px]
              flex items-center justify-center gap-6
              text-4xl font-black shadow-2xl transition-all
              ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-primary text-white hover:bg-primaryHover'
              }
            `}
          >
            {isListening ? (
              <>
                <StopCircle size={56} />
                กดเมื่อพูดจบ
              </>
            ) : (
              <>
                <Mic size={56} />
                พูด
              </>
            )}
          </button>
        )}

        {/* After detected answer */}
        {!isListening && hasDetectedAnswer && (
          <div className="flex gap-4 w-full animate-fade-in-up">
            <button
              onClick={onResetAnswer}
              className="flex-1 bg-white border-4 border-gray-300 text-gray-600 px-2 rounded-[30px] text-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all"
            >
              <RotateCcw size={32} />
              พูดใหม่
            </button>

            <button
              onClick={onSubmitAnswer}
              className="flex-[2] bg-gray-900 text-white py-6 rounded-[30px] text-3xl font-black flex items-center justify-center gap-4 hover:bg-black shadow-xl transition-all"
            >
              <span>ส่งคำตอบ</span>
              <Send size={36} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= Listening Wave ================= */

const ListeningWave = () => (
  <div className="flex items-center gap-1">
    {[1, 2, 3].map(i => (
      <span
        key={i}
        className="w-2 h-6 bg-red-500 rounded-full animate-wave"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);