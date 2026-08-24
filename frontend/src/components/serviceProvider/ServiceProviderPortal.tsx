import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ZoobyLogo } from '../common/ZoobyLogo';
import { PaymentRecord, UserProfile } from '../../types';
import {
  INITIAL_SP_APPOINTMENTS,
  INITIAL_SP_REQUESTS,
  INITIAL_SP_CATALOG,
  INITIAL_SP_AVAILABILITY,
  INITIAL_SP_CLIENTS,
  INITIAL_SP_TRANSACTIONS,
  INITIAL_SP_NOTIFICATIONS,
  ServiceProviderAppointment,
  ServiceProviderRequest,
  ServiceProviderCatalogItem,
  ServiceProviderAvailabilitySettings,
  ServiceProviderClient,
  ServiceProviderTransaction,
  ServiceProviderNotification
} from '../../data/serviceProviderMockData';
import { getDynamicGreeting, getUserDisplayName, getPersonalizedEmptyState } from '../../utils/identity';

interface ServiceProviderPortalProps {
  currentTab?: string;
  payments?: PaymentRecord[];
  onNavigate: (path: string) => void;
}

export const ServiceProviderPortal: React.FC<ServiceProviderPortalProps> = ({
  currentTab = 'dashboard',
  payments = [],
  onNavigate
}) => {
  const { user, logout, updateUserProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<string>(currentTab);
  const [appointments, setAppointments] = useState<ServiceProviderAppointment[]>(INITIAL_SP_APPOINTMENTS);
  const [requests, setRequests] = useState<ServiceProviderRequest[]>(INITIAL_SP_REQUESTS);
  const [catalog, setCatalog] = useState<ServiceProviderCatalogItem[]>(INITIAL_SP_CATALOG);
  const [availability, setAvailability] = useState<ServiceProviderAvailabilitySettings>(INITIAL_SP_AVAILABILITY);
  const [clients, setClients] = useState<ServiceProviderClient[]>(INITIAL_SP_CLIENTS);
  const [transactions, setTransactions] = useState<ServiceProviderTransaction[]>(INITIAL_SP_TRANSACTIONS);
  const [notifications, setNotifications] = useState<ServiceProviderNotification[]>(INITIAL_SP_NOTIFICATIONS);

  // UI state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [selectedAppointment, setSelectedAppointment] = useState<ServiceProviderAppointment | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceProviderRequest | null>(null);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceProviderCatalogItem | null>(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedClientForNotes, setSelectedClientForNotes] = useState<ServiceProviderClient | null>(null);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    businessName: user?.businessName || user?.organizationName || 'Paws & Trails Pet Care & Grooming Hub',
    name: user?.name || 'Vikram Deshmukh',
    phone: user?.phone || '+91 98224 88771',
    email: user?.email || 'vikram.provider@zooby.care',
    city: user?.city || 'Nashik',
    location: user?.location || 'Gangapur Road, Nashik',
    bio: user?.bio || 'Certified pet care professional, canine fitness walker, and master groomer offering personalized care, cage-free sitting, and behavioral coaching across Nashik.',
    serviceRadiusKm: 10,
    experience: user?.experience || '6+ Years',
    licenseNumber: user?.licenseNumber || 'MH-PETCARE-2021-9941',
    availabilityStatus: user?.availability || 'Available'
  });

  // New Service Form state
  const [newServiceForm, setNewServiceForm] = useState({
    name: '',
    category: 'walking' as 'walking' | 'sitting' | 'grooming' | 'training' | 'mobile_grooming',
    description: '',
    durationMinutes: 45,
    price: 600,
    includes: 'Live GPS tracking, Fresh hydration, Post-walk photo'
  });

  // Time slot input
  const [newSlotInput, setNewSlotInput] = useState('');
  const [newBlackoutDate, setNewBlackoutDate] = useState('');

  // Booking filters
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('all');
  const [bookingSearchQuery, setBookingSearchQuery] = useState<string>('');
  const [bookingCategoryFilter, setBookingCategoryFilter] = useState<string>('all');

  // Notification filter
  const [notificationFilter, setNotificationFilter] = useState<string>('all');

  useEffect(() => {
    if (currentTab && currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [currentTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    onNavigate(`/service-provider/${tab}`);
  };

  // --- Handlers for Today's Schedule & Bookings ---
  const handleUpdateAppointmentStatus = (
    id: string,
    newStatus: 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled'
  ) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
    showToast(`Booking status updated to ${newStatus}`);
  };

  // --- Handlers for Requests ---
  const handleAcceptRequest = (request: ServiceProviderRequest) => {
    setRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, status: 'Accepted' } : r)));

    // Create a new appointment from request
    const newApt: ServiceProviderAppointment = {
      id: `sp-apt-${Date.now()}`,
      bookingRef: `ZB-${Math.floor(10000 + Math.random() * 90000)}`,
      petName: request.petName,
      petSpecies: request.petSpecies,
      petBreed: request.petBreed,
      petPhoto: request.petPhoto,
      parentName: request.parentName,
      parentPhone: request.parentPhone,
      parentEmail: request.parentEmail,
      parentLocation: request.location,
      serviceTitle: request.serviceRequested,
      category: request.category,
      date: request.requestedDate,
      timeSlot: request.requestedTime,
      durationMinutes: request.durationMinutes,
      amount: request.price,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      notes: request.notes
    };

    setAppointments((prev) => [newApt, ...prev]);

    // Add transaction
    const newTx: ServiceProviderTransaction = {
      id: `tx-sp-${Date.now()}`,
      transactionRef: `TXN-ZB-${Math.floor(1000 + Math.random() * 9000)}`,
      date: request.requestedDate,
      serviceTitle: request.serviceRequested,
      customerName: request.parentName,
      petName: request.petName,
      grossAmount: request.price,
      platformFee: Math.round(request.price * 0.1),
      netPayout: Math.round(request.price * 0.9),
      payoutStatus: 'Processing',
      paymentMethod: 'Zooby Wallet'
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToast(`Accepted service request from ${request.parentName}! Added to schedule.`);
  };

  const handleDeclineRequest = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'Declined' } : r)));
    showToast('Service request declined.');
  };

  // --- Handlers for My Services Catalog ---
  const handleToggleServiceActive = (id: string) => {
    setCatalog((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
    showToast('Service availability toggled.');
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceForm.name.trim() || !newServiceForm.price) {
      showToast('Please fill in service name and price.');
      return;
    }

    const created: ServiceProviderCatalogItem = {
      id: `svc-${Date.now()}`,
      name: newServiceForm.name.trim(),
      category: newServiceForm.category,
      description: newServiceForm.description.trim() || 'Professional pet care service by verified provider.',
      durationMinutes: Number(newServiceForm.durationMinutes) || 30,
      price: Number(newServiceForm.price),
      isActive: true,
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      includes: newServiceForm.includes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    };

    setCatalog((prev) => [created, ...prev]);
    setIsAddServiceModalOpen(false);
    setNewServiceForm({
      name: '',
      category: 'walking',
      description: '',
      durationMinutes: 45,
      price: 600,
      includes: 'Live GPS tracking, Fresh hydration, Post-walk photo'
    });
    showToast(`New service "${created.name}" created successfully!`);
  };

  const handleSaveEditService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setCatalog((prev) =>
      prev.map((s) => (s.id === editingService.id ? { ...editingService } : s))
    );
    setEditingService(null);
    showToast('Service details updated.');
  };

  // --- Handlers for Availability ---
  const handleToggleDay = (day: string) => {
    setAvailability((prev) => {
      const exists = prev.workingDays.includes(day);
      return {
        ...prev,
        workingDays: exists
          ? prev.workingDays.filter((d) => d !== day)
          : [...prev.workingDays, day]
      };
    });
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotInput.trim()) return;
    const formatted = newSlotInput.trim();
    if (!availability.timeSlots.includes(formatted)) {
      setAvailability((prev) => ({
        ...prev,
        timeSlots: [...prev.timeSlots, formatted].sort()
      }));
      setNewSlotInput('');
      showToast(`Added time slot: ${formatted}`);
    }
  };

  const handleRemoveSlot = (slot: string) => {
    setAvailability((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((s) => s !== slot)
    }));
    showToast(`Removed time slot: ${slot}`);
  };

  const handleAddBlackoutDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlackoutDate) return;
    if (!availability.unavailableDates.includes(newBlackoutDate)) {
      setAvailability((prev) => ({
        ...prev,
        unavailableDates: [...prev.unavailableDates, newBlackoutDate]
      }));
      setNewBlackoutDate('');
      showToast(`Added blackout date: ${newBlackoutDate}`);
    }
  };

  const handleRemoveBlackoutDate = (dateStr: string) => {
    setAvailability((prev) => ({
      ...prev,
      unavailableDates: prev.unavailableDates.filter((d) => d !== dateStr)
    }));
  };

  const handleSaveAvailability = () => {
    showToast('Availability settings saved and synchronized live!');
  };

  // --- Handlers for Earnings & Withdrawal ---
  const totalGrossEarnings = transactions.reduce((sum, t) => sum + t.grossAmount, 0);
  const totalPlatformFees = transactions.reduce((sum, t) => sum + t.platformFee, 0);
  const totalNetEarnings = transactions.reduce((sum, t) => sum + t.netPayout, 0);
  const paidEarnings = transactions
    .filter((t) => t.payoutStatus === 'Paid')
    .reduce((sum, t) => sum + t.netPayout, 0);
  const availableWithdrawBalance = Math.max(0, totalNetEarnings - paidEarnings);

  const handleRequestWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0 || amt > availableWithdrawBalance) {
      showToast('Please enter a valid amount within your available balance.');
      return;
    }

    const newTx: ServiceProviderTransaction = {
      id: `tx-sp-${Date.now()}`,
      transactionRef: `NEFT-ZB-${Math.floor(10000000 + Math.random() * 90000000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      serviceTitle: 'Bank Settlement Disbursement',
      customerName: user?.businessName || 'Paws & Trails',
      petName: 'Wallet Transfer',
      grossAmount: amt,
      platformFee: 0,
      netPayout: amt,
      payoutStatus: 'Paid',
      paymentMethod: 'Direct Bank Transfer (HDFC •••• 4821)'
    };

    setTransactions((prev) => [newTx, ...prev]);
    setIsWithdrawModalOpen(false);
    setWithdrawAmount('');
    showToast(`Withdrawal request of ₹${amt.toLocaleString('en-IN')} submitted to your HDFC Bank account!`);
  };

  // --- Handlers for Profile Settings ---
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: profileForm.name,
      displayName: profileForm.name,
      businessName: profileForm.businessName,
      organizationName: profileForm.businessName,
      phone: profileForm.phone,
      city: profileForm.city,
      location: profileForm.location,
      bio: profileForm.bio,
      experience: profileForm.experience,
      licenseNumber: profileForm.licenseNumber,
      availability: profileForm.availabilityStatus as any
    });
    showToast('Business profile updated successfully!');
  };

  // --- Handlers for Notifications ---
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
  };

  // KPI Calculations
  const todayAppointments = appointments.filter((a) => a.date.toLowerCase().includes('today'));
  const pendingRequestsCount = requests.filter((r) => r.status === 'Pending').length;
  const completedServicesCount = appointments.filter((a) => a.status === 'Completed').length;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Filtered Bookings
  const filteredBookings = appointments.filter((b) => {
    const matchesStatus =
      bookingFilterStatus === 'all' ||
      b.status.toLowerCase() === bookingFilterStatus.toLowerCase() ||
      (bookingFilterStatus === 'today' && b.date.toLowerCase().includes('today')) ||
      (bookingFilterStatus === 'upcoming' && (b.status === 'Confirmed' || b.status === 'Pending'));

    const matchesCategory =
      bookingCategoryFilter === 'all' || b.category === bookingCategoryFilter;

    const matchesSearch =
      bookingSearchQuery === '' ||
      b.petName.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
      b.parentName.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
      b.serviceTitle.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
      b.bookingRef.toLowerCase().includes(bookingSearchQuery.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: 'dashboard' },
    { id: 'schedule', label: "Today's Schedule", icon: 'event_available', count: todayAppointments.length },
    { id: 'requests', label: 'Service Requests', icon: 'mark_email_unread', count: pendingRequestsCount },
    { id: 'services', label: 'My Services', icon: 'spa' },
    { id: 'availability', label: 'Availability & Slots', icon: 'more_time' },
    { id: 'bookings', label: 'Bookings Management', icon: 'calendar_month' },
    { id: 'clients', label: 'Clients & Pets', icon: 'groups' },
    { id: 'earnings', label: 'Earnings & Payouts', icon: 'payments' },
    { id: 'profile', label: 'Business Profile', icon: 'storefront' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications', count: unreadNotificationsCount }
  ];

  return (
    <div className="min-h-screen bg-[#f7f5f0] flex text-[#1b1c1a] font-jakarta selection:bg-[#ffdcbc] selection:text-[#683c00]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#1b1c1a] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-3 border border-[#dac2ae]/30">
          <span className="material-symbols-outlined text-base text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#fbf9f5] border-r border-[#ebdcc4] flex-col shrink-0 justify-between h-screen sticky top-0">
        <div className="overflow-y-auto">
          {/* Brand Header */}
          <div className="p-5 border-b border-[#efeeea] flex items-center justify-between">
            <ZoobyLogo
              size="sm"
              subtitle="Service Provider"
              badgeText="Certified Pro"
              badgeColor="amber"
              clickable={true}
              onClick={() => handleTabChange('dashboard')}
            />
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeTab === item.id
                    ? 'bg-[#ffeed9] text-[#895100] shadow-2xs font-extrabold'
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
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      item.id === 'requests'
                        ? 'bg-[#ba1a1a] text-white'
                        : 'bg-[#895100] text-white'
                    }`}
                  >
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
              src={user?.profilePhoto || user?.avatarUrl || 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=240'}
              alt={getUserDisplayName(user, 'Vikram Deshmukh')}
              className="w-9 h-9 rounded-full object-cover border border-[#895100]/30"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#1b1c1a] truncate">{getUserDisplayName(user, 'Vikram Deshmukh')}</p>
              <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Verified Pro Partner</span>
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

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-xs bg-[#fbf9f5] h-full flex flex-col justify-between p-4 shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#efeeea]">
                <ZoobyLogo
                  size="sm"
                  subtitle="Service Provider Portal"
                  badgeText="Certified Pro"
                  badgeColor="amber"
                />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-[#544434] hover:bg-[#f2ece2]"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <nav className="mt-4 space-y-1 max-h-[70vh] overflow-y-auto pr-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                      activeTab === item.id
                        ? 'bg-[#ffeed9] text-[#895100]'
                        : 'text-[#544434] hover:bg-[#f2ece2]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="bg-[#895100] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#efeeea]">
              <button
                onClick={() => logout('/')}
                className="w-full py-2 px-3 rounded-xl bg-white border border-[#dac2ae]/60 text-[#93000a] text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#fbf9f5]/90 backdrop-blur-md border-b border-[#efeeea] px-4 md:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-[#f3eee8] text-[#544434] cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>
            <div>
              <h1 className="font-quicksand font-bold text-xl md:text-2xl text-[#1b1c1a] capitalize">
                {navItems.find((n) => n.id === activeTab)?.label || 'Service Provider Portal'}
              </h1>
              <p className="text-xs text-[#877462]">
                {getDynamicGreeting(user, 'greeting')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-[#ffdcbc]/40 px-3 py-1.5 rounded-full text-xs font-bold text-[#895100] border border-[#ffdcbc]">
              <span className="material-symbols-outlined text-sm filled-icon">storefront</span>
              <span className="truncate max-w-[200px]">
                {user?.businessName || user?.organizationName || 'Paws & Trails Pet Care Hub'}
              </span>
            </div>

            <button
              onClick={() => handleTabChange('notifications')}
              className="relative p-2 rounded-full bg-white border border-[#dac2ae]/60 hover:bg-[#ffeed9] text-[#544434] transition-colors cursor-pointer"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-lg">notifications</span>
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white" />
              )}
            </button>
          </div>
        </header>

        {/* Tab Content Body */}
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* ========================================================================= */}
          {/* 1. DASHBOARD OVERVIEW */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Requests Alert Banner if Pending */}
              {pendingRequestsCount > 0 && (
                <div className="bg-gradient-to-r from-[#895100] to-[#683c00] text-white rounded-3xl p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-2xl text-[#ffdcbc]">mark_email_unread</span>
                    </div>
                    <div>
                      <h3 className="font-quicksand font-bold text-lg">
                        {pendingRequestsCount} Incoming Service {pendingRequestsCount === 1 ? 'Request' : 'Requests'}
                      </h3>
                      <p className="text-xs text-[#ffdcbc] mt-0.5">
                        Pet parents in Gangapur Rd &amp; Indira Nagar are waiting for your confirmation.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTabChange('requests')}
                    className="px-4 py-2 bg-white text-[#895100] rounded-xl text-xs font-bold hover:bg-[#ffeed9] transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    Review Requests →
                  </button>
                </div>
              )}

              {/* KPI Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-3xl p-5 border border-[#dac2ae]/50 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-[#877462]">
                    <span className="text-xs font-semibold">Today's Services</span>
                    <span className="material-symbols-outlined text-lg text-[#895100]">event_available</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-[#1b1c1a]">{todayAppointments.length} Active</p>
                  <p className="text-[11px] text-emerald-700 font-bold">
                    {todayAppointments.filter((a) => a.status === 'Completed').length} Completed •{' '}
                    {todayAppointments.filter((a) => a.status === 'Confirmed' || a.status === 'In Progress').length} Upcoming
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-[#dac2ae]/50 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-[#877462]">
                    <span className="text-xs font-semibold">Today's Earnings</span>
                    <span className="material-symbols-outlined text-lg text-emerald-700">payments</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-[#1b1c1a]">₹2,500</p>
                  <p className="text-[11px] text-[#877462]">Net: ₹2,250 (after 10% fee)</p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-[#dac2ae]/50 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-[#877462]">
                    <span className="text-xs font-semibold">Monthly Income</span>
                    <span className="material-symbols-outlined text-lg text-[#895100]">trending_up</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-[#1b1c1a]">₹48,250</p>
                  <p className="text-[11px] text-emerald-700 font-bold">+24% vs last month</p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-[#dac2ae]/50 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-[#877462]">
                    <span className="text-xs font-semibold">Rating &amp; Reviews</span>
                    <span className="material-symbols-outlined text-lg text-amber-500 filled-icon">star</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-[#1b1c1a]">4.92 ★</p>
                  <p className="text-[11px] text-[#877462]">Based on 94 verified reviews</p>
                </div>
              </div>

              {/* Quick Action Shortcuts Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setIsAddServiceModalOpen(true)}
                  className="p-3.5 bg-white rounded-2xl border border-[#dac2ae]/60 hover:border-[#895100] text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[#895100] text-2xl group-hover:scale-110 transition-transform">
                    add_circle
                  </span>
                  <p className="text-xs font-bold text-[#1b1c1a] mt-1.5">Add Service</p>
                  <p className="text-[11px] text-[#877462]">Catalog &amp; rates</p>
                </button>

                <button
                  onClick={() => handleTabChange('availability')}
                  className="p-3.5 bg-white rounded-2xl border border-[#dac2ae]/60 hover:border-[#895100] text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[#895100] text-2xl group-hover:scale-110 transition-transform">
                    more_time
                  </span>
                  <p className="text-xs font-bold text-[#1b1c1a] mt-1.5">Set Availability</p>
                  <p className="text-[11px] text-[#877462]">Working days &amp; slots</p>
                </button>

                <button
                  onClick={() => handleTabChange('schedule')}
                  className="p-3.5 bg-white rounded-2xl border border-[#dac2ae]/60 hover:border-[#895100] text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[#895100] text-2xl group-hover:scale-110 transition-transform">
                    schedule
                  </span>
                  <p className="text-xs font-bold text-[#1b1c1a] mt-1.5">View Schedule</p>
                  <p className="text-[11px] text-[#877462]">Today's appointments</p>
                </button>

                <button
                  onClick={() => handleTabChange('earnings')}
                  className="p-3.5 bg-white rounded-2xl border border-[#dac2ae]/60 hover:border-[#895100] text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[#895100] text-2xl group-hover:scale-110 transition-transform">
                    account_balance
                  </span>
                  <p className="text-xs font-bold text-[#1b1c1a] mt-1.5">Withdraw Funds</p>
                  <p className="text-[11px] text-[#877462]">Bank disbursements</p>
                </button>
              </div>

              {/* Today's Schedule Preview */}
              <div className="bg-white rounded-3xl p-6 border border-[#dac2ae]/50 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-quicksand font-bold text-lg text-[#1b1c1a]">
                      Today's Appointment Schedule
                    </h2>
                    <p className="text-xs text-[#877462]">
                      Appointments and pet care visits for today.
                    </p>
                  </div>
                  <button
                    onClick={() => handleTabChange('schedule')}
                    className="text-xs font-bold text-[#895100] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Full Schedule</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {todayAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 rounded-2xl border border-[#ebdcc4] hover:border-[#895100]/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fbf9f5]/50"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={apt.petPhoto}
                          alt={apt.petName}
                          className="w-12 h-12 rounded-2xl object-cover border border-[#dac2ae]/40"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#1b1c1a]">{apt.petName}</span>
                            <span className="text-xs text-[#877462]">({apt.petBreed})</span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                apt.status === 'Confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : apt.status === 'In Progress'
                                  ? 'bg-amber-100 text-amber-900 animate-pulse'
                                  : apt.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {apt.status}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#544434] mt-0.5">
                            {apt.timeSlot} • {apt.serviceTitle}
                          </p>
                          <p className="text-[11px] text-[#877462]">
                            Parent: {apt.parentName} • 📍 {apt.parentLocation}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className="text-sm font-bold text-[#895100] mr-2">₹{apt.amount}</span>
                        {apt.status === 'Confirmed' && (
                          <button
                            onClick={() => handleUpdateAppointmentStatus(apt.id, 'In Progress')}
                            className="px-3 py-1.5 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] transition-colors cursor-pointer"
                          >
                            Start Service
                          </button>
                        )}
                        {apt.status === 'In Progress' && (
                          <button
                            onClick={() => handleUpdateAppointmentStatus(apt.id, 'Completed')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedAppointment(apt)}
                          className="px-2.5 py-1.5 rounded-xl bg-white border border-[#dac2ae] text-xs font-semibold text-[#544434] hover:bg-[#f2ece2] transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. TODAY'S SCHEDULE */}
          {/* ========================================================================= */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                    Today's Schedule &amp; Patient Appointments
                  </h2>
                  <p className="text-xs text-[#877462]">
                    Time-slotted services and active status tracking for today.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold">
                    📅 Today: Aug 25, 2026
                  </span>
                </div>
              </div>

              {/* Appointments List */}
              <div className="space-y-3.5">
                {todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-3xl p-5 border border-[#dac2ae]/50 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="px-3 py-2 rounded-2xl bg-[#ffeed9] text-[#895100] font-bold text-center shrink-0 border border-[#ffdcbc]">
                          <p className="text-xs uppercase tracking-wider font-extrabold">Slot</p>
                          <p className="text-sm">{apt.timeSlot.split(' ')[0]}</p>
                          <p className="text-[10px]">{apt.timeSlot.split(' ')[1]}</p>
                        </div>

                        <img
                          src={apt.petPhoto}
                          alt={apt.petName}
                          className="w-14 h-14 rounded-2xl object-cover border border-[#dac2ae]/40 shrink-0"
                        />

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-quicksand font-bold text-base text-[#1b1c1a]">
                              {apt.petName}
                            </h3>
                            <span className="text-xs text-[#877462]">({apt.petBreed})</span>
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                apt.status === 'Confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : apt.status === 'In Progress'
                                  ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-300'
                                  : apt.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {apt.status}
                            </span>
                            <span className="text-[11px] font-mono text-[#877462] bg-[#f5f0e6] px-2 py-0.5 rounded-md">
                              {apt.bookingRef}
                            </span>
                          </div>

                          <p className="text-xs font-bold text-[#895100] mt-0.5">
                            {apt.serviceTitle} ({apt.durationMinutes} mins) • ₹{apt.amount}
                          </p>

                          <p className="text-[11px] text-[#544434] mt-0.5">
                            Pet Parent: <strong>{apt.parentName}</strong> ({apt.parentPhone}) • 📍 {apt.parentLocation}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={`tel:${apt.parentPhone}`}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f2ece2] transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">call</span>
                          <span>Call Parent</span>
                        </a>

                        {apt.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateAppointmentStatus(apt.id, 'Confirmed')}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                          >
                            Confirm
                          </button>
                        )}

                        {apt.status === 'Confirmed' && (
                          <button
                            onClick={() => handleUpdateAppointmentStatus(apt.id, 'In Progress')}
                            className="px-3.5 py-1.5 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">play_arrow</span>
                            <span>Start Service</span>
                          </button>
                        )}

                        {apt.status === 'In Progress' && (
                          <button
                            onClick={() => handleUpdateAppointmentStatus(apt.id, 'Completed')}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">check</span>
                            <span>Mark Completed</span>
                          </button>
                        )}

                        {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleUpdateAppointmentStatus(apt.id, 'Cancelled')}
                            className="px-3 py-1.5 rounded-xl bg-white border border-[#ffdad6] text-[#ba1a1a] text-xs font-semibold hover:bg-[#ffdad6]/20 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedAppointment(apt)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#dac2ae] text-xs font-semibold text-[#1b1c1a] hover:bg-[#f2ece2] transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </div>
                    </div>

                    {/* Special Care Notes alert */}
                    {apt.specialCareInstructions && (
                      <div className="p-3 bg-[#ffeed9]/60 rounded-xl text-xs text-[#544434] border border-[#ffdcbc] flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm text-[#895100] shrink-0 mt-0.5">info</span>
                        <span>
                          <strong>Care Note:</strong> {apt.specialCareInstructions}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. SERVICE REQUESTS */}
          {/* ========================================================================= */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                    Incoming Service Requests
                  </h2>
                  <p className="text-xs text-[#877462]">
                    Review booking requests and approve them to add to your calendar.
                  </p>
                </div>
                <span className="px-3 py-1 bg-[#ffdad6] text-[#93000a] rounded-full text-xs font-bold">
                  {pendingRequestsCount} Pending Action
                </span>
              </div>

              {requests.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-[#dac2ae]/50 space-y-2">
                  <span className="material-symbols-outlined text-4xl text-[#877462]">inbox</span>
                  <p className="text-sm font-bold text-[#1b1c1a]">No incoming service requests right now.</p>
                  <p className="text-xs text-[#877462]">New booking requests from pet parents will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white rounded-3xl p-5 border border-[#dac2ae]/50 shadow-xs flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={req.petPhoto}
                              alt={req.petName}
                              className="w-12 h-12 rounded-2xl object-cover border border-[#dac2ae]/40"
                            />
                            <div>
                              <h3 className="font-quicksand font-bold text-base text-[#1b1c1a]">
                                {req.petName}
                              </h3>
                              <p className="text-xs text-[#877462]">{req.petBreed}</p>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                              req.status === 'Pending'
                                ? 'bg-amber-100 text-amber-900'
                                : req.status === 'Accepted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <p className="font-bold text-[#895100]">{req.serviceRequested}</p>
                          <p className="text-[#544434] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            <span>{req.requestedDate} • {req.requestedTime}</span>
                          </p>
                          <p className="text-[#544434] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            <span>{req.location}</span>
                          </p>
                          <p className="text-[#544434] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">person</span>
                            <span>{req.parentName} ({req.parentPhone})</span>
                          </p>
                        </div>

                        {req.notes && (
                          <div className="p-2.5 bg-[#fbf9f5] rounded-xl text-[11px] text-[#544434] border border-[#efeeea]">
                            <p className="font-semibold text-[#895100]">Parent Request Note:</p>
                            <p className="mt-0.5 line-clamp-2">{req.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[#efeeea] flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] text-[#877462] uppercase font-bold">Payout Value</p>
                          <p className="text-base font-bold text-[#1b1c1a]">₹{req.price}</p>
                        </div>

                        {req.status === 'Pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeclineRequest(req.id)}
                              className="px-3 py-1.5 rounded-xl bg-white border border-[#ffdad6] text-[#ba1a1a] text-xs font-semibold hover:bg-[#ffdad6]/20 transition-colors cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleAcceptRequest(req)}
                              className="px-3 py-1.5 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] transition-colors cursor-pointer shadow-xs"
                            >
                              Accept
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-[#877462]">Action recorded</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. MY SERVICES */}
          {/* ========================================================================= */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                    My Services &amp; Pricing Catalog
                  </h2>
                  <p className="text-xs text-[#877462]">
                    Add, edit, or adjust pricing and active status for your service offerings.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddServiceModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#895100] hover:bg-[#683c00] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Add New Service</span>
                </button>
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catalog.map((svc) => (
                  <div
                    key={svc.id}
                    className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                      svc.isActive
                        ? 'border-[#dac2ae]/60 shadow-xs'
                        : 'border-gray-200 opacity-60 bg-gray-50'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#ffeed9] text-[#895100]">
                          {svc.category.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-[#544434]">
                            {svc.isActive ? 'Active' : 'Disabled'}
                          </span>
                          <input
                            type="checkbox"
                            checked={svc.isActive}
                            onChange={() => handleToggleServiceActive(svc.id)}
                            className="w-4 h-4 accent-[#895100] cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a]">
                          {svc.name}
                        </h3>
                        <p className="text-xs text-[#877462] mt-1 line-clamp-2">
                          {svc.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#544434]">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-[#895100]">timer</span>
                          <span>{svc.durationMinutes} mins</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-[#895100]">calendar_today</span>
                          <span>{svc.availableDays.length} days/wk</span>
                        </span>
                      </div>

                      {svc.includes && svc.includes.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <p className="text-[11px] font-bold text-[#544434]">Package Inclusions:</p>
                          <ul className="space-y-0.5">
                            {svc.includes.map((inc, i) => (
                              <li key={i} className="text-[11px] text-[#877462] flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-xs text-emerald-600">check</span>
                                <span>{inc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#efeeea] flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-[#877462] uppercase font-bold">Standard Price</p>
                        <p className="text-lg font-bold text-[#895100]">₹{svc.price}</p>
                      </div>
                      <button
                        onClick={() => setEditingService(svc)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f2ece2] cursor-pointer"
                      >
                        Edit Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. AVAILABILITY */}
          {/* ========================================================================= */}
          {activeTab === 'availability' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                  Availability &amp; Working Slots
                </h2>
                <p className="text-xs text-[#877462]">
                  Configure your working days, service hours, time slots, and blackout vacation dates.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Working Days & Slots */}
                <div className="lg:col-span-2 space-y-5">
                  {/* Working Days */}
                  <div className="bg-white rounded-3xl p-6 border border-[#dac2ae]/50 shadow-xs space-y-4">
                    <h3 className="font-quicksand font-bold text-base text-[#1b1c1a]">
                      Working Days of the Week
                    </h3>
                    <p className="text-xs text-[#877462]">
                      Select the days you accept bookings from pet parents.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                        const isSelected = availability.workingDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleToggleDay(day)}
                            className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all text-center cursor-pointer border ${
                              isSelected
                                ? 'bg-[#ffeed9] text-[#895100] border-[#895100] shadow-xs'
                                : 'bg-[#fbf9f5] text-[#877462] border-[#dac2ae]/50 hover:bg-[#f2ece2]'
                            }`}
                          >
                            <p className="text-sm font-extrabold">{day.slice(0, 3)}</p>
                            <p className="text-[10px] mt-0.5">{isSelected ? 'Active' : 'Off'}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Daily Time Slots */}
                  <div className="bg-white rounded-3xl p-6 border border-[#dac2ae]/50 shadow-xs space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-quicksand font-bold text-base text-[#1b1c1a]">
                          Bookable Time Slots
                        </h3>
                        <p className="text-xs text-[#877462]">
                          Available appointment slots visible to customers.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {availability.timeSlots.map((slot) => (
                        <div
                          key={slot}
                          className="px-3 py-1.5 rounded-full bg-[#fbf9f5] border border-[#dac2ae] text-xs font-bold text-[#544434] flex items-center gap-2 shadow-2xs"
                        >
                          <span>{slot}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(slot)}
                            className="text-[#ba1a1a] hover:text-black cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddSlot} className="flex gap-2 pt-2">
                      <input
                        type="text"
                        value={newSlotInput}
                        onChange={(e) => setNewSlotInput(e.target.value)}
                        placeholder="e.g. 06:30 PM"
                        className="px-4 py-2 rounded-xl border border-[#dac2ae] text-xs bg-[#fbf9f5] focus:outline-none focus:ring-2 focus:ring-[#895100] max-w-xs"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] transition-colors cursor-pointer"
                      >
                        + Add Slot
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right Col: Hours, Breaks & Unavailable Dates */}
                <div className="space-y-5">
                  {/* Operating Hours & Breaks */}
                  <div className="bg-white rounded-3xl p-6 border border-[#dac2ae]/50 shadow-xs space-y-4">
                    <h3 className="font-quicksand font-bold text-base text-[#1b1c1a]">
                      Daily Working Window
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-[#544434] mb-1">Shift Start</label>
                        <input
                          type="text"
                          value={availability.workingHoursStart}
                          onChange={(e) =>
                            setAvailability((prev) => ({ ...prev, workingHoursStart: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-xl border border-[#dac2ae] bg-[#fbf9f5]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#544434] mb-1">Shift End</label>
                        <input
                          type="text"
                          value={availability.workingHoursEnd}
                          onChange={(e) =>
                            setAvailability((prev) => ({ ...prev, workingHoursEnd: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-xl border border-[#dac2ae] bg-[#fbf9f5]"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#efeeea]">
                      <p className="text-xs font-bold text-[#544434] mb-2">Rest &amp; Lunch Breaks:</p>
                      {availability.breaks.map((b) => (
                        <div key={b.id} className="p-2.5 rounded-xl bg-[#fbf9f5] border border-[#ebdcc4] text-xs space-y-0.5">
                          <p className="font-bold text-[#895100]">{b.title}</p>
                          <p className="text-[11px] text-[#877462]">{b.start} – {b.end}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Blackout / Vacation Dates */}
                  <div className="bg-white rounded-3xl p-6 border border-[#dac2ae]/50 shadow-xs space-y-4">
                    <h3 className="font-quicksand font-bold text-base text-[#1b1c1a]">
                      Unavailable / Blackout Dates
                    </h3>
                    <p className="text-xs text-[#877462]">
                      Days when bookings are disabled for personal off or holidays.
                    </p>

                    <div className="space-y-2">
                      {availability.unavailableDates.map((dateStr) => (
                        <div
                          key={dateStr}
                          className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-900 flex items-center justify-between"
                        >
                          <span>{dateStr} (Off)</span>
                          <button
                            onClick={() => handleRemoveBlackoutDate(dateStr)}
                            className="text-red-600 hover:text-black font-bold cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddBlackoutDate} className="space-y-2 pt-2">
                      <input
                        type="date"
                        value={newBlackoutDate}
                        onChange={(e) => setNewBlackoutDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#dac2ae] bg-[#fbf9f5] text-xs"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-white border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f2ece2] cursor-pointer"
                      >
                        + Add Off Date
                      </button>
                    </form>
                  </div>

                  <button
                    onClick={handleSaveAvailability}
                    className="w-full py-3 rounded-2xl bg-[#895100] text-white font-bold text-xs hover:bg-[#683c00] transition-colors cursor-pointer shadow-sm"
                  >
                    Save All Availability Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. BOOKINGS */}
          {/* ========================================================================= */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                  Bookings Management
                </h2>
                <p className="text-xs text-[#877462]">
                  View and manage all customer bookings, filters, and status history.
                </p>
              </div>

              {/* Status Filter Tabs & Search Bar */}
              <div className="bg-white rounded-3xl p-5 border border-[#dac2ae]/50 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row justify-between gap-3">
                  {/* Status Tabs */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'all', label: 'All Bookings', count: appointments.length },
                      { id: 'today', label: 'Today', count: todayAppointments.length },
                      { id: 'upcoming', label: 'Upcoming', count: appointments.filter((a) => a.status === 'Confirmed').length },
                      { id: 'completed', label: 'Completed', count: completedServicesCount },
                      { id: 'pending', label: 'Pending', count: appointments.filter((a) => a.status === 'Pending').length }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setBookingFilterStatus(tab.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          bookingFilterStatus === tab.id
                            ? 'bg-[#895100] text-white shadow-2xs'
                            : 'bg-[#fbf9f5] text-[#544434] hover:bg-[#f2ece2]'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Search Bar & Category Filter */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={bookingSearchQuery}
                      onChange={(e) => setBookingSearchQuery(e.target.value)}
                      placeholder="Search pet, parent, ref..."
                      className="px-3.5 py-1.5 rounded-xl border border-[#dac2ae] bg-[#fbf9f5] text-xs focus:outline-none focus:ring-2 focus:ring-[#895100]"
                    />
                    <select
                      value={bookingCategoryFilter}
                      onChange={(e) => setBookingCategoryFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-[#dac2ae] bg-[#fbf9f5] text-xs"
                    >
                      <option value="all">All Categories</option>
                      <option value="walking">Dog Walking</option>
                      <option value="sitting">Pet Sitting</option>
                      <option value="grooming">Grooming &amp; Spa</option>
                      <option value="training">Training</option>
                      <option value="mobile_grooming">Mobile Grooming</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bookings Display (Responsive Cards for mobile, clean list for desktop) */}
              <div className="space-y-3">
                {filteredBookings.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-[#dac2ae]/50 space-y-2">
                    <span className="material-symbols-outlined text-4xl text-[#877462]">event_busy</span>
                    <p className="text-sm font-bold text-[#1b1c1a]">No bookings match your current filter.</p>
                    <p className="text-xs text-[#877462]">Try clearing filters or search queries.</p>
                  </div>
                ) : (
                  filteredBookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white rounded-3xl p-5 border border-[#dac2ae]/50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={b.petPhoto}
                          alt={b.petName}
                          className="w-12 h-12 rounded-2xl object-cover border border-[#dac2ae]/40 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-quicksand font-bold text-base text-[#1b1c1a]">{b.petName}</span>
                            <span className="text-xs text-[#877462]">({b.petBreed})</span>
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                b.status === 'Confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : b.status === 'In Progress'
                                  ? 'bg-amber-100 text-amber-900'
                                  : b.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {b.status}
                            </span>
                            <span className="text-[11px] font-mono text-[#877462] bg-[#fbf9f5] px-2 py-0.5 rounded border border-[#dac2ae]/40">
                              {b.bookingRef}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#895100] mt-0.5">
                            {b.serviceTitle} • {b.date} ({b.timeSlot})
                          </p>
                          <p className="text-[11px] text-[#877462]">
                            Parent: {b.parentName} • 📍 {b.parentLocation}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-3 self-stretch md:self-auto border-t md:border-t-0 pt-3 md:pt-0 border-[#efeeea]">
                        <div className="text-left md:text-right">
                          <p className="text-sm font-bold text-[#1b1c1a]">₹{b.amount}</p>
                          <p className="text-[10px] text-emerald-700 font-bold">{b.paymentStatus}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {b.status === 'Confirmed' && (
                            <button
                              onClick={() => handleUpdateAppointmentStatus(b.id, 'In Progress')}
                              className="px-3 py-1.5 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] transition-colors cursor-pointer"
                            >
                              Start
                            </button>
                          )}
                          {b.status === 'In Progress' && (
                            <button
                              onClick={() => handleUpdateAppointmentStatus(b.id, 'Completed')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedAppointment(b)}
                            className="px-3 py-1.5 rounded-xl bg-white border border-[#dac2ae] text-xs font-semibold text-[#544434] hover:bg-[#f2ece2] transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 7. CLIENTS / PET PARENTS */}
          {/* ========================================================================= */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                  Client Directory &amp; Pet Parents
                </h2>
                <p className="text-xs text-[#877462]">
                  Customers who have booked your pet care services, with pets and history.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clients.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-3xl p-5 border border-[#dac2ae]/50 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={c.avatarUrl}
                          alt={c.parentName}
                          className="w-13 h-13 rounded-full object-cover border border-[#dac2ae]/40"
                        />
                        <div className="min-w-0">
                          <h3 className="font-quicksand font-bold text-base text-[#1b1c1a]">
                            {c.parentName}
                          </h3>
                          <p className="text-xs text-[#877462]">{c.location}</p>
                          <p className="text-[11px] text-[#544434] mt-0.5">
                            📞 {c.phone} • ✉️ {c.email}
                          </p>
                        </div>
                      </div>

                      {/* Associated Pets */}
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-bold text-[#544434] uppercase tracking-wider">
                          Registered Pets:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {c.pets.map((p, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#fbf9f5] border border-[#dac2ae]/50"
                            >
                              <img src={p.photo} alt={p.name} className="w-6 h-6 rounded-full object-cover" />
                              <span className="text-xs font-bold text-[#1b1c1a]">
                                {p.name} <span className="text-[10px] font-normal text-[#877462]">({p.breed})</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Stats & Notes */}
                      <div className="grid grid-cols-2 gap-2 p-3 bg-[#fbf9f5] rounded-2xl text-xs border border-[#efeeea]">
                        <div>
                          <p className="text-[10px] text-[#877462] uppercase font-bold">Total Bookings</p>
                          <p className="text-sm font-bold text-[#1b1c1a]">{c.totalBookings} Visits</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#877462] uppercase font-bold">Total Spent</p>
                          <p className="text-sm font-bold text-[#895100]">₹{c.totalSpent.toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      {c.notes && (
                        <p className="text-[11px] text-[#544434] italic bg-amber-50/70 p-2 rounded-xl border border-amber-200/50">
                          🐾 <strong>Care note:</strong> {c.notes}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#efeeea] flex items-center justify-between">
                      <p className="text-[11px] text-[#877462]">
                        Last visit: <strong>{c.lastServiceDate}</strong>
                      </p>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${c.phone}`}
                          className="px-3 py-1.5 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">call</span>
                          <span>Call</span>
                        </a>
                        <a
                          href={`mailto:${c.email}`}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f2ece2]"
                        >
                          Email
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 8. EARNINGS */}
          {/* ========================================================================= */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                    Earnings &amp; Payout Settlements
                  </h2>
                  <p className="text-xs text-[#877462]">
                    Track gross earnings, Zooby platform fees (10%), and withdraw available balance to bank.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setWithdrawAmount(String(availableWithdrawBalance));
                    setIsWithdrawModalOpen(true);
                  }}
                  disabled={availableWithdrawBalance <= 0}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 ${
                    availableWithdrawBalance > 0
                      ? 'bg-[#895100] hover:bg-[#683c00] text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">account_balance</span>
                  <span>Withdraw Balance (₹{availableWithdrawBalance.toLocaleString('en-IN')})</span>
                </button>
              </div>

              {/* Financial Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-3xl p-5 border border-[#dac2ae]/50 shadow-2xs space-y-1">
                  <span className="text-xs text-[#877462] font-semibold">Available for Payout</span>
                  <p className="text-2xl font-bold text-emerald-700">₹{availableWithdrawBalance.toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-[#877462]">Disbursed to HDFC •••• 4821</p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-[#dac2ae]/50 shadow-2xs space-y-1">
                  <span className="text-xs text-[#877462] font-semibold">Gross Service Income</span>
                  <p className="text-2xl font-bold text-[#1b1c1a]">₹{totalGrossEarnings.toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-[#877462]">Total billing volume</p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-[#dac2ae]/50 shadow-2xs space-y-1">
                  <span className="text-xs text-[#877462] font-semibold">Zooby Platform Fee (10%)</span>
                  <p className="text-2xl font-bold text-amber-700">₹{totalPlatformFees.toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-[#877462]">App maintenance &amp; payment gateway</p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-[#dac2ae]/50 shadow-2xs space-y-1">
                  <span className="text-xs text-[#877462] font-semibold">Net Provider Share (90%)</span>
                  <p className="text-2xl font-bold text-[#895100]">₹{totalNetEarnings.toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-emerald-700 font-bold">100% Guaranteed Payout</p>
                </div>
              </div>

              {/* Transactions History */}
              <div className="bg-white rounded-3xl p-6 border border-[#dac2ae]/50 shadow-xs space-y-4">
                <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a]">
                  Recent Payout Transactions &amp; Bookings
                </h3>

                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 rounded-2xl border border-[#ebdcc4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fbf9f5]/50 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1b1c1a]">{tx.serviceTitle}</span>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full ${
                              tx.payoutStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {tx.payoutStatus}
                          </span>
                        </div>
                        <p className="text-[#877462]">
                          Ref: <span className="font-mono">{tx.transactionRef}</span> • Date: {tx.date} • Method: {tx.paymentMethod}
                        </p>
                        <p className="text-[#544434]">
                          Customer: {tx.customerName} ({tx.petName})
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-sm font-bold text-emerald-700">+₹{tx.netPayout}</p>
                        <p className="text-[10px] text-[#877462]">
                          Gross: ₹{tx.grossAmount} (Fee: ₹{tx.platformFee})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 9. PROFILE */}
          {/* ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                  Business Profile &amp; Practice Settings
                </h2>
                <p className="text-xs text-[#877462]">
                  Manage your business information, services radius, credentials, and verification status.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Card: Provider Identity Badge */}
                <div className="bg-white rounded-3xl p-6 border border-[#dac2ae]/50 shadow-xs space-y-4 text-center">
                  <div className="relative inline-block">
                    <img
                      src={user?.profilePhoto || user?.avatarUrl || 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=240'}
                      alt={profileForm.name}
                      className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-[#ffdcbc]"
                    />
                    <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-md">
                      ✓
                    </span>
                  </div>

                  <div>
                    <h3 className="font-quicksand font-bold text-xl text-[#1b1c1a]">
                      {profileForm.name}
                    </h3>
                    <p className="text-xs font-bold text-[#895100] mt-0.5">
                      {profileForm.businessName}
                    </p>
                    <p className="text-xs text-[#877462] mt-1">{profileForm.location}</p>
                  </div>

                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 text-left space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                      <span>Verified Zooby Service Partner</span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      ID &amp; Background Verification verified. License: <strong>{profileForm.licenseNumber}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-left">
                    <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#efeeea]">
                      <p className="text-[10px] text-[#877462] uppercase font-bold">Rating</p>
                      <p className="text-base font-bold text-[#1b1c1a]">4.92 ★</p>
                    </div>
                    <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#efeeea]">
                      <p className="text-[10px] text-[#877462] uppercase font-bold">Experience</p>
                      <p className="text-base font-bold text-[#1b1c1a]">{profileForm.experience}</p>
                    </div>
                  </div>
                </div>

                {/* Right 2 Cols: Editable Profile Form */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#dac2ae]/50 shadow-xs space-y-4">
                  <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a]">
                    Edit Practice Information
                  </h3>

                  <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-bold text-[#544434] mb-1">Your Full Name</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#dac2ae] bg-[#fbf9f5]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#544434] mb-1">Business / Brand Name</label>
                        <input
                          type="text"
                          value={profileForm.businessName}
                          onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#dac2ae] bg-[#fbf9f5]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-bold text-[#544434] mb-1">Contact Phone</label>
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#dac2ae] bg-[#fbf9f5]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#544434] mb-1">Contact Email</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#dac2ae] bg-[#fbf9f5]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block font-bold text-[#544434] mb-1">Operating City</label>
                        <input
                          type="text"
                          value={profileForm.city}
                          onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#dac2ae] bg-[#fbf9f5]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#544434] mb-1">Neighborhood / Area</label>
                        <input
                          type="text"
                          value={profileForm.location}
                          onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#dac2ae] bg-[#fbf9f5]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#544434] mb-1">Service Radius (km)</label>
                        <select
                          value={profileForm.serviceRadiusKm}
                          onChange={(e) => setProfileForm({ ...profileForm, serviceRadiusKm: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#dac2ae] bg-[#fbf9f5]"
                        >
                          <option value={5}>5 km radius</option>
                          <option value={10}>10 km radius</option>
                          <option value={15}>15 km radius</option>
                          <option value={25}>All City Coverage</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#544434] mb-1">Business Bio / Description</label>
                      <textarea
                        rows={3}
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#dac2ae] bg-[#fbf9f5]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="py-3 px-6 rounded-xl bg-[#895100] text-white font-bold text-xs hover:bg-[#683c00] transition-colors cursor-pointer shadow-sm"
                    >
                      Save Profile Changes
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 10. NOTIFICATIONS */}
          {/* ========================================================================= */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                    Provider Notifications &amp; Alerts
                  </h2>
                  <p className="text-xs text-[#877462]">
                    Updates on service requests, appointment confirmations, reminders, and payments.
                  </p>
                </div>

                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={handleMarkAllNotificationsRead}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#dac2ae] text-xs font-bold text-[#895100] hover:bg-[#ffeed9] transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      notif.read
                        ? 'bg-white border-[#ebdcc4]/60 text-[#544434]'
                        : 'bg-[#ffeed9]/40 border-[#895100]/40 text-[#1b1c1a] shadow-xs'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        notif.type === 'request'
                          ? 'bg-blue-100 text-blue-800'
                          : notif.type === 'booking'
                          ? 'bg-emerald-100 text-emerald-800'
                          : notif.type === 'payment'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {notif.type === 'request'
                          ? 'mark_email_unread'
                          : notif.type === 'booking'
                          ? 'event_available'
                          : notif.type === 'payment'
                          ? 'payments'
                          : 'notifications'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-quicksand font-bold text-sm text-[#1b1c1a]">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-[#877462]">{notif.time}</span>
                      </div>
                      <p className="text-xs text-[#544434] mt-0.5">{notif.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-[#dac2ae] animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#efeeea] pb-3">
              <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a]">
                Appointment Details • {selectedAppointment.bookingRef}
              </h3>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-[#877462] hover:text-black cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex items-center gap-3.5 p-3 bg-[#fbf9f5] rounded-2xl border border-[#ebdcc4]">
              <img
                src={selectedAppointment.petPhoto}
                alt={selectedAppointment.petName}
                className="w-14 h-14 rounded-2xl object-cover"
              />
              <div>
                <h4 className="font-bold text-base text-[#1b1c1a]">
                  {selectedAppointment.petName} ({selectedAppointment.petBreed})
                </h4>
                <p className="text-xs text-[#895100] font-semibold">{selectedAppointment.serviceTitle}</p>
                <p className="text-[11px] text-[#877462]">
                  {selectedAppointment.date} • {selectedAppointment.timeSlot} ({selectedAppointment.durationMinutes} mins)
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#544434]">
              <p>
                <strong>Pet Parent:</strong> {selectedAppointment.parentName}
              </p>
              <p>
                <strong>Phone:</strong> {selectedAppointment.parentPhone}
              </p>
              <p>
                <strong>Service Location:</strong> {selectedAppointment.parentLocation}
              </p>
              <p>
                <strong>Booking Amount:</strong> ₹{selectedAppointment.amount} ({selectedAppointment.paymentStatus})
              </p>
              {selectedAppointment.notes && (
                <p className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                  <strong>Notes:</strong> {selectedAppointment.notes}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-[#efeeea] flex justify-end gap-2">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Service Modal */}
      {isAddServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#dac2ae] animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#efeeea] pb-3">
              <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a]">
                Add New Service to Catalog
              </h3>
              <button
                onClick={() => setIsAddServiceModalOpen(false)}
                className="text-[#877462] hover:text-black cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#544434] mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  value={newServiceForm.name}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, name: e.target.value })}
                  placeholder="e.g. Puppy Play & Leash Exercise"
                  className="w-full px-3 py-2 rounded-xl border border-[#dac2ae] bg-[#fbf9f5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#544434] mb-1">Category</label>
                  <select
                    value={newServiceForm.category}
                    onChange={(e) =>
                      setNewServiceForm({ ...newServiceForm, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#dac2ae] bg-[#fbf9f5]"
                  >
                    <option value="walking">Dog Walking</option>
                    <option value="sitting">Pet Sitting</option>
                    <option value="grooming">Grooming &amp; Spa</option>
                    <option value="training">Pet Training</option>
                    <option value="mobile_grooming">Mobile Grooming</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#544434] mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newServiceForm.price}
                    onChange={(e) =>
                      setNewServiceForm({ ...newServiceForm, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#dac2ae] bg-[#fbf9f5]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#544434] mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  value={newServiceForm.durationMinutes}
                  onChange={(e) =>
                    setNewServiceForm({ ...newServiceForm, durationMinutes: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#dac2ae] bg-[#fbf9f5]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#544434] mb-1">Inclusions (comma separated)</label>
                <input
                  type="text"
                  value={newServiceForm.includes}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, includes: e.target.value })}
                  placeholder="e.g. GPS Tracking, Hydration, Photos"
                  className="w-full px-3 py-2 rounded-xl border border-[#dac2ae] bg-[#fbf9f5]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#544434] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newServiceForm.description}
                  onChange={(e) =>
                    setNewServiceForm({ ...newServiceForm, description: e.target.value })
                  }
                  placeholder="Describe your service..."
                  className="w-full px-3 py-2 rounded-xl border border-[#dac2ae] bg-[#fbf9f5]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddServiceModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white border border-[#dac2ae] font-bold text-[#544434]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#895100] text-white font-bold hover:bg-[#683c00]"
                >
                  Add Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#dac2ae] animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#efeeea] pb-3">
              <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a]">
                Edit Service • {editingService.name}
              </h3>
              <button
                onClick={() => setEditingService(null)}
                className="text-[#877462] hover:text-black cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEditService} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#544434] mb-1">Service Title</label>
                <input
                  type="text"
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#dac2ae] bg-[#fbf9f5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#544434] mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={editingService.price}
                    onChange={(e) =>
                      setEditingService({ ...editingService, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#dac2ae] bg-[#fbf9f5]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#544434] mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={editingService.durationMinutes}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        durationMinutes: Number(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#dac2ae] bg-[#fbf9f5]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#544434] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingService.description}
                  onChange={(e) =>
                    setEditingService({ ...editingService, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#dac2ae] bg-[#fbf9f5]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-3 py-2 rounded-xl bg-white border border-[#dac2ae] font-bold text-[#544434]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#895100] text-white font-bold hover:bg-[#683c00]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Funds Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-[#dac2ae] animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#efeeea] pb-3">
              <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a]">
                Withdraw to Bank Account
              </h3>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-[#877462] hover:text-black cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-3 bg-[#fbf9f5] rounded-2xl border border-[#ebdcc4] text-xs space-y-1">
              <p className="text-[#877462]">Available Balance:</p>
              <p className="text-xl font-bold text-emerald-700">₹{availableWithdrawBalance.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-[#544434]">
                Target Bank: <strong>HDFC Bank •••• 4821 (IFSC: HDFC0001842)</strong>
              </p>
            </div>

            <form onSubmit={handleRequestWithdrawal} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#544434] mb-1">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 rounded-xl border border-[#dac2ae] bg-[#fbf9f5] font-bold text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#895100] text-white font-bold text-xs hover:bg-[#683c00] transition-colors cursor-pointer"
              >
                Submit Bank Transfer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
