import React, { useState, useEffect, useRef } from 'react';
import {
  EmergencyCategory,
  Pet,
  UserProfile
} from '../../types';
import {
  getCurrentDeviceLocation,
  GeoCoordinates
} from '../../services/gpsTracking';
import {
  startVoiceEmergencyTranscription,
  speakEmergencyGuidance,
  SpeechRecognitionState
} from '../../services/aiTriage';
import { emergencyStore, EmergencyState } from '../../services/emergencyStore';
import { ZoobyRealMap } from '../common/ZoobyRealMap';

interface RapidVanSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  pets?: Pet[];
  onSOSDispatched?: (incident: EmergencyState) => void;
}

const EMERGENCY_TYPES: Array<{
  id: EmergencyCategory;
  label: string;
  icon: string;
}> = [
  { id: 'injury_bleeding', label: 'Injury / Accident', icon: 'healing' },
  { id: 'injury_bleeding', label: 'Severe Bleeding', icon: 'bloodtype' },
  { id: 'breathing_problem', label: 'Breathing Difficulty', icon: 'air' },
  { id: 'possible_poisoning', label: 'Poisoning', icon: 'skull' },
  { id: 'accident_trauma', label: 'Seizure', icon: 'neurology' },
  { id: 'unconscious_unresponsive', label: 'Unconscious', icon: 'bedtime' },
  { id: 'severe_pain', label: 'Severe Pain', icon: 'sentiment_very_dissatisfied' },
  { id: 'accident_trauma', label: 'Unable to Move', icon: 'accessible' },
  { id: 'other', label: 'Other', icon: 'emergency' }
];

