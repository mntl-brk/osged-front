export function NewtonLoaderOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      
      <div className="absolute inset-0 bg-white/60 backdrop-blur-md" />

      <div className="relative flex flex-col items-center justify-center">
        
        <div className="relative flex items-center justify-center w-[56px] h-[56px]">
          
          <div className="relative flex items-start w-1/4 h-full origin-top animate-swing">
            <div className="w-full h-1/4 rounded-full bg-[#2563EB] shadow-lg shadow-blue-500/40" />
          </div>

          <div className="relative flex items-start w-1/4 h-full origin-top">
            <div className="w-full h-1/4 rounded-full bg-[#2563EB]" />
          </div>

          <div className="relative flex items-start w-1/4 h-full origin-top">
            <div className="w-full h-1/4 rounded-full bg-[#2563EB]" />
          </div>

          <div className="relative flex items-start w-1/4 h-full origin-top animate-swing2">
            <div className="w-full h-1/4 rounded-full bg-[#2563EB] shadow-lg shadow-blue-500/40" />
          </div>

        </div>

        <p className="text-sm font-semibold text-gray-600 tracking-wide">
          กำลังโหลดข้อมูลการประเมิน...
        </p>
      </div>
    </div>
  )
}