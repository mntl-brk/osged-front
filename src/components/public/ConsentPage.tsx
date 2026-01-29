import React, { useState, useRef, useEffect } from 'react';
import { FileText, Camera, Mic, Check, ArrowRight, Video, AlertCircle, PlayCircle, StopCircle, RefreshCcw } from 'lucide-react';
import { useVoiceGuide } from '@/hooks/useVoiceGuide';
import { useCameraRecorder } from '@/hooks/useCameraRecorder';
import { createSession } from '@/api/sessions/createSession';
import { useAssessmentStore } from '@/store/assessmentStore';
import { sleep } from '@/hooks/useSleepPage';

interface ConsentPageProps {
  onNext: () => void;
}

export const ConsentPage: React.FC<ConsentPageProps> = ({ onNext }) => {
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const consentGuideText =
    'สวัสดีครับ ต่อไปเป็นขั้นตอนการให้ความยินยอมในการเข้าร่วมการทดสอบนะครับ กรุณากดปุ่ม เริ่มอัดคลิป ก่อน เมื่อเริ่มอัดแล้ว ให้ค่อย ๆ อ่านเงื่อนไขการเก็บรวบรวมข้อมูล ในกรอบด้านบนออกเสียงให้ครบถ้วน เมื่ออ่านเสร็จแล้ว กดปุ่มหยุดบันทึก จากนั้น ติ๊กช่องยินยอมด้านล่าง แล้วกดปุ่มถัดไปได้เลยครับ'

  const { isSpeaking, replay } = useVoiceGuide(consentGuideText)

  const participantId = useAssessmentStore((s) => s.participantId)
  const setSessionId = useAssessmentStore((s) => s.setSessionId)
  
  const {
    videoRef,
    isRecording,
    hasRecorded,
    recordedBlob,
    cameraError,
    startCamera,
    startRecording,
    stopRecording,
  } = useCameraRecorder()

  useEffect(() => {
    startCamera();
    return () => {
      stopRecording();
    };
  }, []);


  const handleSubmit = async () => {
    setIsLoading(true);
    await sleep(500);
    
    if (!consent) {
        alert('กรุณากดยอมรับเงื่อนไขการเก็บรวบรวมข้อมูล')
        return
    }

    if (!participantId) {
        alert('ไม่พบข้อมูลผู้เข้าร่วม')
        return
    }

    if (!recordedBlob) {
        alert('กรุณาอัดวิดีโอยินยอม')
        return
    }

    try{
        //  สร้าง session
        const result = await createSession({ participant_id: participantId })

        result.match(
            async (session) => {
            setSessionId(session.session_id)

            const formData = new FormData()
            formData.append('file', recordedBlob)

            const uploadRes = await fetch(
                `/api/media/consent/${session.session_id}`,
                {
                method: 'POST',
                body: formData,
                }
            )

            if (!uploadRes.ok) {
                alert('อัปโหลดวิดีโอไม่สำเร็จ')
                return
            }

            onNext()
            },
            () => {
            alert('ไม่สามารถเริ่มการประเมินได้')
            }
        )
    } finally {
         setIsLoading(false);
        }
    };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-8 animate-fade-in pb-32">
      
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
        การให้ความยินยอม
      </h1>

      <div className="space-y-5">
        
        {/* 1. PDPA Information */}
        <div className="bg-blue-50 rounded-2xl md:p-6 p-3 border border-blue-100">
            <h3 className="md:text-xl text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <FileText className="text-primary md:block hidden"/> 
                เงื่อนไขการเก็บรวบรวมข้อมูล
            </h3>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200 text-gray-600 text-base h-40 overflow-y-auto shadow-inner leading-relaxed">
                <p className="mb-2 font-medium text-gray-800">ข้าพเจ้ายินยอมให้โครงการดำเนินการดังนี้</p>
                <ul className="list-disc pl-5 space-y-2 mb-2">
                    <li>เก็บรวบรวมข้อมูลส่วนบุคคล ที่อยู่ อายุ และ เพศ</li>
                    <li>บันทึกภาพและเสียงวิดีโอ ตลอดการทำแบบทดสอบเพื่อนำไปวิเคราะห์ผลทางการแพทย์</li>
                    <li>เก็บรวบรวมข้อมูลการตอบสนองและภาพวาดนาฬิกา</li>
                </ul>
            </div>
        </div>

        {/* 2. Video Recording / Device Check */}
        <div className="bg-gray-50 rounded-2xl md:p-6 p-3 border border-gray-200">
             <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Video className="text-primary md:block hidden"/> 
                บันทึกวิดีโอยืนยัน
            </h3>
            
            <p className="text-gray-600 mb-4 text-center">
                กรุณากดปุ่ม <strong className='text-red-500'>"เริ่มอัดคลิป"</strong> และพูดตาม <span className="text-primary font-bold">"กล่องสีขาวด้านบน"</span> เมื่อพูดครบแล้วกดหยุด
            </p>

            {cameraError ? (
                <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center text-red-600">
                    <AlertCircle size={48} className="mx-auto mb-2" />
                    <p className="font-bold">ไม่สามารถเข้าถึงกล้อง/ไมโครโฟนได้</p>
                    <p className="text-sm">กรุณาอนุญาตการใช้งานใน Browser Settings หรือเปลี่ยนอุปกรณ์</p>
                    <button 
                        onClick={startCamera}
                        className="mt-4 px-4 py-2 bg-white border border-red-300 rounded-lg hover:bg-red-50"
                    >
                        ลองใหม่อีกครั้ง
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    {/* Camera Preview */}
                    <div className="relative w-full max-w-sm aspect-video bg-black rounded-xl overflow-hidden shadow-md">
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            muted 
                            playsInline 
                            className={`w-full h-full object-cover ${!isRecording && hasRecorded ? 'opacity-50' : ''}`}
                        />
                        {isRecording && (
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                <div className="w-2 h-2 bg-white rounded-full"></div> REC
                            </div>
                        )}
                        {hasRecorded && !isRecording && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-green-500 text-white p-3 rounded-full shadow-lg">
                                    <Check size={32} strokeWidth={4} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex gap-4">
                        {!isRecording ? (
                            <button
                                onClick={startRecording}
                                className={`
                                    flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg shadow-md transition-all
                                    ${hasRecorded 
                                        ? 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50' 
                                        : 'bg-red-500 text-white hover:bg-red-600 hover:scale-105'}
                                `}
                            >
                                {hasRecorded ? <><RefreshCcw size={20}/> อัดใหม่</> : <><Camera size={20}/> เริ่มอัดคลิป</>}
                            </button>
                        ) : (
                            <button
                                onClick={stopRecording}
                                className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg shadow-md bg-gray-800 text-white hover:bg-gray-900 scale-105"
                            >
                                <StopCircle size={20} /> หยุดบันทึก
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* 3. Consent Checkbox */}
        <label className="flex items-center gap-4 cursor-pointer p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-primary/20 transition-all shadow-sm">
            <div className="relative flex items-center justify-center shrink-0">
                <input 
                    type="checkbox" 
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="peer w-8 h-8 cursor-pointer appearance-none rounded-lg border-2 border-gray-300 checked:bg-primary checked:border-primary transition-all"
                />
                <Check className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transform scale-75 peer-checked:scale-100 transition-transform" size={20} strokeWidth={4} />
            </div>
            <div className="select-none">
                <span className="text-lg md:text-xl font-bold text-gray-800 block">
                    ข้าพเจ้ายินยอมให้เก็บรวบรวมข้อมูล ภาพ และเสียง
                </span>
                <span className="text-sm text-gray-500">
                    (เพื่อใช้ในการประเมินผลทางการแพทย์)
                </span>
            </div>
        </label>

      </div>

      {/* Next Button */}
      <div className="mt-10 flex justify-center">
        <button 
          onClick={handleSubmit}
          className={`
            w-full max-w-md
            py-5 px-8 rounded-2xl 
            text-2xl font-bold 
            shadow-lg 
            transform transition-all duration-200
            flex items-center justify-center gap-3
            ${(consent && (hasRecorded || cameraError)) // Allow proceed if error to not block, or strict? Let's be strict but allow error bypass if logic demands, here strict on recorded unless error
                ? 'bg-primary hover:bg-primaryHover text-white hover:shadow-xl hover:-translate-y-1' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
            ${isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:-translate-y-2'}
          `}
        >
          {isLoading ? (
                   <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                 ) : (
                   <>
                     <span>ถัดไป</span>
                     <ArrowRight size={32} strokeWidth={3} />
                   </>
                 )}
               </button>
      </div>

    </div>
  );
};