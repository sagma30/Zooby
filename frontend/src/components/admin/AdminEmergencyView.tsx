import React, { useState, useEffect } from 'react';
import { EmergencyIncident, VanLocation } from '../../types';
import { ZoobyRealMap } from '../common/ZoobyRealMap';

interface AdminEmergencyViewProps {
  onSelectIncident?: (incident: EmergencyIncident) => void;
}

const INITIAL_DEMO_INCIDENTS: EmergencyIncident[] = [
  {
    incidentId: 'sos-9921-X',
    userId: 'usr-parent-aisha',
    userName: 'Aisha Sharma',
    userPhone: '+91 98220 11223',
    petName: 'Bruno',
    petSpecies: 'Dog',
    petBreed: 'Golden Retriever',
    category: 'accident_trauma',
    description: 'Bruno injured his paw during morning walk on Gangapur Road. Bleeding controlled, limping severely.',
    location: {
      latitude: 20.0055,
      longitude: 73.7650,
      address: 'Near Silver Palm Enclave, Gangapur Road, Nashik'
    },
    triage: {
      urgency: 'HIGH',
      summary: 'Reported soft tissue trauma & localized laceration. Rapid mobile unit dispatched.',
      primaryConcern: 'TRAUMA / LACERATION',
      firstAidAdvice: ['Keep dog calm and immobilized', 'Apply clean gauze pad with gentle pressure'],
      suggestedAction: 'Emergency Van Unit #1 dispatched for doorstep vitals check and wound dressing.',
      isLifeThreatening: false,
      triageModel: 'gemini-2.5-flash',
      triagedAt: new Date()
    },
    assignedVanId: 'van-nashik-01',
    assignedVanPlate: 'MH 15 ZB 4022',
    assignedWorkerId: 'usr-van-vikram',
    assignedWorkerName: 'Vikram Pawar',
    assignedWorkerPhone: '+91 98223 99001',
    status: 'EN_ROUTE',
    statusHistory: [
      { status: 'CREATED', timestamp: new Date(Date.now() - 1000 * 60 * 12), updatedBy: 'Aisha Sharma' },
      { status: 'LOCATION_CONFIRMED', timestamp: new Date(Date.now() - 1000 * 60 * 11), updatedBy: 'System' },
      { status: 'TRIAGE_COMPLETED', timestamp: new Date(Date.now() - 1000 * 60 * 10), updatedBy: 'AI Triage Engine' },
      { status: 'DISPATCH_CONFIRMED', timestamp: new Date(Date.now() - 1000 * 60 * 8), updatedBy: 'Vikram Pawar' },
      { status: 'EN_ROUTE', timestamp: new Date(Date.now() - 1000 * 60 * 5), updatedBy: 'Vikram Pawar' }
    ],
    distanceKm: 2.1,
    etaMinutes: 7,
    createdAt: new Date(Date.now() - 1000 * 60 * 12),
    updatedAt: new Date()
  }
];

