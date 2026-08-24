import React, { useState } from 'react';
import { useCity } from '../context/CityContext';
import { ZoobyLogo } from './common/ZoobyLogo';
import { CompanyInfoModal, InfoModalTab } from './common/CompanyInfoModal';

interface FooterProps {
  onNavigate?: (path: string) => void;
  onOpenBookingForService?: (serviceCategory: string) => void;
  onOpenSOS?: () => void;
  onSelectCategory?: (category: any) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenBookingForService,
  onOpenSOS,
  onSelectCategory
}) => {
  const { currentCity, supportedCities, setCityById } = useCity();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalTab, setInfoModalTab] = useState<InfoModalTab>('about');

  const openInfoModal = (tab: InfoModalTab) => {
    setInfoModalTab(tab);
    setIsInfoModalOpen(true);
  };

  const handleServiceClick = (cat: string) => {
    if (cat === 'adoption') {
      const el = document.getElementById('adopt');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (onNavigate) {
        onNavigate('/adopt');
      }
      return;
    }

    if (onOpenBookingForService) {
      onOpenBookingForService(cat);
    } else if (onSelectCategory) {
      onSelectCategory(cat);
    } else if (onNavigate) {
      onNavigate('/services');
    }
  };

  const handleSOSClick = () => {
    if (onOpenSOS) {
      onOpenSOS();
    } else {
      const sosBtn = document.getElementById('header-sos-btn') || document.getElementById('hero-sos-btn');
      if (sosBtn) {
        sosBtn.click();
      }
    }
  };

  return (
    <footer className="w-full bg-[#1b1c1a] text-stone-300 pt-16 pb-12 border-t border-stone-800 font-jakarta selection:bg-[#ffdcbc] selection:text-[#683c00]">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 space-y-12">
        {/* Main 5-Column Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* COLUMN 1 — ZOOBY */}
          <div className="space-y-4 lg:col-span-1">
            <ZoobyLogo
              size="md"
              variant="dark"
              subtitle="Comprehensive Pet Care"
              onClick={() => (onNavigate ? onNavigate('/') : window.scrollTo({ top: 0, behavior: 'smooth' }))}
              clickable={true}
            />

            <p className="text-xs text-stone-400 leading-relaxed">
              Pet care, simplified. Comprehensive mobile van services, veterinary care, walking, boarding, training, and ethical adoption across India.
            </p>

            {/* Follow Zooby & Refined Minimal Instagram CTA */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2.5">
                Follow Zooby
              </span>
              <a
                href="https://www.instagram.com/zooby.petcare?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-stone-300 hover:text-white transition-colors group cursor-pointer"
                title="Follow @zooby.petcare on Instagram"
              >
                {/* Small circular Instagram icon container (36px x 36px) */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] flex items-center justify-center text-white shadow-xs group-hover:scale-105 group-hover:opacity-95 transition-all shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                {/* Username displayed as clean normal footer text */}
                <span className="text-xs font-medium text-stone-300 group-hover:text-white group-hover:underline transition-colors">
                  @zooby.petcare
                </span>
              </a>
            </div>
          </div>

          {/* COLUMN 2 — SERVICES */}
          <div className="space-y-3">
            <h4 className="font-quicksand font-bold text-sm text-white uppercase tracking-wider">
              Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => handleServiceClick('mobile_grooming')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Mobile Grooming Van
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleServiceClick('mobile_vet')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Mobile Vet Clinic Van
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleServiceClick('grooming')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Pet Grooming Salon
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleServiceClick('vet_consult')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Veterinary Care &amp; Consult
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleServiceClick('walking')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  GPS-Tracked Dog Walking
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleServiceClick('sitting')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Pet Sitting &amp; Host Stays
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleServiceClick('training')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Positive Canine Training
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleServiceClick('adoption')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Adoption &amp; Shelter Rescue
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 3 — COMPANY */}
          <div className="space-y-3">
            <h4 className="font-quicksand font-bold text-sm text-white uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  type="button"
                  onClick={() => openInfoModal('about')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  About Zooby
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openInfoModal('contact')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openInfoModal('careers')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Careers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => (onNavigate ? onNavigate('/provider/register') : null)}
                  className="text-amber-400 font-bold hover:underline cursor-pointer text-left"
                >
                  Partner With Us (Vets &amp; Groomers)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => (onNavigate ? onNavigate('/rescue/dashboard') : null)}
                  className="text-emerald-400 font-bold hover:underline cursor-pointer text-left"
                >
                  Rescue Partner Portal
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 4 — SUPPORT */}
          <div className="space-y-3">
            <h4 className="font-quicksand font-bold text-sm text-white uppercase tracking-wider">
              Support &amp; Safety
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  type="button"
                  onClick={() => openInfoModal('help')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Help Center &amp; FAQs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleSOSClick}
                  className="text-rose-400 font-bold hover:underline cursor-pointer text-left flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">emergency</span>
                  <span>24/7 Emergency Support</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openInfoModal('trust')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Trust &amp; Safety Guarantee
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openInfoModal('terms')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openInfoModal('privacy')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 5 — ZOOBY LOCATIONS */}
          <div className="space-y-3">
            <h4 className="font-quicksand font-bold text-sm text-white uppercase tracking-wider">
              Zooby Locations
            </h4>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Select your city to view available Zooby services and mobile care coverage.
            </p>
            <div className="space-y-1.5 pt-1">
              {supportedCities.map((c) => {
                const isSelected = c.id === currentCity.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCityById(c.id)}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#895100] text-white font-bold shadow-xs'
                        : 'bg-stone-900 text-stone-300 hover:bg-stone-800 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      <span>{c.name}</span>
                    </span>
                    {c.isPrimary ? (
                      <span className="text-[9px] uppercase bg-amber-400 text-black font-extrabold px-1.5 py-0.2 rounded">
                        PRIMARY
                      </span>
                    ) : isSelected ? (
                      <span className="text-[10px] text-amber-300 font-bold">Active</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* FOOTER BOTTOM BAR */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone-500">
          <div>
            &copy; 2026 Zooby Care India Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => openInfoModal('privacy')}
              className="hover:text-stone-300 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => openInfoModal('terms')}
              className="hover:text-stone-300 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => openInfoModal('trust')}
              className="hover:text-stone-300 transition-colors cursor-pointer"
            >
              Trust &amp; Safety
            </button>
          </div>
        </div>
      </div>

      {/* Global Multi-Tab Info Modal */}
      <CompanyInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        initialTab={infoModalTab}
        onOpenSOS={onOpenSOS}
        onOpenBooking={handleServiceClick}
        onNavigate={onNavigate}
      />
    </footer>
  );
};
