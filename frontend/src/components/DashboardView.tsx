import React from 'react';
import { Pet, AgendaItem, NotificationUpdate, ServiceCategory, VanLocation, Booking } from '../types';
import { ZoobyRealMap } from './common/ZoobyRealMap';
import { calculateDistanceKm, calculateTravelEtaMinutes } from '../services/gpsTracking';

interface DashboardViewProps {
  pets: Pet[];
  onSelectPet: (pet: Pet) => void;
  onNavigateTab: (tab: string) => void;
  onSelectCategory: (category: ServiceCategory) => void;
  onOpenAddHealthEvent: (pet: Pet) => void;
  onOpenAddPet: () => void;
  agenda: AgendaItem[];
  updates: NotificationUpdate[];
  activeVanLocation?: VanLocation | null;
  activeBooking?: Booking | null;
  onOpenSOS?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  pets,
  onSelectPet,
  onNavigateTab,
  onSelectCategory,
  onOpenAddHealthEvent,
  onOpenAddPet,
  agenda,
  updates,
  activeVanLocation,
  activeBooking,
  onOpenSOS
}) => {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-10 animate-fade-in">
      {/* Hero Greeting */}
      <div>
        <h1 className="font-quicksand font-bold text-3xl md:text-5xl text-[#1b1c1a] tracking-tight">
          Good morning, Rohan!
        </h1>
        <p className="font-jakarta text-base md:text-lg text-[#544434] mt-2">
          Here's what's happening with your furry friends today.
        </p>
      </div>

      {/* Main Grid: Left 2 Columns, Right 1 Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: My Pets + Book a Service */}
        <div className="lg:col-span-8 space-y-10">
          {/* Section: My Pets */}
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                My Pets
              </h2>
              <button
                id="view-all-pets-btn"
                onClick={() => onNavigateTab('mypets')}
                className="text-sm font-semibold text-[#895100] hover:text-[#683c00] hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            {/* Pets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  className="bg-white rounded-2xl p-5 border border-[#e5e0d8] shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
                >
                  {/* Organic background accent in top corner */}
                  <div className="absolute top-0 right-0 w-28 h-28 bg-[#f5f3ef] rounded-bl-full pointer-events-none -z-0 opacity-80" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#ff9f1c] shadow-xs shrink-0">
                        <img
                          src={pet.photoUrl}
                          alt={pet.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div>
                        <h3 className="font-quicksand font-bold text-xl text-[#1b1c1a]">
                          {pet.name}
                        </h3>
                        <p className="text-xs text-[#544434] font-medium">{pet.breed}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="space-y-2 mb-5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        {pet.isAttentionNeeded ? (
                          <span className="flex items-center gap-1 text-[#ba1a1a]">
                            <span className="material-symbols-outlined text-[16px]">medical_services</span>
                            <span>{pet.vaccinationStatus}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[#41674b]">
                            <span className="material-symbols-outlined text-[16px] filled-icon">check_circle</span>
                            <span>{pet.vaccinationStatus}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-[#544434]">
                        <span className="material-symbols-outlined text-[15px] text-[#877462]">scale</span>
                        <span>{pet.weight} • {pet.healthStatusText}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative z-10 pt-2 flex flex-col gap-2">
                    <button
                      id={`view-profile-${pet.id}`}
                      onClick={() => onSelectPet(pet)}
                      className="w-full py-2.5 px-4 rounded-full border-2 border-[#475b9c] text-[#475b9c] hover:bg-[#a2b6fd]/20 text-xs font-bold transition-all text-center cursor-pointer active:scale-98"
                    >
                      View Profile
                    </button>
                    <button
                      id={`add-health-event-${pet.id}`}
                      onClick={() => onOpenAddHealthEvent(pet)}
                      className="w-full py-1.5 px-3 rounded-full text-[11px] font-semibold text-[#895100] hover:bg-[#ffdcbc]/30 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">add_circle</span>
                      <span>Log Health Event</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Pet Card */}
              <button
                id="dashboard-add-pet-card"
                onClick={onOpenAddPet}
                className="bg-[#fbf9f5] hover:bg-white rounded-2xl p-5 border-2 border-dashed border-[#dac2ae] hover:border-[#895100] flex flex-col items-center justify-center gap-2 min-h-[220px] transition-all cursor-pointer text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-[#ffdcbc]/40 text-[#895100] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">add</span>
                </div>
                <span className="font-quicksand font-bold text-base text-[#1b1c1a]">
                  Add Another Pet
                </span>
                <span className="text-xs text-[#544434] max-w-[160px]">
                  Track digital health records and book services
                </span>
              </button>
            </div>
          </div>

          {/* Section: Book a Service */}
          <div>
            <h2 className="font-quicksand font-bold text-2xl text-[#1b1c1a] mb-5">
              Book a Service
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Grooming */}
              <button
                id="service-category-grooming"
                onClick={() => onSelectCategory('grooming')}
                className="bg-white rounded-2xl p-6 border border-[#e5e0d8] shadow-2xs hover:shadow-md hover:border-[#ff9f1c] transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer group active:scale-98"
              >
                <div className="w-16 h-16 rounded-full bg-[#ffdcbc]/50 text-[#895100] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">content_cut</span>
                </div>
                <span className="font-quicksand font-bold text-base text-[#1b1c1a]">
                  Grooming
                </span>
              </button>

              {/* Walking */}
              <button
                id="service-category-walking"
                onClick={() => onSelectCategory('walking')}
                className="bg-white rounded-2xl p-6 border border-[#e5e0d8] shadow-2xs hover:shadow-md hover:border-[#41674b] transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer group active:scale-98"
              >
                <div className="w-16 h-16 rounded-full bg-[#c2edca]/50 text-[#294e35] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">directions_walk</span>
                </div>
                <span className="font-quicksand font-bold text-base text-[#1b1c1a]">
                  Walking
                </span>
              </button>

              {/* Sitting */}
              <button
                id="service-category-sitting"
                onClick={() => onSelectCategory('sitting')}
                className="bg-white rounded-2xl p-6 border border-[#e5e0d8] shadow-2xs hover:shadow-md hover:border-[#475b9c] transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer group active:scale-98"
              >
                <div className="w-16 h-16 rounded-full bg-[#dce1ff]/60 text-[#314685] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">chair</span>
                </div>
                <span className="font-quicksand font-bold text-base text-[#1b1c1a]">
                  Sitting
                </span>
              </button>

              {/* Vet Consults */}
              <button
                id="service-category-vet"
                onClick={() => onSelectCategory('vet_consult')}
                className="bg-white rounded-2xl p-6 border border-[#e5e0d8] shadow-2xs hover:shadow-md hover:border-[#ba1a1a] transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer group active:scale-98"
              >
                <div className="w-16 h-16 rounded-full bg-[#ffdad6]/60 text-[#93000a] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">local_hospital</span>
                </div>
                <span className="font-quicksand font-bold text-base text-[#1b1c1a]">
                  Vet Consults
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Agenda & Recent Updates */}
        <div className="lg:col-span-4 space-y-6">
          {/* 🔴 24/7 Rapid Van SOS Quick Action Card */}
          {onOpenSOS && (
            <div className="bg-gradient-to-r from-rose-600 to-red-600 rounded-2xl p-4 text-white shadow-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold animate-pulse">
                  <span className="material-symbols-outlined text-2xl filled-icon">emergency</span>
                </div>
                <div>
                  <h3 className="font-quicksand font-bold text-base leading-tight">24/7 Rapid Van SOS</h3>
                  <p className="text-[11px] text-rose-100">AI Triage &amp; Instant Emergency Dispatch</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenSOS}
                className="py-2 px-3.5 rounded-xl bg-white text-rose-700 font-extrabold text-xs shadow-xs hover:bg-rose-50 transition-all cursor-pointer active:scale-95 shrink-0"
              >
                Trigger SOS
              </button>
            </div>
          )}

          {/* 🚐 "Your Zooby Van" Live Real-time GPS Tracking Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5e0d8] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#895100] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-lg">local_shipping</span>
                </div>
                <div>
                  <h2 className="font-quicksand font-bold text-base text-[#1b1c1a] leading-tight">
                    Your Zooby Van
                  </h2>
                  <span className="text-[11px] text-[#716153]">
                    {activeVanLocation?.vanPlate || 'MH 15 ZB 4022 (Unit #1)'}
                  </span>
                </div>
              </div>

              {/* Status Pill */}
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{activeVanLocation?.trackingStatus === 'ACTIVE' ? 'Live GPS En Route' : 'Scheduled'}</span>
              </span>
            </div>

            {/* Interactive Leaflet GPS Map */}
            <ZoobyRealMap
              height="190px"
              userPosition={{
                lat: 20.0055, // Pet Parent Doorstep (Gangapur Road, Nashik)
                lng: 73.7650,
                title: 'Your Doorstep (Bruno)'
              }}
              vanPosition={{
                lat: activeVanLocation?.latitude ?? 19.9975, // Live Van Coordinates
                lng: activeVanLocation?.longitude ?? 73.7898,
                plate: activeVanLocation?.vanPlate || 'MH 15 ZB 4022',
                status: 'En Route'
              }}
              showRouteLine={true}
              zoom={13}
            />

            {/* Real Distance & Calculated ETA Banner */}
            <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#efeeea] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#877462] block text-[10px] uppercase font-bold">Driver / Tech</span>
                <strong className="text-[#1b1c1a]">{activeVanLocation?.workerName || 'Vikram Pawar'}</strong>
              </div>

              <div className="text-right">
                <span className="text-[#877462] block text-[10px] uppercase font-bold">Estimated Arrival</span>
                <strong className="text-[#895100] text-sm font-bold">
                  {calculateTravelEtaMinutes(
                    calculateDistanceKm(
                      20.0055,
                      73.7650,
                      activeVanLocation?.latitude ?? 19.9975,
                      activeVanLocation?.longitude ?? 73.7898
                    )
                  )
                    ? `${calculateTravelEtaMinutes(
                        calculateDistanceKm(
                          20.0055,
                          73.7650,
                          activeVanLocation?.latitude ?? 19.9975,
                          activeVanLocation?.longitude ?? 73.7898
                        )
                      )} mins (${calculateDistanceKm(
                        20.0055,
                        73.7650,
                        activeVanLocation?.latitude ?? 19.9975,
                        activeVanLocation?.longitude ?? 73.7898
                      )} km)`
                    : 'ETA unavailable'}
                </strong>
              </div>
            </div>
          </div>

          {/* Upcoming Agenda Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#e5e0d8] shadow-xs">
            <h2 className="font-quicksand font-bold text-xl text-[#1b1c1a] mb-5 flex items-center gap-2">
              Upcoming Agenda
            </h2>

            <div className="space-y-4">
              {agenda.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#fbf9f5] rounded-xl p-4 border border-[#efeeea] relative pl-4 border-l-4 border-l-[#ff9f1c]"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        item.category === 'Grooming'
                          ? 'bg-[#ffdcbc] text-[#683c00]'
                          : 'bg-[#c2edca] text-[#294e35]'
                      }`}
                    >
                      {item.category}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        item.dueBadge.includes('Left')
                          ? 'text-[#ba1a1a]'
                          : 'text-[#544434]'
                      }`}
                    >
                      {item.dueBadge}
                    </span>
                  </div>

                  <h3 className="font-quicksand font-bold text-base text-[#1b1c1a] mt-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#544434] mt-0.5">
                    {item.timeText} • {item.locationOrDoctor}
                  </p>

                  {item.actionType === 'book_vet' && (
                    <button
                      id="book-vet-agenda-btn"
                      onClick={() => onSelectCategory('vet_consult')}
                      className="mt-3 text-xs font-bold text-[#895100] hover:text-[#683c00] flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>Book Vet Now</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  )}

                  {item.actionType === 'view_booking' && (
                    <button
                      id="view-booking-agenda-btn"
                      onClick={() => onNavigateTab('history')}
                      className="mt-3 text-xs font-bold text-[#475b9c] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Confirmed Booking</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Updates Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#e5e0d8] shadow-xs">
            <h2 className="font-quicksand font-bold text-xl text-[#1b1c1a] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#475b9c] text-[20px]">notifications_active</span>
              Recent Updates
            </h2>

            <div className="space-y-3">
              {updates.map((update) => (
                <div key={update.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-[#fbf9f5] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#dce1ff] text-[#314685] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[16px] filled-icon">
                      {update.type === 'booking' ? 'check' : update.type === 'reminder' ? 'notifications' : 'pets'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#1b1c1a] leading-snug">
                      {update.text}
                    </p>
                    <span className="text-[11px] text-[#877462] mt-0.5 block">
                      {update.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