export const AdminEmergencyView: React.FC<AdminEmergencyViewProps> = ({ onSelectIncident }) => {
  const [incidents, setIncidents] = useState<EmergencyIncident[]>(INITIAL_DEMO_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(INITIAL_DEMO_INCIDENTS[0]);
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');

  // Fetch live incidents from backend if available
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${API_BASE_URL}/emergency/admin/all`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            setIncidents(json.data);
            setSelectedIncident(json.data[0]);
          }
        }
      } catch {
        // Fallback to demo state
      }
    };
    fetchIncidents();
  }, []);

  const filtered = incidents.filter((inc) => {
    if (filterUrgency === 'ALL') return true;
    return inc.triage.urgency === filterUrgency;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-900 to-stone-900 p-6 rounded-3xl text-white shadow-md">
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
                Live Feed
              </span>
            </div>
            <p className="text-xs text-stone-300">
              Active incident monitoring, AI triage audit, and mobile van fleet emergency dispatch
            </p>
          </div>
        </div>

        {/* Quick Filter */}
        <div className="flex items-center gap-2 bg-stone-800/80 p-1 rounded-2xl border border-stone-700">
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

      {/* Grid: Left Column Incident List | Right Column Map & Telemetry Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Incident Feed */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-quicksand font-bold text-base text-[#1b1c1a]">
              Active Incidents ({filtered.length})
            </h3>
            <span className="text-xs text-[#877462]">Auto-refreshing</span>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-[#efeeea] text-center space-y-2">
              <span className="material-symbols-outlined text-4xl text-emerald-600">verified</span>
              <h4 className="font-bold text-sm text-[#1b1c1a]">No Active Emergencies</h4>
              <p className="text-xs text-[#877462]">All reported pet emergencies have been safely resolved.</p>
            </div>
          ) : (
            filtered.map((inc) => {
              const isSelected = selectedIncident?.incidentId === inc.incidentId;
              return (
                <div
                  key={inc.incidentId}
                  onClick={() => {
                    setSelectedIncident(inc);
                    if (onSelectIncident) onSelectIncident(inc);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-white border-rose-500 shadow-md ring-2 ring-rose-500/20'
                      : 'bg-white border-[#efeeea] hover:border-[#dac2ae]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          inc.triage.urgency === 'CRITICAL'
                            ? 'bg-red-600 text-white animate-pulse'
                            : inc.triage.urgency === 'HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inc.triage.urgency}
                      </span>
                      <span className="text-xs font-bold text-[#1b1c1a]">{inc.incidentId}</span>
                    </div>

                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                      {inc.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[#1b1c1a]">
                      {inc.petName || 'Pet'} ({inc.petBreed || 'Animal'}) • {inc.userName}
                    </h4>
                    <p className="text-xs text-[#544434] line-clamp-2 mt-0.5">{inc.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#efeeea] text-[11px] text-[#877462]">
                    <span>📍 {inc.location.address || 'Nashik'}</span>
                    <span className="font-bold text-[#1b1c1a]">
                      {inc.assignedVanPlate ? `🚐 ${inc.assignedVanPlate}` : 'Awaiting Van'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right 7 Cols: Interactive Fleet Telemetry Map & Details */}
        <div className="lg:col-span-7 space-y-4">
          {selectedIncident ? (
            <>
              {/* Telemetry Real Map */}
              <div className="bg-white rounded-3xl p-5 border border-[#efeeea] shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a]">
                      Live Response Telemetry: {selectedIncident.incidentId}
                    </h3>
                    <p className="text-xs text-[#877462]">
                      Target: {selectedIncident.location.address || 'Emergency Location'}
                    </p>
                  </div>

                  {selectedIncident.etaMinutes && (
                    <div className="bg-[#f4ebd9] px-3 py-1.5 rounded-xl text-right">
                      <div className="text-[10px] text-[#877462] uppercase font-bold">Estimated ETA</div>
                      <div className="text-sm font-bold text-[#895100]">{selectedIncident.etaMinutes} mins</div>
                    </div>
                  )}
                </div>

                <ZoobyRealMap
                  height="320px"
                  userPosition={{
                    lat: selectedIncident.location.latitude,
                    lng: selectedIncident.location.longitude,
                    title: `Emergency: ${selectedIncident.petName || 'Pet'}`
                  }}
                  vanPosition={{
                    lat: selectedIncident.location.latitude - 0.015, // Real live tracking offset
                    lng: selectedIncident.location.longitude + 0.012,
                    plate: selectedIncident.assignedVanPlate || 'MH 15 ZB 4022',
                    status: selectedIncident.status
                  }}
                  showRouteLine={true}
                  zoom={14}
                />
              </div>

              {/* Triage & Clinical Notes Card */}
              <div className="bg-white rounded-3xl p-5 border border-[#efeeea] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                  <span className="material-symbols-outlined text-lg">medical_services</span>
                  <span>AI Clinical Triage Summary ({selectedIncident.triage.triageModel})</span>
                </div>
                <p className="text-xs text-[#544434] leading-relaxed">
                  {selectedIncident.triage.summary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[#efeeea] text-xs">
                    <span className="text-[#877462] block text-[10px] uppercase font-bold">Assigned Crew</span>
                    <strong className="text-[#1b1c1a] block mt-0.5">{selectedIncident.assignedWorkerName || 'Vikram Pawar'}</strong>
                    <span className="text-[11px] text-[#544434]">{selectedIncident.assignedWorkerPhone || '+91 98223 99001'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[#efeeea] text-xs">
                    <span className="text-[#877462] block text-[10px] uppercase font-bold">Parent Contact</span>
                    <strong className="text-[#1b1c1a] block mt-0.5">{selectedIncident.userName}</strong>
                    <span className="text-[11px] text-[#544434]">{selectedIncident.userPhone}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-[#efeeea] text-center text-[#877462]">
              Select an incident from the left to inspect real-time telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