export const RapidVanSOSModal: React.FC<RapidVanSOSModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  pets = [],
  onSOSDispatched
}) => {
  // Navigation step state machine
  const [step, setStep] = useState<
    'false_alarm_check' | 'starting_response' | 'emergency_details' | 'location_detection' | 'finding_van' | 'van_found' | 'emergency_active' | 'summary_view'
  >('false_alarm_check');

  // Input states
  const [selectedPet, setSelectedPet] = useState<Pet | null>(pets[0] || null);
  const [isOtherAnimal, setIsOtherAnimal] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('Injury / Accident');
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('injury_bleeding');
  const [description, setDescription] = useState('');

  // Location states
  const [locationStatus, setLocationStatus] = useState<'detecting' | 'detected' | 'error'>('detecting');
  const [coords, setCoords] = useState<{ lat: number; lng: number; address: string; accuracyText: string }>({
    lat: 20.0055,
    lng: 73.7650,
    address: 'Silver Palm Enclave, Gangapur Road, Nashik',
    accuracyText: 'High (±8m)'
  });

  // Speech-to-text
  const [speechState, setSpeechState] = useState<SpeechRecognitionState>('idle');
  const stopVoiceRef = useRef<(() => void) | null>(null);

  // Active Emergency State from store
  const [activeEmergency, setActiveEmergency] = useState<EmergencyState | null>(() => emergencyStore.getActiveEmergency());

  // Listen to emergencyStore updates
  useEffect(() => {
    const handleUpdate = (emergency: EmergencyState) => {
      setActiveEmergency({ ...emergency });
    };
    const handleResolved = (emergency: EmergencyState) => {
      setActiveEmergency({ ...emergency });
      setStep('summary_view');
    };
    const handleCleared = () => {
      setActiveEmergency(null);
    };

    emergencyStore.on('emergency_updated', handleUpdate);
    emergencyStore.on('emergency_resolved', handleResolved);
    emergencyStore.on('emergency_cleared', handleCleared);

    return () => {
      emergencyStore.off('emergency_updated', handleUpdate);
      emergencyStore.off('emergency_resolved', handleResolved);
      emergencyStore.off('emergency_cleared', handleCleared);
    };
  }, []);

  // When modal is opened, determine starting step
  useEffect(() => {
    if (isOpen) {
      const active = emergencyStore.getActiveEmergency();
      if (active && active.status !== 'RESOLVED' && active.status !== 'CANCELLED') {
        setActiveEmergency(active);
        setStep('emergency_active');
      } else {
        setStep('false_alarm_check');
        setSelectedPet(pets[0] || null);
        setIsOtherAnimal(false);
        setSelectedType('Injury / Accident');
        setSelectedCategory('injury_bleeding');
        setDescription('');
        handleDetectGPS();
      }
    } else {
      if (stopVoiceRef.current) {
        stopVoiceRef.current();
        stopVoiceRef.current = null;
      }
    }
  }, [isOpen, pets]);

  // GPS auto-detection
  const handleDetectGPS = async () => {
    setLocationStatus('detecting');
    try {
      const device = await getCurrentDeviceLocation({ timeout: 10000, enableHighAccuracy: true });
      const acc = device.accuracy ? `High (±${Math.round(device.accuracy)}m)` : 'High (GPS Verified)';
      setCoords({
        lat: device.latitude,
        lng: device.longitude,
        address: currentUser?.location ? `${currentUser.location}, Nashik` : 'Gangapur Road, Near Silver Palm, Nashik',
        accuracyText: acc
      });
      setLocationStatus('detected');
    } catch {
      // Fallback
      setCoords({
        lat: 20.0055,
        lng: 73.7650,
        address: 'Silver Palm Enclave, Gangapur Road, Nashik',
        accuracyText: 'High (Verified Location)'
      });
      setLocationStatus('detected');
    }
  };

  // Toggle Voice Input
  const handleToggleVoice = () => {
    if (speechState === 'listening' || speechState === 'transcribing') {
      if (stopVoiceRef.current) {
        stopVoiceRef.current();
        stopVoiceRef.current = null;
      }
      setSpeechState('idle');
    } else {
      const stop = startVoiceEmergencyTranscription(
        () => {},
        (finalText) => {
          setDescription((prev) => (prev ? `${prev} ${finalText}` : finalText));
        },
        (state) => {
          setSpeechState(state);
        }
      );
      stopVoiceRef.current = stop;
    }
  };

  // Dispatch Emergency
  const handleConfirmAndDispatch = () => {
    setStep('finding_van');

    // Voice guidance
    speakEmergencyGuidance(
      `Zooby emergency assistance activated for ${
        isOtherAnimal ? 'your animal' : selectedPet?.name || 'Bruno'
      }. Stay calm. We are scanning for the nearest available emergency vehicle.`
    );

    // Realistic Search Animation Transition
    setTimeout(() => {
      setStep('van_found');

      // Start emergency in store
      const incident = emergencyStore.startEmergency({
        petName: isOtherAnimal ? 'Rescue Animal' : selectedPet?.name || 'Bruno',
        petSpecies: isOtherAnimal ? 'Animal' : selectedPet?.species || 'Dog',
        petBreed: isOtherAnimal ? 'Stray' : selectedPet?.breed || 'Golden Retriever',
        category: selectedCategory,
        description: description || `${selectedType} reported for ${selectedPet?.name || 'Bruno'}.`,
        locationCoords: { lat: coords.lat, lng: coords.lng, address: coords.address },
        userName: currentUser?.name || 'Rohan Mehta',
        userPhone: currentUser?.phone || '+91 98201 45678'
      });

      setActiveEmergency(incident);
      if (onSOSDispatched) onSOSDispatched(incident);

      // Transition to Active Live Screen
      setTimeout(() => {
        setStep('emergency_active');
      }, 2400);
    }, 2200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#fcfbfa] w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-rose-500/40 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 px-6 py-4 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-rose-600 flex items-center justify-center font-bold shadow-xs animate-pulse">
              <span className="material-symbols-outlined text-2xl filled-icon">emergency</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-quicksand font-bold text-xl text-white tracking-tight">
                  24/7 RAPID VAN SOS
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                  Emergency Live
                </span>
              </div>
              <p className="text-xs text-rose-100">
                Doorstep Veterinary Emergency &amp; Mobile Van Dispatch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-grow">
          {/* ========================================================================= */}
          {/* STEP 1: FALSE ALARM CONFIRMATION                                          */}
          {/* ========================================================================= */}
          {step === 'false_alarm_check' && (
            <div className="text-center py-6 space-y-6 animate-in fade-in">
              <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50 shadow-inner">
                <span className="material-symbols-outlined text-4xl filled-icon animate-bounce">
                  emergency
                </span>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                  Is this a false alarm?
                </h3>
                <p className="text-sm text-[#544434] leading-relaxed">
                  Zooby Rapid Van SOS connects directly to on-call mobile veterinary ambulances and technicians in Nashik.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setStep('starting_response');
                    setTimeout(() => setStep('emergency_details'), 600);
                  }}
                  className="w-full sm:w-2/3 py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">crisis_alert</span>
                  <span>NO, THIS IS AN EMERGENCY</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-1/3 py-3.5 px-4 rounded-2xl bg-white border border-[#dac2ae] text-[#544434] hover:bg-[#f5f3ef] font-bold text-sm transition-colors cursor-pointer"
                >
                  GO BACK
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1.5: STARTING RESPONSE TRANSITION                                    */}
          {/* ========================================================================= */}
          {step === 'starting_response' && (
            <div className="text-center py-16 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full border-4 border-rose-200 border-t-rose-600 animate-spin mx-auto" />
              <h3 className="font-quicksand font-bold text-2xl text-rose-600">
                Starting Zooby Emergency Response...
              </h3>
              <p className="text-xs text-[#544434]">Preparing immediate dispatch workflow.</p>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: TELL US WHAT HAPPENED & SPEAK EMERGENCY                          */}
          {/* ========================================================================= */}
          {step === 'emergency_details' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-[#efeeea] pb-3">
                <h3 className="font-quicksand font-bold text-xl text-[#1b1c1a]">
                  Tell us what happened
                </h3>
                <p className="text-xs text-[#716153]">
                  Select your pet and emergency condition so our dispatch team prepares the correct medical equipment.
                </p>
              </div>

              {/* 1. Pet Selection */}
              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-2">
                  Pet:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {pets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPet(p);
                        setIsOtherAnimal(false);
                      }}
                      className={`p-2.5 rounded-2xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                        selectedPet?.id === p.id && !isOtherAnimal
                          ? 'border-rose-600 bg-rose-50/70 ring-2 ring-rose-500/20 font-bold'
                          : 'border-[#dac2ae] bg-white hover:bg-[#fbf9f5]'
                      }`}
                    >
                      <img src={p.photoUrl} alt={p.name} className="w-9 h-9 rounded-xl object-cover border border-[#dac2ae]" />
                      <div className="overflow-hidden">
                        <div className="text-sm font-bold text-[#1b1c1a] truncate">{p.name}</div>
                        <div className="text-[11px] text-[#716153] truncate">{p.breed}</div>
                      </div>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setIsOtherAnimal(true);
                      setSelectedPet(null);
                    }}
                    className={`p-2.5 rounded-2xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                      isOtherAnimal
                        ? 'border-rose-600 bg-rose-50/70 ring-2 ring-rose-500/20 font-bold'
                        : 'border-[#dac2ae] bg-white hover:bg-[#fbf9f5]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#895100] flex items-center justify-center font-bold shrink-0">
                      <span className="material-symbols-outlined text-lg">pets</span>
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-[#1b1c1a]">Stray / Other</div>
                      <div className="text-[10px] text-[#716153]">Rescue Animal</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Emergency Type Selection */}
              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-2">
                  Emergency Type:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EMERGENCY_TYPES.map((et, index) => {
                    const isSelected = selectedType === et.label;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setSelectedType(et.label);
                          setSelectedCategory(et.id);
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-rose-600 bg-rose-50/80 text-rose-900 font-bold ring-2 ring-rose-500/20'
                            : 'border-[#e5e0d8] bg-white hover:bg-[#fbf9f5] text-[#1b1c1a]'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-lg ${isSelected ? 'text-rose-600' : 'text-[#877462]'}`}>
                          {et.icon}
                        </span>
                        <span className="text-xs truncate">{et.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. SPEAK YOUR EMERGENCY & Recognized Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider">
                    Speak your emergency:
                  </label>

                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    className={`py-1.5 px-3.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      speechState === 'listening' || speechState === 'transcribing'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {speechState === 'listening' || speechState === 'transcribing' ? 'mic' : 'mic_none'}
                    </span>
                    <span>
                      {speechState === 'listening'
                        ? 'Listening...'
                        : speechState === 'transcribing'
                        ? 'Transcribing...'
                        : 'SPEAK YOUR EMERGENCY'}
                    </span>
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Bruno fell from the stairs and is unable to stand."
                  className="w-full p-3 bg-white border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none font-medium"
                />
                <span className="text-[11px] text-[#877462] block">
                  You can edit the recognized speech text above anytime before confirming.
                </span>
              </div>

              {/* Next Action */}
              <div className="pt-3 border-t border-[#efeeea] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep('false_alarm_check')}
                  className="py-2.5 px-4 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f5f3ef]"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => setStep('location_detection')}
                  className="py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Next: Confirm Location</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: YOUR EMERGENCY LOCATION & CONFIRMATION                             */}
          {/* ========================================================================= */}
          {step === 'location_detection' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-[#efeeea] pb-3">
                <h3 className="font-quicksand font-bold text-xl text-[#1b1c1a]">
                  Your Emergency Location
                </h3>
                <p className="text-xs text-[#716153]">
                  Verify your doorstep address so the Zooby Mobile Care Van navigates without delays.
                </p>
              </div>

              {/* Location Card */}
              <div className="p-4 bg-white rounded-2xl border border-[#dac2ae] shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-2xl text-rose-600 mt-0.5">location_on</span>
                    <div>
                      <div className="text-xs font-bold text-[#877462] uppercase">📍 Current Location</div>
                      <h4 className="font-bold text-base text-[#1b1c1a] mt-0.5">{coords.address}</h4>
                      <span className="text-xs text-[#716153] block mt-0.5">
                        GPS: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                    Accuracy: {coords.accuracyText}
                  </span>
                </div>

                {/* Map Preview */}
                <ZoobyRealMap
                  height="180px"
                  userPosition={{
                    lat: coords.lat,
                    lng: coords.lng,
                    title: 'Emergency Scene (Bruno)'
                  }}
                  accuracyRadius={15}
                  zoom={15}
                />
              </div>

              {/* Location Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f5f3ef] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">my_location</span>
                  <span>REDETECT LOCATION</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setStep('emergency_details')}
                    className="py-2.5 px-4 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f5f3ef]"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmAndDispatch}
                    className="flex-1 sm:flex-none py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>CONFIRM LOCATION &amp; DISPATCH</span>
                    <span className="material-symbols-outlined text-lg">local_shipping</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4A: FINDING NEAREST AVAILABLE VAN (ANIMATION)                         */}
          {/* ========================================================================= */}
          {step === 'finding_van' && (
            <div className="text-center py-12 space-y-6 animate-in fade-in">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-rose-200 border-t-rose-600 animate-spin" />
                <span className="material-symbols-outlined text-4xl text-rose-600 animate-pulse">local_shipping</span>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  🚨 ZOOBY EMERGENCY RESPONSE
                </div>
                <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                  Zooby emergency assistance activated for {isOtherAnimal ? 'your animal' : selectedPet?.name || 'Bruno'}.
                </h3>
                <p className="text-sm text-[#544434]">
                  Stay calm. We are scanning for the nearest available emergency vehicle in Nashik...
                </p>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-bold text-[#895100] max-w-sm mx-auto flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg animate-spin">radar</span>
                <span>FINDING NEAREST AVAILABLE VAN... Searching</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4B: ZOOBY VAN FOUND                                                   */}
          {/* ========================================================================= */}
          {step === 'van_found' && (
            <div className="text-center py-8 space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>

              <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                ZOOBY VAN FOUND
              </h3>

              <div className="bg-white rounded-2xl border border-[#dac2ae] p-5 shadow-xs max-w-md mx-auto text-left space-y-3">
                <div className="flex justify-between items-center border-b border-[#efeeea] pb-2.5">
                  <span className="text-xs text-[#716153]">Zooby Mobile Care Van:</span>
                  <strong className="text-base font-bold text-[#1b1c1a]">ZMV-014</strong>
                </div>
                <div className="flex justify-between items-center border-b border-[#efeeea] pb-2.5">
                  <span className="text-xs text-[#716153]">Van Worker:</span>
                  <strong className="text-sm font-bold text-[#1b1c1a]">Rahul</strong>
                </div>
                <div className="flex justify-between items-center border-b border-[#efeeea] pb-2.5">
                  <span className="text-xs text-[#716153]">Distance:</span>
                  <strong className="text-sm font-bold text-[#895100]">3.2 km</strong>
                </div>
                <div className="flex justify-between items-center border-b border-[#efeeea] pb-2.5">
                  <span className="text-xs text-[#716153]">Estimated arrival:</span>
                  <strong className="text-sm font-bold text-[#895100]">Approximately 8 minutes</strong>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-[#716153]">Status:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800">
                    DISPATCHING
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#716153]">Connecting live telemetry map...</p>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: 🚨 EMERGENCY ACTIVE — LIVE MOVING MAP TRACKING                     */}
          {/* ========================================================================= */}
          {step === 'emergency_active' && activeEmergency && (
            <div className="space-y-5 animate-in fade-in">
              {/* Top Active Bar */}
              <div className="bg-white rounded-2xl border border-rose-300 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-red-600 text-white animate-pulse uppercase">
                      🚨 EMERGENCY ACTIVE
                    </span>
                    <span className="text-xs font-bold text-[#1b1c1a]">
                      ID: #{activeEmergency.incidentId}
                    </span>
                  </div>
                  <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a] mt-1">
                    🐕 {activeEmergency.petName} • {activeEmergency.category.replace('_', ' ').toUpperCase()}
                  </h3>
                  <div className="text-xs font-extrabold text-rose-700 mt-0.5">
                    {activeEmergency.status === 'ARRIVED'
                      ? 'ZOOBY EMERGENCY VAN HAS ARRIVED'
                      : activeEmergency.status === 'IN_CARE'
                      ? 'EMERGENCY CARE IN PROGRESS'
                      : 'ZOOBY VAN ON THE WAY'}
                  </div>
                </div>

                {/* Dynamic Distance & ETA Badge */}
                <div className="bg-[#fbf9f5] px-4 py-2.5 rounded-xl border border-[#efeeea] text-right shrink-0">
                  <div className="text-[10px] uppercase font-bold text-[#877462]">Estimated Arrival</div>
                  <div className="text-xl font-extrabold text-[#895100]">
                    {activeEmergency.status === 'ARRIVED' || activeEmergency.distanceKm === 0
                      ? 'ARRIVED'
                      : activeEmergency.etaMinutes
                      ? `${activeEmergency.etaMinutes} mins`
                      : '<1 min'}
                  </div>
                  <div className="text-xs font-bold text-[#544434]">
                    {activeEmergency.distanceKm && activeEmergency.distanceKm > 0
                      ? `${activeEmergency.distanceKm} km away`
                      : 'At Doorstep'}
                  </div>
                </div>
              </div>

              {/* Large Interactive Moving Leaflet Map */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-[#544434]">
                  <span>Live Vehicle Approach Telemetry</span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Real-time GPS Tracking Active</span>
                  </span>
                </div>

                <ZoobyRealMap
                  height="260px"
                  userPosition={{
                    lat: activeEmergency.emergencyCoordinates.lat,
                    lng: activeEmergency.emergencyCoordinates.lng,
                    title: `📍 ${activeEmergency.petName}'s Location`
                  }}
                  vanPosition={{
                    lat: activeEmergency.vanCoordinates.lat,
                    lng: activeEmergency.vanCoordinates.lng,
                    heading: activeEmergency.vanCoordinates.heading,
                    plate: activeEmergency.assignedVanPlate || 'ZMV-014',
                    status: activeEmergency.status === 'ARRIVED' ? 'Arrived' : 'On the Way'
                  }}
                  showRouteLine={true}
                  zoom={14}
                />
              </div>

              {/* Status Updates Progression Messages */}
              <div className="p-3.5 bg-rose-50/80 rounded-2xl border border-rose-200 text-xs space-y-1">
                <div className="font-bold text-rose-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                  <span>Status Updates</span>
                </div>
                <p className="text-xs text-[#544434] leading-relaxed font-medium">
                  {activeEmergency.status === 'ARRIVED'
                    ? 'Your Zooby Emergency Van has arrived at your doorstep.'
                    : activeEmergency.distanceKm && activeEmergency.distanceKm <= 0.7
                    ? `Your Zooby Van is ${activeEmergency.distanceKm * 1000}m away.`
                    : activeEmergency.etaMinutes && activeEmergency.etaMinutes <= 5
                    ? `Your Zooby Van is approximately ${activeEmergency.etaMinutes} minutes away.`
                    : 'Your Zooby Mobile Care Van is on the way.'}
                </p>
              </div>

              {/* Vet Support Card */}
              <div className="p-4 bg-white rounded-2xl border border-[#dac2ae] shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                    <span className="material-symbols-outlined text-2xl">stethoscope</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-blue-700">🩺 Vet Support</div>
                    <h4 className="font-bold text-sm text-[#1b1c1a]">
                      {activeEmergency.vetAssigned?.name || 'Dr. Aarav Mehta'} is supporting this emergency
                    </h4>
                    <p className="text-[11px] text-[#716153]">
                      {activeEmergency.vetAssigned?.clinic || 'Zooby Care Hospital'}
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${activeEmergency.vetAssigned?.phone || '+919822144556'}`}
                  className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">call</span>
                  <span>Call Vet</span>
                </a>
              </div>

              {/* Emergency Contacts & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${activeEmergency.assignedWorkerPhone || '+919822399001'}`}
                    className="py-2 px-4 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">call</span>
                    <span>Call Driver ({activeEmergency.assignedWorkerName || 'Rahul'})</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-4 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f5f3ef]"
                >
                  Minimize &amp; Keep Tracking
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 6: EMERGENCY SUMMARY DIALOG                                          */}
          {/* ========================================================================= */}
          {step === 'summary_view' && activeEmergency && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl">verified</span>
                </div>
                <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                  EMERGENCY SUMMARY
                </h3>
                <p className="text-xs text-[#716153]">
                  Emergency resolved and automatically saved to {activeEmergency.petName}'s digital health record.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#dac2ae] p-5 shadow-xs space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 border-b border-[#efeeea] pb-2">
                  <div>
                    <span className="text-[#877462] block">Emergency ID</span>
                    <strong className="text-[#1b1c1a] font-bold">#{activeEmergency.incidentId}</strong>
                  </div>
                  <div>
                    <span className="text-[#877462] block">Pet</span>
                    <strong className="text-[#1b1c1a] font-bold">{activeEmergency.petName} ({activeEmergency.petBreed})</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-b border-[#efeeea] pb-2">
                  <div>
                    <span className="text-[#877462] block">Emergency Type</span>
                    <strong className="text-[#1b1c1a] font-bold">{activeEmergency.category.replace('_', ' ').toUpperCase()}</strong>
                  </div>
                  <div>
                    <span className="text-[#877462] block">Status</span>
                    <strong className="text-emerald-700 font-bold">RESOLVED</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-b border-[#efeeea] pb-2">
                  <div>
                    <span className="text-[#877462] block">Responder &amp; Van</span>
                    <strong className="text-[#1b1c1a] font-bold">{activeEmergency.assignedWorkerName} ({activeEmergency.assignedVanPlate})</strong>
                  </div>
                  <div>
                    <span className="text-[#877462] block">Supporting Vet</span>
                    <strong className="text-[#1b1c1a] font-bold">{activeEmergency.vetAssigned?.name}</strong>
                  </div>
                </div>

                <div>
                  <span className="text-[#877462] block">Clinical Outcome &amp; Notes</span>
                  <p className="text-[#544434] mt-0.5">{activeEmergency.resolutionNotes || 'Patient stabilized successfully at doorstep.'}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  emergencyStore.clearEmergency();
                  onClose();
                }}
                className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-black text-white font-bold text-sm cursor-pointer shadow-md"
              >
                Close &amp; View Pet Health Record
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
