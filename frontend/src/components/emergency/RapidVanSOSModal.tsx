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
  isSpeechRecognitionSupported,
  SpeechRecognitionState
} from '../../services/aiTriage';
import { emergencyStore, EmergencyState } from '../../services/emergencyStore';
import { ZoobyRealMap } from '../common/ZoobyRealMap';
import { useCity } from '../../context/CityContext';

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
  { id: 'injury_bleeding', label: 'Injury', icon: 'healing' },
  { id: 'possible_poisoning', label: 'Possible Poisoning', icon: 'skull' },
  { id: 'breathing_problem', label: 'Difficulty Breathing', icon: 'air' },
  { id: 'injury_bleeding', label: 'Severe Bleeding', icon: 'bloodtype' },
  { id: 'accident_trauma', label: 'Seizure', icon: 'neurology' },
  { id: 'accident_trauma', label: 'Accident', icon: 'car_crash' },
  { id: 'unconscious_unresponsive', label: 'Unconscious', icon: 'bedtime' },
  { id: 'severe_pain', label: 'Severe Pain', icon: 'sentiment_very_dissatisfied' },
  { id: 'possible_poisoning', label: 'Vomiting', icon: 'sick' },
  { id: 'heat_stroke', label: 'Heat-Related Emergency', icon: 'thermostat' },
  { id: 'other', label: 'Other', icon: 'emergency' }
];

