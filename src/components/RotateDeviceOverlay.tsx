import Image from 'next/image';

export const RotateDeviceOverlay = () => {
  return (
    <div
      className="
        fixed inset-0 z-[9999]
        bg-black/50 backdrop-blur-sm
        flex items-center justify-center
        px-6
      "
    >
      <div
        className="
          bg-white
          rounded-[40px]
          w-full max-w-md
          px-10 py-12
          text-center
          shadow-2xl
          animate-fade-in
        "
      >
        {/* GIF */}
        <div className="flex justify-center mb-8">
          <div className="
            w-80 h-40
            rounded-3xl
            flex items-center justify-center
          ">
            <Image
              src="/gif/rotate.gif"
              alt="หมุนหน้าจอเป็นแนวนอน"
              width={180}
              height={120}
              priority
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          กรุณาหมุนหน้าจอ <span className="font-black text-primary"> แนวนอน</span>
        </h2>

        {/* Description */}
        <p className="text-lg text-gray-600 leading-relaxed">
          เพื่อให้สามารถทำแบบทดสอบได้สะดวก<br />
        </p>

      </div>
    </div>
  );
};