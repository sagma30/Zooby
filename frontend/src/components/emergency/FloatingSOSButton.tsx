import React from 'react';

interface FloatingSOSButtonProps {
  onClick: () => void;
  className?: string;
}

export const FloatingSOSButton: React.FC<FloatingSOSButtonProps> = ({
  onClick,
  className = ''
}) => {
  return (
    <div className={`fixed bottom-5 left-4 sm:left-6 z-40 font-jakarta print:hidden ${className}`}>
      <button
        id="public-floating-sos-btn"
        type="button"
        onClick={onClick}
        aria-label="Emergency SOS"
        title="Emergency SOS"
        className="group relative w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] rounded-full bg-gradient-to-br from-[#b91c1c] via-[#991b1b] to-[#7f1d1d] hover:from-[#dc2626] hover:to-[#991b1b] text-white shadow-lg hover:shadow-xl shadow-red-950/30 border border-white/25 flex flex-col items-center justify-center gap-0.5 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer select-none"
      >
        {/* White Emergency Icon */}
        <span className="material-symbols-outlined text-[20px] sm:text-[22px] leading-none text-white select-none">
          emergency
        </span>

        {/* Small Crisp SOS Label */}
        <span className="font-quicksand font-extrabold text-[9px] tracking-wider uppercase text-white/95 leading-none select-none">
          SOS
        </span>
      </button>
    </div>
  );
};
