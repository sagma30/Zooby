import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserSettingsView } from '../UserSettingsView';
import { ProviderEarningsView } from './ProviderEarningsView';
import { PaymentRecord } from '../../types';
import {
  INITIAL_PROVIDER_APPOINTMENTS,
  INITIAL_PROVIDER_CUSTOMERS,
  INITIAL_PROVIDER_SERVICES,
  ProviderAppointment,
  ProviderCustomer,
  ProviderServiceItem
} from '../../data/providerMockData';

import { emergencyStore, EmergencyState } from '../../services/emergencyStore';
import { getDynamicGreeting, getUserDisplayName, getPersonalizedEmptyState } from '../../utils/identity';

interface ProviderPortalProps {
  currentTab?: string;
  payments?: PaymentRecord[];
  onNavigate: (path: string) => void;
}

export const ProviderPortal: React.FC<ProviderPortalProps> = ({
  currentTab = 'dashboard',
  payments = [],
  onNavigate
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(currentTab);
  const [appointments, setAppointments] = useState<ProviderAppointment[]>(INITIAL_PROVIDER_APPOINTMENTS);
  const [customers, setCustomers] = useState<ProviderCustomer[]>(INITIAL_PROVIDER_CUSTOMERS);
  const [services, setServices] = useState<ProviderServiceItem[]>(INITIAL_PROVIDER_SERVICES);
  const [selectedAppointment, setSelectedAppointment] = useState<ProviderAppointment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Synchronized Emergency State
  const [emergency, setEmergency] = useState<EmergencyState | null>(() => emergencyStore.getActiveEmergency());
  const [vetNoteInput, setVetNoteInput] = useState('');
  const [isAddingVetNote, setIsAddingVetNote] = useState(false);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateStatus = (id: string, newStatus: 'Confirmed' | 'Completed' | 'Cancelled') => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
    showToast(`Appointment status updated to ${newStatus}`);
  };

  const handleToggleService = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
    showToast('Service availability updated');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    onNavigate(`/provider/${tab}`);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'bookings', label: 'Bookings', icon: 'event_available', count: (appointments || []).filter((a) => a.status === 'Pending').length },
    { id: 'calendar', label: 'Calendar', icon: 'calendar_month' },
    { id: 'services', label: 'Services & Pricing', icon: 'medical_services' },
    { id: 'customers', label: 'Customers', icon: 'people' },
    { id: 'earnings', label: 'Earnings & Payouts', icon: 'payments' },
    { id: 'reviews', label: 'Reviews & Ratings', icon: 'star' },
    { id: 'profile', label: 'Business Profile', icon: 'storefront' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  return (
    <div className="min-h-screen bg-[#f7f5f0] flex text-[#1b1c1a] font-jakarta selection:bg-[#ffdcbc] selection:text-[#683c00]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#1b1c1a] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-base text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#fbf9f5] border-r border-[#ebdcc4] flex-col shrink-0 justify-between h-screen sticky top-0">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#efeeea] flex items-center justify-between">
            <ZoobyLogo
              size="sm"
              subtitle="Provider Portal"
              badgeText="Care Partner"
              badgeColor="blue"
              clickable={true}
              onClick={() => handleTabChange('dashboard')}
            />
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-colors cursor-pointer text-left ${
                  activeTab === item.id
                    ? 'bg-[#ffeed9] text-[#895100] shadow-2xs'
                    : 'text-[#544434] hover:bg-[#f2ece2] hover:text-[#1b1c1a]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[19px] ${activeTab === item.id ? 'filled-icon' : ''}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="bg-[#ff9f1c] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Provider Profile & Logout */}
        <div className="p-4 border-t border-[#efeeea] space-y-3">
          <div className="flex items-center gap-3 p-2 bg-[#f4ebd9]/40 rounded-2xl border border-[#dac2ae]/40">
            <img
              src={user?.profilePhoto || user?.avatarUrl || 'https://images.unsplash.com/photo-1594824813689-0b73c4d7e2e3?auto=format&fit=crop&q=80&w=240'}
              alt={getUserDisplayName(user, 'Dr. Ananya Mehta')}
              className="w-9 h-9 rounded-full object-cover border border-[#895100]/30"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#1b1c1a] truncate">{getUserDisplayName(user, 'Dr. Ananya Mehta')}</p>
              <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Verified Specialist</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => logout('/')}
            className="w-full py-2 px-3 rounded-xl bg-white border border-[#dac2ae]/60 text-[#93000a] text-xs font-bold hover:bg-[#ffdad6]/20 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Sign Out of Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#fbf9f5]/90 backdrop-blur-md border-b border-[#efeeea] px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-[#f3eee8] text-[#544434]"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>
            <div>
              <h1 className="font-quicksand font-bold text-2xl text-[#1b1c1a] capitalize">
                {navItems.find((n) => n.id === activeTab)?.label || 'Provider Portal'}
              </h1>
              <p className="text-xs text-[#877462]">
                {getDynamicGreeting(user)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-[#ffdcbc]/40 px-3 py-1.5 rounded-full text-xs font-bold text-[#895100]">
              <span className="material-symbols-outlined text-sm filled-icon">storefront</span>
              <span>{user?.businessName || user?.organizationName || 'Nashik Paws & Vet Care Clinic'}</span>
            </div>

            <button
              onClick={() => logout('/')}
              className="md:hidden p-2 rounded-xl text-[#93000a] hover:bg-[#ffdad6]/20"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </header>

        {/* Tab Content */}
        <main className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 🚨 Live Emergency Tele-Support Banner */}
              {emergency && emergency.status !== 'RESOLVED' && emergency.status !== 'CANCELLED' && (
                <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-stone-900 text-white rounded-3xl p-5 shadow-lg border border-blue-500/40 space-y-3 animate-in slide-in-from-top-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/30 text-blue-300 flex items-center justify-center font-bold animate-pulse">
                        <span className="material-symbols-outlined text-3xl filled-icon">emergency</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Active Emergency Dispatch
                          </span>
                          <span className="text-xs text-blue-200 font-semibold">Incident #{emergency.incidentId}</span>
                        </div>
                        <h3 className="font-quicksand font-bold text-lg text-white mt-0.5">
                          {emergency.petName} ({emergency.petBreed}) • {emergency.category.replace('_', ' ').toUpperCase()}
                        </h3>
                        <p className="text-xs text-stone-300 mt-0.5">
                          📍 {emergency.emergencyCoordinates.address} • Responding Van: <strong>{emergency.assignedVanPlate} ({emergency.assignedWorkerName})</strong> • ETA: <strong>{emergency.distanceKm > 0 ? `${emergency.etaMinutes} mins (${emergency.distanceKm} km)` : 'Arrived'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`tel:${emergency.assignedWorkerPhone || '+919822399001'}`}
                        className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-base">call</span>
                        <span>Call Driver ({emergency.assignedWorkerName})</span>
                      </a>
                      <a
                        href={`tel:${emergency.userPhone || '+919820145678'}`}
                        className="py-2 px-3.5 rounded-xl bg-stone-700 hover:bg-stone-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-base">person</span>
                        <span>Call Parent ({emergency.userName})</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setIsAddingVetNote(!isAddingVetNote)}
                        className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">note_add</span>
                        <span>{isAddingVetNote ? 'Close Instructions' : 'Add Clinical Instructions'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Doctor's Instructions Input */}
                  {isAddingVetNote && (
                    <div className="bg-stone-800 p-3 rounded-2xl space-y-2 text-xs border border-stone-700">
                      <span className="font-bold text-blue-300">Prescribe Tele-Emergency Directives for Van Tech</span>
                      <textarea
                        rows={2}
                        value={vetNoteInput}
                        onChange={(e) => setVetNoteInput(e.target.value)}
                        placeholder="e.g. Keep pressure on wound with sterile gauze. Elevate hind limb slightly during transport..."
                        className="w-full p-2.5 bg-stone-900 text-white rounded-xl border border-stone-600 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (vetNoteInput) {
                            emergencyStore.addClinicalNotes(`[Dr. Mehta Directive]: ${vetNoteInput}`);
                            setVetNoteInput('');
                            setIsAddingVetNote(false);
                            showToast('Doctor directives transmitted to Mobile Unit #1.');
                          }
                        }}
                        className="py-1.5 px-4 bg-blue-500 text-white font-bold rounded-xl text-xs hover:bg-blue-400"
                      >
                        Transmit Instructions to Van
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Executive Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-3xl p-5 border border-[#dac2ae]/50 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-[#877462]">
                    <span className="text-xs font-semibold">Today's Appointments</span>
                    <span className="material-symbols-outlined text-lg text-[#895100]">event</span>
                  </div>
                  <p className="text-2xl font-bold text-[#1b1c1a]">4 Scheduled</p>
                  <p className="text-[11px] text-emerald-700 font-bold">2 Completed • 2 Upcoming</p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-[#dac2ae]/50 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-[#877462]">
                    <span className="text-xs font-semibold">Pending Requests</span>
                    <span className="material-symbols-outlined text-lg text-amber-600">pending_actions</span>
                  </div>
                  <p className="text-2xl font-bold text-[#1b1c1a]">1 New</p>
                  <p className="text-[11px] text-amber-700 font-bold">Needs confirmation</p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-[#dac2ae]/50 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-[#877462]">
                    <span className="text-xs font-semibold">August Earnings</span>
                    <span className="material-symbols-outlined text-lg text-[#294e35]">payments</span>
                  </div>
                  <p className="text-2xl font-bold text-[#1b1c1a]">₹48,500</p>
                  <p className="text-[11px] text-emerald-700 font-bold">+18% vs last month</p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-[#dac2ae]/50 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-[#877462]">
                    <span className="text-xs font-semibold">Patient Rating</span>
                    <span className="material-symbols-outlined text-lg text-amber-500 filled-icon">star</span>
                  </div>
                  <p className="text-2xl font-bold text-[#1b1c1a]">4.95 ★</p>
                  <p className="text-[11px] text-[#877462]">Based on 142 reviews</p>
                </div>
              </div>

              {/* Today's Appointments List */}
              <div className="bg-white rounded-3xl p-6 border border-[#dac2ae]/50 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-quicksand font-bold text-xl text-[#1b1c1a]">
                      Today's Patient Schedule
                    </h2>
                    <p className="text-xs text-[#877462]">
                      Review upcoming checkups, vaccinations, and treatment notes.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs font-bold text-[#895100] hover:underline cursor-pointer"
                  >
                    View All Bookings →
                  </button>
                </div>

                <div className="divide-y divide-[#efeeea]">
                  {appointments.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#877462]">
                      <p>{getPersonalizedEmptyState(user, 'schedule')}</p>
                    </div>
                  ) : (
                    appointments.map((apt) => (
                    <div key={apt.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={apt.avatarUrl}
                          alt={apt.patientName}
                          className="w-12 h-12 rounded-2xl object-cover border border-[#dac2ae]/50 shrink-0"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-[#1b1c1a]">{apt.patientName}</h3>
                            <span className="text-xs text-[#877462]">({apt.breed})</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                apt.status === 'Confirmed'
                                  ? 'bg-[#c2edca] text-[#294e35]'
                                  : apt.status === 'Pending'
                                  ? 'bg-[#ffeed9] text-[#895100]'
                                  : 'bg-[#efeeea] text-[#544434]'
                              }`}
                            >
                              {apt.status}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#895100]">{apt.serviceTitle}</p>
                          <p className="text-[11px] text-[#877462]">
                            Parent: {apt.parentName} • {apt.parentPhone} • {apt.time}
                          </p>
                          {apt.notes && (
                            <p className="text-[11px] bg-[#f9f7f4] p-1.5 rounded-lg text-[#544434] border border-[#ebdcc4] inline-block mt-1">
                              Clinical Note: {apt.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {apt.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'Confirmed')}
                            className="px-3 py-1.5 rounded-xl bg-[#895100] text-white font-bold text-xs hover:bg-[#683c00] transition-colors cursor-pointer"
                          >
                            Accept
                          </button>
                        )}
                        {apt.status === 'Confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'Completed')}
                            className="px-3 py-1.5 rounded-xl bg-[#294e35] text-white font-bold text-xs hover:bg-[#1f3b28] transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">check</span>
                            <span>Mark Complete</span>
                          </button>
                        )}
                        <span className="text-xs font-bold text-[#1b1c1a] px-2.5 py-1 bg-[#f9f7f4] rounded-lg border border-[#dac2ae]/40">
                          ₹{apt.amount}
                        </span>
                      </div>
                    </div>
                  )))}
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-3xl p-6 border border-[#dac2ae]/50 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-quicksand font-bold text-xl text-[#1b1c1a]">
                    Patient Appointments &amp; Bookings
                  </h2>
                  <p className="text-xs text-[#877462]">
                    Full schedule history, patient profiles, and status controls.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f9f7f4] text-[#877462] uppercase tracking-wider font-bold border-y border-[#efeeea]">
                    <tr>
                      <th className="py-3 px-4">Patient &amp; Parent</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Date &amp; Time</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#efeeea]">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-[#fcfbfa]">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <img src={apt.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                            <div>
                              <p className="font-bold text-[#1b1c1a]">{apt.patientName}</p>
                              <p className="text-[10px] text-[#877462]">{apt.parentName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#895100]">{apt.serviceTitle}</td>
                        <td className="py-3.5 px-4 text-[#544434]">{apt.date} • {apt.time}</td>
                        <td className="py-3.5 px-4 font-bold text-[#1b1c1a]">₹{apt.amount}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              apt.status === 'Confirmed'
                                ? 'bg-[#c2edca] text-[#294e35]'
                                : apt.status === 'Pending'
                                ? 'bg-[#ffeed9] text-[#895100]'
                                : 'bg-[#efeeea] text-[#544434]'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {apt.status !== 'Completed' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'Completed')}
                              className="text-xs font-bold text-[#294e35] hover:underline cursor-pointer"
                            >
                              Complete
                            </button>
                          )}
                          {apt.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                              className="text-xs font-bold text-[#93000a] hover:underline cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Services & Pricing Tab */}
          {activeTab === 'services' && (
            <div className="bg-white rounded-3xl p-6 border border-[#dac2ae]/50 shadow-xs space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-quicksand font-bold text-xl text-[#1b1c1a]">
                    Clinic Service Menu &amp; Rates
                  </h2>
                  <p className="text-xs text-[#877462]">
                    Enable or disable procedures, adjust pricing, and define duration.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((srv) => (
                  <div key={srv.id} className="p-5 rounded-2xl border border-[#ebdcc4] bg-[#fdfcfa] space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-sm text-[#1b1c1a]">{srv.title}</h3>
                        <p className="text-xs text-[#877462]">{srv.durationMinutes} min • {srv.category}</p>
                      </div>
                      <span className="font-bold text-sm text-[#895100]">₹{srv.price}</span>
                    </div>
                    <p className="text-xs text-[#544434]">{srv.description}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-[#efeeea]">
                      <span className={`text-[11px] font-bold ${srv.isActive ? 'text-emerald-700' : 'text-[#877462]'}`}>
                        {srv.isActive ? '● Available for Online Booking' : '○ Temporarily Paused'}
                      </span>
                      <button
                        onClick={() => handleToggleService(srv.id)}
                        className={`text-xs font-bold px-3 py-1 rounded-lg cursor-pointer ${
                          srv.isActive ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#c2edca] text-[#294e35]'
                        }`}
                      >
                        {srv.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-3xl p-6 border border-[#dac2ae]/50 shadow-xs space-y-6">
              <div>
                <h2 className="font-quicksand font-bold text-xl text-[#1b1c1a]">
                  Patient &amp; Client Records
                </h2>
                <p className="text-xs text-[#877462]">
                  Registered pet parents and past clinic visits.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {customers.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl border border-[#ebdcc4] bg-[#fdfcfa] space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={c.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <h4 className="font-bold text-sm text-[#1b1c1a]">{c.parentName}</h4>
                        <p className="text-xs text-[#877462]">{c.phone}</p>
                      </div>
                    </div>
                    <div className="text-xs space-y-1 text-[#544434]">
                      <p><strong>Pets:</strong> {c.pets.join(', ')}</p>
                      <p><strong>Total Visits:</strong> {c.totalVisits}</p>
                      <p><strong>Last Visit:</strong> {c.lastVisit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings & Profile Tabs with Camera Photo Capture */}
          {(activeTab === 'settings' || activeTab === 'profile') && (
            <UserSettingsView
              onNavigate={(path) => onNavigate(path)}
              onNavigateTab={(tab) => handleTabChange(tab)}
            />
          )}

          {/* Earnings & Payouts Tab */}
          {activeTab === 'earnings' && (
            <ProviderEarningsView
              providerId={user?.id || 'prov-happy-tails'}
              providerName={user?.name || 'Happy Tails Clinic & Mobile Care'}
              payments={payments}
            />
          )}

          {/* Other Tabs: Reviews, Calendar */}
          {['calendar', 'reviews'].includes(activeTab) && (
            <div className="bg-white rounded-3xl p-8 border border-[#dac2ae]/50 shadow-xs space-y-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-[#ffeed9] text-[#895100] flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">
                  {navItems.find((n) => n.id === activeTab)?.icon || 'medical_services'}
                </span>
              </div>
              <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a] capitalize">
                {navItems.find((n) => n.id === activeTab)?.label}
              </h3>
              <p className="text-xs text-[#877462] max-w-md mx-auto">
                Manage your practice's {activeTab} information, connected bank accounts for automated weekly settlements, and clinic staff permissions.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => showToast('Changes saved successfully!')}
                  className="px-5 py-2.5 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] transition-colors cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
