import React, { useState } from 'react';
import { Pet, HealthEvent } from '../types';

interface AddHealthEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet?: Pet;
  petName?: string;
  allPets?: Pet[];
  onSelectPet?: (pet: Pet) => void;
  onSave?: (event: HealthEvent) => void;
  onSaveHealthEvent?: (petId: string, event: HealthEvent) => void;
}

export const AddHealthEventModal: React.FC<AddHealthEventModalProps> = ({
  isOpen,
  onClose,
  pet,
  petName,
  allPets = [],
  onSelectPet,
  onSave,
  onSaveHealthEvent
}) => {
  const [eventType, setEventType] = useState<HealthEvent['eventType']>('vaccination');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [clinic, setClinic] = useState('');
  const [notes, setNotes] = useState('');
  const [setReminder, setSetReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPet = pet || allPets[0] || {
    id: 'pet-fallback',
    name: petName || 'Pet',
    breed: 'Companion Pet',
    photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) {
      setError('Please provide an event title (e.g. Annual Rabies Shot)');
      return;
    }

    const newEvent: HealthEvent = {
      id: 'event-' + Date.now(),
      petId: currentPet.id,
      eventType,
      eventTitle: eventTitle.trim(),
      date: eventDate,
      administeredBy: clinic.trim() || 'Veterinary Care Provider',
      notes: notes.trim(),
      reminderEnabled: setReminder,
      reminderDate: setReminder ? reminderDate || eventDate : undefined,
      isUpcoming: new Date(eventDate) > new Date(),
      statusBadge: new Date(eventDate) > new Date() ? 'Upcoming' : 'Status: Completed'
    };

    if (onSaveHealthEvent) {
      onSaveHealthEvent(currentPet.id, newEvent);
    } else if (onSave) {
      onSave(newEvent);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fbf9f5] w-full max-w-[620px] rounded-2xl md:rounded-3xl shadow-2xl border border-[#e5e0d8] overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Top App Bar */}
        <div className="sticky top-0 bg-[#fbf9f5]/95 backdrop-blur-md px-6 py-4 border-b border-[#efeeea] flex items-center justify-between z-20">
          <button
            id="close-add-event-btn"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#544434] hover:bg-[#efeeea] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>

          <h2 className="font-quicksand font-bold text-xl md:text-2xl text-[#895100] text-center">
            Add Health Event
          </h2>

          <button
            id="save-event-top-btn"
            onClick={handleSubmit}
            className="font-jakarta font-bold text-sm text-[#895100] hover:bg-[#efeeea] px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            Save
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 md:p-8 max-h-[85vh] overflow-y-auto space-y-6">
          {/* Pet Profile Context Header */}
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="relative">
              <div className="w-22 h-22 rounded-full overflow-hidden border-3 border-[#41674b] shadow-md bg-white">
                <img
                  src={currentPet.photoUrl}
                  alt={currentPet.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 bg-[#ff9f1c] text-[#683c00] rounded-full w-7 h-7 flex items-center justify-center border-2 border-white shadow-xs">
                <span className="material-symbols-outlined text-[15px] filled-icon">
                  medical_services
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                {currentPet.name}
              </h3>
              <p className="text-xs text-[#544434] font-medium">
                {currentPet.breed} • Health Record
              </p>
            </div>

            {/* Quick pet switch if user has multiple pets */}
            {allPets.length > 1 && (
              <div className="flex gap-2 mt-1">
                {allPets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectPet && onSelectPet(p)}
                    className={`text-[11px] px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                      p.id === currentPet.id
                        ? 'bg-[#895100] text-white'
                        : 'bg-[#efeeea] text-[#544434] hover:bg-[#dac2ae]/50'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-2xl p-6 md:p-7 border border-[#e5e0d8] shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-[#ffdad6] text-[#93000a] text-xs font-semibold p-3 rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Event Type Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#00164d] tracking-wide" htmlFor="eventType">
                  Event Type
                </label>
                <div className="relative">
                  <select
                    id="eventType"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full bg-[#fbf9f5] border border-[#dac2ae] rounded-xl px-4 py-3 pr-10 text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100] focus:border-transparent transition-colors cursor-pointer appearance-none"
                  >
                    <option value="vaccination">Vaccination</option>
                    <option value="medication">Medication</option>
                    <option value="routine_checkup">Routine Checkup / Vet Consult</option>
                    <option value="surgery">Surgery</option>
                    <option value="allergy">Allergy Assessment</option>
                    <option value="treatment">Treatment (Deworming, Anti-Tick)</option>
                    <option value="other">Other Wellness Event</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#544434]">
                    <span className="material-symbols-outlined text-lg">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Event Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#00164d] tracking-wide" htmlFor="eventTitle">
                  Event Title
                </label>
                <input
                  id="eventTitle"
                  type="text"
                  value={eventTitle}
                  onChange={(e) => {
                    setEventTitle(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={
                    eventType === 'vaccination'
                      ? 'e.g. Annual Rabies Shot / DHPP Vaccine'
                      : eventType === 'medication'
                      ? 'e.g. Heartworm Preventative, De-worming'
                      : 'e.g. Dental Cleaning, Annual Physical'
                  }
                  className="w-full bg-[#fbf9f5] border border-[#dac2ae] rounded-xl px-4 py-3 text-sm text-[#1b1c1a] placeholder:text-[#877462] focus:outline-none focus:ring-2 focus:ring-[#895100] focus:border-transparent transition-colors"
                />
              </div>

              {/* Date of Event */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#00164d] tracking-wide" htmlFor="eventDate">
                    Date of Event
                  </label>
                  <div className="relative">
                    <input
                      id="eventDate"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-[#fbf9f5] border border-[#dac2ae] rounded-xl px-4 py-3 pl-10 text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100] focus:border-transparent transition-colors cursor-pointer"
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#544434]">
                      <span className="material-symbols-outlined text-base">calendar_today</span>
                    </div>
                  </div>
                </div>

                {/* Administered By / Clinic */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#00164d] tracking-wide" htmlFor="clinic">
                    Administered By / Clinic
                  </label>
                  <div className="relative">
                    <input
                      id="clinic"
                      type="text"
                      value={clinic}
                      onChange={(e) => setClinic(e.target.value)}
                      placeholder="e.g. Happy Paws Clinic / Dr. Smith"
                      className="w-full bg-[#fbf9f5] border border-[#dac2ae] rounded-xl px-4 py-3 pl-10 text-sm text-[#1b1c1a] placeholder:text-[#877462] focus:outline-none focus:ring-2 focus:ring-[#895100] focus:border-transparent transition-colors"
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#544434]">
                      <span className="material-symbols-outlined text-base">local_hospital</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes (Optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#00164d] tracking-wide" htmlFor="notes">
                  Notes &amp; Observations (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any specific details, symptoms, dosage, or instructions..."
                  rows={3}
                  className="w-full bg-[#fbf9f5] border border-[#dac2ae] rounded-xl px-4 py-3 text-sm text-[#1b1c1a] placeholder:text-[#877462] focus:outline-none focus:ring-2 focus:ring-[#895100] focus:border-transparent transition-colors resize-none"
                />
              </div>

              {/* Set Reminder Section */}
              <div className="pt-4 border-t border-[#dac2ae]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#c2edca] text-[#294e35] flex items-center justify-center">
                      <span className="material-symbols-outlined text-base filled-icon">
                        notifications_active
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#1b1c1a]">Set Reminder</div>
                      <div className="text-xs text-[#544434]">
                        Get notified when it's time for the next dose or visit.
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setSetReminder(!setReminder)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      setReminder ? 'bg-[#ff9f1c]' : 'bg-[#e4e2de]'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                        setReminder ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Reminder Date Selector (shown when toggled on) */}
                {setReminder && (
                  <div className="bg-[#fbf9f5] p-3.5 rounded-xl border border-[#dac2ae]/60 animate-in fade-in duration-150">
                    <label className="text-xs font-bold text-[#544434] block mb-1">
                      Reminder Due Date
                    </label>
                    <input
                      type="date"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className="w-full bg-white border border-[#dac2ae] rounded-lg px-3 py-2 text-sm text-[#1b1c1a] focus:ring-2 focus:ring-[#895100] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#efeeea]">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-full border-2 border-[#475b9c] text-[#475b9c] hover:bg-[#a2b6fd]/20 text-sm font-bold transition-all text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto flex-1 px-6 py-3 rounded-full bg-[#ff9f1c] hover:bg-[#ff8f00] text-[#683c00] text-sm font-bold shadow-[0_4px_14px_0_rgba(255,159,28,0.39)] transition-all cursor-pointer active:translate-y-0.5"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
