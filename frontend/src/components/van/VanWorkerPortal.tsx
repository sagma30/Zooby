import React, { useState, useEffect, useRef } from 'react';
import { VanJob, UserProfile, PetCareRecord, EmergencyIncident } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ZoobyRealMap } from '../common/ZoobyRealMap';
import {
  watchDeviceLocation,
  pushVanLocationUpdate,
  GeoCoordinates,
  calculateDistanceKm,
  calculateTravelEtaMinutes
} from '../../services/gpsTracking';

import { emergencyStore, EmergencyState } from '../../services/emergencyStore';
import { getDynamicGreeting, getUserDisplayName, getPersonalizedEmptyState } from '../../utils/identity';
import { ZoobyLogo } from '../common/ZoobyLogo';

interface VanWorkerPortalProps {
  user?: UserProfile;
  currentTab?: string;
  jobs: VanJob[];
  onUpdateJobStatus?: (jobId: string, status: VanJob['status'], completionData?: {
    notes: string;
    vitals?: { weight?: string; coatCondition?: string; behaviorNote?: string; temperature?: string };
  }) => void;
  onUpdateJobs?: React.Dispatch<React.SetStateAction<VanJob[]>>;
  onNavigate: (path: string) => void;
}

export const VanWorkerPortal: React.FC<VanWorkerPortalProps> = ({
  user: propUser,
  currentTab = 'dashboard',
  jobs = [],
  onUpdateJobStatus,
  onUpdateJobs,
  onNavigate
}) => {
  const { user: authUser, logout } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('zooby_auth_token') || undefined : undefined;

  const activeUser = authUser || propUser || {
    id: 'usr-van-rahul',
    name: 'Rahul Sharma',
    displayName: 'Rahul Sharma',
    firstName: 'Rahul',
    lastName: 'Sharma',
    email: 'rahul.van@zooby.care',
    phone: '+91 98223 99001',
    role: 'VAN_WORKER' as const,
    location: 'College Road, Nashik',
    city: 'Nashik',
    assignedVanPlate: 'ZMV-014',
    jobTitle: 'Lead Mobile Technician',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=240'
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'route' | 'supplies' | 'history'>((currentTab as any) || 'dashboard');
  const [selectedJob, setSelectedJob] = useState<VanJob | null>(jobs[0] || null);
  const [isCompletingJob, setIsCompletingJob] = useState(false);
  const [simulatedDirections, setSimulatedDirections] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const safeJobs = jobs || [];
  const activeJobs = safeJobs.filter((j) => j.status !== 'Service Completed');
  const completedJobs = safeJobs.filter((j) => j.status === 'Service Completed');
  const nextScheduledJob = activeJobs[0] || null;

  // --- Real Device Geolocation Tracking State ---
  const [isGpsActive, setIsGpsActive] = useState<boolean>(true);
  const [deviceCoords, setDeviceCoords] = useState<GeoCoordinates | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // --- Synchronized Shared Emergency State ---
  const [emergency, setEmergency] = useState<EmergencyState | null>(() => emergencyStore.getActiveEmergency());
  const [isAddingNotes, setIsAddingNotes] = useState(false);
  const [clinicalNoteInput, setClinicalNoteInput] = useState('');
  const [treatmentInput, setTreatmentInput] = useState('');

  // Listen to emergencyStore updates
  useEffect(() => {
    const handleUpdate = (updated: EmergencyState) => {
      setEmergency({ ...updated });
    };
    const handleCleared = () => {
      setEmergency(null);
    };

    emergencyStore.on('emergency_updated', handleUpdate);
    emergencyStore.on('emergency_resolved', handleUpdate);
    emergencyStore.on('emergency_cleared', handleCleared);

    return () => {
      emergencyStore.off('emergency_updated', handleUpdate);
      emergencyStore.off('emergency_resolved', handleUpdate);
      emergencyStore.off('emergency_cleared', handleCleared);
    };
  }, []);

  // --- Continuous Real Geolocation Watcher ---
  useEffect(() => {
    if (!isGpsActive) return;

    const stopWatching = watchDeviceLocation(
      (coords) => {
        setDeviceCoords(coords);
        setGpsError(null);
        pushVanLocationUpdate('van-zmv-014', coords, token, {
          workerName: activeUser.name,
          trackingStatus: 'ACTIVE',
          currentJobId: nextScheduledJob?.id,
          currentEmergencyId: emergency?.incidentId
        });
      },
      (err) => {
        console.warn('Van worker geolocation error:', err);
        setGpsError(err.message || 'GPS location unavailable');
      }
    );

    return () => {
      stopWatching();
    };
  }, [isGpsActive, token, activeUser.name, nextScheduledJob?.id, emergency?.incidentId]);

  // Sync tab if currentTab prop changes from external router
  useEffect(() => {
    if (currentTab) {
      setActiveTab(currentTab as any);
    }
  }, [currentTab]);

  // Completion form state
  const [completionForm, setCompletionForm] = useState({
    notes: 'Warm water hydrobath completed, organic shampoo treatment, ear cleaning & gentle nail trim. Pet coat is soft and clean.',
    weight: '32 kg',
    coatCondition: 'Clean, Glossy & De-shedded',
    temperature: '101.4°F (Normal)',
    behaviorNote: 'Calm and happy during warm air blow drying'
  });

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => {
      setActionNotice((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleUpdateStatusInternal = (jobId: string, status: VanJob['status'], completionData?: any) => {
    if (onUpdateJobStatus) {
      onUpdateJobStatus(jobId, status, completionData);
    } else if (onUpdateJobs) {
      onUpdateJobs((prev) =>
        prev.map((j) => {
          if (j.id === jobId) {
            return {
              ...j,
              status,
              ...(completionData ? { completedAt: 'Just now', notes: completionData.notes } : {})
            };
          }
          return j;
        })
      );
    }
  };

  const handleNextStatus = (job: VanJob) => {
    if (job.status === 'Assigned') {
      handleUpdateStatusInternal(job.id, 'On the Way');
      showNotification(`Trip started for ${job.petName}. ETA broadcast to pet parent.`);
    } else if (job.status === 'On the Way') {
      handleUpdateStatusInternal(job.id, 'Arrived');
      showNotification(`Arrived at ${job.customerAddress}. Notified pet parent.`);
    } else if (job.status === 'Arrived') {
      handleUpdateStatusInternal(job.id, 'Service Started');
      showNotification(`Hydrobath service started for ${job.petName}.`);
    } else if (job.status === 'Service Started') {
      setSelectedJob(job);
      setIsCompletingJob(true);
    }
  };

  const handleFinishJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    handleUpdateStatusInternal(selectedJob.id, 'Service Completed', {
      notes: completionForm.notes,
      vitals: {
        weight: completionForm.weight,
        coatCondition: completionForm.coatCondition,
        temperature: completionForm.temperature,
        behaviorNote: completionForm.behaviorNote
      }
    });

    showNotification(`Care visit completed! PetCare health record created for ${selectedJob.petName}.`);
    setIsCompletingJob(false);
    setSelectedJob(null);
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1b1c1a] font-jakarta pb-16 md:pb-8">
      {/* Mobile-Friendly Van Header */}
      <header className="sticky top-0 z-30 bg-[#1b1c1a] text-white px-4 md:px-8 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shadow-xs">
            <span className="material-symbols-outlined text-[24px]">local_shipping</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-quicksand font-bold text-lg text-amber-400">Zooby Van Fleet</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                {activeUser.assignedVanPlate || 'MH 15 ZB 4022'}
              </span>
            </div>
            <p className="text-xs text-stone-400">{activeUser.name || 'Vikram Pawar'} • Lead Mobile Technician</p>
          </div>
        </div>

        {/* Right Status & Logout */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsGpsActive(!isGpsActive)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isGpsActive
                ? gpsError
                  ? 'bg-amber-950 text-amber-300 border border-amber-500'
                  : 'bg-stone-800 text-emerald-300 border border-emerald-500/50 hover:bg-stone-700'
                : 'bg-stone-800 text-stone-400 border border-stone-600 hover:bg-stone-700'
            }`}
            title={isGpsActive ? 'Click to Pause GPS Tracking' : 'Click to Resume GPS Tracking'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isGpsActive
                  ? gpsError
                    ? 'bg-amber-400'
                    : 'bg-emerald-400 animate-pulse'
                  : 'bg-stone-500'
              }`}
            />
            <span className="hidden sm:inline">
              {isGpsActive
                ? gpsError
                  ? 'GPS Permission Pending'
                  : deviceCoords
                  ? `Live GPS Active (±${Math.round(deviceCoords.accuracy || 10)}m)`
                  : 'Acquiring GPS...'
                : 'Tracking Paused'}
            </span>
            <span className="sm:hidden">{isGpsActive ? 'GPS On' : 'GPS Off'}</span>
          </button>
          <button
            onClick={() => logout('/')}
            className="p-2 text-stone-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1 text-xs"
            title="Log Out"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Action Toast Notification */}
      {/* 🚨 High-Priority Emergency Dispatch Alert Banner & Active Care UI */}
      {emergency && emergency.status !== 'RESOLVED' && emergency.status !== 'CANCELLED' && (
        <div className="bg-rose-600 text-white px-4 md:px-8 py-4 shadow-xl border-b-2 border-rose-700 animate-in slide-in-from-top-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white text-rose-600 flex items-center justify-center font-bold animate-pulse shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-2xl filled-icon">emergency</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-quicksand font-extrabold text-xs uppercase tracking-wider bg-rose-800 px-2.5 py-0.5 rounded-md">
                    🚨 EMERGENCY REQUEST • #{emergency.incidentId}
                  </span>
                  <span className="text-xs font-bold text-rose-100 bg-white/20 px-2 py-0.5 rounded-full">
                    Priority: {emergency.triage.urgency}
                  </span>
                  <span className="text-xs font-bold text-emerald-200">
                    {emergency.status === 'ARRIVED'
                      ? 'Arrived at Scene'
                      : emergency.status === 'IN_CARE'
                      ? 'Care in Progress'
                      : 'Responding (On Route)'}
                  </span>
                </div>
                <h3 className="font-quicksand font-bold text-base md:text-lg text-white mt-0.5">
                  Pet: <strong>{emergency.petName}</strong> ({emergency.petBreed}) • Emergency: <strong>{emergency.category.replace('_', ' ').toUpperCase()}</strong>
                </h3>
                <p className="text-xs text-rose-100 mt-0.5 flex items-center gap-2">
                  <span>📍 {emergency.emergencyCoordinates.address}</span>
                  <span>•</span>
                  <strong>{emergency.distanceKm > 0 ? `${emergency.distanceKm} km (${emergency.etaMinutes} mins)` : 'At Doorstep'}</strong>
                </p>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {emergency.userPhone && (
                <a
                  href={`tel:${emergency.userPhone}`}
                  className="py-2 px-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">call</span>
                  <span>Call Parent ({emergency.userName})</span>
                </a>
              )}

              {emergency.vetAssigned && (
                <a
                  href={`tel:${emergency.vetAssigned.phone}`}
                  className="py-2 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">stethoscope</span>
                  <span>Call Vet ({emergency.vetAssigned.name})</span>
                </a>
              )}

              {emergency.status === 'DISPATCH_CONFIRMED' && (
                <button
                  type="button"
                  onClick={() => {
                    emergencyStore.acceptByWorker();
                    showNotification('Accepted emergency dispatch! Route started.');
                  }}
                  className="py-2 px-5 rounded-xl bg-white text-rose-700 font-extrabold text-xs shadow-md hover:bg-rose-50 transition-all cursor-pointer"
                >
                  ACCEPT EMERGENCY
                </button>
              )}

              {(emergency.status === 'DISPATCH_CONFIRMED' || emergency.status === 'EN_ROUTE') && (
                <button
                  type="button"
                  onClick={() => {
                    emergencyStore.markArrived();
                    showNotification('Arrived at emergency location! Notified pet parent and vet.');
                  }}
                  className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">task_alt</span>
                  <span>ARRIVED AT SCENE</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Care & Resolution Action Ribbon */}
          {(emergency.status === 'ARRIVED' || emergency.status === 'IN_CARE') && (
            <div className="pt-3 border-t border-rose-500/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase">Active Care Controls:</span>

                {emergency.status === 'ARRIVED' && (
                  <button
                    type="button"
                    onClick={() => {
                      emergencyStore.startActiveCare();
                      showNotification('Started on-scene stabilization & emergency care.');
                    }}
                    className="py-1.5 px-3 rounded-xl bg-white text-rose-700 font-bold text-xs shadow-xs"
                  >
                    START CARE
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsAddingNotes(true)}
                  className="py-1.5 px-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-xs flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">edit_note</span>
                  <span>ADD CLINICAL NOTES</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to resolve this emergency? This will generate the final summary and update the pet health record.')) {
                    emergencyStore.resolveEmergency('Patient stabilized on-scene. Clean wound dressing and vitals normal.');
                    showNotification('Emergency successfully resolved! Health record updated.');
                  }
                }}
                className="py-1.5 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-extrabold text-xs shadow-md cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base">verified</span>
                <span>RESOLVE EMERGENCY</span>
              </button>
            </div>
          )}

          {/* Inline Clinical Note Input */}
          {isAddingNotes && (
            <div className="bg-rose-700/90 p-3 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center font-bold">
                <span>Add On-Scene Clinical Note / Treatment</span>
                <button onClick={() => setIsAddingNotes(false)} className="text-white hover:text-rose-200">
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
              <textarea
                rows={2}
                value={clinicalNoteInput}
                onChange={(e) => setClinicalNoteInput(e.target.value)}
                placeholder="e.g. Cleansed wound on right hind leg, applied sterile dressing, heart rate normal (110 bpm)..."
                className="w-full p-2 bg-white text-black rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (clinicalNoteInput) {
                    emergencyStore.addClinicalNotes(clinicalNoteInput);
                    setClinicalNoteInput('');
                    setIsAddingNotes(false);
                    showNotification('Clinical observation logged to emergency timeline.');
                  }
                }}
                className="py-1 px-3 bg-white text-rose-700 font-bold rounded-lg text-xs"
              >
                Save Note to Record
              </button>
            </div>
          )}
        </div>
      )}

      {actionNotice && (
        <div className="sticky top-[60px] z-40 bg-amber-500 text-black px-4 py-2 text-xs font-bold text-center shadow-md animate-in slide-in-from-top-2 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-[#e6e2dd] px-4 md:px-8 py-2 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'dashboard' ? 'bg-[#895100] text-white shadow-xs' : 'text-[#544434] hover:bg-[#f6f4ee]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">dashboard</span>
          <span>Dashboard Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('route')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'route' ? 'bg-[#895100] text-white shadow-xs' : 'text-[#544434] hover:bg-[#f6f4ee]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">route</span>
          <span>Today's Route ({activeJobs.length} Stops)</span>
        </button>
        <button
          onClick={() => setActiveTab('supplies')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'supplies' ? 'bg-[#895100] text-white shadow-xs' : 'text-[#544434] hover:bg-[#f6f4ee]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">inventory_2</span>
          <span>Van Inventory & Health</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'history' ? 'bg-[#895100] text-white shadow-xs' : 'text-[#544434] hover:bg-[#f6f4ee]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">history</span>
          <span>Completed Visits ({completedJobs.length})</span>
        </button>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* ========================================================================= */}
        {/* TAB: DASHBOARD OVERVIEW (Complete Working Van Worker Experience)           */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 1. Welcome & Status Header Section */}
            <div className="bg-gradient-to-r from-[#1b1c1a] via-[#2d241b] to-[#1b1c1a] text-white rounded-3xl p-6 md:p-8 border border-stone-800 shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Van {activeUser.assignedVanPlate || 'ZMV-014'} Dispatched • Nashik West Sector</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-quicksand text-white">
                    {getDynamicGreeting(activeUser, 'welcome')}!
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
                    You have <strong className="text-amber-400 font-bold">{activeJobs.length} active stops</strong> assigned on your Gangapur Road &amp; College Road route today. Hydrobath water is pre-heated to 38°C and supplies are fully stocked.
                  </p>
                </div>

                {/* Right Quick Telemetry Chips */}
                <div className="flex flex-wrap md:flex-col gap-2 shrink-0 text-xs">
                  <div className="px-3.5 py-2 rounded-xl bg-stone-900/90 border border-stone-700/80 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-400 text-[18px]">water_drop</span>
                    <div>
                      <div className="text-[10px] text-stone-400">Fresh Water Tank</div>
                      <div className="font-bold text-white">82% (240L RO)</div>
                    </div>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-stone-900/90 border border-stone-700/80 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">battery_charging_full</span>
                    <div>
                      <div className="text-[10px] text-stone-400">Aux Inverter Battery</div>
                      <div className="font-bold text-white">94% Active</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Top Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#e6e2dd] shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-[#716153]">
                  <span>Today's Assigned Route</span>
                  <span className="material-symbols-outlined text-amber-600 text-[18px]">route</span>
                </div>
                <div className="text-2xl font-bold text-[#1b1c1a] font-quicksand">
                  {activeJobs.length} <span className="text-xs font-normal text-[#716153]">/ {safeJobs.length} Stops Left</span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  <span>On Schedule across Nashik</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e6e2dd] shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-[#716153]">
                  <span>Next Scheduled Visit</span>
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">event</span>
                </div>
                <div className="text-lg font-bold text-[#1b1c1a] truncate font-quicksand">
                  {nextScheduledJob ? nextScheduledJob.petName : 'All Finished'}
                </div>
                <div className="text-[11px] font-semibold text-[#895100]">
                  {nextScheduledJob ? nextScheduledJob.scheduledTime : 'No more stops'}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e6e2dd] shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-[#716153]">
                  <span>Completed Today</span>
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                </div>
                <div className="text-2xl font-bold text-[#1b1c1a] font-quicksand">
                  {completedJobs.length}
                </div>
                <div className="text-[11px] font-semibold text-stone-600">
                  Digital PetCare Records Issued
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e6e2dd] shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-[#716153]">
                  <span>Van Unit Health</span>
                  <span className="material-symbols-outlined text-purple-600 text-[18px]">minor_crash</span>
                </div>
                <div className="text-lg font-bold text-emerald-700 font-quicksand">
                  100% Ready
                </div>
                <div className="text-[11px] text-stone-600">
                  Plate: {activeUser.assignedVanPlate || 'MH 15 ZB 4022'}
                </div>
              </div>
            </div>

            {/* 3. Next Scheduled Visit Spotlight Card */}
            {nextScheduledJob ? (
              <div className="bg-white rounded-3xl border-2 border-amber-400 p-6 md:p-7 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#efeeea]">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">near_me</span>
                      <span>Next Scheduled Visit</span>
                    </span>
                    <span className="text-xs font-bold text-[#895100]">{nextScheduledJob.scheduledTime}</span>
                  </div>

                  <span
                    className={`px-3.5 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                      nextScheduledJob.status === 'Service Started'
                        ? 'bg-purple-100 text-purple-800 animate-pulse'
                        : nextScheduledJob.status === 'Arrived'
                        ? 'bg-blue-100 text-blue-800'
                        : nextScheduledJob.status === 'On the Way'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    Current Status: {nextScheduledJob.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={nextScheduledJob.petPhoto}
                        alt={nextScheduledJob.petName}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-300 shadow-xs"
                      />
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold font-quicksand text-[#1b1c1a]">
                          {nextScheduledJob.petName}{' '}
                          <span className="text-sm font-semibold text-[#895100]">({nextScheduledJob.petBreed})</span>
                        </h2>
                        <p className="text-xs sm:text-sm font-bold text-[#544434]">{nextScheduledJob.serviceTitle}</p>
                        <p className="text-xs text-amber-800 font-semibold mt-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
                          Handling Notes: {nextScheduledJob.handlingNotes}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#fbf9f5] p-3.5 rounded-2xl border border-[#efeeea]">
                      <div className="space-y-1">
                        <div className="text-[#716153]">Pet Parent / Customer:</div>
                        <div className="font-bold text-[#1b1c1a] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-[#895100]">person</span>
                          <span>{nextScheduledJob.customerName}</span>
                        </div>
                        <div className="text-[#544434] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-emerald-600">phone</span>
                          <a href={`tel:${nextScheduledJob.customerPhone}`} className="font-semibold hover:underline">
                            {nextScheduledJob.customerPhone}
                          </a>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[#716153]">Doorstep Address:</div>
                        <div className="font-semibold text-[#1b1c1a] flex items-start gap-1">
                          <span className="material-symbols-outlined text-[15px] text-[#895100] mt-0.5">home_pin</span>
                          <span>{nextScheduledJob.customerAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="lg:col-span-4 flex flex-col gap-2.5">
                    <button
                      onClick={() => handleNextStatus(nextScheduledJob)}
                      className={`w-full py-3 px-4 rounded-2xl text-xs font-bold shadow-sm transition-transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 ${
                        nextScheduledJob.status === 'Assigned'
                          ? 'bg-amber-500 hover:bg-amber-600 text-black'
                          : nextScheduledJob.status === 'On the Way'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : nextScheduledJob.status === 'Arrived'
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {nextScheduledJob.status === 'Service Started' ? 'task_alt' : 'arrow_forward'}
                      </span>
                      <span>
                        {nextScheduledJob.status === 'Assigned' && 'Start Trip (On the Way)'}
                        {nextScheduledJob.status === 'On the Way' && 'Mark Arrived at Gate'}
                        {nextScheduledJob.status === 'Arrived' && 'Start Hydrobath Care'}
                        {nextScheduledJob.status === 'Service Started' && 'Complete & Issue Health Record'}
                      </span>
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSimulatedDirections(`GPS Route: Head south on Gangapur Rd towards College Rd. ETA to ${nextScheduledJob.customerAddress}: 11 minutes.`);
                          showNotification('Turn-by-turn navigation enabled.');
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-[#f6f4ee] hover:bg-[#efeeea] text-xs font-bold text-[#544434] flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-blue-600">near_me</span>
                        <span>GPS Route</span>
                      </button>

                      <a
                        href={`tel:${nextScheduledJob.customerPhone}`}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-[#f6f4ee] hover:bg-[#efeeea] text-xs font-bold text-[#544434] flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">call</span>
                        <span>Call Parent</span>
                      </a>
                    </div>
                  </div>
                </div>

                {simulatedDirections && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-xs text-blue-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-blue-600">navigation</span>
                      <span>{simulatedDirections}</span>
                    </div>
                    <button
                      onClick={() => setSimulatedDirections(null)}
                      className="text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#e6e2dd] p-8 text-center space-y-3">
                <span className="material-symbols-outlined text-5xl text-emerald-600">check_circle</span>
                <h3 className="text-xl font-bold font-quicksand text-[#1b1c1a]">All Route Stops Completed for Today!</h3>
                <p className="text-xs text-[#716153] max-w-md mx-auto">
                  Fantastic job! All pets in your route received premium doorstep care and verified health records were dispatched to pet parents.
                </p>
                <button
                  onClick={() => setActiveTab('history')}
                  className="px-5 py-2.5 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] transition-colors cursor-pointer"
                >
                  Review Today’s Completed Visits
                </button>
              </div>
            )}

            {/* 4. Quick Actions Bar */}
            <div className="bg-white rounded-2xl border border-[#e6e2dd] p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#716153] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#895100]">bolt</span>
                <span>Van Technician Quick Actions</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <button
                  onClick={() => showNotification('Pre-trip UV-C sterilization and safety checklist confirmed.')}
                  className="p-3 rounded-xl bg-[#fbf9f5] hover:bg-[#f6f4ee] border border-[#efeeea] font-semibold text-[#1b1c1a] flex flex-col items-center text-center gap-1.5 cursor-pointer transition-all hover:border-[#895100]"
                >
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">sanitizer</span>
                  <span>Pre-Trip Sanitation</span>
                </button>

                <button
                  onClick={() => showNotification('ETA delay broadcast sent to upcoming customer stops.')}
                  className="p-3 rounded-xl bg-[#fbf9f5] hover:bg-[#f6f4ee] border border-[#efeeea] font-semibold text-[#1b1c1a] flex flex-col items-center text-center gap-1.5 cursor-pointer transition-all hover:border-[#895100]"
                >
                  <span className="material-symbols-outlined text-amber-600 text-[20px]">broadcast_on_personal</span>
                  <span>Broadcast Van Delay</span>
                </button>

                <button
                  onClick={() => showNotification('RO Hydrobath water reservoir logged as refilled (300L at Nashik Hub).')}
                  className="p-3 rounded-xl bg-[#fbf9f5] hover:bg-[#f6f4ee] border border-[#efeeea] font-semibold text-[#1b1c1a] flex flex-col items-center text-center gap-1.5 cursor-pointer transition-all hover:border-[#895100]"
                >
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">water_drop</span>
                  <span>Refill RO Water Tank</span>
                </button>

                <button
                  onClick={() => showNotification('Emergency Vet broadcast active: Dr. Rohan Kulkarni alerted for tele-support.')}
                  className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold text-rose-800 flex flex-col items-center text-center gap-1.5 cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-rose-600 text-[20px]">emergency</span>
                  <span>Emergency Vet Protocol</span>
                </button>
              </div>
            </div>

            {/* 5. Split Section: Today's Route Summary & Van Inventory Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Route Stops Preview */}
              <div className="bg-white rounded-2xl border border-[#e6e2dd] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold font-quicksand text-[#1b1c1a]">Today's Assigned Route</h3>
                    <p className="text-xs text-[#716153]">{safeJobs.length} total scheduled doorstep appointments</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('route')}
                    className="text-xs font-bold text-[#895100] hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <span>View Route Map</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {safeJobs.slice(0, 3).map((job, idx) => (
                    <div
                      key={job.id}
                      className="p-3.5 rounded-xl bg-[#fbf9f5] border border-[#efeeea] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-[#1b1c1a]">
                            {job.petName} ({job.petBreed}) • {job.serviceTitle}
                          </div>
                          <div className="text-[#716153] text-[11px] truncate max-w-xs">{job.customerAddress}</div>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                          job.status === 'Service Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : job.status === 'Service Started'
                            ? 'bg-purple-100 text-purple-800'
                            : job.status === 'On the Way'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Van Inventory & Diagnostics Summary */}
              <div className="bg-white rounded-2xl border border-[#e6e2dd] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold font-quicksand text-[#1b1c1a]">Van Stock & Diagnostics</h3>
                    <p className="text-xs text-[#716153]">Automated sensor readings for Unit #1</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('supplies')}
                    className="text-xs font-bold text-[#895100] hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <span>Full Checklist</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-[#716153] mb-1">
                      <span>Hydrobath Fresh Water Tank (RO Pure)</span>
                      <span className="font-bold text-[#1b1c1a]">82% (240 Liters)</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '82%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#716153] mb-1">
                      <span>Auxiliary Inverter Battery</span>
                      <span className="font-bold text-[#1b1c1a]">94% (6.2 kWh remaining)</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-2 rounded-lg bg-[#fbf9f5] border border-[#efeeea]">
                      <span className="text-[#716153] block">Shampoo Stock</span>
                      <strong className="text-[#1b1c1a]">4 Organic Bottles</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-[#fbf9f5] border border-[#efeeea]">
                      <span className="text-[#716153] block">Sanitized Towels</span>
                      <strong className="text-[#1b1c1a]">12 Fresh Packs</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Live Alerts / Route Precautions */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-[#895100] flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] text-amber-700 mt-0.5">info</span>
              <div className="space-y-0.5">
                <h4 className="font-bold text-[#683c00]">Nashik Service Route Notice</h4>
                <p className="text-[#544434]">
                  Pet parent Sam Sharma requested extra gentle tear-stain cleansing for Bruno. Monsoon rain expected around 4:00 PM; indoor dry area requested for Rocky's visit.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: TODAY'S ROUTE (Detailed Route & Stop Execution Sequence)             */}
        {/* ========================================================================= */}
        {activeTab === 'route' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Stops List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-quicksand text-[#1b1c1a]">Assigned Stops for Today</h2>
                  <p className="text-xs text-[#716153]">Nashik City Service Sequence</p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-[#895100] text-xs font-bold rounded-full">
                  Unit #1 • Gangapur Rd - College Rd Zone
                </span>
              </div>

              {activeJobs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#e6e2dd] p-8 text-center space-y-2">
                  <span className="material-symbols-outlined text-4xl text-emerald-600">task_alt</span>
                  <h3 className="text-base font-bold text-[#1b1c1a]">All Scheduled Stops Completed!</h3>
                  <p className="text-xs text-[#716153]">Great job today! The van is clean and ready for tomorrow.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeJobs.map((job, idx) => (
                    <div
                      key={job.id}
                      className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                        job.status === 'On the Way' || job.status === 'Arrived' || job.status === 'Service Started'
                          ? 'border-amber-500 ring-2 ring-amber-500/20'
                          : 'border-[#e6e2dd]'
                      }`}
                    >
                      {/* Top bar */}
                      <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#efeeea]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                            #{idx + 1}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#895100]">{job.scheduledTime}</span>
                            <h3 className="text-base font-bold text-[#1b1c1a]">{job.serviceTitle}</h3>
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            job.status === 'Service Started'
                              ? 'bg-purple-100 text-purple-800 animate-pulse'
                              : job.status === 'Arrived'
                              ? 'bg-blue-100 text-blue-800'
                              : job.status === 'On the Way'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>

                      {/* Pet & Customer Details */}
                      <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3.5">
                          <img src={job.petPhoto} alt={job.petName} className="w-14 h-14 rounded-xl object-cover border border-[#e6e2dd]" />
                          <div>
                            <h4 className="text-sm font-bold text-[#1b1c1a]">
                              {job.petName} ({job.petBreed})
                            </h4>
                            <p className="text-xs text-[#716153]">{job.petSpecies}</p>
                            <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
                              Note: {job.handlingNotes}
                            </p>
                          </div>
                        </div>

                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-[#1b1c1a]">
                            <span className="material-symbols-outlined text-[16px] text-[#895100]">person</span>
                            <span>{job.customerName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#544434]">
                            <span className="material-symbols-outlined text-[16px] text-[#895100]">phone</span>
                            <a href={`tel:${job.customerPhone}`} className="hover:underline font-semibold">
                              {job.customerPhone}
                            </a>
                          </div>
                          <div className="flex items-start gap-1.5 text-[#716153]">
                            <span className="material-symbols-outlined text-[16px] text-[#895100] mt-0.5">home_pin</span>
                            <span>{job.customerAddress}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-[#efeeea] flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSimulatedDirections(`Navigating to ${job.customerAddress} via Gangapur Rd (Estimated ETA: 12 mins)`);
                              showNotification(`GPS directions loaded for ${job.customerName}`);
                            }}
                            className="px-3 py-1.5 bg-[#f6f4ee] hover:bg-[#efeeea] rounded-xl text-xs font-bold text-[#544434] flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px] text-blue-600">near_me</span>
                            <span>GPS Directions</span>
                          </button>
                          <a
                            href={`tel:${job.customerPhone}`}
                            className="px-3 py-1.5 bg-[#f6f4ee] hover:bg-[#efeeea] rounded-xl text-xs font-bold text-[#544434] flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px] text-emerald-600">call</span>
                            <span>Call Customer</span>
                          </a>
                        </div>

                        <button
                          onClick={() => handleNextStatus(job)}
                          className={`px-5 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                            job.status === 'Assigned'
                              ? 'bg-amber-600 hover:bg-amber-700 text-white'
                              : job.status === 'On the Way'
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : job.status === 'Arrived'
                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {job.status === 'Service Started' ? 'task_alt' : 'arrow_forward'}
                          </span>
                          <span>
                            {job.status === 'Assigned' && 'Start Trip (On the Way)'}
                            {job.status === 'On the Way' && 'Mark Arrived at Doorstep'}
                            {job.status === 'Arrived' && 'Start Van Grooming Session'}
                            {job.status === 'Service Started' && 'Finish & Generate PetCare Record'}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Col: Live Interactive Route Map & Van Diagnostics */}
            <div className="space-y-4">
              {/* Live Interactive Route Map */}
              <div className="bg-white rounded-2xl border border-[#e6e2dd] p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1b1c1a] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#895100]">map</span>
                    <span>Live Route GPS Map</span>
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {deviceCoords ? 'Live GPS' : 'Hub GPS'}
                  </span>
                </div>

                <ZoobyRealMap
                  height="260px"
                  vanPosition={{
                    lat: deviceCoords?.latitude ?? 19.9975,
                    lng: deviceCoords?.longitude ?? 73.7898,
                    heading: deviceCoords?.heading,
                    plate: activeUser.assignedVanPlate || 'MH 15 ZB 4022',
                    status: 'Active Route'
                  }}
                  stops={[
                    { id: '1', lat: 20.0055, lng: 73.7650, title: 'Gangapur Rd', petName: 'Bruno', sequence: 1 },
                    { id: '2', lat: 19.9980, lng: 73.7840, title: 'College Rd', petName: 'Rocky', sequence: 2 },
                    { id: '3', lat: 19.9700, lng: 73.7750, title: 'Indira Nagar', petName: 'Milo', sequence: 3 }
                  ]}
                  showRouteLine={true}
                  zoom={13}
                />

                {nextScheduledJob && (
                  <div className="p-2.5 rounded-xl bg-[#fbf9f5] border border-[#efeeea] flex items-center justify-between text-xs">
                    <span className="text-[#716153]">Next: <strong>{nextScheduledJob.petName}</strong></span>
                    <strong className="text-[#895100]">
                      {calculateDistanceKm(
                        deviceCoords?.latitude ?? 19.9975,
                        deviceCoords?.longitude ?? 73.7898,
                        20.0055,
                        73.7650
                      )} km away
                    </strong>
                  </div>
                )}
              </div>

              {simulatedDirections && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-blue-600">navigation</span>
                      <span>Turn-by-Turn Guidance</span>
                    </span>
                    <button
                      onClick={() => setSimulatedDirections(null)}
                      className="text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                  <p className="leading-relaxed font-medium">{simulatedDirections}</p>
                </div>
              )}

              {/* Van Diagnostics Widget */}
              <div className="bg-white rounded-2xl border border-[#e6e2dd] p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#1b1c1a] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#895100]">minor_crash</span>
                  <span>Van Unit #1 System Status</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-[#716153] mb-1">
                      <span>Hydrobath Fresh Water Tank</span>
                      <span className="font-bold text-[#1b1c1a]">82% (240 Liters)</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '82%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#716153] mb-1">
                      <span>Auxiliary Inverter Battery</span>
                      <span className="font-bold text-[#1b1c1a]">94% Full</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#716153] mb-1">
                      <span>Water Heating Unit</span>
                      <span className="font-bold text-amber-700">38°C (Ideal Warm)</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#efeeea] text-[11px] text-[#716153]">
                  Vehicle Plate: <span className="font-bold text-[#1b1c1a]">{activeUser.assignedVanPlate || 'MH 15 ZB 4022'}</span> • Stationed at Zooby Nashik Central Depot.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: VAN SUPPLIES & SANITATION CHECKLIST                                  */}
        {/* ========================================================================= */}
        {activeTab === 'supplies' && (
          <div className="bg-white rounded-2xl border border-[#e6e2dd] p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-quicksand text-[#1b1c1a]">Van Stock & Sanitation Checklist</h2>
                <p className="text-xs text-[#716153]">Ensure high hygiene standards between doorstep appointments</p>
              </div>
              <button
                onClick={() => showNotification('Inventory verified & logged to Zooby Central Operations.')}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Confirm All Stock Ready</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {[
                { title: 'Organic Herbal Shampoos', qty: '4 Bottles (Lavender & Oatmeal)', status: 'Stocked' },
                { title: 'De-shedding Undercoat Rakes', qty: '2 Sets (Sanitized with UV-C)', status: 'Ready' },
                { title: 'Warm Water Reservoir', qty: '240 Liters Pure RO Water', status: 'Full' },
                { title: 'Fresh Cotton Towels', qty: '12 Clean Packs', status: 'Stocked' },
                { title: 'Low-Noise Velocity Dryer', qty: 'Dual Motor Tested', status: 'Optimal' },
                { title: 'Emergency First Aid Kit', qty: 'Styptic Powder, Antiseptic, Bandages', status: 'Verified' },
                { title: 'Pet Calming Ear Protectors', qty: '3 Sizes (Happy Hoodies)', status: 'Ready' },
                { title: 'UV-C Tool Sterilizer Chamber', qty: 'Operational & Lamp Tested', status: 'Active' }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#fbf9f5] border border-[#efeeea] flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#1b1c1a]">{item.title}</h4>
                    <p className="text-[#716153] mt-0.5">{item.qty}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px]">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: COMPLETED VISITS                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold font-quicksand text-[#1b1c1a]">Completed Doorstep Care Sessions</h2>
              <p className="text-xs text-[#716153]">Synchronized automatically with PetCare Health Records</p>
            </div>

            {completedJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e6e2dd] p-8 text-center space-y-2">
                <span className="material-symbols-outlined text-4xl text-stone-400">inventory</span>
                <p className="text-xs text-[#716153]">No completed jobs for today yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedJobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-2xl border border-[#e6e2dd] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img src={job.petPhoto} alt={job.petName} className="w-14 h-14 rounded-xl object-cover border border-[#e6e2dd]" />
                      <div>
                        <h4 className="text-sm font-bold text-[#1b1c1a]">
                          {job.petName} • {job.serviceTitle}
                        </h4>
                        <p className="text-xs text-[#716153]">
                          Customer: {job.customerName} ({job.customerAddress})
                        </p>
                        {job.notes && (
                          <p className="text-[11px] text-emerald-800 font-medium mt-1 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                            Record Notes: {job.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">verified</span>
                        <span>Completed &amp; Record Generated</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Completion & PetCare Record Modal */}
      {isCompletingJob && selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fade-in border border-[#e6e2dd] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#efeeea] mb-4">
              <div>
                <h3 className="text-base font-bold text-[#1b1c1a]">Complete Care & Generate Record</h3>
                <p className="text-xs text-[#716153]">{selectedJob.petName} • {selectedJob.serviceTitle}</p>
              </div>
              <button
                onClick={() => setIsCompletingJob(false)}
                className="w-7 h-7 rounded-full bg-[#f6f4ee] text-[#544434] flex items-center justify-center hover:bg-[#efeeea] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleFinishJob} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#544434] mb-1">Session Summary & Notes for Pet Parent</label>
                <textarea
                  rows={3}
                  required
                  value={completionForm.notes}
                  onChange={(e) => setCompletionForm({ ...completionForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5] focus:outline-hidden focus:border-[#895100]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#544434] mb-1">Measured Weight</label>
                  <input
                    type="text"
                    value={completionForm.weight}
                    onChange={(e) => setCompletionForm({ ...completionForm, weight: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#544434] mb-1">Coat / Skin Condition</label>
                  <input
                    type="text"
                    value={completionForm.coatCondition}
                    onChange={(e) => setCompletionForm({ ...completionForm, coatCondition: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#544434] mb-1">Pet Behavior / Temperament Note</label>
                <input
                  type="text"
                  value={completionForm.behaviorNote}
                  onChange={(e) => setCompletionForm({ ...completionForm, behaviorNote: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5]"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 mt-0.5">verified</span>
                <span>
                  This note will be permanently added to {selectedJob.petName}’s PetCare profile and the parent will receive an instant push notification!
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCompletingJob(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#d6cfc7] text-xs font-bold text-[#544434] hover:bg-[#f6f4ee] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs cursor-pointer"
                >
                  Complete & Notify Parent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
