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
  isUploading?: boolean
  isSubmitting?: boolean
  isSpeaking: boolean
  showHint?: boolean
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
  isUploading = false,
  isSubmitting,
  isSpeaking,
  showHint
}) => {
  const hasFinalAnswer = hasDetectedAnswer;

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

      {showHint && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 text-center mb-6">
          <p className="text-gray-700 text-lg">
            หากยังไม่พร้อมตอบ สามารถพูดว่า
            <strong> "ขอข้ามคำถามนี้"</strong>
          </p>

          <p className="text-sm text-gray-500 mt-2">
            ระบบจะข้ามคำถามนี้ให้อัตโนมัติภายใน 2 นาที
          </p>
        </div>
      )}

      {/* ================= Question ================= */}
      <div className="flex-grow flex flex-col justify-center mb-10 md:mb-2 mt-6">
        <div
          className="
            relative bg-white border-[6px] border-primary
            rounded-[40px] p-8 md:p-12
            shadow-xl text-center
          "
        >
          <div
            className="
              absolute -top-5 left-1/2 -translate-x-1/2
              px-4 py-2 rounded-full
              bg-primary text-white
              font-black text-base shadow-lg
              w-full md:w-auto
            "
          >
            อ่านคำถามแล้วตอบ "ใช่" หรือ "ไม่ใช่"
          </div>

          <p className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
            {questionText}
          </p>
        </div>
      </div>

      {/* ================= Answer / Listening Display ================= */}
      <div className="mb-8 mt-4">
        {/* มีคำตอบแล้ว */}
        {hasFinalAnswer && (
          <div className={`p-6 rounded-[32px] md:h-[140px] h-[100px] border-4 bg-white  shadow-inner text-center flex flex-col items-center justify-center animate-fade-in
            ${finalAnswerText === 'ข้ามคำถามนี้'
                ? 'border-yellow-300'
                : 'border-green-300'
              }
              `}>
            <span className="text-sm md:text-base font-bold text-gray-500 uppercase tracking-widest mb-4">
              คำตอบของท่าน
            </span>
            <p className={`text-4xl md:text-5xl font-black
              ${finalAnswerText === 'ข้ามคำถามนี้'
                ? 'text-yellow-600'
                : 'text-green-700'
              }`}>
              {finalAnswerText}
            </p>
          </div>
        )}

        {/* กำลังฟัง */}
        {!hasFinalAnswer && isListening && (
          <div className="p-6 rounded-[32px] border-4 bg-red-50 border-red-200 text-center md:h-[140px] h-[100px] flex flex-col items-center justify-center animate-fade-in">
            <span className="text-xl font-black text-red-600 mb-4">
              กำลังฟังเสียงของท่าน
            </span>
            <ListeningWave />
          </div>
        )}

        {/* ยังไม่เริ่ม */}
        {!hasFinalAnswer && !isListening && (
          <div className="p-6 rounded-[32px] border-4 border-dashed border-gray-200 text-center text-gray-400 font-bold text-xl md:h-[140px] h-[100px] flex items-center justify-center">
            ตอบว่า “ใช่” หรือ “ไม่ใช่”
          </div>
        )}
      </div>

      {/* ================= Controls ================= */}
      <div className="flex flex-col gap-4 pb-12">

        {/* Main Mic Button */}
        {!hasFinalAnswer && (
        <button
          disabled={isSubmitting || isUploading || isSpeaking}
          onClick={isSpeaking ? undefined : onToggleListening}
          className={`
            w-full py-6 rounded-[35px]
            flex items-center justify-center gap-6
            text-4xl font-black shadow-2xl transition-all
            ${
              isSpeaking
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isSubmitting || isUploading
                ? 'bg-gray-300 cursor-not-allowed'
                : isListening
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-primary text-white hover:bg-primaryHover'
            }
          `}
        >
          {isSpeaking ? (
            <>
              <div className="w-6 h-6 border-4 border-gray-500 border-t-transparent rounded-full animate-spin" />
              กำลังอธิบาย
            </>
          ) : isListening ? (
            <>
              <StopCircle size={38} />
              กดเมื่อพูดจบ
            </>
          ) : (
            <>
              <Mic size={38} />
              พูด
            </>
          )}
        </button>
      )}

        {/* After detected answer */}
        {!isListening && hasDetectedAnswer && (
          <div className="flex gap-2 w-full animate-fade-in-up">
            <button
              disabled={isUploading || isSubmitting}
              onClick={onResetAnswer}
              className={`
                flex-1 px-2 rounded-[30px]
                text-xl md:text-3xl font-bold
                flex items-center justify-center gap-2
                transition-all
                ${
                  isUploading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-4 border-gray-300 text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <RotateCcw className="h-10" />
              พูดใหม่
            </button>

            <button
              disabled={isUploading || isSubmitting}
              onClick={onSubmitAnswer}
              className={`
                flex-[2] py-4 rounded-[30px]
                text-xl md:text-3xl font-black
                flex items-center justify-center gap-3
                shadow-xl transition-all
                ${
                  isUploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 hover:bg-black text-white'
                }
              `}
            >
              {isUploading || isSubmitting ? (
                 <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>ส่งคำตอบ</span>
                  <Send className="h-10" />
                </>
              )}
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