import React, { useState, useEffect, useCallback } from 'react';
import {
  Pet,
  HealthEvent,
  ServiceProvider,
  Booking,
  AgendaItem,
  NotificationUpdate,
  ServiceCategory,
  AdoptionAnimal,
  AdoptionApplication,
  VanJob,
  PaymentRecord
} from './types';
import {
  INITIAL_PETS,
  SERVICE_PROVIDERS,
  INITIAL_AGENDA,
  INITIAL_UPDATES,
  INITIAL_BOOKINGS,
  INITIAL_ADOPTION_ANIMALS,
  INITIAL_ADOPTION_APPLICATIONS,
  INITIAL_VAN_JOBS
} from './data/mockData';
import { INITIAL_PAYMENTS } from './data/paymentMockData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DashboardView } from './components/DashboardView';
import { PetProfileView } from './components/PetProfileView';
import { ServicesDiscoveryView } from './components/ServicesDiscoveryView';
import { HistoryView } from './components/HistoryView';
import { PublicLandingPage } from './components/public/PublicLandingPage';
import { UnifiedSignInView } from './components/auth/UnifiedSignInView';
import { CustomerSignUpView } from './components/auth/CustomerSignUpView';
import { ProviderRegisterView } from './components/auth/ProviderRegisterView';
import { AdminPortal } from './components/admin/AdminPortal';
import { ProviderPortal } from './components/provider/ProviderPortal';
import { RescuePartnerPortal } from './components/rescue/RescuePartnerPortal';
import { VanWorkerPortal } from './components/van/VanWorkerPortal';
import { PetParentAdoptionView } from './components/adoption/PetParentAdoptionView';
import { AccessDeniedView } from './components/common/AccessDeniedView';
import { DemoRoleSwitcher } from './components/common/DemoRoleSwitcher';
import { UserSettingsView } from './components/UserSettingsView';
import { AddHealthEventModal } from './components/AddHealthEventModal';
import { BookingModal } from './components/BookingModal';
import { InboxModal } from './components/InboxModal';
import { AddPetModal } from './components/AddPetModal';
import { MobileNavBar } from './components/MobileNavBar';

