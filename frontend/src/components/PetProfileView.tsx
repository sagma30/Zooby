import React, { useState } from 'react';
import { Pet, HealthEvent, ServiceCategory } from '../types';

interface PetProfileViewProps {
  pet?: Pet;
  selectedPet?: Pet;
  allPets?: Pet[];
  pets?: Pet[];
  onSelectPet: (pet: Pet) => void;
  onOpenAddHealthEvent?: (pet: Pet) => void;
  onOpenAddEvent?: (pet: Pet) => void;
  onOpenBookService: (category?: ServiceCategory, pet?: Pet) => void;
  onOpenEditProfile?: (pet: Pet) => void;
  onOpenEditPet?: (pet: Pet) => void;
}

export const PetProfileView: React.FC<PetProfileViewProps> = ({
  pet: propPet,
  selectedPet: propSelectedPet,
  allPets: propAllPets,
  pets: propPets,
  onSelectPet,
  onOpenAddHealthEvent,
  onOpenAddEvent,
  onOpenBookService,
  onOpenEditProfile,
  onOpenEditPet
}) => {
  const petsList = propAllPets || propPets || [];
  const pet = propPet || propSelectedPet || petsList[0];

  const handleAddHealthEvent = onOpenAddHealthEvent || onOpenAddEvent || (() => {});
  const handleEditProfile = onOpenEditProfile || onOpenEditPet || (() => {});

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [locationData, setLocationData] = useState(() => pet?.liveLocation || {
    status: 'At Home' as const,
    locationText: 'Gangapur Road, Nashik',
    lastUpdated: 'Just now',
    battery: 88,
    isSafeZone: true,
    city: 'Nashik',
    state: 'Maharashtra',
    mapImage: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600'
  });
  const [copiedShare, setCopiedShare] = useState(false);

  // Sync location data when active pet changes
  React.useEffect(() => {
    if (pet?.liveLocation) {
      setLocationData(pet.liveLocation);
    }
  }, [pet?.id, pet?.liveLocation]);

  if (!pet) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-16 text-center">
        <div className="w-16 h-16 bg-[#ffdcbc]/40 rounded-full flex items-center justify-center text-[#895100] mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl">pets</span>
        </div>
        <h2 className="font-quicksand font-bold text-2xl text-[#1b1c1a] mb-2">No Pet Profile Selected</h2>
        <p className="text-sm text-[#877462]">Please select or add a pet to view their health timeline and records.</p>
      </div>
    );
  }

  // Filtered health events
  const healthEventsList = pet.healthEvents || [];
  const filteredEvents = healthEventsList.filter((event) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'vaccination') return event.eventType === 'vaccination';
    if (filterCategory === 'checkup') return event.eventType === 'routine_checkup' || event.eventType === 'vet_visit';
    if (filterCategory === 'medication') return event.eventType === 'medication' || event.eventType === 'treatment';
    return true;
  });

  const handleRefreshLocation = () => {
    setIsRefreshingLocation(true);
    setTimeout(() => {
      const statuses: Array<'At Home' | 'On a Walk' | 'At Vet' | 'With Sitter'> = [
        'At Home',
        'On a Walk',
        'At Home'
      ];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setLocationData((prev) => ({
        ...prev,
        status: randomStatus,
        lastUpdated: 'Just now',
        battery: Math.max(70, Math.min(100, prev.battery - 1))
      }));
      setIsRefreshingLocation(false);
    }, 600);
  };

  const handleShare = () => {
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-10 animate-fade-in">
      {/* Pet Switcher Bar if multiple pets */}
      {petsList.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-semibold text-[#877462] uppercase tracking-wider mr-2 shrink-0">
            Switch Profile:
          </span>
          {petsList.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPet(p)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                p.id === pet.id
                  ? 'bg-[#895100] text-white shadow-xs'
                  : 'bg-white text-[#544434] border border-[#dac2ae]/60 hover:bg-[#efeeea]'
              }`}
            >
              <img src={p.photoUrl} alt={p.name} className="w-5 h-5 rounded-full object-cover" />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Hero Profile Header */}
      <section className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* Avatar */}
        <div className="w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-[#895100] overflow-hidden shadow-lg shrink-0 relative bg-white">
          <img
            src={pet.photoUrl}
            alt={pet.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <div
            className="absolute bottom-1 right-1 bg-[#41674b] w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white"
            title="Active & Monitored"
          >
            <span className="material-symbols-outlined text-[14px] filled-icon">pets</span>
          </div>
        </div>

        {/* Info & Action Buttons */}
        <div className="text-center md:text-left flex-grow">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
            <h1 className="font-quicksand font-bold text-4xl md:text-5xl text-[#895100]">
              {pet.name}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="bg-[#efeeea] px-3 py-1 rounded-xl text-xs font-bold text-[#544434] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">pets</span>
                {pet.breed}
              </span>
              <span className="bg-[#efeeea] px-3 py-1 rounded-xl text-xs font-bold text-[#544434] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">cake</span>
                {pet.age}
              </span>
              <span className="bg-[#efeeea] px-3 py-1 rounded-xl text-xs font-bold text-[#544434] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {pet.location}
              </span>
            </div>
          </div>

          <p className="text-base text-[#544434] max-w-2xl mb-6 leading-relaxed">
            {pet.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <button
              id="profile-add-health-event-btn"
              onClick={() => handleAddHealthEvent(pet)}
              className="bg-[#ff9f1c] hover:bg-[#ff8f00] text-[#683c00] font-jakarta font-bold text-sm px-6 py-3 rounded-full transition-all shadow-[0_4px_12px_rgba(255,159,28,0.35)] hover:shadow-none active:translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] filled-icon">add_circle</span>
              <span>Add Health Event</span>
            </button>

            <button
              id="profile-book-service-btn"
              onClick={() => onOpenBookService(undefined, pet)}
              className="border-2 border-[#475b9c] text-[#475b9c] hover:bg-[#a2b6fd]/20 font-jakarta font-bold text-sm px-6 py-3 rounded-full transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span>Book Service</span>
            </button>

            <button
              id="profile-edit-btn"
              onClick={() => handleEditProfile(pet)}
              className="border border-[#dac2ae] text-[#544434] hover:bg-[#efeeea] font-jakarta font-semibold text-sm px-4 py-3 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>Edit Profile</span>
            </button>

            <button
              id="profile-share-btn"
              onClick={handleShare}
              className="border border-[#dac2ae] text-[#544434] hover:bg-[#efeeea] font-jakarta font-semibold text-sm px-4 py-3 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copiedShare ? 'check' : 'share'}
              </span>
              <span>{copiedShare ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Bento Grid: Left Column Vitals & Map | Right Column Health Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (4 cols): Vital Info + Live Location + Book Service promo */}
        <div className="lg:col-span-4 space-y-6">
          {/* Vital Information Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#e5e0d8] shadow-xs">
            <h2 className="font-quicksand font-bold text-xl text-[#895100] mb-5 flex items-center gap-2 border-b border-[#efeeea] pb-3">
              <span className="material-symbols-outlined text-[#41674b] filled-icon">vital_signs</span>
              Vital Information
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-[#f5f3ef] pb-3">
                <span className="text-[#877462] font-medium">Blood Group</span>
                <span className="font-bold text-[#1b1c1a]">{pet.bloodGroup}</span>
              </div>

              <div className="flex items-center justify-between border-b border-[#f5f3ef] pb-3">
                <span className="text-[#877462] font-medium">Allergies</span>
                <span className="font-bold text-[#41674b] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  {pet.allergies}
                </span>
              </div>

              <div className="flex flex-col gap-1 border-b border-[#f5f3ef] pb-3">
                <span className="text-[#877462] font-medium">Current Medications</span>
                <span className="font-semibold text-[#1b1c1a] text-xs bg-[#f5f3ef] p-2 rounded-lg mt-1">
                  {pet.currentMedications}
                </span>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <span className="text-[#877462] font-medium">Service Preferences</span>
                <div className="flex flex-wrap gap-2">
                  {pet.servicePreferences.map((pref, i) => (
                    <span
                      key={i}
                      className="bg-[#dce1ff] text-[#00164d] px-3 py-1 rounded-full text-xs font-semibold"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Location Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#e5e0d8] shadow-xs">
            <h2 className="font-quicksand font-bold text-xl text-[#895100] mb-4 flex items-center gap-2 border-b border-[#efeeea] pb-3">
              <span className="material-symbols-outlined text-[#475b9c] filled-icon">location_on</span>
              Live Location
            </h2>

            {/* Map Preview */}
            <div className="relative rounded-xl overflow-hidden mb-4 h-36 bg-[#efeeea] border border-[#dac2ae]/40">
              <img
                src={locationData.mapImage}
                alt="Pet location map"
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-5 h-5 bg-[#895100] rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[12px]">pets</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#41674b] rounded-full border-2 border-white animate-ping" />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-bold text-[#1b1c1a] shadow-xs">
                {locationData.city}, {locationData.state}
              </div>
            </div>

            {/* Location Meta */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#877462] uppercase tracking-wider font-semibold">Status</span>
                <span className="text-[#41674b] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#41674b] rounded-full animate-pulse" />
                  {locationData.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#877462] uppercase tracking-wider font-semibold">Battery</span>
                <span className="text-[#1b1c1a] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#41674b]">battery_5_bar</span>
                  {locationData.battery}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#877462] uppercase tracking-wider font-semibold">Last Updated</span>
                <span className="text-[#544434] font-medium">{locationData.lastUpdated}</span>
              </div>
            </div>

            <button
              id="refresh-location-btn"
              onClick={handleRefreshLocation}
              disabled={isRefreshingLocation}
              className="w-full mt-4 py-2 border-2 border-[#895100] text-[#895100] hover:bg-[#ffdcbc]/20 rounded-full text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-sm ${isRefreshingLocation ? 'animate-spin' : ''}`}>
                refresh
              </span>
              <span>{isRefreshingLocation ? 'Pinging Beacon...' : 'Refresh Location'}</span>
            </button>
          </div>

          {/* Book a Service Promo Card */}
          <div className="bg-[#41674b] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute -right-5 -top-5 opacity-15 pointer-events-none">
              <span className="material-symbols-outlined text-[130px]">pets</span>
            </div>
            <h3 className="font-quicksand font-bold text-2xl mb-1.5 relative z-10">
              Book a Service
            </h3>
            <p className="text-xs text-[#c2edca] mb-5 relative z-10 leading-relaxed">
              Schedule grooming, walking, or trusted veterinary visits for {pet.name} today.
            </p>
            <button
              id="promo-book-now-btn"
              onClick={() => onOpenBookService(undefined, pet)}
              className="bg-white text-[#41674b] hover:bg-[#f5f3ef] font-jakarta font-bold text-xs px-6 py-2.5 rounded-full transition-colors relative z-10 w-full shadow-xs cursor-pointer active:scale-98"
            >
              Book Now
            </button>
          </div>
        </div>

        {/* Right Column (8 cols): Health Timeline */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#e5e0d8] shadow-xs">
            {/* Timeline Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-[#efeeea] pb-4">
              <h2 className="font-quicksand font-bold text-2xl text-[#895100] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#475b9c] filled-icon">history</span>
                Health Timeline
              </h2>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#877462] font-semibold">Filter:</span>
                <div className="flex bg-[#f5f3ef] p-1 rounded-xl gap-1 text-xs font-semibold">
                  <button
                    onClick={() => setFilterCategory('all')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      filterCategory === 'all'
                        ? 'bg-white text-[#895100] shadow-xs font-bold'
                        : 'text-[#544434] hover:text-[#1b1c1a]'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterCategory('vaccination')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      filterCategory === 'vaccination'
                        ? 'bg-white text-[#895100] shadow-xs font-bold'
                        : 'text-[#544434] hover:text-[#1b1c1a]'
                    }`}
                  >
                    Vaccines
                  </button>
                  <button
                    onClick={() => setFilterCategory('checkup')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      filterCategory === 'checkup'
                        ? 'bg-white text-[#895100] shadow-xs font-bold'
                        : 'text-[#544434] hover:text-[#1b1c1a]'
                    }`}
                  >
                    Checkups
                  </button>
                  <button
                    onClick={() => setFilterCategory('medication')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      filterCategory === 'medication'
                        ? 'bg-white text-[#895100] shadow-xs font-bold'
                        : 'text-[#544434] hover:text-[#1b1c1a]'
                    }`}
                  >
                    Medication
                  </button>
                </div>
              </div>
            </div>

            {/* Timeline Vertical Track */}
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-[#877462] space-y-3">
                <span className="material-symbols-outlined text-4xl text-[#dac2ae]">medical_information</span>
                <p className="text-sm font-medium">No health events recorded in this category yet.</p>
                <button
                  onClick={() => handleAddHealthEvent(pet)}
                  className="text-xs font-bold text-[#895100] hover:underline cursor-pointer"
                >
                  + Add First Health Record
                </button>
              </div>
            ) : (
              <div className="relative pl-7 md:pl-9 before:content-[''] before:absolute before:left-[14px] md:before:left-[17px] before:top-3 before:bottom-3 before:w-[2px] before:bg-[#dce1ff] space-y-7">
                {filteredEvents.map((event) => {
                  const isUpcoming = event.isUpcoming;
                  const isVaccine = event.eventType === 'vaccination';
                  const isCheckup = event.eventType === 'routine_checkup' || event.eventType === 'vet_visit';

                  // Badge & Node Styling
                  let nodeBg = 'bg-[#dce1ff] text-[#314685]';
                  let nodeIcon = 'medical_services';

                  if (isUpcoming) {
                    nodeBg = 'bg-[#ffdcbc] text-[#683c00]';
                    nodeIcon = 'warning';
                  } else if (isVaccine) {
                    nodeBg = 'bg-[#c2edca] text-[#294e35]';
                    nodeIcon = 'vaccines';
                  } else if (isCheckup) {
                    nodeBg = 'bg-[#dce1ff] text-[#314685]';
                    nodeIcon = 'health_and_safety';
                  } else if (event.eventType === 'treatment') {
                    nodeBg = 'bg-[#ffdcbc] text-[#683c00]';
                    nodeIcon = 'bug_report';
                  }

                  return (
                    <div key={event.id} className="relative group">
                      {/* Circle node icon */}
                      <div
                        className={`absolute -left-[35px] md:-left-[39px] top-1.5 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-xs z-10 ${nodeBg}`}
                      >
                        <span className="material-symbols-outlined text-[16px] filled-icon">
                          {nodeIcon}
                        </span>
                      </div>

                      {/* Card Content */}
                      <div
                        className={`bg-[#fbf9f5] rounded-xl p-5 border transition-all ${
                          isUpcoming
                            ? 'border-l-4 border-l-[#ff9f1c] border-[#efeeea] shadow-2xs'
                            : 'border-[#efeeea] hover:border-[#dac2ae]'
                        }`}
                      >
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-1.5">
                          <h4 className="font-quicksand font-bold text-base md:text-lg text-[#1b1c1a]">
                            {event.eventTitle}
                          </h4>

                          {isUpcoming ? (
                            <span className="bg-[#ffdad6] text-[#93000a] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                              Upcoming
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-[#877462] bg-[#eae8e4] px-2.5 py-0.5 rounded-md">
                              {event.date}
                            </span>
                          )}
                        </div>

                        {event.administeredBy && (
                          <p className="text-xs text-[#544434] mb-2 flex items-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-[14px] text-[#877462]">
                              local_hospital
                            </span>
                            <span>{event.administeredBy}</span>
                          </p>
                        )}

                        <p className="text-sm text-[#544434] leading-relaxed">
                          {event.notes}
                        </p>

                        {/* Callout if checkup notes */}
                        {isCheckup && event.notes && (
                          <div className="mt-3 bg-white rounded-lg p-3 text-xs text-[#1b1c1a] border border-[#efeeea] border-l-3 border-l-[#475b9c]">
                            <strong className="text-[#475b9c]">Clinical Observation:</strong> {event.notes}
                          </div>
                        )}

                        {/* Action link for upcoming items */}
                        {isUpcoming && (
                          <div className="mt-3.5 pt-3 border-t border-[#efeeea] flex items-center justify-between">
                            <button
                              id={`schedule-appt-${event.id}`}
                              onClick={() => onOpenBookService('vet_consult', pet)}
                              className="text-xs font-bold text-[#895100] hover:text-[#683c00] flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              <span>Schedule Appointment</span>
                              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </button>
                            {event.reminderEnabled && (
                              <span className="text-[11px] text-[#41674b] flex items-center gap-1 font-semibold">
                                <span className="material-symbols-outlined text-[14px]">alarm_on</span>
                                Reminder set ({event.reminderDate || event.date})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick add health event footer inside card */}
            <div className="mt-8 pt-6 border-t border-[#efeeea] flex justify-between items-center">
              <span className="text-xs text-[#877462]">
                Total {filteredEvents.length} medical and wellness records
              </span>
              <button
                id="timeline-add-event-btn"
                onClick={() => handleAddHealthEvent(pet)}
                className="text-xs font-bold text-[#895100] hover:text-[#683c00] flex items-center gap-1.5 cursor-pointer bg-[#ffdcbc]/40 px-3.5 py-1.5 rounded-full hover:bg-[#ffdcbc]/70 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
                <span>Add Record</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
