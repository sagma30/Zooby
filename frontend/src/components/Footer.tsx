import React from 'react';

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full py-10 bg-[#efeeea] border-t border-[#dac2ae]/40 mt-auto text-[#544434]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#895100] text-white flex items-center justify-center font-bold text-sm">
            <span className="material-symbols-outlined text-[16px] filled-icon">pets</span>
          </div>
          <span className="font-quicksand font-bold text-xl text-[#895100]">Zooby</span>
        </div>

        <nav className="flex flex-wrap justify-center gap-6 text-sm">
          {onNavigate && (
            <button
              onClick={() => onNavigate('/provider/login')}
              className="text-[#895100] font-semibold hover:underline transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">medical_services</span>
              <span>Care Providers</span>
            </button>
          )}
          <button onClick={() => alert("Zooby 24/7 Support: support@zooby.care | +91 98200 12345")} className="hover:text-[#895100] hover:underline transition-colors cursor-pointer">
            Support
          </button>
          <button onClick={() => alert("Zooby Privacy Policy: All medical and GPS records are encrypted with strict privacy controls.")} className="hover:text-[#895100] hover:underline transition-colors cursor-pointer">
            Privacy Policy
          </button>
          <button onClick={() => alert("Zooby Terms of Service: Verified professional care providers and safe satisfaction guarantee.")} className="hover:text-[#895100] hover:underline transition-colors cursor-pointer">
            Terms of Service
          </button>
          <button onClick={() => alert("Zooby Trust & Safety: 100% background-checked care specialists, GPS live updates, and vetted clinics.")} className="hover:text-[#895100] hover:underline transition-colors cursor-pointer">
            Trust &amp; Safety
          </button>
        </nav>

        <div className="text-xs text-[#877462] text-center md:text-right">
          &copy; 2026 Zooby. Professional Pet Care Made Simple.
        </div>
      </div>
    </footer>
  );
};