function ZoobyAppInner() {
  const { user, role, isAuthenticated, logout } = useAuth();

  // Navigation / Path state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const p = window.location.pathname;
    return p && p.length > 0 ? p : '/';
  });

  const navigate = useCallback((path: string) => {
    setCurrentPath(path);
    try {
      window.history.pushState({}, '', path);
    } catch {
      // safe fallback in sandboxes
    }
  }, []);

  // Listen to popstate (browser back / forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Customer application state
  const [pets, setPets] = useState<Pet[]>(() => {
    const saved = localStorage.getItem('zooby_pets');
    return saved ? JSON.parse(saved) : INITIAL_PETS;
  });

  const [selectedPet, setSelectedPet] = useState<Pet>(() => pets[0] || INITIAL_PETS[0]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<ServiceCategory | 'all'>('all');

  const [agenda, setAgenda] = useState<AgendaItem[]>(() => {
    const saved = localStorage.getItem('zooby_agenda');
    return saved ? JSON.parse(saved) : INITIAL_AGENDA;
  });

  const [updates, setUpdates] = useState<NotificationUpdate[]>(() => {
    const saved = localStorage.getItem('zooby_updates');
    return saved ? JSON.parse(saved) : INITIAL_UPDATES;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('zooby_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  // Adoption & Rescue State
  const [adoptionAnimals, setAdoptionAnimals] = useState<AdoptionAnimal[]>(() => {
    const saved = localStorage.getItem('zooby_adoption_animals');
    return saved ? JSON.parse(saved) : INITIAL_ADOPTION_ANIMALS;
  });

  const [adoptionApplications, setAdoptionApplications] = useState<AdoptionApplication[]>(() => {
    const saved = localStorage.getItem('zooby_adoption_applications');
    return saved ? JSON.parse(saved) : INITIAL_ADOPTION_APPLICATIONS;
  });

  // Van Jobs State
  const [vanJobs, setVanJobs] = useState<VanJob[]>(() => {
    const saved = localStorage.getItem('zooby_van_jobs');
    return saved ? JSON.parse(saved) : INITIAL_VAN_JOBS;
  });

  // Financials & Payment Records State
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('zooby_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  // Persist State to localStorage
  useEffect(() => {
    localStorage.setItem('zooby_pets', JSON.stringify(pets));
  }, [pets]);

  useEffect(() => {
    localStorage.setItem('zooby_agenda', JSON.stringify(agenda));
  }, [agenda]);

  useEffect(() => {
    localStorage.setItem('zooby_updates', JSON.stringify(updates));
  }, [updates]);

  useEffect(() => {
    localStorage.setItem('zooby_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('zooby_adoption_animals', JSON.stringify(adoptionAnimals));
  }, [adoptionAnimals]);

  useEffect(() => {
    localStorage.setItem('zooby_adoption_applications', JSON.stringify(adoptionApplications));
  }, [adoptionApplications]);

  useEffect(() => {
    localStorage.setItem('zooby_van_jobs', JSON.stringify(vanJobs));
  }, [vanJobs]);

  useEffect(() => {
    localStorage.setItem('zooby_payments', JSON.stringify(payments));
  }, [payments]);

  // Modal States
  const [isAddHealthEventOpen, setIsAddHealthEventOpen] = useState(false);
  const [healthEventPet, setHealthEventPet] = useState<Pet>(selectedPet);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingProvider, setBookingProvider] = useState<ServiceProvider | null>(null);
  const [isInboxModalOpen, setIsInboxModalOpen] = useState(false);
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [editPetTarget, setEditPetTarget] = useState<Pet | null>(null);

  // Sync selected pet if updated in array
  useEffect(() => {
    if (selectedPet?.id) {
      const updated = pets.find((p) => p.id === selectedPet.id);
      if (updated) {
        setSelectedPet(updated);
      }
    } else if (pets.length > 0) {
      setSelectedPet(pets[0]);
    }
  }, [pets, selectedPet?.id]);

  const unreadCount = (updates || []).filter((u) => !u.read).length;

  // Handlers for Pet Parent
  const handleSelectPet = (pet: Pet) => {
    setSelectedPet(pet);
    setActiveTab('mypets');
    navigate('/mypets');
  };

  const handleOpenAddHealthEvent = (pet: Pet) => {
    setHealthEventPet(pet);
    setIsAddHealthEventOpen(true);
  };

  const handleSaveHealthEvent = (petId: string, newEvent: HealthEvent) => {
    setPets((prevPets) =>
      prevPets.map((p) => {
        if (p.id === petId) {
          const updatedEvents = [newEvent, ...(p.healthEvents || [])];
          return {
            ...p,
            healthEvents: updatedEvents,
            isAttentionNeeded: newEvent.isUpcoming ? true : p.isAttentionNeeded,
            vaccinationStatus:
              newEvent.eventType === 'vaccination' ? 'Vaccinations Up-to-date' : p.vaccinationStatus
          };
        }
        return p;
      })
    );

    if (newEvent.isUpcoming) {
      const targetPet = pets.find((p) => p.id === petId);
      const newAgendaItem: AgendaItem = {
        id: 'agenda-' + Date.now(),
        category: 'Health',
        title: `${targetPet?.name || 'Pet'}'s ${newEvent.eventTitle}`,
        timeText: newEvent.date,
        locationOrDoctor: newEvent.administeredBy,
        dueBadge: 'Scheduled',
        petName: targetPet?.name || '',
        actionText: 'Book Vet Now',
        actionType: 'book_vet'
      };
      setAgenda((prev) => [newAgendaItem, ...prev]);
    }

    const newUpdate: NotificationUpdate = {
      id: 'up-' + Date.now(),
      text: `Health event recorded: "${newEvent.eventTitle}" for ${
        pets.find((p) => p.id === petId)?.name || 'pet'
      }.`,
      time: 'Just now',
      type: 'health',
      read: false
    };
    setUpdates((prev) => [newUpdate, ...prev]);
  };

  const handleSelectCategory = (category: ServiceCategory | 'all') => {
    setSelectedServiceCategory(category);
    setActiveTab('services');
    navigate('/services');
  };

  const handleOpenBookProvider = (provider: ServiceProvider) => {
    setBookingProvider(provider);
    setIsBookingModalOpen(true);
  };

  const handleOpenBookServiceGeneric = (category?: ServiceCategory, pet?: Pet) => {
    if (pet) {
      setSelectedPet(pet);
    }
    if (category) {
      setSelectedServiceCategory(category);
      const prov = SERVICE_PROVIDERS.find((p) => p.category === category) || SERVICE_PROVIDERS[0];
      setBookingProvider(prov);
      setIsBookingModalOpen(true);
    } else {
      setActiveTab('services');
      navigate('/services');
    }
  };

  const handleConfirmBooking = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);

    // If this is a mobile service booking, assign it to a Van Job
    if (newBooking.isMobileService) {
      const newJob: VanJob = {
        id: `vjob-${Date.now()}`,
        bookingId: newBooking.id,
        vanWorkerId: 'usr-van-vikram',
        vanNumber: 'MH 15 ZB 4022',
        customerName: user?.name || 'Aisha Sharma',
        customerPhone: user?.phone || '+91 98220 11223',
        customerAddress: newBooking.location,
        petName: newBooking.petName,
        petSpecies: newBooking.petSpecies || 'Dog',
        petBreed: newBooking.petBreed || 'Pet',
        petPhoto: newBooking.petPhoto || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400',
        handlingNotes: newBooking.notes || 'Handle with gentle care.',
        serviceTitle: newBooking.serviceTitle,
        scheduledTime: `${newBooking.timeSlot} ${newBooking.date}`,
        status: 'Assigned',
        sequenceOrder: vanJobs.length + 1,
        latitude: 19.9975,
        longitude: 73.7898
      };
      setVanJobs((prev) => [newJob, ...prev]);
    }

    const newAgendaItem: AgendaItem = {
      id: 'agenda-' + Date.now(),
      category: newBooking.serviceCategory === 'grooming' || newBooking.serviceCategory === 'mobile_grooming' ? 'Grooming' : 'Health',
      title: `${newBooking.petName}'s ${newBooking.serviceCategory.replace('_', ' ')}`,
      timeText: newBooking.date,
      locationOrDoctor: newBooking.providerName,
      dueBadge: newBooking.isMobileService ? 'Van Assigned' : 'Confirmed',
      petName: newBooking.petName,
      actionText: newBooking.isMobileService ? 'Track Van' : 'View Details',
      actionType: 'view_booking'
    };
    setAgenda((prev) => [newAgendaItem, ...prev]);

    const newUpdate: NotificationUpdate = {
      id: 'up-' + Date.now(),
      text: `Booking confirmed: ${newBooking.serviceTitle} with ${newBooking.providerName} for ${newBooking.petName}.`,
      time: 'Just now',
      type: newBooking.isMobileService ? 'van' : 'booking',
      read: false
    };
    setUpdates((prev) => [newUpdate, ...prev]);
  };

  const handleSavePet = (newPet: Pet) => {
    if (editPetTarget) {
      setPets((prev) => prev.map((p) => (p.id === newPet.id ? newPet : p)));
      if (selectedPet.id === newPet.id) {
        setSelectedPet(newPet);
      }
    } else {
      setPets((prev) => [...prev, newPet]);
      setSelectedPet(newPet);
    }
    setEditPetTarget(null);
  };

  const handleOpenEditPet = (pet: Pet) => {
    setEditPetTarget(pet);
    setIsAddPetModalOpen(true);
  };

  const handleMarkAllRead = () => {
    setUpdates((prev) => prev.map((u) => ({ ...u, read: true })));
  };

  // Handlers for Adoption applications
  const handleSubmitAdoptionApplication = (application: AdoptionApplication) => {
    setAdoptionApplications((prev) => [application, ...prev]);

    // Add pet parent notification
    const newUpdate: NotificationUpdate = {
      id: 'up-' + Date.now(),
      text: `Adoption application submitted for ${application.animalName}. The shelter has received your request.`,
      time: 'Just now',
      type: 'adoption',
      read: false
    };
    setUpdates((prev) => [newUpdate, ...prev]);
  };

  // Handlers for Payments & Refunds
  const handleAddPayment = (newPayment: PaymentRecord) => {
    setPayments((prev) => [newPayment, ...prev]);
  };

  const handleUpdatePayment = (updated: PaymentRecord) => {
    setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (updated.bookingId || updated.bookingRef) {
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id === updated.bookingId || b.bookingRef === updated.bookingRef) {
            return {
              ...b,
              paymentStatus: updated.paymentStatus === 'Refunded' ? 'Refunded' : b.paymentStatus
            };
          }
          return b;
        })
      );
    }
  };

  const handleRequestRefund = (paymentId: string, reason: string) => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === paymentId) {
          return {
            ...p,
            refundStatus: 'Requested',
            refundReason: reason,
            refundDate: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          };
        }
        return p;
      })
    );

    const targetPayment = payments.find((p) => p.id === paymentId);
    const newUpdate: NotificationUpdate = {
      id: 'up-' + Date.now(),
      text: `Refund request submitted for transaction ₹${targetPayment?.amount || ''} (${targetPayment?.serviceTitle || paymentId}). Our accounts team is reviewing your reversal.`,
      time: 'Just now',
      type: 'booking',
      read: false
    };
    setUpdates((prev) => [newUpdate, ...prev]);
  };

  // -------------------------------------------------------------
  // ROUTE DISPATCH & GUARDS (5 ROLES)
  // -------------------------------------------------------------

  // 1. UNIFIED SIGN IN ROUTE
  // All auth entry paths (/login, /signin, /provider/login, /admin/login, /rescue/login, /van/login) use ONE unified sign-in page
  if (
    currentPath === '/login' ||
    currentPath === '/signin' ||
    currentPath === '/provider/login' ||
    currentPath === '/admin/login' ||
    currentPath === '/rescue/login' ||
    currentPath === '/van/login'
  ) {
    return (
      <div className="relative">
        <UnifiedSignInView onNavigate={navigate} />
        <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
      </div>
    );
  }

  // 2. SIGN UP / REGISTRATION
  if (currentPath === '/signup' || currentPath === '/register') {
    return (
      <div className="relative">
        <CustomerSignUpView onNavigate={navigate} />
        <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
      </div>
    );
  }

  // 3. PROVIDER REGISTRATION ("Become a Provider" flow)
  if (
    currentPath === '/provider/register' ||
    currentPath === '/provider/signup' ||
    currentPath === '/join-provider'
  ) {
    return (
      <div className="relative">
        <ProviderRegisterView onNavigate={navigate} />
        <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
      </div>
    );
  }

  // 4. ADMIN ROUTE GUARD (/admin/*)
  if (currentPath.startsWith('/admin')) {
    if (!isAuthenticated || role !== 'ADMIN') {
      return (
        <div className="relative">
          <AccessDeniedView
            requiredRole="ADMIN"
            attemptedPath={currentPath}
            onNavigate={navigate}
          />
          <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
        </div>
      );
    }

    const subTab = currentPath.replace('/admin/', '').replace('/admin', '') || 'dashboard';
    return (
      <div className="relative">
        <AdminPortal
          initialTab={subTab}
          onNavigate={navigate}
          onExitAdmin={() => navigate('/')}
          onSignOut={() => logout('/login')}
        />
        <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
      </div>
    );
  }

  // 5. PROVIDER ROUTE GUARD (/provider/*)
  if (currentPath.startsWith('/provider')) {
    if (!isAuthenticated || role !== 'PROVIDER') {
      return (
        <div className="relative">
          <AccessDeniedView
            requiredRole="PROVIDER"
            attemptedPath={currentPath}
            onNavigate={navigate}
          />
          <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
        </div>
      );
    }

    const providerTab = currentPath.replace('/provider/', '').replace('/provider', '') || 'dashboard';
    return (
      <div className="relative">
        <ProviderPortal currentTab={providerTab} onNavigate={navigate} />
        <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
      </div>
    );
  }

  // 6. RESCUE PARTNER ROUTE GUARD (/rescue/*)
  if (currentPath.startsWith('/rescue')) {
    if (!isAuthenticated || role !== 'RESCUE_PARTNER') {
      return (
        <div className="relative">
          <AccessDeniedView
            requiredRole="RESCUE_PARTNER"
            attemptedPath={currentPath}
            onNavigate={navigate}
          />
          <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
        </div>
      );
    }

    const rescueTab = currentPath.replace('/rescue/', '').replace('/rescue', '') || 'dashboard';
    return (
      <div className="relative">
        <RescuePartnerPortal
          currentTab={rescueTab}
          onNavigate={navigate}
          animals={adoptionAnimals}
          onUpdateAnimals={setAdoptionAnimals}
          applications={adoptionApplications}
          onUpdateApplications={setAdoptionApplications}
        />
        <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
      </div>
    );
  }

  // 7. VAN WORKER ROUTE GUARD (/van/*)
  if (currentPath.startsWith('/van')) {
    if (!isAuthenticated || role !== 'VAN_WORKER') {
      return (
        <div className="relative">
          <AccessDeniedView
            requiredRole="VAN_WORKER"
            attemptedPath={currentPath}
            onNavigate={navigate}
          />
          <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
        </div>
      );
    }

    const vanTab = currentPath.replace('/van/', '').replace('/van', '') || 'dashboard';
    return (
      <div className="relative">
        <VanWorkerPortal
          currentTab={vanTab}
          onNavigate={navigate}
          jobs={vanJobs}
          onUpdateJobs={setVanJobs}
        />
        <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
      </div>
    );
  }

  // 8. ROOT PATH (/) & PUBLIC LANDING
  if (currentPath === '/') {
    // If not authenticated, show public landing page
    if (!isAuthenticated) {
      return (
        <div className="relative">
          <PublicLandingPage
            adoptionAnimals={adoptionAnimals}
            onOpenSignIn={() => navigate('/login')}
            onOpenSignUp={() => navigate('/signup')}
            onNavigate={navigate}
            onSelectServiceForBooking={() => navigate('/services')}
          />
          <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
        </div>
      );
    }

    // If authenticated as specific roles, direct to their home dashboard
    if (role === 'ADMIN') {
      return (
        <div className="relative">
          <AdminPortal
            initialTab="dashboard"
            onNavigate={navigate}
            onExitAdmin={() => navigate('/')}
            onSignOut={() => logout('/login')}
          />
          <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
        </div>
      );
    }

    if (role === 'PROVIDER') {
      return (
        <div className="relative">
          <ProviderPortal currentTab="dashboard" onNavigate={navigate} />
          <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
        </div>
      );
    }

    if (role === 'RESCUE_PARTNER') {
      return (
        <div className="relative">
          <RescuePartnerPortal
            currentTab="dashboard"
            onNavigate={navigate}
            animals={adoptionAnimals}
            onUpdateAnimals={setAdoptionAnimals}
            applications={adoptionApplications}
            onUpdateApplications={setAdoptionApplications}
          />
          <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
        </div>
      );
    }

    if (role === 'VAN_WORKER') {
      return (
        <div className="relative">
          <VanWorkerPortal
            currentTab="dashboard"
            onNavigate={navigate}
            jobs={vanJobs}
            onUpdateJobs={setVanJobs}
          />
          <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
        </div>
      );
    }
  }

  // 9. PET PARENT / CUSTOMER PAGES
  // If unauthenticated and trying to access a customer route like /dashboard, redirect to public landing / login
  if (!isAuthenticated) {
    return (
      <div className="relative">
        <PublicLandingPage
          adoptionAnimals={adoptionAnimals}
          onOpenSignIn={() => navigate('/login')}
          onOpenSignUp={() => navigate('/signup')}
          onNavigate={navigate}
          onSelectServiceForBooking={() => navigate('/services')}
        />
        <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
      </div>
    );
  }

  // If a role-specific user tries to access /dashboard, redirect to their role-specific portal
  if (role === 'PROVIDER') {
    return (
      <div className="relative">
        <ProviderPortal currentTab="dashboard" onNavigate={navigate} />
        <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
      </div>
    );
  }

  if (role === 'ADMIN') {
    return (
      <div className="relative">
        <AdminPortal
          initialTab="dashboard"
          onNavigate={navigate}
          onExitAdmin={() => navigate('/')}
          onSignOut={() => logout('/login')}
        />
        <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
      </div>
    );
  }

  if (role === 'RESCUE_PARTNER') {
    return (
      <div className="relative">
        <RescuePartnerPortal
          currentTab="dashboard"
          onNavigate={navigate}
          animals={adoptionAnimals}
          onUpdateAnimals={setAdoptionAnimals}
          applications={adoptionApplications}
          onUpdateApplications={setAdoptionApplications}
        />
        <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
      </div>
    );
  }

  if (role === 'VAN_WORKER') {
    return (
      <div className="relative">
        <VanWorkerPortal
          currentTab="dashboard"
          onNavigate={navigate}
          jobs={vanJobs}
          onUpdateJobs={setVanJobs}
        />
        <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
      </div>
    );
  }

  // PET PARENT ROLE -> Render Pet Parent customer views
  const resolvedTab =
    currentPath === '/mypets'
      ? 'mypets'
      : currentPath === '/services'
      ? 'services'
      : currentPath === '/adopt' || currentPath === '/adoption'
      ? 'adopt'
      : currentPath === '/history' || currentPath === '/bookings'
      ? 'history'
      : currentPath === '/inbox' || currentPath === '/messages'
      ? 'inbox'
      : currentPath === '/settings' || currentPath === '/profile'
      ? 'settings'
      : activeTab;

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f5] text-[#1b1c1a] font-jakarta pb-16 md:pb-0 selection:bg-[#ffdcbc] selection:text-[#683c00]">
      {/* Top Navigation Bar */}
      <Header
        activeTab={resolvedTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          navigate(`/${tab === 'dashboard' ? 'dashboard' : tab}`);
        }}
        pets={pets}
        selectedPet={selectedPet}
        setSelectedPet={setSelectedPet}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsInboxModalOpen(true)}
        onOpenAddPet={() => {
          setEditPetTarget(null);
          setIsAddPetModalOpen(true);
        }}
        currentUser={user}
        onOpenSignIn={() => navigate('/login')}
        onSignOut={() => logout('/login')}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {resolvedTab === 'dashboard' && (
          <DashboardView
            pets={pets}
            onSelectPet={handleSelectPet}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              navigate(`/${tab === 'dashboard' ? 'dashboard' : tab}`);
            }}
            onSelectCategory={handleSelectCategory}
            onOpenAddHealthEvent={(pet) => handleOpenAddHealthEvent(pet || selectedPet)}
            onOpenAddPet={() => {
              setEditPetTarget(null);
              setIsAddPetModalOpen(true);
            }}
            agenda={agenda}
            updates={updates}
          />
        )}

        {resolvedTab === 'mypets' && (
          <PetProfileView
            pet={selectedPet}
            allPets={pets}
            onSelectPet={setSelectedPet}
            onOpenAddHealthEvent={(pet) => handleOpenAddHealthEvent(pet || selectedPet)}
            onOpenEditProfile={(pet) => handleOpenEditPet(pet || selectedPet)}
            onOpenBookService={(category, pet) => handleOpenBookServiceGeneric(category, pet || selectedPet)}
          />
        )}

        {resolvedTab === 'services' && (
          <ServicesDiscoveryView
            providers={SERVICE_PROVIDERS}
            selectedCategory={selectedServiceCategory}
            onSelectCategory={setSelectedServiceCategory}
            onBookProvider={handleOpenBookProvider}
            onQuickBookCareVan={() => handleOpenBookServiceGeneric('mobile_grooming', selectedPet)}
          />
        )}

        {resolvedTab === 'adopt' && (
          <PetParentAdoptionView
            animals={adoptionAnimals || []}
            applications={adoptionApplications || []}
            userApplications={(adoptionApplications || []).filter(
              (a) => a.applicantId === user?.id || a.applicantEmail === user?.email
            )}
            onSubmitApplication={handleSubmitAdoptionApplication}
            onNavigate={navigate}
          />
        )}

        {resolvedTab === 'history' && (
          <HistoryView
            bookings={bookings}
            onBookAgain={(booking) => {
              const prov =
                SERVICE_PROVIDERS.find((p) => p.id === booking.providerId) ||
                SERVICE_PROVIDERS[0];
              setBookingProvider(prov);
              setIsBookingModalOpen(true);
            }}
            onExploreServices={() => {
              setActiveTab('services');
              navigate('/services');
            }}
          />
        )}

        {resolvedTab === 'inbox' && (
          <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-quicksand font-bold text-3xl text-[#1b1c1a]">Notifications &amp; Activity</h1>
                <p className="text-xs text-[#877462]">Recent updates on your pets, bookings, van tracking, and adoption requests.</p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="px-3 py-1.5 rounded-full bg-white border border-[#dac2ae] text-xs font-bold text-[#895100] hover:bg-[#ffdcbc]/20 transition-colors cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="space-y-3">
              {updates.map((u) => (
                <div
                  key={u.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    u.read ? 'bg-white border-[#ebdcc4]' : 'bg-[#fff5ea] border-[#ffb86c]/50 shadow-xs'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    u.type === 'van'
                      ? 'bg-purple-100 text-purple-700'
                      : u.type === 'adoption'
                      ? 'bg-emerald-100 text-emerald-700'
                      : u.type === 'health'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    <span className="material-symbols-outlined text-[19px]">
                      {u.type === 'van'
                        ? 'local_shipping'
                        : u.type === 'adoption'
                        ? 'volunteer_activism'
                        : u.type === 'health'
                        ? 'medical_services'
                        : 'notifications'}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <p className="text-xs sm:text-sm font-medium text-[#1b1c1a]">{u.text}</p>
                    <span className="text-[11px] text-[#877462] font-semibold mt-0.5 block">{u.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {resolvedTab === 'settings' && <UserSettingsView />}
      </main>

      {/* Footer */}
      <Footer onSelectCategory={handleSelectCategory} onNavigate={navigate} />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNavBar
        activeTab={resolvedTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          navigate(`/${tab === 'dashboard' ? 'dashboard' : tab}`);
        }}
        unreadCount={unreadCount}
      />

      {/* Global Modals for Pet Parents */}
      <AddHealthEventModal
        isOpen={isAddHealthEventOpen}
        onClose={() => setIsAddHealthEventOpen(false)}
        pet={healthEventPet || selectedPet || pets[0]}
        allPets={pets}
        onSelectPet={(p) => setHealthEventPet(p)}
        onSaveHealthEvent={handleSaveHealthEvent}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        provider={bookingProvider}
        pets={pets}
        selectedPet={selectedPet}
        onConfirmBooking={handleConfirmBooking}
      />

      <InboxModal
        isOpen={isInboxModalOpen}
        onClose={() => setIsInboxModalOpen(false)}
        updates={updates}
        onMarkAllRead={handleMarkAllRead}
      />

      <AddPetModal
        isOpen={isAddPetModalOpen}
        onClose={() => {
          setIsAddPetModalOpen(false);
          setEditPetTarget(null);
        }}
        onSavePet={handleSavePet}
        editPet={editPetTarget}
      />

      {/* Demo Persona Switcher floating pill */}
      <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ZoobyAppInner />
    </AuthProvider>
  );
}

export default App;
