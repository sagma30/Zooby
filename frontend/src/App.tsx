import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { CityProvider } from './context/CityContext';
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
import { BookingFlowModal } from './components/booking/BookingFlowModal';
import { InboxModal } from './components/InboxModal';
import { AddPetModal } from './components/AddPetModal';
import { MobileNavBar } from './components/MobileNavBar';
import { RapidVanSOSModal } from './components/emergency/RapidVanSOSModal';
import { VanLocation } from './types';
import { subscribeToVanLocationStream } from './services/gpsTracking';

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

  // Modals state
  const [isAddHealthEventOpen, setIsAddHealthEventOpen] = useState(false);
  const [healthEventPet, setHealthEventPet] = useState<Pet | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingProvider, setBookingProvider] = useState<ServiceProvider>(SERVICE_PROVIDERS[0]);
  const [isBookingFlowModalOpen, setIsBookingFlowModalOpen] = useState(false);
  const [bookingFlowCategory, setBookingFlowCategory] = useState<string>('mobile_grooming');
  const [bookingFlowProvider, setBookingFlowProvider] = useState<ServiceProvider | null>(null);
  const [isInboxModalOpen, setIsInboxModalOpen] = useState(false);
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [editPetTarget, setEditPetTarget] = useState<Pet | null>(null);

  const handleOpenBookingFlow = (category: string = 'mobile_grooming', provider?: ServiceProvider) => {
    setBookingFlowCategory(category);
    setBookingFlowProvider(provider || null);
    setIsBookingFlowModalOpen(true);
  };

  // 🔴 24/7 Rapid SOS & Live Van Location State
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [liveVanLocation, setLiveVanLocation] = useState<VanLocation | null>(null);

  // Subscribe to real-time van updates
  useEffect(() => {
    const unsubscribe = subscribeToVanLocationStream((loc) => {
      setLiveVanLocation(loc);
    });
    return () => {
      unsubscribe();
    };
  }, []);

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

  // ⚡ Intent Preservation Hook (Executed immediately after authentication)
  useEffect(() => {
    if (isAuthenticated) {
      try {
        const pendingRaw = sessionStorage.getItem('zooby_pending_intent');
        if (pendingRaw) {
          const intent = JSON.parse(pendingRaw);
          sessionStorage.removeItem('zooby_pending_intent');

          if (role === 'PET_PARENT' || !role) {
            if (intent.action === 'book') {
              const serviceId = intent.serviceCategory || 'mobile_grooming';
              setBookingFlowCategory(serviceId);
              setIsBookingFlowModalOpen(true);
            } else if (intent.action === 'adopt') {
              setActiveTab('adopt');
              navigate('/adopt');
            } else if (intent.action === 'sos') {
              setIsSOSModalOpen(true);
            } else if (intent.action === 'track_van') {
              setActiveTab('dashboard');
              navigate('/dashboard');
            }
          }
        }
      } catch (err) {
        console.error('Failed to parse stored user intent:', err);
      }
    }
  }, [isAuthenticated, role, navigate]);

  // Scoped Data for Active Pet Parent (Declared at top level with other hooks)
  const scopedPets = useMemo(() => {
    if (!user || user.role !== 'PET_PARENT') return pets;
    const userOwned = pets.filter(
      (p) =>
        p.ownerId === user.id ||
        p.ownerId === user.userId ||
        p.ownerName === user.name ||
        p.ownerName === user.displayName
    );
    return userOwned.length > 0 ? userOwned : pets;
  }, [pets, user]);

  const scopedBookings = useMemo(() => {
    if (!user || user.role !== 'PET_PARENT') return bookings;
    const userOwned = bookings.filter(
      (b) =>
        b.userId === user.id ||
        b.userId === user.userId ||
        b.petParentId === user.id ||
        b.petParentId === user.userId ||
        b.petParentName === user.name ||
        b.petParentName === user.displayName
    );
    return userOwned.length > 0 ? userOwned : bookings;
  }, [bookings, user]);

  const scopedAgenda = useMemo(() => {
    if (!user || user.role !== 'PET_PARENT') return agenda;
    const petNames = new Set(scopedPets.map((p) => p.name));
    return agenda.filter((a) => !a.petName || petNames.has(a.petName));
  }, [agenda, scopedPets, user]);

  const activeCustomerPet = scopedPets.find((p) => p.id === selectedPet?.id) || scopedPets[0] || selectedPet;

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
    const bookingWithUser: Booking = {
      ...newBooking,
      userId: newBooking.userId || user?.id || user?.userId || 'usr-parent-sam',
      petParentId: newBooking.petParentId || user?.id || user?.userId || 'usr-parent-sam',
      petParentName: newBooking.petParentName || user?.displayName || user?.name || 'Sam Sharma'
    };
    setBookings((prev) => [bookingWithUser, ...prev]);

    // If this is a mobile service booking, assign it to a Van Job
    if (bookingWithUser.isMobileService) {
      const newJob: VanJob = {
        id: `vjob-${Date.now()}`,
        bookingId: bookingWithUser.id,
        vanWorkerId: 'usr-van-rahul',
        vanNumber: 'ZMV-014',
        customerName: user?.displayName || user?.name || 'Sam Sharma',
        customerPhone: user?.phone || '+91 98220 11223',
        customerAddress: bookingWithUser.location,
        petName: bookingWithUser.petName,
        petSpecies: bookingWithUser.petSpecies || 'Dog',
        petBreed: bookingWithUser.petBreed || 'Pet',
        petPhoto: bookingWithUser.petPhoto || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400',
        handlingNotes: bookingWithUser.notes || 'Handle with gentle care.',
        serviceTitle: bookingWithUser.serviceTitle,
        scheduledTime: `${bookingWithUser.timeSlot} ${bookingWithUser.date}`,
        status: 'Assigned',
        sequenceOrder: vanJobs.length + 1,
        latitude: 19.9975,
        longitude: 73.7898
      };
      setVanJobs((prev) => [newJob, ...prev]);
    }

    const newAgendaItem: AgendaItem = {
      id: 'agenda-' + Date.now(),
      category: bookingWithUser.serviceCategory === 'grooming' || bookingWithUser.serviceCategory === 'mobile_grooming' ? 'Grooming' : 'Health',
      title: `${bookingWithUser.petName}'s ${bookingWithUser.serviceCategory.replace('_', ' ')}`,
      timeText: bookingWithUser.date,
      locationOrDoctor: bookingWithUser.providerName,
      dueBadge: bookingWithUser.isMobileService ? 'Van Assigned' : 'Confirmed',
      petName: bookingWithUser.petName,
      actionText: bookingWithUser.isMobileService ? 'Track Van' : 'View Details',
      actionType: 'view_booking'
    };
    setAgenda((prev) => [newAgendaItem, ...prev]);

    const newUpdate: NotificationUpdate = {
      id: 'up-' + Date.now(),
      text: `Booking confirmed: ${bookingWithUser.serviceTitle} with ${bookingWithUser.providerName} for ${bookingWithUser.petName}.`,
      time: 'Just now',
      type: bookingWithUser.isMobileService ? 'van' : 'booking',
      read: false
    };
    setUpdates((prev) => [newUpdate, ...prev]);
  };

  const handleSavePet = (newPet: Pet) => {
    const petWithOwner: Pet = {
      ...newPet,
      ownerId: newPet.ownerId || user?.id || user?.userId || 'usr-parent-sam',
      ownerName: newPet.ownerName || user?.displayName || user?.name || 'Sam Sharma'
    };
    if (editPetTarget) {
      setPets((prev) => prev.map((p) => (p.id === petWithOwner.id ? petWithOwner : p)));
      if (selectedPet.id === petWithOwner.id) {
        setSelectedPet(petWithOwner);
      }
    } else {
      setPets((prev) => [...prev, petWithOwner]);
      setSelectedPet(petWithOwner);
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
            onSelectServiceForBooking={handleOpenBookingFlow}
            onOpenSOS={() => setIsSOSModalOpen(true)}
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
          onSelectServiceForBooking={handleOpenBookingFlow}
          onOpenSOS={() => setIsSOSModalOpen(true)}
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
        pets={scopedPets}
        selectedPet={activeCustomerPet}
        setSelectedPet={setSelectedPet}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsInboxModalOpen(true)}
        onOpenAddPet={() => {
          setEditPetTarget(null);
          setIsAddPetModalOpen(true);
        }}
        onOpenSOS={() => setIsSOSModalOpen(true)}
        currentUser={user}
        onOpenSignIn={() => navigate('/login')}
        onSignOut={() => logout('/login')}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {resolvedTab === 'dashboard' && (
          <DashboardView
            pets={scopedPets}
            onSelectPet={handleSelectPet}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              navigate(`/${tab === 'dashboard' ? 'dashboard' : tab}`);
            }}
            onSelectCategory={handleSelectCategory}
            onOpenAddHealthEvent={(pet) => handleOpenAddHealthEvent(pet || activeCustomerPet)}
            onOpenAddPet={() => {
              setEditPetTarget(null);
              setIsAddPetModalOpen(true);
            }}
            agenda={scopedAgenda}
            updates={updates}
            activeVanLocation={liveVanLocation}
            onOpenSOS={() => setIsSOSModalOpen(true)}
          />
        )}

        {resolvedTab === 'mypets' && (
          <PetProfileView
            pet={activeCustomerPet}
            allPets={scopedPets}
            onSelectPet={setSelectedPet}
            onOpenAddHealthEvent={(pet) => handleOpenAddHealthEvent(pet || activeCustomerPet)}
            onOpenEditProfile={(pet) => handleOpenEditPet(pet || activeCustomerPet)}
            onOpenBookService={(category, pet) => handleOpenBookServiceGeneric(category, pet || activeCustomerPet)}
          />
        )}

        {resolvedTab === 'services' && (
          <ServicesDiscoveryView
            providers={SERVICE_PROVIDERS}
            selectedCategory={selectedServiceCategory}
            onSelectCategory={setSelectedServiceCategory}
            onBookProvider={handleOpenBookProvider}
            onQuickBookCareVan={() => handleOpenBookServiceGeneric('mobile_grooming', activeCustomerPet)}
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
            bookings={scopedBookings}
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
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenBookingForService={handleOpenBookingFlow}
        onOpenSOS={() => setIsSOSModalOpen(true)}
        onNavigate={navigate}
      />

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

      {/* Multi-Step Responsive Booking Flow Modal */}
      <BookingFlowModal
        isOpen={isBookingFlowModalOpen}
        onClose={() => setIsBookingFlowModalOpen(false)}
        initialServiceCategory={bookingFlowCategory}
        initialProvider={bookingFlowProvider}
        pets={pets}
        selectedPet={selectedPet}
        onConfirmBooking={(newBooking) => {
          setBookings((prev) => [newBooking, ...prev]);
          const newUpdate: NotificationUpdate = {
            id: 'up-bk-' + Date.now(),
            text: `Booking confirmed: ${newBooking.serviceTitle} for ${newBooking.petName} (${newBooking.date}).`,
            time: 'Just now',
            type: 'booking',
            read: false
          };
          setUpdates((prev) => [newUpdate, ...prev]);
        }}
        onAddPayment={handleAddPayment}
        onNavigateToServices={() => navigate('/services')}
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

      {/* 🔴 24/7 Rapid SOS Emergency Modal */}
      <RapidVanSOSModal
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
        currentUser={user}
        pets={pets}
        onSOSDispatched={(incident) => {
          // Add instant alert update for pet parent
          const sosUpdate: NotificationUpdate = {
            id: 'sos-up-' + Date.now(),
            text: `🚨 24/7 Rapid SOS Dispatched! Unit ${incident.assignedVanPlate || 'Unit #1'} is en route for ${incident.petName || 'your pet'}.`,
            time: 'Just now',
            type: 'health',
            read: false
          };
          setUpdates((prev) => [sosUpdate, ...prev]);
        }}
      />

      {/* Demo Persona Switcher floating pill */}
      <DemoRoleSwitcher currentPath={currentPath} onNavigate={navigate} />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <CityProvider>
        <ZoobyAppInner />
      </CityProvider>
    </AuthProvider>
  );
}

export default App;
