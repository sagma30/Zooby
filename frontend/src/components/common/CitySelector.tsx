import React, { useState, useRef, useEffect } from 'react';
import { useCity } from '../../context/CityContext';

interface CitySelectorProps {
  variant?: 'header' | 'hero' | 'compact';
  className?: string;
}

export const CitySelector: React.FC<CitySelectorProps> = ({ variant = 'header', className = '' }) => {
  const {
    currentCity,
    supportedCities,
    setCityById,
    detectLocationCity,
    isUnsupportedLocation,
    clearUnsupportedAlert
  } = useCity();

  const [isOpen, setIsOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectNotice, setDetectNotice] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (cityId: string) => {
    setCityById(cityId);
    setIsOpen(false);
    setDetectNotice(null);
  };

  const handleUseMyLocation = async () => {
    setIsDetecting(true);
    setDetectNotice(null);
    const result = await detectLocationCity();
    setIsDetecting(false);
    if (result.success && result.city) {
      setDetectNotice(`You're currently in or near ${result.city.name}.`);
      setTimeout(() => {
        setIsOpen(false);
        setDetectNotice(null);
      }, 1800);
    } else {
      setDetectNotice(result.message || "Zooby isn't available in your city yet.");
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      {/* Selector Trigger Button */}
      {variant === 'hero' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-[#dac2ae]/60 hover:border-[#895100] text-[#1b1c1a] font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <div className="w-6 h-6 rounded-lg bg-[#ffeed9] text-[#895100] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[16px] filled-icon">location_on</span>
          </div>
          <div className="text-left">
            <span className="text-[10px] text-[#877462] block uppercase tracking-wider font-bold">City</span>
            <span className="text-xs font-extrabold text-[#895100]">{currentCity.name}</span>
          </div>
          <span className="material-symbols-outlined text-base text-[#877462]">
            {isOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f4ebd9]/60 hover:bg-[#ffeed9] border border-[#dac2ae]/60 text-[#544434] hover:text-[#895100] text-xs font-bold transition-all cursor-pointer"
          title="Change Operating City"
        >
          <span className="material-symbols-outlined text-[16px] text-[#895100] filled-icon">location_on</span>
          <span>{currentCity.name}</span>
          <span className="material-symbols-outlined text-[16px] text-[#877462]">
            {isOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 rounded-3xl bg-white shadow-2xl border border-[#dac2ae]/70 p-3 z-50 animate-in fade-in zoom-in-95 space-y-2">
          {/* Header */}
          <div className="px-3 pt-2 pb-1 border-b border-[#efeeea]">
            <span className="text-[10px] font-bold text-[#877462] uppercase tracking-wider block">
              Zooby Services Near You
            </span>
            <p className="text-xs font-bold text-[#1b1c1a]">Select your service city</p>
          </div>

          {/* Use My Location Option */}
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isDetecting}
            className="w-full px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100/70 text-[#895100] text-xs font-bold flex items-center justify-between transition-colors cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-[17px] ${isDetecting ? 'animate-spin' : ''}`}>
                {isDetecting ? 'progress_activity' : 'my_location'}
              </span>
              <span>{isDetecting ? 'Detecting GPS Location...' : 'Use my current location'}</span>
            </div>
            <span className="text-[10px] font-semibold bg-amber-200/60 px-1.5 py-0.5 rounded-md">GPS</span>
          </button>

          {/* Location Detection Feedback */}
          {detectNotice && (
            <div className="px-3 py-1.5 rounded-xl bg-stone-100 text-[11px] text-[#544434] font-medium leading-tight">
              {detectNotice}
            </div>
          )}

          {/* Cities List */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#877462] uppercase tracking-wider px-3 block pt-1">
              Supported Cities
            </span>
            {supportedCities.map((city) => {
              const isSelected = city.id === currentCity.id;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleCitySelect(city.id)}
                  className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#ffeed9] text-[#895100] font-bold shadow-2xs'
                      : 'text-[#1b1c1a] hover:bg-[#f6f4ee]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[17px] ${isSelected ? 'text-[#895100] filled-icon' : 'text-[#877462]'}`}>
                      location_city
                    </span>
                    <div>
                      <div className="font-bold">{city.name}</div>
                      <div className="text-[10px] text-[#877462]">{city.state}</div>
                    </div>
                  </div>

                  {city.isPrimary && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-[#895100] text-white rounded-md">
                      Primary Hub
                    </span>
                  )}
                  {isSelected && !city.isPrimary && (
                    <span className="material-symbols-outlined text-sm text-[#895100]">check</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-[#efeeea] px-3 pb-1 text-[10px] text-[#877462] flex items-center justify-between">
            <span>5 Active Hubs</span>
            <span className="text-emerald-700 font-bold">24/7 Mobile Van SOS</span>
          </div>
        </div>
      )}

      {/* Unsupported Location Floating Alert if detected */}
      {isUnsupportedLocation && (
        <div className="fixed top-20 right-6 z-50 bg-rose-900 text-white p-4 rounded-2xl shadow-2xl max-w-sm space-y-2 animate-in slide-in-from-top-3 border border-rose-700">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-rose-300">location_off</span>
              <h4 className="font-bold text-xs text-white">Zooby isn't in your city yet</h4>
            </div>
            <button onClick={clearUnsupportedAlert} className="text-rose-300 hover:text-white">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          <p className="text-[11px] text-rose-100 leading-relaxed">
            We are currently operational in Nashik, Mumbai, Pune, Bengaluru, and Nagpur. Select an active city to explore services.
          </p>
          <div className="pt-1 flex gap-2">
            <button
              onClick={() => {
                clearUnsupportedAlert();
                setIsOpen(true);
              }}
              className="py-1 px-3 bg-white text-rose-900 font-bold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              Explore Available Cities
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
