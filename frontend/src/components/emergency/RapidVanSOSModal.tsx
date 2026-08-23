import React, { useState, useEffect, useRef } from 'react';
import {
  EmergencyCategory,
  EmergencyIncident,
  EmergencyTriageDetails,
  EmergencyStatus,
  Pet,
  UserProfile,
  VanLocation
} from '../../types';
import {
  getCurrentDeviceLocation,
  GeoCoordinates,
  checkGeolocationPermission,
  calculateDistanceKm,
  calculateTravelEtaMinutes,
  subscribeToVanLocationStream
} from '../../services/gpsTracking';
import {
  startVoiceEmergencyTranscription,
  speakEmergencyGuidance,
  evaluateAITriage,
  SpeechRecognitionState
} from '../../services/aiTriage';
import { ZoobyRealMap } from '../common/ZoobyRealMap';

interface RapidVanSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  pets?: Pet[];
  onSOSDispatched?: (incident: EmergencyIncident) => void;
}

const EMERGENCY_CATEGORIES: Array<{
  id: EmergencyCategory;
  label: string;
  icon: string;
  badgeColor: string;
}> = [
  { id: 'injury_bleeding', label: 'Injury / Bleeding', icon: 'bloodtype', badgeColor: 'bg-rose-100 text-rose-800' },
  { id: 'breathing_problem', label: 'Breathing Problem', icon: 'air', badgeColor: 'bg-sky-100 text-sky-800' },
  { id: 'unconscious_unresponsive', label: 'Unconscious / Collapse', icon: 'bedtime', badgeColor: 'bg-purple-100 text-purple-800' },
  { id: 'possible_poisoning', label: 'Poisoning / Toxicity', icon: 'skull', badgeColor: 'bg-amber-100 text-amber-800' },
  { id: 'accident_trauma', label: 'Accident / Vehicle Trauma', icon: 'car_crash', badgeColor: 'bg-red-100 text-red-800' },
  { id: 'severe_pain', label: 'Severe Pain', icon: 'healing', badgeColor: 'bg-orange-100 text-orange-800' },
  { id: 'severe_illness', label: 'Sudden Severe Illness', icon: 'coronavirus', badgeColor: 'bg-yellow-100 text-yellow-800' },
  { id: 'lost_injured_animal', label: 'Lost / Injured Stray', icon: 'pets', badgeColor: 'bg-emerald-100 text-emerald-800' },
  { id: 'other', label: 'Other Emergency', icon: 'emergency', badgeColor: 'bg-stone-100 text-stone-800' }
];