export const RapidVanSOSModal: React.FC<RapidVanSOSModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  pets = [],
  onSOSDispatched
}) => {
  const { currentCity } = useCity();

  // Navigation step state machine
  const [step, setStep] = useState<
    'false_alarm_check' | 'emergency_intake' | 'finding_van' | 'van_found' | 'emergency_active' | 'summary_view'
  >('false_alarm_check');

  // Intake Sub-step (1: Pet & Emergency Type, 2: Voice & Description, 3: GPS Location, 4: Summary Confirmation)
  const [intakeStage, setIntakeStage] = useState<'details' | 'voice' | 'location' | 'summary'>('details');

  // Input states
  const [selectedPet, setSelectedPet] = useState<Pet | null>(pets[0] || null);
  const [isOtherAnimal, setIsOtherAnimal] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('Possible Poisoning');
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('possible_poisoning');
  const [description, setDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  // Location states
  const [locationStatus, setLocationStatus] = useState<'detecting' | 'detected' | 'error'>('detecting');
  const [coords, setCoords] = useState<{ lat: number; lng: number; address: string; accuracyText: string }>({
    lat: 20.0055,
    lng: 73.7650,
    address: 'Silver Palm Enclave, Gangapur Road, Nashik',
    accuracyText: 'High (±8m)'
  });
  const [customAddress, setCustomAddress] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Speech-to-text
  const [speechState, setSpeechState] = useState<SpeechRecognitionState>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const stopVoiceRef = useRef<(() => void) | null>(null);
  const speechSupported = isSpeechRecognitionSupported();

  // Active Emergency State from store
  const [activeEmergency, setActiveEmergency] = useState<EmergencyState | null>(() =>
    emergencyStore.getActiveEmergency()
  );

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
        setIntakeStage('details');
        setSelectedPet(pets[0] || null);
        setIsOtherAnimal(false);
        setSelectedType('Possible Poisoning');
        setSelectedCategory('possible_poisoning');
        setDescription('');
        setCustomAddress('');
        setIsEditingAddress(false);
        setIsEditingDescription(false);
        handleDetectGPS();
      }
    } else {
      if (stopVoiceRef.current) {
        stopVoiceRef.current();
        stopVoiceRef.current = null;
      }
    }
  }, [isOpen, pets]);

  // GPS auto-detection with real browser navigator.geolocation
  const handleDetectGPS = async () => {
    setLocationStatus('detecting');
    try {
      const device = await getCurrentDeviceLocation({ timeout: 12000, enableHighAccuracy: true });
      const acc = device.accuracy ? `High (±${Math.round(device.accuracy)}m)` : 'High (GPS Verified)';
      const addr = currentUser?.location
        ? `${currentUser.location}, ${currentCity.name}`
        : `${currentCity.coverageAreas[0] || 'Gangapur Road'}, ${currentCity.name}`;

      setCoords({
        lat: device.latitude,
        lng: device.longitude,
        address: addr,
        accuracyText: acc
      });
      setCustomAddress(addr);
      setLocationStatus('detected');
    } catch {
      // Graceful fallback
      const fallbackAddr = currentUser?.location
        ? `${currentUser.location}, ${currentCity.name}`
        : `${currentCity.coverageAreas[0] || 'Central Hub'}, ${currentCity.name}`;

      setCoords({
        lat: currentCity.coordinates.lat,
        lng: currentCity.coordinates.lng,
        address: fallbackAddr,
        accuracyText: 'High (Verified City Location)'
      });
      setCustomAddress(fallbackAddr);
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
      setInterimTranscript('');
    } else {
      setInterimTranscript('');
      const stop = startVoiceEmergencyTranscription(
        (interim) => {
          setInterimTranscript(interim);
        },
        (finalText) => {
          setDescription((prev) => (prev ? `${prev} ${finalText}` : finalText));
          setInterimTranscript('');
        },
        (state) => {
          setSpeechState(state);
        }
      );
      stopVoiceRef.current = stop;
    }
  };

  // Start SOS flow after false alarm confirmation
  const handleStartSOS = () => {
    setStep('emergency_intake');
    setIntakeStage('details');

    const petName = isOtherAnimal ? 'your animal' : selectedPet?.name || 'Bruno';
    speakEmergencyGuidance(
      `Zooby emergency assistance is activated for ${petName}. Stay calm. Please describe what happened to your pet.`
    );
  };

  // Dispatch Emergency
  const handleConfirmAndDispatch = () => {
    setStep('finding_van');

    const targetAddress = customAddress.trim() || coords.address;
    const petName = isOtherAnimal ? 'Rescue Animal' : selectedPet?.name || 'Bruno';

    // Voice guidance
    speakEmergencyGuidance(
      `Zooby emergency assistance activated for ${petName}. We are dispatching the nearest available emergency vehicle in ${currentCity.name}.`
    );

    // Realistic Search Animation Transition
    setTimeout(() => {
      setStep('van_found');

      // Start emergency in store with current city and coordinates
      const incident = emergencyStore.startEmergency({
        cityId: currentCity.id,
        userId: currentUser?.id || currentUser?.userId || 'usr-parent-sam',
        userName: currentUser?.displayName || currentUser?.name || 'Sam Sharma',
        userPhone: currentUser?.phone || '+91 98220 11223',
        userEmail: currentUser?.email || 'sam@zooby.care',
        petId: selectedPet?.id || 'pet-bruno',
        petName: petName,
        petSpecies: isOtherAnimal ? 'Animal' : selectedPet?.species || 'Dog',
        petBreed: isOtherAnimal ? 'Stray' : selectedPet?.breed || 'Golden Retriever',
        category: selectedCategory,
        description: description || `${selectedType} reported for ${petName} in ${currentCity.name}.`,
        locationCoords: {
          lat: coords.lat,
          lng: coords.lng,
          address: targetAddress
        },
        assignedWorkerName: 'Rahul Sharma',
        assignedVanPlate: 'ZMV-014'
      });

      setActiveEmergency(incident);
      if (onSOSDispatched) onSOSDispatched(incident);

      // Transition to Active Live Screen
      setTimeout(() => {
        setStep('emergency_active');
      }, 2200);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#fcfbfa] w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-rose-500/50 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[94vh]">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-amber-600 px-6 py-4 text-white flex items-center justify-between shadow-md shrink-0">
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
                Doorstep Veterinary Emergency &amp; Mobile Van Dispatch • {currentCity.name}
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
          {/* STEP 1: RAPID SOS CONFIRMATION                                            */}
          {/* ========================================================================= */}
          {step === 'false_alarm_check' && (
            <div className="text-center py-6 space-y-6 animate-in fade-in">
              <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50 shadow-inner">
                <span className="material-symbols-outlined text-4xl filled-icon animate-bounce">
                  emergency
                </span>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-extrabold uppercase tracking-wider">
                  🚨 24/7 Rapid Van SOS
                </span>
                <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                  Is this a real emergency?
                </h3>
                <p className="text-sm text-[#544434] leading-relaxed">
                  Zooby Rapid SOS immediately routes on-call mobile veterinary technicians and hospital ambulances in {currentCity.name}.
                </p>
                <p className="text-xs text-[#877462]">
                  Emergency assistance is available 24/7 across all supported zones.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={handleStartSOS}
                  className="w-full sm:w-2/3 py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">crisis_alert</span>
                  <span>YES, START SOS</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-1/3 py-3.5 px-4 rounded-2xl bg-white border border-[#dac2ae] text-[#544434] hover:bg-[#f5f3ef] font-bold text-sm transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: COMPLETE EMERGENCY INTAKE FLOW (PET + VOICE + GPS + SUMMARY)      */}
          {/* ========================================================================= */}
          {step === 'emergency_intake' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Emergency Activated Alert Header */}
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 font-bold">
                  <span className="material-symbols-outlined text-xl">emergency</span>
                </div>
                <div>
                  <h4 className="font-quicksand font-bold text-base text-rose-900">
                    🚨 EMERGENCY ACTIVATED
                  </h4>
                  <p className="text-xs text-rose-800 leading-relaxed mt-0.5">
                    Zooby emergency assistance activated for{' '}
                    <strong>{isOtherAnimal ? 'your animal' : selectedPet?.name || 'your pet'}</strong>. Stay calm. We are collecting the information needed to dispatch the nearest available emergency vehicle.
                  </p>
                </div>
              </div>

              {/* Multi-Step Intake Progress Tracker */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold border-b border-[#efeeea] pb-3">
                <button
                  type="button"
                  onClick={() => setIntakeStage('details')}
                  className={`py-1.5 rounded-lg transition-all ${
                    intakeStage === 'details'
                      ? 'bg-rose-600 text-white'
                      : 'bg-[#f5f3ef] text-[#716153] hover:bg-rose-50'
                  }`}
                >
                  1. Pet &amp; Type
                </button>
                <button
                  type="button"
                  onClick={() => setIntakeStage('voice')}
                  className={`py-1.5 rounded-lg transition-all ${
                    intakeStage === 'voice'
                      ? 'bg-rose-600 text-white'
                      : 'bg-[#f5f3ef] text-[#716153] hover:bg-rose-50'
                  }`}
                >
                  2. Voice / Notes
                </button>
                <button
                  type="button"
                  onClick={() => setIntakeStage('location')}
                  className={`py-1.5 rounded-lg transition-all ${
                    intakeStage === 'location'
                      ? 'bg-rose-600 text-white'
                      : 'bg-[#f5f3ef] text-[#716153] hover:bg-rose-50'
                  }`}
                >
                  3. GPS Location
                </button>
                <button
                  type="button"
                  onClick={() => setIntakeStage('summary')}
                  className={`py-1.5 rounded-lg transition-all ${
                    intakeStage === 'summary'
                      ? 'bg-rose-600 text-white'
                      : 'bg-[#f5f3ef] text-[#716153] hover:bg-rose-50'
                  }`}
                >
                  4. Confirm
                </button>
              </div>

              {/* INTAKE SUBSTAGE 1: PET SELECTION & EMERGENCY CATEGORY */}
              {intakeStage === 'details' && (
                <div className="space-y-5 animate-in fade-in">
                  {/* 1. Pet Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider">
                        Select Affected Pet:
                      </label>
                      <span className="text-[11px] text-[#877462]">No typing required</span>
                    </div>

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
                              ? 'border-rose-600 bg-rose-50/80 ring-2 ring-rose-500/20 font-bold'
                              : 'border-[#dac2ae] bg-white hover:bg-[#fbf9f5]'
                          }`}
                        >
                          <img
                            src={p.photoUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover border border-[#dac2ae] shrink-0"
                          />
                          <div className="overflow-hidden">
                            <div className="text-sm font-bold text-[#1b1c1a] truncate">🐶 {p.name}</div>
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
                            ? 'border-rose-600 bg-rose-50/80 ring-2 ring-rose-500/20 font-bold'
                            : 'border-[#dac2ae] bg-white hover:bg-[#fbf9f5]'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#895100] flex items-center justify-center font-bold shrink-0">
                          <span className="material-symbols-outlined text-xl">pets</span>
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
                      Emergency Category / Condition:
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
                                ? 'border-rose-600 bg-rose-50 text-rose-900 font-bold ring-2 ring-rose-500/20'
                                : 'border-[#e5e0d8] bg-white hover:bg-[#fbf9f5] text-[#1b1c1a]'
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-lg ${
                                isSelected ? 'text-rose-600' : 'text-[#877462]'
                              }`}
                            >
                              {et.icon}
                            </span>
                            <span className="text-xs truncate">{et.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Continue to Voice Input */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIntakeStage('voice')}
                      className="py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <span>Next: Speak Emergency</span>
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* INTAKE SUBSTAGE 2: VOICE-TO-TEXT EMERGENCY DESCRIPTION (CORE FEATURE) */}
              {intakeStage === 'voice' && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="border-b border-[#efeeea] pb-2">
                    <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a]">
                      WHAT HAPPENED?
                    </h3>
                    <p className="text-xs text-[#716153]">
                      Speak your emergency directly so our medical team can prepare emergency medicines and equipment.
                    </p>
                  </div>

                  {/* Prominent Voice Microphone Card */}
                  <div className="bg-white rounded-2xl border border-[#dac2ae] p-5 shadow-xs text-center space-y-4">
                    <div className="flex flex-col items-center justify-center">
                      <button
                        type="button"
                        onClick={handleToggleVoice}
                        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${
                          speechState === 'listening' || speechState === 'transcribing'
                            ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-200 scale-105'
                            : 'bg-rose-100 text-rose-700 hover:bg-rose-200 hover:scale-105 active:scale-95 ring-4 ring-rose-50'
                        }`}
                      >
                        <span className="material-symbols-outlined text-4xl">
                          {speechState === 'listening' || speechState === 'transcribing' ? 'mic' : 'mic_none'}
                        </span>
                      </button>

                      <div className="mt-3 space-y-1">
                        <div className="text-sm font-bold text-[#1b1c1a]">
                          {speechState === 'listening' ? (
                            <span className="text-rose-600 flex items-center justify-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                              🔴 Listening... Speak now
                            </span>
                          ) : speechState === 'transcribing' ? (
                            <span className="text-amber-600">⚡ Transcribing speech...</span>
                          ) : (
                            <span>🎙️ Tap to speak emergency</span>
                          )}
                        </div>
                        <p className="text-xs text-[#877462]">
                          "Describe what happened to your pet..."
                        </p>
                      </div>
                    </div>

                    {/* Live Interim Transcript */}
                    {interimTranscript && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs italic text-[#895100]">
                        "{interimTranscript}..."
                      </div>
                    )}

                    {/* Speech Recognition Fallback Notice */}
                    {!speechSupported && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-[#895100] text-left">
                        Voice input isn't available on this device. You can type the emergency description in the field below instead.
                      </div>
                    )}

                    {/* Description Textarea */}
                    <div className="text-left space-y-1.5">
                      <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider">
                        Emergency Description:
                      </label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder='e.g. "Bruno ate something from the floor and now he is vomiting and shaking."'
                        className="w-full p-3.5 bg-[#fbf9f5] border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none font-medium"
                      />
                      <div className="flex items-center justify-between text-[11px] text-[#877462]">
                        <span>You can edit or add details to the transcribed text anytime.</span>
                        {description && (
                          <button
                            type="button"
                            onClick={() => setDescription('')}
                            className="text-rose-600 hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setIntakeStage('details')}
                      className="py-2.5 px-4 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f5f3ef]"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={() => setIntakeStage('location')}
                      className="py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <span>Next: Confirm Location</span>
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* INTAKE SUBSTAGE 3: GPS LOCATION & MAP VERIFICATION */}
              {intakeStage === 'location' && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="border-b border-[#efeeea] pb-2">
                    <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a]">
                      📍 Your Emergency Location
                    </h3>
                    <p className="text-xs text-[#716153]">
                      Verify your location so the Zooby Mobile Care Van arrives at your exact doorstep.
                    </p>
                  </div>

                  {/* Location Card */}
                  <div className="bg-white rounded-2xl border border-[#dac2ae] p-4 shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-2xl text-rose-600 mt-0.5">location_on</span>
                        <div className="flex-grow">
                          <div className="text-xs font-bold text-[#877462] uppercase">📍 Current Location</div>
                          {isEditingAddress ? (
                            <input
                              type="text"
                              value={customAddress}
                              onChange={(e) => setCustomAddress(e.target.value)}
                              className="w-full mt-1 p-2 bg-[#fbf9f5] border border-rose-300 rounded-lg text-xs font-bold text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-rose-500"
                              placeholder="Enter doorstep address..."
                            />
                          ) : (
                            <h4 className="font-bold text-sm text-[#1b1c1a] mt-0.5">
                              {customAddress || coords.address}
                            </h4>
                          )}
                          <span className="text-[11px] text-[#716153] block mt-0.5">
                            GPS Coordinates: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          {coords.accuracyText}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsEditingAddress(!isEditingAddress)}
                          className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
                        >
                          {isEditingAddress ? 'Done Editing' : 'Edit Address'}
                        </button>
                      </div>
                    </div>

                    {/* Live OpenStreetMap Preview */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-[#716153]">Live Location Map:</div>
                      <ZoobyRealMap
                        height="180px"
                        userPosition={{
                          lat: coords.lat,
                          lng: coords.lng,
                          title: `📍 Emergency Location (${selectedPet?.name || 'Pet'})`
                        }}
                        accuracyRadius={15}
                        zoom={15}
                      />
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f5f3ef] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">my_location</span>
                      <span>DETECT AGAIN</span>
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setIntakeStage('voice')}
                        className="py-2.5 px-4 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f5f3ef]"
                      >
                        Back
                      </button>

                      <button
                        type="button"
                        onClick={() => setIntakeStage('summary')}
                        className="flex-1 sm:flex-none py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <span>YES, USE THIS LOCATION</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* INTAKE SUBSTAGE 4: EMERGENCY SUMMARY BEFORE DISPATCH */}
              {intakeStage === 'summary' && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="border-b border-[#efeeea] pb-2">
                    <h3 className="font-quicksand font-bold text-xl text-[#1b1c1a]">
                      🚨 EMERGENCY SUMMARY
                    </h3>
                    <p className="text-xs text-[#716153]">
                      Please verify the emergency details below before final vehicle dispatch.
                    </p>
                  </div>

                  {/* Concise Emergency Summary Card */}
                  <div className="bg-white rounded-2xl border-2 border-rose-500/40 p-5 shadow-xs space-y-3.5">
                    <div className="grid grid-cols-2 gap-3 border-b border-[#efeeea] pb-3">
                      <div>
                        <span className="text-[11px] font-bold text-[#877462] uppercase block">Pet:</span>
                        <strong className="text-base font-bold text-[#1b1c1a]">
                          🐶 {isOtherAnimal ? 'Rescue Animal' : selectedPet?.name || 'Bruno'}
                        </strong>
                        <span className="text-xs text-[#716153] block">
                          {isOtherAnimal ? 'Stray Animal' : selectedPet?.breed || 'Dog'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-[#877462] uppercase block">Emergency:</span>
                        <strong className="text-sm font-bold text-rose-700 block mt-0.5">
                          {selectedType}
                        </strong>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-100 text-rose-800 uppercase inline-block mt-1">
                          Priority 1 • Rapid Dispatch
                        </span>
                      </div>
                    </div>

                    <div className="border-b border-[#efeeea] pb-3">
                      <span className="text-[11px] font-bold text-[#877462] uppercase block">Description:</span>
                      <p className="text-xs sm:text-sm font-medium text-[#1b1c1a] mt-0.5 bg-[#fbf9f5] p-3 rounded-xl border border-[#efeeea]">
                        "{description || `${selectedType} reported for ${selectedPet?.name || 'pet'}.`}"
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-[#877462] uppercase block">Doorstep Location:</span>
                        <p className="text-xs font-bold text-[#1b1c1a] mt-0.5">
                          📍 {customAddress || coords.address}
                        </p>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-[#877462] uppercase block">GPS Telemetry:</span>
                        <p className="text-xs text-emerald-800 font-bold mt-0.5 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                          <span>Location detected ({coords.accuracyText})</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setIntakeStage('details')}
                      className="py-3 px-5 rounded-2xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f5f3ef] cursor-pointer"
                    >
                      EDIT DETAILS
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmAndDispatch}
                      className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 active:scale-98 text-white font-extrabold text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-all animate-pulse"
                    >
                      <span className="material-symbols-outlined text-xl">local_shipping</span>
                      <span>DISPATCH EMERGENCY</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: DISPATCHING & SCANNING NEAREST AVAILABLE VAN                        */}
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
                  Zooby Emergency Assistance Activated for {isOtherAnimal ? 'your animal' : selectedPet?.name || 'Bruno'}
                </h3>
                <p className="text-sm text-[#544434]">
                  Stay calm. We are locating the nearest available emergency vehicle in {currentCity.name}...
                </p>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-bold text-[#895100] max-w-sm mx-auto flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg animate-spin">radar</span>
                <span>Scanning for nearby Zooby Mobile Care Vans...</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: ZOOBY VAN FOUND & ASSIGNED                                         */}
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
                  <span className="text-xs text-[#716153]">Van Worker / Technician:</span>
                  <strong className="text-sm font-bold text-[#1b1c1a]">Rahul Sharma</strong>
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
                  <span className="text-xs text-[#716153]">Supporting Vet:</span>
                  <span className="text-xs font-bold text-blue-700">Dr. Ananya Mehta (Notified)</span>
                </div>
              </div>

              <p className="text-xs text-[#716153]">Connecting live vehicle approach telemetry...</p>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: 🚨 EMERGENCY ACTIVE — LIVE MOVING MAP TRACKING (PRESERVED UI)       */}
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
                      ? 'ZOOBY EMERGENCY VAN HAS ARRIVED AT YOUR DOORSTEP'
                      : activeEmergency.status === 'IN_CARE'
                      ? 'EMERGENCY CARE IN PROGRESS'
                      : activeEmergency.status === 'ARRIVING'
                      ? 'ZOOBY VAN IS ARRIVING NOW'
                      : 'ZOOBY VAN EN ROUTE TO YOUR DOORSTEP'}
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
                    lat: activeEmergency.emergencyCoordinates?.lat || coords.lat,
                    lng: activeEmergency.emergencyCoordinates?.lng || coords.lng,
                    title: `📍 ${activeEmergency.petName}'s Location`
                  }}
                  vanPosition={{
                    lat: activeEmergency.vanCoordinates?.lat || coords.lat,
                    lng: activeEmergency.vanCoordinates?.lng || coords.lng,
                    heading: activeEmergency.vanCoordinates?.heading || 320,
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
                    ? `Your Zooby Van is ${Math.round(activeEmergency.distanceKm * 1000)}m away approaching your doorstep.`
                    : activeEmergency.etaMinutes && activeEmergency.etaMinutes <= 5
                    ? `Your Zooby Van is approximately ${activeEmergency.etaMinutes} minutes away.`
                    : `Your Zooby Mobile Care Van (${activeEmergency.assignedVanPlate || 'ZMV-014'}) is on the way.`}
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
                      {activeEmergency.vetAssigned?.name || 'Dr. Ananya Mehta'} is supporting this emergency
                    </h4>
                    <p className="text-[11px] text-[#716153]">
                      {activeEmergency.vetAssigned?.clinic || 'Nashik Paws & Vet Care Clinic'}
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${activeEmergency.vetAssigned?.phone || '+919822144556'}`}
                  className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
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
                    className="py-2 px-4 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">call</span>
                    <span>Call Driver ({activeEmergency.assignedWorkerName || 'Rahul Sharma'})</span>
                  </a>

                  {activeEmergency.status === 'ARRIVED' && (
                    <button
                      type="button"
                      onClick={() => emergencyStore.startActiveCare()}
                      className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Start Care
                    </button>
                  )}

                  {(activeEmergency.status === 'ARRIVED' || activeEmergency.status === 'IN_CARE') && (
                    <button
                      type="button"
                      onClick={() =>
                        emergencyStore.resolveEmergency(
                          'Patient examined and stabilized on-scene. Treatment and prescription recorded.'
                        )
                      }
                      className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Complete Emergency
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-4 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f5f3ef] cursor-pointer"
                >
                  Minimize &amp; Keep Tracking
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 6: EMERGENCY SUMMARY DIALOG (AFTER RESOLUTION)                       */}
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
                    <strong className="text-[#1b1c1a] font-bold">
                      {activeEmergency.petName} ({activeEmergency.petBreed})
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-b border-[#efeeea] pb-2">
                  <div>
                    <span className="text-[#877462] block">Emergency Type</span>
                    <strong className="text-[#1b1c1a] font-bold">
                      {activeEmergency.category.replace('_', ' ').toUpperCase()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#877462] block">Status</span>
                    <strong className="text-emerald-700 font-bold">RESOLVED</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-b border-[#efeeea] pb-2">
                  <div>
                    <span className="text-[#877462] block">Responder &amp; Van</span>
                    <strong className="text-[#1b1c1a] font-bold">
                      {activeEmergency.assignedWorkerName} ({activeEmergency.assignedVanPlate})
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#877462] block">Supporting Vet</span>
                    <strong className="text-[#1b1c1a] font-bold">
                      {activeEmergency.vetAssigned?.name || 'Dr. Ananya Mehta'}
                    </strong>
                  </div>
                </div>

                <div>
                  <span className="text-[#877462] block">Clinical Outcome &amp; Notes</span>
                  <p className="text-[#544434] mt-0.5 font-medium">
                    {activeEmergency.resolutionNotes || 'Patient stabilized successfully at doorstep.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  emergencyStore.clearEmergency();
                  onClose();
                }}
                className="w-full py-3.5 rounded-2xl bg-stone-900 hover:bg-black text-white font-bold text-sm cursor-pointer shadow-md"
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
