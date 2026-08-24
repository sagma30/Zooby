import React from 'react';
import { ZoobyLogo } from './ZoobyLogo';

export interface ServiceDetailData {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: string;
  badge: string;
  tag: string;
  price: string;
  image: string;
  highlights?: string[];
  inclusions?: string[];
  precautions?: string[];
  vanEquipment?: string[];
  doctorQualifications?: string;
  duration?: string;
}

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceDetailData | null;
  onBookService: (serviceId: string) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  isOpen,
  onClose,
  service,
  onBookService
}) => {
  if (!isOpen || !service) return null;

  const isVanService = service.id.includes('mobile') || service.id === 'mobile_grooming' || service.id === 'mobile_vet';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-jakarta">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#ebdcc4] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header Image Banner */}
        <div className="relative aspect-[16/8] sm:aspect-[16/7] bg-stone-900 shrink-0">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          {/* Badge & Title in Banner */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#ffeed9] text-[#895100]">
                {service.badge}
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-xs">
                {service.tag}
              </span>
            </div>
            <h2 className="font-quicksand font-bold text-2xl sm:text-3xl text-white tracking-tight">
              {service.title}
            </h2>
            <p className="text-xs sm:text-sm text-amber-200 font-medium">
              {service.subtitle} • {service.price}
            </p>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#1b1c1a] text-xs leading-relaxed">
          {/* Overview Description */}
          <div className="space-y-2">
            <h3 className="font-quicksand font-bold text-sm text-[#895100] uppercase tracking-wider">
              Service Overview
            </h3>
            <p className="text-[#544434] text-sm leading-relaxed">
              {service.desc}
            </p>
          </div>

          {/* Key Inclusions & Features */}
          <div className="space-y-2.5">
            <h3 className="font-quicksand font-bold text-sm text-[#895100] uppercase tracking-wider">
              What’s Included
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(service.inclusions || [
                'Full session by background-verified professional',
                'Pre-service behavioral and health check',
                'Digital record update in your Zooby Pet Profile',
                'Live GPS tracking with real-time ETA updates'
              ]).map((inc, i) => (
                <div key={i} className="p-3 bg-[#fbf9f5] rounded-xl border border-[#efeeea] flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span className="text-[#544434] font-medium">{inc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Van / Clinic Equipment Specs */}
          {isVanService && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2 text-[#895100] font-bold text-sm">
                <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                <span>Zooby Mobile Van Equipment Standards</span>
              </div>
              <ul className="space-y-1.5 text-stone-700 pl-6 list-disc">
                <li>Warm RO water hydrobath system pre-heated to pet-safe 38°C</li>
                <li>Whisper-quiet velocity blowers and air conditioning for anxiety-free drying</li>
                <li>Hospital-grade UV-C tool sterilization between appointments</li>
                <li>Onboard emergency oxygen & first-aid support</li>
              </ul>
            </div>
          )}

          {/* Preparation & Instructions */}
          <div className="p-4 rounded-2xl bg-[#f6f4ee] border border-[#e6e2dd] space-y-1.5">
            <div className="flex items-center gap-2 text-[#1b1c1a] font-bold text-xs">
              <span className="material-symbols-outlined text-[#895100] text-[18px]">info</span>
              <span>How to Prepare Your Pet</span>
            </div>
            <p className="text-[#716153]">
              Ensure your pet has had a light walk before the appointment. Please keep vaccination records accessible, or upload them directly into your pet's profile.
            </p>
          </div>
        </div>

        {/* Modal Bottom Sticky CTA */}
        <div className="p-5 bg-[#fbf9f5] border-t border-[#ebdcc4] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-[11px] text-[#877462] block font-semibold">Guaranteed Upfront Pricing</span>
            <span className="font-quicksand font-bold text-lg text-[#895100]">{service.price}</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#efeeea] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onBookService(service.id);
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#895100] hover:bg-[#683c00] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-98"
            >
              <span>{service.id === 'adoption' ? 'Explore Adoptions' : 'Book Appointment'}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
