import React, { useEffect, useState } from 'react';
import { emergencyStore, EmergencyState } from '../../services/emergencyStore';

interface FloatingEmergencyBarProps {
  onOpenSOSModal: () => void;
}

export const FloatingEmergencyBar: React.FC<FloatingEmergencyBarProps> = ({ onOpenSOSModal }) => {
  const [activeEmergency, setActiveEmergency] = useState<EmergencyState | null>(() =>
    emergencyStore.getActiveEmergency()
  );

  useEffect(() => {
    const handleUpdate = (emergency: EmergencyState) => {
      setActiveEmergency({ ...emergency });
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

  if (!activeEmergency || activeEmergency.status === 'RESOLVED' || activeEmergency.status === 'CANCELLED') {
    return null;
  }

  const isArrived = activeEmergency.status === 'ARRIVED' || activeEmergency.distanceKm === 0;

  return (
    <aside
      aria-label="Active Emergency Status"
      onClick={onOpenSOSModal}
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-xl bg-gradient-to-r from-rose-700 via-red-600 to-amber-600 text-white rounded-2xl shadow-2xl p-3.5 sm:p-4 border-2 border-white/30 flex items-center justify-between gap-3 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all animate-bounce duration-1000"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-9 h-9 rounded-xl bg-white text-rose-600 flex items-center justify-center font-bold shrink-0 shadow-xs animate-pulse">
          <span className="material-symbols-outlined text-2xl filled-icon">emergency</span>
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 tracking-wider">
              🚨 Active SOS
            </span>
            <span className="text-xs font-bold text-rose-100 truncate">
              #{activeEmergency.incidentId} • {activeEmergency.petName}
            </span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
            {isArrived
              ? '🚐 Van arrived at doorstep!'
              : `🚐 Van ${activeEmergency.assignedVanPlate || 'ZMV-014'} (${activeEmergency.etaMinutes || 8} min away)`}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenSOSModal();
          }}
          className="px-3.5 py-1.5 rounded-xl bg-white text-rose-700 hover:bg-rose-50 text-xs font-extrabold shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Open Map</span>
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </button>
      </div>
    </aside>
  );
};