export const RapidVanSOSModal: React.FC<RapidVanSOSModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  pets = [],
  onSOSDispatched
}) => {
  // Step state machine
  const [step, setStep] = useState<
    'confirm_start' | 'details_and_location' | 'triage_evaluating' | 'dispatched_live_tracking'
  >('confirm_start');

  // Input states
  const [selectedPet, setSelectedPet] = useState<Pet | null>(pets[0] || null);
  const [isOtherAnimal, setIsOtherAnimal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('injury_bleeding');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '+91 98201 45678');

  // Location states
  const [locationStatus, setLocationStatus] = useState<'pending' | 'detecting' | 'detected' | 'denied' | 'error'>('pending');
  const [deviceCoords, setDeviceCoords] = useState<GeoCoordinates | null>(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState('');

  // Voice speech-to-text states
  const [speechState, setSpeechState] = useState<SpeechRecognitionState>('idle');
  const stopVoiceRef = useRef<(() => void) | null>(null);

  // Active Incident & Live Dispatch state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triageResult, setTriageResult] = useState<EmergencyTriageDetails | null>(null);
  const [activeIncident, setActiveIncident] = useState<EmergencyIncident | null>(null);
  const [liveVanLocation, setLiveVanLocation] = useState<VanLocation | null>(null);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [calculatedEta, setCalculatedEta] = useState<number | null>(null);

  // Reset modal when opened
  useEffect(() => {
    if (isOpen) {
      setStep('confirm_start');
      setSelectedPet(pets[0] || null);
      setIsOtherAnimal(false);
      setSelectedCategory('injury_bleeding');
      setDescription('');
      setLocationStatus('pending');
      setDeviceCoords(null);
      setActiveIncident(null);
      setTriageResult(null);
      setLiveVanLocation(null);
    } else {
      if (stopVoiceRef.current) {
        stopVoiceRef.current();
        stopVoiceRef.current = null;
      }
    }
  }, [isOpen, pets]);

  // Handle GPS location detection
  const handleDetectLocation = async () => {
    setLocationStatus('detecting');
    setLocationErrorMsg('');

    try {
      const coords = await getCurrentDeviceLocation({
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      });
      setDeviceCoords(coords);
      setLocationStatus('detected');
    } catch (err: any) {
      console.warn('Geolocation capture failed:', err);
      setLocationStatus('denied');
      setLocationErrorMsg(
        err?.message || 'Location permission was denied. Location is required to dispatch the emergency van to your exact doorstep.'
      );
    }
  };

  // Toggle Live Speech-to-Text
  const handleToggleVoiceInput = () => {
    if (speechState === 'listening' || speechState === 'transcribing') {
      if (stopVoiceRef.current) {
        stopVoiceRef.current();
        stopVoiceRef.current = null;
      }
      setSpeechState('idle');
    } else {
      const stop = startVoiceEmergencyTranscription(
        (interim) => {
          // Live interim preview
        },
        (final) => {
          setDescription((prev) => (prev ? `${prev} ${final}` : final));
        },
        (state) => {
          setSpeechState(state);
        }
      );
      stopVoiceRef.current = stop;
    }
  };

  // Dispatch 24/7 SOS
  const handleInitiateSOSDispatch = async () => {
    if (!deviceCoords) {
      alert('Please detect your real GPS location first so our emergency van can navigate to you.');
      return;
    }

    setIsSubmitting(true);
    setStep('triage_evaluating');

    // 1. Perform AI Clinical Triage
    const triage = await evaluateAITriage({
      category: selectedCategory,
      description: description || 'Emergency SOS dispatched from quick selection',
      petName: isOtherAnimal ? 'Rescue Animal' : selectedPet?.name,
      petSpecies: isOtherAnimal ? 'Animal' : selectedPet?.species,
      petBreed: isOtherAnimal ? 'Unknown' : selectedPet?.breed
    });

    setTriageResult(triage);

    // Speak initial reassurance
    speakEmergencyGuidance(
      `Zooby Emergency Assistance activated for ${
        isOtherAnimal ? 'your animal' : selectedPet?.name || 'your pet'
      }. Stay calm. We are scanning for the nearest available emergency vehicle.`
    );

    // 2. Call backend dispatch API
    try {
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${API_BASE_URL}/emergency/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: currentUser?.name || 'Pet Parent',
          userPhone: contactPhone,
          userEmail: currentUser?.email,
          petId: isOtherAnimal ? undefined : selectedPet?.id,
          petName: isOtherAnimal ? 'Rescue Animal' : selectedPet?.name,
          petSpecies: isOtherAnimal ? 'Animal' : selectedPet?.species,
          petBreed: isOtherAnimal ? 'Stray / Mixed' : selectedPet?.breed,
          category: selectedCategory,
          description: description || 'Emergency mobile assistance requested',
          location: {
            latitude: deviceCoords.latitude,
            longitude: deviceCoords.longitude,
            accuracy: deviceCoords.accuracy,
            address: currentUser?.location || 'Nashik Doorstep Service Point'
          }
        })
      });

      if (res.ok) {
        const json = await res.json();
        const incident: EmergencyIncident = json.data;
        setActiveIncident(incident);
        if (onSOSDispatched) onSOSDispatched(incident);

        // Calculate initial distance & ETA if van assigned
        if (incident.distanceKm != null) {
          setCalculatedDistance(incident.distanceKm);
          setCalculatedEta(incident.etaMinutes ?? calculateTravelEtaMinutes(incident.distanceKm));
        }

        // Voice update
        if (incident.status === 'RESOURCE_ASSIGNED' || incident.status === 'DISPATCH_CONFIRMED') {
          setTimeout(() => {
            speakEmergencyGuidance(
              `Emergency vehicle ${incident.assignedVanPlate || 'Unit 1'} is assigned. Estimated arrival time is ${
                incident.etaMinutes || 8
              } minutes.`
            );
          }, 1500);
        }
      }
    } catch (err) {
      console.warn('Backend SOS dispatch failed:', err);
    }

    setIsSubmitting(false);
    setStep('dispatched_live_tracking');
  };

  // Subscribe to real-time van stream when in live tracking step
  useEffect(() => {
    if (step !== 'dispatched_live_tracking') return;

    const unsubscribe = subscribeToVanLocationStream((loc) => {
      setLiveVanLocation(loc);
      if (deviceCoords) {
        const dist = calculateDistanceKm(
          deviceCoords.latitude,
          deviceCoords.longitude,
          loc.latitude,
          loc.longitude
        );
        setCalculatedDistance(dist);
        setCalculatedEta(calculateTravelEtaMinutes(dist, loc.speed ? loc.speed * 3.6 : undefined));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [step, deviceCoords]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#fcfbfa] w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-rose-500/40 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Emergency Modal Top Banner */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 px-6 py-4 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-rose-600 flex items-center justify-center font-bold shadow-xs animate-pulse">
              <span className="material-symbols-outlined text-2xl filled-icon">emergency</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-quicksand font-bold text-xl text-white tracking-tight">
                  Zooby Rapid Van SOS
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                  24/7 Active
                </span>
              </div>
              <p className="text-xs text-rose-100">
                Immediate veterinary triage &amp; mobile emergency van dispatch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close Emergency Modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-grow">
          {/* ========================================================================= */}
          {/* STEP 1: ACCIDENTAL ACTIVATION SAFEGUARD / CONFIRMATION                     */}
          {/* ========================================================================= */}
          {step === 'confirm_start' && (
            <div className="text-center py-4 space-y-6 animate-in fade-in">
              <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50 shadow-inner">
                <span className="material-symbols-outlined text-4xl filled-icon animate-bounce">
                  emergency
                </span>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                  Do you need immediate emergency assistance?
                </h3>
                <p className="text-sm text-[#544434] leading-relaxed">
                  We'll help identify the urgency with AI triage and locate the nearest available Zooby mobile medical van.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-1/2 py-3 px-4 rounded-2xl bg-white border border-[#dac2ae] text-[#544434] hover:bg-[#f5f3ef] font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancel / False Alarm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('details_and_location');
                    handleDetectLocation();
                  }}
                  className="w-full sm:w-1/2 py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Yes, Start SOS</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: DETAILS, LOCATION, SPEECH TRANSCRIPTION, & FAST CATEGORIES        */}
          {/* ========================================================================= */}
          {step === 'details_and_location' && (
            <div className="space-y-6 animate-in fade-in">
              {/* 1. Pet Selection */}
              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-2">
                  1. Which pet needs urgent help?
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
                          ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-500/20 font-bold'
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
                        ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-500/20 font-bold'
                        : 'border-[#dac2ae] bg-white hover:bg-[#fbf9f5]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#895100] flex items-center justify-center font-bold shrink-0">
                      <span className="material-symbols-outlined text-lg">pets</span>
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-[#1b1c1a] truncate">Stray / Rescue</div>
                      <div className="text-[10px] text-[#716153] truncate">Other Animal</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Fast Emergency Categories */}
              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-2">
                  2. Select Primary Emergency Condition
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EMERGENCY_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-rose-600 bg-rose-50/70 text-rose-900 font-bold ring-2 ring-rose-500/20'
                            : 'border-[#e5e0d8] bg-white hover:bg-[#fbf9f5] text-[#1b1c1a]'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-lg ${isSelected ? 'text-rose-600' : 'text-[#877462]'}`}>
                          {cat.icon}
                        </span>
                        <span className="text-xs truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Fast Speech Transcription or Free-form text */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider">
                    3. Describe What Happened (Voice or Text)
                  </label>

                  {/* Speak Emergency CTA button */}
                  <button
                    type="button"
                    onClick={handleToggleVoiceInput}
                    className={`py-1 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      speechState === 'listening' || speechState === 'transcribing'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {speechState === 'listening' || speechState === 'transcribing' ? 'mic' : 'mic_none'}
                    </span>
                    <span>
                      {speechState === 'listening'
                        ? 'Listening...'
                        : speechState === 'transcribing'
                        ? 'Transcribing...'
                        : 'Speak Emergency'}
                    </span>
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. My pet was struck by a bicycle on Gangapur Road and has a bleeding hind leg..."
                  className="w-full p-3 bg-white border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              {/* 4. Real Geolocation Status & Live Map Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider">
                    4. Emergency GPS Coordinates
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">my_location</span>
                    <span>Re-detect Location</span>
                  </button>
                </div>

                {locationStatus === 'detecting' && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-[#895100] flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    <span>Detecting your real device GPS coordinates...</span>
                  </div>
                )}

                {locationStatus === 'detected' && deviceCoords && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                        <span>
                          Location detected: <strong>{deviceCoords.latitude.toFixed(4)}, {deviceCoords.longitude.toFixed(4)}</strong> (Accurate to ±{Math.round(deviceCoords.accuracy || 15)}m)
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        GPS Verified
                      </span>
                    </div>

                    {/* Mini Map Preview */}
                    <ZoobyRealMap
                      height="150px"
                      userPosition={{
                        lat: deviceCoords.latitude,
                        lng: deviceCoords.longitude,
                        title: 'Emergency Scene'
                      }}
                      accuracyRadius={deviceCoords.accuracy}
                      zoom={15}
                    />
                  </div>
                )}

                {locationStatus === 'denied' && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <span className="material-symbols-outlined text-base text-rose-600">warning</span>
                      <span>Location Permission Required</span>
                    </div>
                    <p>{locationErrorMsg}</p>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      className="mt-2 py-1.5 px-3 rounded-lg bg-rose-600 text-white font-bold text-xs"
                    >
                      Allow Location Access
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Submit Action */}
              <div className="pt-3 border-t border-[#efeeea] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep('confirm_start')}
                  className="py-2.5 px-4 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f5f3ef]"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleInitiateSOSDispatch}
                  disabled={isSubmitting || locationStatus !== 'detected'}
                  className="py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-98 disabled:opacity-50 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">local_shipping</span>
                  <span>Dispatch Nearest Emergency Van</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: TRIAGE EVALUATION SPINNER                                         */}
          {/* ========================================================================= */}
          {step === 'triage_evaluating' && (
            <div className="text-center py-10 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full border-4 border-rose-200 border-t-rose-600 animate-spin mx-auto" />
              <h3 className="font-quicksand font-bold text-xl text-[#1b1c1a]">
                AI Triage Engine &amp; Van Matching Active...
              </h3>
              <p className="text-xs text-[#544434] max-w-sm mx-auto">
                Analyzing emergency urgency, generating immediate first aid guidance, and locating nearest available mobile unit in Nashik.
              </p>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: DISPATCHED LIVE TRACKING, REAL MAP, & ETA                          */}
          {/* ========================================================================= */}
          {step === 'dispatched_live_tracking' && activeIncident && (
            <div className="space-y-5 animate-in fade-in">
              {/* Top Urgency & Dispatch Status Card */}
              <div className="bg-white rounded-2xl border border-[#dac2ae] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0">
                    <span className="material-symbols-outlined text-2xl">local_shipping</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                        {activeIncident.status === 'RESOURCE_ASSIGNED' || activeIncident.status === 'EN_ROUTE'
                          ? 'Emergency Van Dispatched'
                          : activeIncident.status === 'NO_RESOURCE_AVAILABLE'
                          ? 'No Van Available Nearby'
                          : activeIncident.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        Priority: {activeIncident.triage.urgency}
                      </span>
                    </div>
                    <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a]">
                      {activeIncident.assignedVanPlate || 'Unit #1'} • {activeIncident.assignedWorkerName || 'Lead Mobile Technician'}
                    </h3>
                  </div>
                </div>

                {/* Real Calculated ETA */}
                <div className="bg-[#fbf9f5] px-4 py-2 rounded-xl border border-[#efeeea] text-right">
                  <div className="text-[10px] uppercase font-bold text-[#877462]">Estimated Arrival</div>
                  <div className="text-lg font-bold text-[#1b1c1a]">
                    {calculatedEta ? `${calculatedEta} mins` : 'ETA calculating...'}
                  </div>
                  <div className="text-[10px] text-[#716153]">
                    {calculatedDistance ? `${calculatedDistance} km away` : 'Locating...'}
                  </div>
                </div>
              </div>

              {/* Real Interactive Leaflet GPS Map */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-[#544434]">
                  <span>Live GPS Van Telemetry</span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Real-time GPS Stream Active</span>
                  </span>
                </div>

                <ZoobyRealMap
                  height="280px"
                  userPosition={
                    deviceCoords
                      ? {
                          lat: deviceCoords.latitude,
                          lng: deviceCoords.longitude,
                          title: `${currentUser?.name || 'Pet Parent'} (Emergency Scene)`
                        }
                      : null
                  }
                  vanPosition={
                    liveVanLocation
                      ? {
                          lat: liveVanLocation.latitude,
                          lng: liveVanLocation.longitude,
                          heading: liveVanLocation.heading,
                          plate: liveVanLocation.vanPlate,
                          speed: liveVanLocation.speed,
                          status: 'En Route (SOS)'
                        }
                      : {
                          lat: 19.9975, // Default Nashik Hub initial point
                          lng: 73.7898,
                          plate: activeIncident.assignedVanPlate || 'MH 15 ZB 4022',
                          status: 'En Route (SOS)'
                        }
                  }
                  showRouteLine={true}
                  zoom={14}
                />
              </div>

              {/* AI Clinical Triage & Approved First-Aid Guidance */}
              <div className="bg-rose-50/60 rounded-2xl border border-rose-200 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                  <span className="material-symbols-outlined text-base">medical_services</span>
                  <span>AI First-Aid Guidance While Van Approaches</span>
                </div>
                <p className="text-xs text-[#544434] leading-relaxed">
                  {activeIncident.triage.summary}
                </p>
                <div className="space-y-1.5">
                  {activeIncident.triage.firstAidAdvice.map((advice, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#1b1c1a]">
                      <span className="font-bold text-rose-700">•</span>
                      <span>{advice}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Hotline Backup (Always available) */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-stone-100 rounded-xl text-xs">
                <div className="flex items-center gap-2 text-[#544434]">
                  <span className="material-symbols-outlined text-base text-rose-600">call</span>
                  <span>24/7 Emergency Vet Hotline: <strong>+91 98200 12345</strong></span>
                </div>
                <a
                  href="tel:+919820012345"
                  className="py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  Call Hotline Now
                </a>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-black cursor-pointer"
                >
                  Keep Tracking in Background
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
