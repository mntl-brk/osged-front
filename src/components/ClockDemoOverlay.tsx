interface ClockDemoOverlayProps {
  onClose: () => void;
}

export const ClockDemoOverlay: React.FC<ClockDemoOverlayProps> = ({ onClose }) => {
  return (
    <div
      className="
        fixed inset-0 z-[999]
        bg-black/70
        flex items-center justify-center
        px-3 py-4
      "
    >
      <div
        className="
          bg-white
          w-full
          max-h-full
          max-w-md
          md:max-w-lg
          lg:max-w-4xl
          rounded-4xl
          p-4 md:p-6
          shadow-2xl
          flex flex-col
        "
      >
        {/* Title */}
        <h2
          className="
            text-lg md:text-2xl
            text-black font-bold text-center
            mb-1 md:mb-4
          "
        >
          ตัวอย่างการสร้างนาฬิกา
        </h2>

        {/* Video wrapper */}
        <div
          className="
            relative
            w-full
            aspect-video
            rounded-2xl
            overflow-hidden
            mb-4 md:mb-6
          "
        >
          <video
            src="/demo/clock-demo.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        {/* Action button */}
        <button
          onClick={onClose}
          className="
            w-full
            h-13 md:h-16
            rounded-2xl
            text-lg md:text-xl
            font-black
            bg-primary text-white
            hover:bg-primaryHover
            active:scale-95
            transition-all
          "
        >
          เข้าใจแล้ว เริ่มทำเลย
        </button>
      </div>
    </div>
  );
};