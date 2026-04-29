import React, { useState, useRef, useEffect } from 'react';
import { FileText, Camera, Mic, Check, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, StopCircle, RefreshCcw } from 'lucide-react';
import { useCameraRecorder } from '@/hooks/useCameraRecorder';
import { createSession } from '@/api/sessions/createSession';
import { useAssessmentStore } from '@/store/assessmentStore';
import { sleep } from '@/hooks/useSleepPage';
import { useLocalVoiceGuide } from '@/hooks/useLocalVoiceGuide';
import { stopAudio } from '@/lib/audioManager';
import { isAudioUnlocked, unlockAudio } from '@/lib/audioUnlock';
import DataCollectionNoticeModal from '../DataCollectionNoticeModal';

interface ConsentPageProps {
    onNext: () => void;
}

export const ConsentPage: React.FC<ConsentPageProps> = ({ onNext }) => {
    const [consent, setConsent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showNotice, setShowNotice] = useState(true)

    //   const consentGuideText =
    //     'สวัสดีครับ ต่อไปเป็นขั้นตอนการให้ความยินยอมในการเข้าร่วมการทดสอบนะครับ กรุณากดปุ่ม เริ่มอัดคลิป ก่อน เมื่อเริ่มอัดแล้ว ให้ค่อย ๆ อ่านเงื่อนไขการเก็บรวบรวมข้อมูล ในกรอบด้านบนออกเสียงให้ครบถ้วน เมื่ออ่านเสร็จแล้ว กดปุ่มหยุดบันทึก จากนั้น ติ๊กช่องยินยอมด้านล่าง แล้วกดปุ่มถัดไปได้เลยครับ'

    //   const { isSpeaking, replay } = useVoiceGuide(consentGuideText)

    const [guideFinished, setGuideFinished] = useState(false)
    const { isSpeaking } = useLocalVoiceGuide(
        '/audio/consent.mp3',
        !showNotice,

        {
            onEnd: () => {
                setGuideFinished(true)
            },
        }
    )

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
        if (!guideFinished) return

        startCamera()

        return () => {
            stopRecording()
            stopAudio()
        }
    }, [guideFinished])


    const handleSubmit = async () => {
        setIsLoading(true);
        await sleep(500);

        if (isRecording) {
            alert('กรุณาหยุดบันทึกก่อนกดถัดไป')
            return
        }

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


        try {
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
                    stopAudio()
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
        <>
            <DataCollectionNoticeModal
                open={showNotice}
                onConfirm={() => {
                    unlockAudio()
                    setShowNotice(false)
                }}
            />
            <div className="w-full max-w-4xl mx-auto px-6 py-12 animate-fade-in pb-32">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                        การให้ความยินยอม
                    </h1>
                    <p className="text-xl text-gray-500">
                        กรุณาอ่านเงื่อนไขและบันทึกวิดีโอยืนยันเพื่อความปลอดภัยของข้อมูล
                    </p>
                </div>

                <div className="space-y-8">

                    {/* 1. PDPA Information */}
                    <div className="bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-xl shadow-blue-50/50">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                1
                            </span>
                            เงื่อนไขการเก็บรวบรวมข้อมูล
                        </h3>

                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-gray-700 text-lg shadow-inner leading-relaxed">
                            <p className="mb-4 font-bold text-gray-900">ข้าพเจ้ายินยอมให้โครงการดำเนินการดังนี้:</p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="text-green-500 shrink-0 mt-1" size={20} />
                                    <span>เก็บรวบรวมข้อมูลส่วนบุคคล ที่อยู่ อายุ และเพศ</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="text-green-500 shrink-0 mt-1" size={20} />
                                    <span><strong>บันทึกภาพและเสียงวิดีโอ</strong> ตลอดการทำแบบทดสอบเพื่อนำไปวิเคราะห์ผลทางการแพทย์</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="text-green-500 shrink-0 mt-1" size={20} />
                                    <span>เก็บรวบรวมข้อมูลการตอบสนองและผลการคัดกรอง</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 2. Video Recording */}
                    <div className="bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-xl shadow-blue-50/50">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <span className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                2
                            </span>
                            บันทึกวิดีโอยืนยันตัวตน
                        </h3>

                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-8 text-center text-gray-700">
                            กรุณากดปุ่ม <strong className="text-red-500">"เริ่มอัดคลิป"</strong> และอ่านเงื่อนไขในกล่องด้านบนออกเสียง เมื่ออ่านจบแล้วกด <strong>"หยุดบันทึก"</strong>
                        </div>

                        {cameraError ? (
                            <div className="bg-red-50 p-8 rounded-2xl border border-red-200 text-center text-red-600">
                                <AlertCircle size={48} className="mx-auto mb-4" />
                                <p className="text-xl font-bold mb-2">ไม่สามารถเข้าถึงกล้องหรือไมโครโฟนได้</p>
                                <p className="text-gray-600 mb-6">กรุณาอนุญาตการใช้งานในเบราว์เซอร์หรือตรวจสอบอุปกรณ์ของท่าน</p>
                                <button
                                    onClick={startCamera}
                                    className="px-6 py-3 bg-white border-2 border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors"
                                >
                                    ลองใหม่อีกครั้ง
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-6">
                                {/* Camera Preview */}
                                <div className="relative w-full max-w-lg aspect-video bg-gray-900 rounded-[24px] overflow-hidden shadow-lg border-8 border-gray-50">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className={`w-full h-full object-cover transition-opacity duration-300 ${(!isRecording && hasRecorded) ? 'opacity-40 grayscale' : ''}`}
                                    />

                                    {isRecording && (
                                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                            กำลังบันทึก
                                        </div>
                                    )}

                                    {hasRecorded && !isRecording && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-green-900/20 backdrop-blur-sm">
                                            <div className="bg-white text-green-500 p-4 rounded-full shadow-2xl flex flex-col items-center gap-2 animate-bounce-slow">
                                                <Check size={40} strokeWidth={4} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="flex justify-center w-full">
                                    {!isRecording ? (
                                        <button
                                            onClick={startRecording}
                                            disabled={isSpeaking}
                                            className={`
                        flex items-center justify-center gap-3 w-full max-w-sm py-4 rounded-2xl font-bold text-xl shadow-lg transition-all duration-300
                        ${isSpeaking
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                                                    : hasRecorded
                                                        ? 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                        : 'bg-red-500 text-white hover:bg-red-600 hover:shadow-red-200 hover:-translate-y-1'
                                                }
                      `}
                                        >
                                            {hasRecorded ? (
                                                <><RefreshCcw size={24} /> อัดใหม่</>
                                            ) : (
                                                <><Camera size={24} /> เริ่มอัดคลิป</>
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={stopRecording}
                                            className="flex items-center justify-center gap-3 w-full max-w-sm py-4 rounded-2xl font-bold text-xl shadow-lg bg-gray-900 text-white hover:bg-black hover:shadow-gray-400 hover:-translate-y-1 transition-all duration-300"
                                        >
                                            <StopCircle size={24} /> หยุดบันทึก
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. Consent Checkbox */}
                    <div className="bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-xl shadow-blue-50/50">
                        <label className="flex items-center gap-6 cursor-pointer group">
                            <div className="relative flex items-center justify-center shrink-0">
                                <input
                                    type="checkbox"
                                    checked={consent}
                                    onChange={(e) => setConsent(e.target.checked)}
                                    className="peer w-10 h-10 cursor-pointer appearance-none rounded-xl border-2 border-gray-300 checked:bg-primary checked:border-primary transition-all group-hover:border-primary/50"
                                />
                                <Check className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transform scale-50 peer-checked:scale-100 transition-transform duration-200" size={24} strokeWidth={4} />
                            </div>
                            <div className="select-none">
                                <span className="text-xl md:text-2xl font-black text-gray-900 block mb-1">
                                    ข้าพเจ้ายินยอมให้เก็บรวบรวมข้อมูล ภาพ และเสียง
                                </span>
                                <span className="text-base text-gray-500">
                                    เพื่อนำไปใช้ในการประเมินผลทางการแพทย์ตามที่ระบุไว้
                                </span>
                            </div>
                        </label>
                    </div>

                </div>

                {/* Next Button */}
                <div className="mt-12 flex justify-center">
                    <button
                        onClick={handleSubmit}
                        disabled={!consent || !hasRecorded || isRecording || isSpeaking || isLoading}
                        className={`
              w-full max-w-lg
              py-5 px-8 rounded-2xl 
              text-2xl font-black 
              shadow-2xl 
              transform transition-all duration-300
              flex items-center justify-center gap-4
              ${(consent && (hasRecorded || cameraError))
                                ? 'bg-primary hover:bg-primaryHover text-white hover:shadow-blue-300/50 hover:-translate-y-1'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                            }
            `}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                <span>กำลังประมวลผล...</span>
                            </div>
                        ) : (
                            <>
                                <span>ดำเนินการต่อไป</span>
                                <ArrowRight size={32} strokeWidth={4} />
                            </>
                        )}
                    </button>
                </div>

            </div>
        </>
    );
};