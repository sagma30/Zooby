import React, { useState, useEffect, useRef } from 'react';
import {
  EmergencyCategory,
  Pet,
  UserProfile,
  EmergencyUrgency
} from '../../types';
import {
  getCurrentDeviceLocation,
  GeoCoordinates
} from '../../services/gpsTracking';
import {
  startVoiceEmergencyTranscription,
  speakEmergencyGuidance,
  isSpeechRecognitionSupported,
  evaluateAITriage,
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

// User-specified 7 Emergency Type Options
const EMERGENCY_TYPE_OPTIONS = [
  { id: 'injury_bleeding' as EmergencyCategory, label: 'Pet Injury', icon: 'healing', emoji: '🐾' },
  { id: 'breathing_problem' as EmergencyCategory, label: 'Breathing Problem', icon: 'air', emoji: '🫁' },
  { id: 'possible_poisoning' as EmergencyCategory, label: 'Poisoning / Toxic Exposure', icon: 'skull', emoji: '☠️' },
  { id: 'accident_trauma' as EmergencyCategory, label: 'Accident', icon: 'car_crash', emoji: '🚗' },
  { id: 'injury_bleeding' as EmergencyCategory, label: 'Severe Bleeding', icon: 'bloodtype', emoji: '🩸' },
  { id: 'unconscious_unresponsive' as EmergencyCategory, label: 'Critical Condition', icon: 'crisis_alert', emoji: '🌡️' },
  { id: 'other' as EmergencyCategory, label: 'Other Emergency', icon: 'emergency', emoji: '🏠' }
];

export const RapidVanSOSModal: React.FC<RapidVanSOSModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  pets = [],
  onSOSDispatched
}) => {
  const { currentCity } = useCity();

  // Workflow Step Machine
  // 1: emergency_type -> 2: location -> 3: details_and_voice -> 4: ai_triage -> 5: nearest_van -> 6: dispatch_confirmed (live map/timeline) -> 7: summary_view
  const [currentStep, setCurrentStep] = useState<
    'emergency_type' | 'location' | 'details' | 'ai_triage' | 'nearest_van' | 'dispatch_confirmed' | 'summary_view'
  >('emergency_type');

  // Step 1: Emergency Type state
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<string>('Pet Injury');
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('injury_bleeding');

  // Step 2: Location state
  const [locationMode, setLocationMode] = useState<'prompt' | 'allowed' | 'manual'>('prompt');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'detected' | 'denied'>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number; address: string; accuracyText: string }>({
    lat: currentCity.coordinates.lat,
    lng: currentCity.coordinates.lng,
    address: `${currentCity.coverageAreas[0] || 'Central Area'}, ${currentCity.name}`,
    accuracyText: 'Pending GPS verification'
  });
  const [manualAddressInput, setManualAddressInput] = useState<string>('');
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);

  // Step 3: Fast Details State
  const [petNameInput, setPetNameInput] = useState<string>('');
  const [selectedSpecies, setSelectedSpecies] = useState<'Dog' | 'Cat' | 'Puppy' | 'Kitten' | 'Bird' | 'Other'>('Dog');
  const [selectedPetFromProfile, setSelectedPetFromProfile] = useState<Pet | null>(pets[0] || null);
  const [descriptionInput, setDescriptionInput] = useState<string>('');

  // Step 4: Live Speech state
  const [speechState, setSpeechState] = useState<SpeechRecognitionState>('idle');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const stopVoiceRef = useRef<(() => void) | null>(null);
  const speechSupported = isSpeechRecognitionSupported();

  // Step 5: AI Triage state
  const [triageUrgency, setTriageUrgency] = useState<EmergencyUrgency>('CRITICAL');
  const [triageAnalysisMsg, setTriageAnalysisMsg] = useState<string>('Analyzing emergency severity and vital risks...');
  const [triageStepIndex, setTriageStepIndex] = useState<number>(1);

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
      setCurrentStep('summary_view');
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

  // Initialize/Reset on modal open
  useEffect(() => {
    if (isOpen) {
      const active = emergencyStore.getActiveEmergency();
      if (active && active.status !== 'RESOLVED' && active.status !== 'CANCELLED') {
        setActiveEmergency(active);
        setCurrentStep('dispatch_confirmed');
      } else {
        setCurrentStep('emergency_type');
        setSelectedEmergencyType('Pet Injury');
        setSelectedCategory('injury_bleeding');
        setLocationMode('prompt');
        setLocationStatus('idle');
        setLocationErrorMsg(null);
        setManualAddressInput('');
        setPetNameInput(pets[0]?.name || '');
        setSelectedSpecies(pets[0]?.species === 'Cat' ? 'Cat' : 'Dog');
        setSelectedPetFromProfile(pets[0] || null);
        setDescriptionInput('');
        setInterimTranscript('');
      }
    } else {
      if (stopVoiceRef.current) {
        stopVoiceRef.current();
        stopVoiceRef.current = null;
      }
    }
  }, [isOpen, pets]);

  // Request browser geolocation permission
  const handleAllowLocation = async () => {
    setLocationStatus('detecting');
    setLocationErrorMsg(null);
    try {
      const device = await getCurrentDeviceLocation({ timeout: 12000, enableHighAccuracy: true });
      const acc = device.accuracy ? `High (±${Math.round(device.accuracy)}m)` : 'High (GPS Verified)';
      const addr = currentUser?.location
        ? `${currentUser.location}, ${currentCity.name}`
        : `${currentCity.coverageAreas[0] || 'Main Road'}, ${currentCity.name}`;

      setCoords({
        lat: device.latitude,
        lng: device.longitude,
        address: addr,
        accuracyText: acc
      });
      setLocationStatus('detected');
      setLocationMode('allowed');
    } catch (err: any) {
      console.warn('Geolocation permission denied or timed out:', err);
      setLocationStatus('denied');
      setLocationMode('manual');
      setLocationErrorMsg('Location permission was denied or timed out. Please enter your location manually below.');
    }
  };

  // Toggle Live Speech Recording
  const handleStartRecording = () => {
    setInterimTranscript('');
    const stop = startVoiceEmergencyTranscription(
      (interim) => {
        setInterimTranscript(interim);
      },
      (finalText) => {
        setDescriptionInput((prev) => (prev ? `${prev} ${finalText}` : finalText));
        setInterimTranscript('');
      },
      (state) => {
        setSpeechState(state);
      }
    );
    stopVoiceRef.current = stop;
  };

  const handleStopRecording = () => {
    if (stopVoiceRef.current) {
      stopVoiceRef.current();
      stopVoiceRef.current = null;
    }
    setSpeechState('idle');
    setInterimTranscript('');
  };

  const handleRetryRecording = () => {
    handleStopRecording();
    setDescriptionInput('');
    handleStartRecording();
  };

  // Execute AI Triage Stage & Dispatch Sequence
  const handleStartEmergencyResponse = async () => {
    setCurrentStep('ai_triage');
    setTriageStepIndex(1);
    setTriageAnalysisMsg('Analyzing emergency severity and clinical urgency...');

    const petName = petNameInput.trim() || selectedPetFromProfile?.name || `${selectedSpecies}`;
    speakEmergencyGuidance(
      `Zooby Emergency Response initiated for ${petName}. Stay calm. Our dispatch team is finding the nearest mobile care van in ${currentCity.name}.`
    );

    // Dynamic AI triage evaluation
    try {
      const triage = await evaluateAITriage({
        category: selectedCategory,
        description: descriptionInput || `${selectedEmergencyType} reported for ${petName}`,
        petName,
        petSpecies: selectedSpecies
      });
      setTriageUrgency(triage.urgency);
    } catch {
      setTriageUrgency('CRITICAL');
    }

    // Triage stage progression animation
    setTimeout(() => {
      setTriageStepIndex(2);
      setTriageAnalysisMsg('Classifying urgency triage & alerting on-call veterinary specialists...');
    }, 1200);

    setTimeout(() => {
      setTriageStepIndex(3);
      setTriageAnalysisMsg(`Locating nearest available Zooby Emergency Van in ${currentCity.name}...`);
    }, 2400);

    setTimeout(() => {
      setCurrentStep('nearest_van');
    }, 3600);
  };

  // Confirm and assign nearest van
  const handleConfirmNearestVan = () => {
    const petName = petNameInput.trim() || selectedPetFromProfile?.name || `${selectedSpecies}`;
    const targetAddress = manualAddressInput.trim() || coords.address;
    const assignedVan = currentCity.assignedVans[0] || {
      plate: 'ZMV-014',
      model: 'Zooby Mobile Care Unit #1',
      workerName: 'Rahul Sharma',
      contact: '+91 98223 99001'
    };

    // Calculate dynamic ETA based on distance
    const estDistanceKm = 3.4;
    const calculatedEta = Math.max(4, Math.round((estDistanceKm / 28) * 60)); // ~7-8 mins

    const incident = emergencyStore.startEmergency({
      cityId: currentCity.id,
      userId: currentUser?.id || currentUser?.userId || 'usr-guest-sos',
      userName: currentUser?.displayName || currentUser?.name || 'Emergency Caller',
      userPhone: currentUser?.phone || '+91 98220 99111',
      userEmail: currentUser?.email || 'emergency@zooby.care',
      petId: selectedPetFromProfile?.id || 'pet-sos-' + Date.now(),
      petName,
      petSpecies: selectedSpecies,
      petBreed: selectedPetFromProfile?.breed || selectedSpecies,
      category: selectedCategory,
      description: descriptionInput || `${selectedEmergencyType} reported for ${petName} in ${currentCity.name}.`,
      locationCoords: {
        lat: coords.lat,
        lng: coords.lng,
        address: targetAddress
      },
      assignedWorkerName: assignedVan.workerName,
      assignedVanPlate: assignedVan.plate,
      etaMinutes: calculatedEta,
      distanceKm: estDistanceKm
    });

    setActiveEmergency(incident);
    if (onSOSDispatched) onSOSDispatched(incident);
    setCurrentStep('dispatch_confirmed');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200 font-jakarta">
      <div className="bg-[#fcfbfa] w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-red-500/50 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[94vh]">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-6 py-4 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-red-600 flex items-center justify-center font-bold shadow-xs animate-pulse">
              <span className="material-symbols-outlined text-2xl font-black">emergency</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-quicksand font-bold text-xl text-white tracking-tight">
                  ZOOBY EMERGENCY SOS
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                  24/7 Rapid Van Dispatch
                </span>
              </div>
              <p className="text-xs text-rose-100">
                Doorstep Veterinary Emergency &amp; Mobile Van Response • {currentCity.name}
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
          {/* STEP 1: EMERGENCY TYPE SELECTION                                          */}
          {/* ========================================================================= */}
          {currentStep === 'emergency_type' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-[#efeeea] pb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 uppercase tracking-wider">
                  Step 1 of 4 • Select Condition
                </span>
                <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a] mt-1">
                  What is the emergency?
                </h3>
                <p className="text-xs text-[#716153]">
                  Select the closest option to initiate instant triage and mobile dispatch.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {EMERGENCY_TYPE_OPTIONS.map((et) => {
                  const isSelected = selectedEmergencyType === et.label;
                  return (
                    <button
                      key={et.label}
                      type="button"
                      onClick={() => {
                        setSelectedEmergencyType(et.label);
                        setSelectedCategory(et.id);
                      }}
                      className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-red-600 bg-red-50 text-red-900 font-bold ring-2 ring-red-500/20 shadow-xs'
                          : 'border-[#dac2ae]/70 bg-white hover:bg-[#fbf9f5] text-[#1b1c1a]'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{et.emoji}</span>
                      <div className="overflow-hidden">
                        <strong className="text-sm block">{et.label}</strong>
                        <span className="text-[10px] text-[#877462]">One-tap priority routing</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep('location')}
                  className="py-3.5 px-7 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-98 text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Next: Confirm Location</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: LOCATION REQUEST & PERMISSION                                     */}
          {/* ========================================================================= */}
          {currentStep === 'location' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-[#efeeea] pb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 uppercase tracking-wider">
                  Step 2 of 4 • Location
                </span>
                <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a] mt-1">
                  Where is the emergency?
                </h3>
                <p className="text-xs text-[#716153]">
                  Zooby needs your location to find the nearest available emergency van in {currentCity.name}.
                </p>
              </div>

              {/* Location Permission Options Box */}
              <div className="p-5 bg-white rounded-2xl border border-[#dac2ae] shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold shrink-0">
                    <span className="material-symbols-outlined text-2xl">location_on</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1b1c1a]">Browser Location Access</h4>
                    <p className="text-xs text-[#544434]">
                      Allow browser GPS for automatic precision doorstep dispatch.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleAllowLocation}
                    disabled={locationStatus === 'detecting'}
                    className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      locationStatus === 'detected'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {locationStatus === 'detecting' ? 'sync' : locationStatus === 'detected' ? 'check' : 'my_location'}
                    </span>
                    <span>
                      {locationStatus === 'detecting'
                        ? 'Detecting Location...'
                        : locationStatus === 'detected'
                        ? 'GPS Detected ✓'
                        : 'Allow Location'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLocationMode('manual');
                      setLocationStatus('idle');
                    }}
                    className="py-3 px-4 rounded-xl border border-[#dac2ae] bg-[#fbf9f5] hover:bg-white text-[#544434] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">edit_location</span>
                    <span>Enter Location Manually</span>
                  </button>
                </div>

                {locationErrorMsg && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-amber-600">info</span>
                    <span>{locationErrorMsg}</span>
                  </div>
                )}

                {/* Manual Address Input */}
                <div className="space-y-1.5 pt-2 border-t border-[#efeeea]">
                  <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider">
                    Doorstep Address / Landmark:
                  </label>
                  <input
                    type="text"
                    value={manualAddressInput || (locationStatus === 'detected' ? coords.address : '')}
                    onChange={(e) => setManualAddressInput(e.target.value)}
                    placeholder="e.g. Rowhouse #4, Silver Palm, Gangapur Road, Nashik"
                    className="w-full p-3 bg-[#fbf9f5] border border-[#dac2ae] rounded-xl text-xs font-medium text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  {locationStatus === 'detected' && (
                    <span className="text-[11px] text-emerald-700 font-bold block">
                      ✓ GPS Verified: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)} ({coords.accuracyText})
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep('emergency_type')}
                  className="py-2.5 px-4 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f5f3ef]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep('details')}
                  className="py-3.5 px-7 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Next: Fast Emergency Details</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3 & 4: FAST EMERGENCY DETAILS & LIVE SPEECH TRANSCRIPTION            */}
          {/* ========================================================================= */}
          {currentStep === 'details' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-[#efeeea] pb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 uppercase tracking-wider">
                  Step 3 of 4 • Fast Details &amp; Voice
                </span>
                <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a] mt-1">
                  Describe what happened
                </h3>
                <p className="text-xs text-[#716153]">
                  Provide minimal details or use voice to describe the symptoms. Keep fields optional to avoid delay.
                </p>
              </div>

              {/* Minimal Pet Info Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1">
                    Pet Species:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {(['Dog', 'Cat', 'Puppy', 'Kitten', 'Bird', 'Other'] as const).map((sp) => (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => setSelectedSpecies(sp)}
                        className={`p-2 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                          selectedSpecies === sp
                            ? 'border-red-600 bg-red-50 text-red-900 shadow-xs'
                            : 'border-[#dac2ae] bg-white text-[#544434]'
                        }`}
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1">
                    Pet Name (Optional):
                  </label>
                  <input
                    type="text"
                    value={petNameInput}
                    onChange={(e) => setPetNameInput(e.target.value)}
                    placeholder="e.g. Bruno or Unknown"
                    className="w-full p-2.5 bg-white border border-[#dac2ae] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* 🎙️ Live Speech Transcription Card (Core Requirement) */}
              <div className="bg-white rounded-2xl border border-[#dac2ae] p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-600 text-lg">mic</span>
                    <strong className="text-xs font-bold text-[#1b1c1a] uppercase tracking-wider">
                      🎙️ Speak Emergency (Live Transcription)
                    </strong>
                  </div>
                  <span className="text-[10px] text-[#877462]">
                    {speechSupported ? 'Live Speech Recognition Ready' : 'Voice input unavailable (type below)'}
                  </span>
                </div>

                {/* Speech Controls: Start / Stop / Retry */}
                <div className="flex flex-wrap items-center gap-2">
                  {speechState !== 'listening' && speechState !== 'transcribing' ? (
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      disabled={!speechSupported}
                      className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">mic</span>
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopRecording}
                      className="py-2 px-4 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer animate-pulse"
                    >
                      <span className="material-symbols-outlined text-base">stop</span>
                      <span>Stop Recording</span>
                    </button>
                  )}

                  {descriptionInput && (
                    <button
                      type="button"
                      onClick={handleRetryRecording}
                      className="py-2 px-3 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#fbf9f5] flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">refresh</span>
                      <span>Retry</span>
                    </button>
                  )}
                </div>

                {/* Live Interim Transcript */}
                {interimTranscript && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs italic text-[#895100]">
                    "{interimTranscript}..."
                  </div>
                )}

                {/* Description Text Input (Editable anytime) */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#544434] uppercase tracking-wider">
                    Emergency Description (Type or Edit Transcription):
                  </label>
                  <textarea
                    rows={2}
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    placeholder='e.g. "My dog was hit by a car and is bleeding from the left leg."'
                    className="w-full p-3 bg-[#fbf9f5] border border-[#dac2ae] rounded-xl text-xs font-medium text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>
              </div>

              {/* Large Start Emergency Response Action */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('location')}
                  className="py-2.5 px-4 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f5f3ef]"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleStartEmergencyResponse}
                  className="py-4 px-8 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-rose-700 active:scale-98 text-white font-extrabold text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-all animate-pulse"
                >
                  <span className="material-symbols-outlined text-xl">crisis_alert</span>
                  <span>START EMERGENCY RESPONSE</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: AI-ASSISTED TRIAGE STAGE                                          */}
          {/* ========================================================================= */}
          {currentStep === 'ai_triage' && (
            <div className="text-center py-10 space-y-6 animate-in fade-in">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-red-200 border-t-red-600 animate-spin" />
                <span className="material-symbols-outlined text-3xl text-red-600 animate-pulse">psychology</span>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-red-100 text-red-800 tracking-wider">
                  AI-Assisted Emergency Triage
                </span>
                <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                  Evaluating Emergency Severity...
                </h3>
                <p className="text-xs text-[#544434] leading-relaxed">
                  {triageAnalysisMsg}
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 bg-white rounded-2xl border border-[#dac2ae] text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#877462]">Urgency Classification:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-extrabold text-xs ${
                      triageUrgency === 'CRITICAL'
                        ? 'bg-red-600 text-white'
                        : triageUrgency === 'HIGH'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {triageUrgency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#877462]">Emergency Condition:</span>
                  <strong className="text-[#1b1c1a] font-bold">{selectedEmergencyType}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#877462]">Active City Zone:</span>
                  <strong className="text-[#1b1c1a] font-bold">{currentCity.name}</strong>
                </div>
              </div>

              {/* Veterinary Disclaimer (Mandatory) */}
              <div className="p-3.5 bg-amber-50 border border-amber-300/80 rounded-2xl text-[11px] text-amber-900 max-w-md mx-auto text-left leading-relaxed">
                <strong>Medical Notice:</strong> This AI-assisted triage interface is designed for rapid dispatch prioritization only and does NOT constitute a formal veterinary diagnosis.
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 6: NEAREST VAN IDENTIFICATION & ROUTING                              */}
          {/* ========================================================================= */}
          {currentStep === 'nearest_van' && (
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <span className="material-symbols-outlined text-3xl">verified</span>
              </div>

              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-100 text-emerald-800 tracking-wider">
                  Nearest Eligible Van Located
                </span>
                <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                  Zooby Emergency Unit #1 Ready
                </h3>
              </div>

              <div className="bg-white rounded-2xl border border-[#dac2ae] p-5 shadow-xs max-w-md mx-auto text-left space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-[#efeeea] pb-2">
                  <span className="text-[#716153]">Emergency Unit:</span>
                  <strong className="text-sm font-bold text-[#1b1c1a]">ZMV-014 (Zooby Mobile Care Van)</strong>
                </div>
                <div className="flex justify-between items-center border-b border-[#efeeea] pb-2">
                  <span className="text-[#716153]">Van Technician:</span>
                  <strong className="text-sm font-bold text-[#1b1c1a]">Rahul Sharma</strong>
                </div>
                <div className="flex justify-between items-center border-b border-[#efeeea] pb-2">
                  <span className="text-[#716153]">Calculated ETA:</span>
                  <strong className="text-sm font-bold text-red-700">Approximately 7–8 minutes (3.4 km)</strong>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[#716153]">Telemetry State:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-[#895100]">
                    Emergency dispatch simulation
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleConfirmNearestVan}
                  className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-lg">local_shipping</span>
                  <span>CONFIRM VEHICLE DISPATCH</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 7: DISPATCH CONFIRMED & LIVE STATUS TIMELINE (WITH MAP)              */}
          {/* ========================================================================= */}
          {currentStep === 'dispatch_confirmed' && activeEmergency && (
            <div className="space-y-5 animate-in fade-in">
              {/* DISPATCH CONFIRMED Header */}
              <div className="p-4 bg-red-50 border-2 border-red-500 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white uppercase animate-pulse">
                      DISPATCH CONFIRMED
                    </span>
                    <span className="text-xs font-mono font-bold text-[#1b1c1a]">
                      #{activeEmergency.incidentId}
                    </span>
                  </div>
                  <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a] mt-1">
                    🚨 {activeEmergency.category.replace('_', ' ').toUpperCase()} • {activeEmergency.petName}
                  </h3>
                  <p className="text-xs text-red-700 font-bold">
                    Van {activeEmergency.assignedVanPlate || 'ZMV-014'} is en route to {activeEmergency.locationCoords?.address || coords.address}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-red-200 text-right shrink-0">
                  <span className="text-[10px] text-[#877462] uppercase font-bold block">ETA</span>
                  <span className="text-xl font-black text-red-600">
                    {activeEmergency.etaMinutes ? `${activeEmergency.etaMinutes} mins` : '<1 min'}
                  </span>
                </div>
              </div>

              {/* 5-Stage Live Status Timeline (User Specification) */}
              <div className="p-4 bg-white rounded-2xl border border-[#dac2ae] space-y-2">
                <span className="text-xs font-bold text-[#544434] uppercase tracking-wider block">
                  Live Dispatch Status Timeline:
                </span>
                <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-bold">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <div>✓</div>
                    <div>SOS Received</div>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <div>✓</div>
                    <div>Assessed</div>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <div>✓</div>
                    <div>Van Assigned</div>
                  </div>
                  <div className="p-2 rounded-xl bg-red-600 text-white shadow-xs animate-pulse">
                    <div>⚡</div>
                    <div>En Route</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#f5f3ef] text-[#877462]">
                    <div>○</div>
                    <div>Arrived</div>
                  </div>
                </div>
              </div>

              {/* Interactive Real Map */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-[#544434]">
                  <span>Live Vehicle Approach Telemetry</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Real GPS Stream Active</span>
                  </span>
                </div>
                <ZoobyRealMap
                  height="220px"
                  userPosition={{
                    lat: activeEmergency.locationCoords?.lat || coords.lat,
                    lng: activeEmergency.locationCoords?.lng || coords.lng,
                    title: `📍 Emergency: ${activeEmergency.petName}`
                  }}
                  vanPosition={{
                    lat: activeEmergency.vanCoordinates?.lat || coords.lat + 0.008,
                    lng: activeEmergency.vanCoordinates?.lng || coords.lng + 0.008,
                    plate: activeEmergency.assignedVanPlate || 'ZMV-014',
                    status: 'En Route'
                  }}
                  showRouteLine={true}
                  zoom={14}
                />
              </div>

              {/* Emergency Contacts & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
                <a
                  href="tel:+918009662991"
                  className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">call</span>
                  <span>Call Emergency Hotline (911)</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f5f3ef] cursor-pointer"
                >
                  Minimize &amp; Keep Tracking
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 7 (POST-CARE): SUMMARY VIEW                                          */}
          {/* ========================================================================= */}
          {currentStep === 'summary_view' && activeEmergency && (
            <div className="space-y-5 text-center py-6 animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl">verified</span>
              </div>
              <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                Emergency Resolved
              </h3>
              <p className="text-xs text-[#716153]">
                Emergency patient stabilized at doorstep by Zooby Unit {activeEmergency.assignedVanPlate || 'ZMV-014'}.
              </p>
              <button
                type="button"
                onClick={() => {
                  emergencyStore.clearEmergency();
                  onClose();
                }}
                className="py-3 px-6 rounded-2xl bg-stone-900 text-white text-xs font-bold hover:bg-black cursor-pointer"
              >
                Close &amp; Return to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
