import React, { useState, useEffect } from 'react';
import { ZoobyRealMap } from '../common/ZoobyRealMap';
import { emergencyStore, EmergencyState } from '../../services/emergencyStore';

interface AdminEmergencyViewProps {
  onSelectIncident?: (incident: EmergencyState) => void;
}

export const AdminEmergencyView: React.FC<AdminEmergencyViewProps> = () => {
  const [activeEmergency, setActiveEmergency] = useState<EmergencyState | null>(() => emergencyStore.getActiveEmergency());
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');

  useEffect(() => {
    const handleUpdate = (updated: EmergencyState) => {
      setActiveEmergency({ ...updated });
    };
    const handleCleared = () => {
      setActiveEmergency(null);
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-900 via-stone-900 to-black p-6 rounded-3xl text-white shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-3xl filled-icon">emergency</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-quicksand font-bold text-2xl text-white tracking-tight">
                24/7 Rapid SOS &amp; Emergency Telemetry
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold uppercase animate-pulse">
                Live Multi-Role Sync
              </span>
            </div>
            <p className="text-xs text-stone-300">
              Real-time synchronization across Pet Parent, Mobile Van Unit, and On-Call Veterinarian
            </p>
          </div>
        </div>

        {/* Status / Filter */}
        <div className="flex items-center gap-2 bg-stone-800/90 p-1.5 rounded-2xl border border-stone-700">
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map((urg) => (
            <button
              key={urg}
              onClick={() => setFilterUrgency(urg)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterUrgency === urg
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              {urg}
            </button>
          ))}
        </div>
      </div>

      {activeEmergency ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 5 Cols: Incident Overview & Timeline */}
          <div className="lg:col-span-5 space-y-4">
            {/* Main Active Incident Summary */}
            <div className="bg-white rounded-3xl p-6 border border-[#dac2ae] shadow-xs space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#877462]">Active Incident</span>
                  <h3 className="font-quicksand font-bold text-xl text-[#1b1c1a]">
                    #{activeEmergency.incidentId} • {activeEmergency.petName}
                  </h3>
                  <p className="text-xs text-[#544434] mt-0.5">
                    {activeEmergency.petBreed} • Reported: {activeEmergency.category.replace('_', ' ').toUpperCase()}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800">
                  {activeEmergency.status === 'ARRIVED'
                    ? 'ARRIVED AT SCENE'
                    : activeEmergency.status === 'IN_CARE'
                    ? 'CARE IN PROGRESS'
                    : activeEmergency.status === 'RESOLVED'
                    ? 'RESOLVED'
                    : 'RESPONDING'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#fbf9f5] rounded-2xl border border-[#efeeea] text-xs">
                <div>
                  <span className="text-[#877462] block text-[10px] uppercase font-bold">Assigned Van</span>
                  <strong className="text-[#1b1c1a] block mt-0.5">{activeEmergency.assignedVanPlate}</strong>
                  <span className="text-[#544434]">{activeEmergency.assignedWorkerName} ({activeEmergency.assignedWorkerPhone})</span>
                </div>
                <div>
                  <span className="text-[#877462] block text-[10px] uppercase font-bold">Supporting Vet</span>
                  <strong className="text-[#1b1c1a] block mt-0.5">{activeEmergency.vetAssigned?.name || 'Dr. Aarav Mehta'}</strong>
                  <span className="text-[#544434]">{activeEmergency.vetAssigned?.clinic}</span>
                </div>
              </div>

              {/* Clinical Notes if available */}
              {activeEmergency.clinicalNotes && (
                <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">medical_services</span>
                    <span>On-Scene Clinical Observation:</span>
                  </div>
                  <p>{activeEmergency.clinicalNotes}</p>
                </div>
              )}
            </div>

            {/* Live Chronological Emergency Timeline */}
            <div className="bg-white rounded-3xl p-6 border border-[#dac2ae] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-quicksand font-bold text-base text-[#1b1c1a] flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-rose-600">history_toggle_drop_down</span>
                  <span>Incident Event Timeline</span>
                </h3>
                <span className="text-[11px] text-[#877462] font-semibold">Auto-logging</span>
              </div>

              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-rose-200">
                {activeEmergency.timeline.map((entry, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-rose-600 border-2 border-white ring-2 ring-rose-200" />
                    <div className="text-xs">
                      <div className="flex items-center justify-between text-[#877462]">
                        <span className="font-bold text-[#1b1c1a]">{entry.time}</span>
                        {entry.badge && (
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 text-[10px] font-bold text-[#544434]">
                            {entry.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[#544434] mt-0.5 font-medium">{entry.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Full Real-Time Telemetry Map */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-[#dac2ae] shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a]">
                    Live Telemetry Map — Incident #{activeEmergency.incidentId}
                  </h3>
                  <p className="text-xs text-[#877462]">
                    Destination: {activeEmergency.emergencyCoordinates.address}
                  </p>
                </div>

                <div className="bg-[#fbf9f5] px-3.5 py-1.5 rounded-xl border border-[#efeeea] text-right">
                  <div className="text-[10px] uppercase font-bold text-[#877462]">Distance &amp; ETA</div>
                  <strong className="text-sm font-bold text-[#895100]">
                    {activeEmergency.distanceKm > 0
                      ? `${activeEmergency.distanceKm} km (${activeEmergency.etaMinutes} mins)`
                      : 'Arrived'}
                  </strong>
                </div>
              </div>

              {/* Real Interactive Map with 3 Telemetry Pins: Pet, Van, Vet */}
              <ZoobyRealMap
                height="380px"
                userPosition={{
                  lat: activeEmergency.emergencyCoordinates.lat,
                  lng: activeEmergency.emergencyCoordinates.lng,
                  title: `📍 ${activeEmergency.petName} (Emergency Scene)`
                }}
                vanPosition={{
                  lat: activeEmergency.vanCoordinates.lat,
                  lng: activeEmergency.vanCoordinates.lng,
                  heading: activeEmergency.vanCoordinates.heading,
                  plate: activeEmergency.assignedVanPlate || 'ZMV-014',
                  status: activeEmergency.status === 'ARRIVED' ? 'Arrived at Scene' : 'En Route'
                }}
                destinationPosition={{
                  lat: 19.9910,
                  lng: 73.7920,
                  title: `🩺 ${activeEmergency.vetAssigned?.name || 'Dr. Mehta'} (Clinic Support)`
                }}
                showRouteLine={true}
                zoom={14}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 border border-[#efeeea] text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-4xl">verified</span>
          </div>
          <h3 className="font-quicksand font-bold text-xl text-[#1b1c1a]">No Active Emergency Dispatches</h3>
          <p className="text-xs text-[#877462] max-w-md mx-auto">
            All mobile care units are in standby or scheduled routine routes in Nashik.
          </p>
        </div>
      )}
    </div>
  );
};
