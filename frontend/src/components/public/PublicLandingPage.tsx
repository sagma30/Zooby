import React, { useState, useRef } from 'react';
import { AdoptionAnimal } from '../../types';
import { INITIAL_ADOPTION_ANIMALS } from '../../data/mockData';
import { useCity } from '../../context/CityContext';
import { useAuth } from '../../context/AuthContext';
import { CitySelector } from '../common/CitySelector';
import { Footer } from '../Footer';
import { ZoobyLogo } from '../common/ZoobyLogo';
import { PawCursorHeroTrail } from '../common/PawCursorHeroTrail';
import { ServiceDetailModal, ServiceDetailData } from '../common/ServiceDetailModal';
import { CompanyInfoModal, InfoModalTab } from '../common/CompanyInfoModal';
import { FloatingSOSButton } from '../emergency/FloatingSOSButton';
import { RapidVanSOSModal } from '../emergency/RapidVanSOSModal';
import { FloatingEmergencyBar } from '../emergency/FloatingEmergencyBar';

interface PublicLandingPageProps {
  adoptionAnimals?: AdoptionAnimal[];
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
  onNavigate: (path: string) => void;
  onSelectServiceForBooking?: (serviceId: string) => void;
  onOpenSOS?: () => void;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  adoptionAnimals = [],
  onOpenSignIn,
  onOpenSignUp,
  onNavigate,
  onSelectServiceForBooking,
  onOpenSOS
}) => {
  const { currentCity, supportedCities, setCityById } = useCity();
  const { isAuthenticated, user, role } = useAuth();
  const heroRef = useRef<HTMLElement | null>(null);

  const [selectedServiceFilter, setSelectedServiceFilter] = useState<'all' | 'van' | 'clinic' | 'home'>('all');
  const [adoptFilter, setAdoptFilter] = useState<'All' | 'Dog' | 'Cat' | 'Puppy' | 'Kitten'>('All');
  const [selectedPetForModal, setSelectedPetForModal] = useState<AdoptionAnimal | null>(null);
  const [selectedServiceForDetail, setSelectedServiceForDetail] = useState<ServiceDetailData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalTab, setInfoModalTab] = useState<InfoModalTab>('about');
  const [isLocalSOSOpen, setIsLocalSOSOpen] = useState(false);

  const openInfoModal = (tab: InfoModalTab) => {
    setInfoModalTab(tab);
    setIsInfoModalOpen(true);
  };

  const services: ServiceDetailData[] = [
    {
      id: 'mobile_grooming',
      title: 'Grooming Van',
      subtitle: 'Doorstep Luxury Hydrobath',
      desc: 'Air-conditioned custom van equipped with warm water hydrobath (38°C), herbal shampoos, low-noise blowers, and gentle sanitized styling right outside your gate.',
      icon: 'local_shipping',
      badge: 'Zooby Mobile Care',
      tag: 'Doorstep Service',
      price: 'From ₹1,299 (Base ₹1,999)',
      duration: '45–75 mins',
      image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600',
      inclusions: [
        'Warm RO water hydrobath (38°C)',
        'Organic chamomile & herbal shampoo',
        'Low-noise velocity blow dry',
        'Nail clipping, ear cleansing & pad balm'
      ]
    },
    {
      id: 'vet_consult',
      title: 'Veterinary Services',
      subtitle: 'Certified Clinical Diagnostics',
      desc: 'Expert in-clinic physical examinations, core vaccinations, health certificates, preventative wellness, and compassionate emergency consults with licensed BVSc doctors.',
      icon: 'medical_services',
      badge: 'BVSc Certified Doctors',
      tag: 'Clinic & Virtual',
      price: 'From ₹899',
      duration: '30 mins',
      image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=600',
      inclusions: [
        'Full physical nose-to-tail examination (₹899)',
        'Vet Checking & Vaccination (₹1,899 / 7-in-1 ₹1,599)',
        'De-worming dosage (₹399) & First Aid (₹999)',
        'Blood Test at Home with lab report (₹1,299)'
      ]
    },
    {
      id: 'mobile_vet',
      title: 'Mobile Vet Clinic Van',
      subtitle: 'Doorstep Vet Health Check',
      desc: 'Low-stress veterinary consultations, vaccinations, microchipping, and routine blood tests conducted inside the sterilized mobile van outside your gate.',
      icon: 'ambulance',
      badge: 'Zero Clinic Stress',
      tag: 'Doorstep Vet',
      price: 'From ₹899',
      duration: '30 mins',
      image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&q=80&w=600',
      inclusions: [
        'Doorstep physical exam inside climate-controlled van',
        'Core DHPPIL / Anti-Rabies vaccination',
        'Blood/sample collection for lab diagnostics',
        'Instant digital health record generation'
      ]
    },
    {
      id: 'walking',
      title: 'Pet Walking',
      subtitle: 'GPS-Tracked Fitness Strolls',
      desc: 'Solo or small-pack energizing walks led by background-verified dog handlers with live GPS tracking, hydration breaks, and post-walk photos.',
      icon: 'directions_walk',
      badge: 'Live GPS Tracking',
      tag: 'Daily Routine',
      price: 'From ₹149 / walk',
      duration: '30–60 mins',
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=600',
      inclusions: [
        'Standard Walk: ₹149 (30 mins)',
        'Long Walk: ₹199 (45 mins)',
        'Exercise Walk: ₹279 (60 mins)',
        'Monthly Standard Walk Plan: ₹3,500 (26 days)'
      ]
    },
    {
      id: 'sitting',
      title: 'Pet Sitting',
      subtitle: 'Cage-Free Loving Homes',
      desc: 'Warm in-home pet stays and host boarding with enclosed lawns, personalized diets, plenty of cuddles, and regular video check-ins.',
      icon: 'home',
      badge: 'Verified Pet Hosts',
      tag: 'Cage-Free Stays',
      price: 'From ₹599',
      duration: '3h / 8h / 24h',
      image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=600',
      inclusions: [
        '3 Hours Sitting: ₹599',
        '8 Hours Daycare: ₹999',
        '24 Hours Overnight Stay: ₹1,999',
        '100% cage-free supervision with video updates'
      ]
    },
    {
      id: 'training',
      title: 'Pet Training',
      subtitle: 'Positive Reinforcement Coaching',
      desc: 'Puppy socialization, leash manners, recall commands, and separation anxiety management led by certified animal behaviorists.',
      icon: 'school',
      badge: 'Force-Free Methods',
      tag: 'Behavior Coaching',
      price: 'From ₹1,000 / session',
      duration: '60 mins',
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=600',
      inclusions: [
        'Individual Training Session: ₹1,000',
        'Basic Puppy & Home Training: ₹7,000',
        'Leash, Walking & Behaviour Training: ₹14,000',
        'Aggression, Anxiety or Biting Training: ₹20,000'
      ]
    },
    {
      id: 'grooming',
      title: 'Salon Spa & Grooming',
      subtitle: 'In-Salon Pampering',
      desc: 'Breed-specific haircut styling, medicated baths, de-matting, ear flushing, and nail trimming at top-rated partner pet salons.',
      icon: 'content_cut',
      badge: 'Master Groomers',
      tag: 'Salon Service',
      price: 'From ₹1,299',
      duration: '60–75 mins',
      image: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&q=80&w=600',
      inclusions: [
        'Bath + Basic Grooming: From ₹1,299',
        'Full Grooming with Haircut: From ₹1,699',
        'Premium De-shedding: From ₹1,999',
        'Sanitary trim, ear cleaning & tear stain care'
      ]
    },
    {
      id: 'adoption',
      title: 'Pet Adoption',
      subtitle: 'Verified Shelter Network',
      desc: 'Find healthy, vaccinated, and microchipped rescue puppies, dogs, and kittens looking for their loving forever home in Nashik.',
      icon: 'favorite',
      badge: '100% Medical Records',
      tag: 'Rescue Network',
      price: 'Ethical Adoption',
      duration: 'Lifetime Bond',
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
      inclusions: [
        'Complete medical & deworming passport',
        'First vaccination & health check included',
        'Pre-adoption shelter meet & greet',
        'Post-adoption nutrition & care guidance'
      ]
    },
    {
      id: 'rescue_support',
      title: 'Rescue / Adoption Support',
      subtitle: 'Shelter & Medical Rehab',
      desc: 'Community support program connecting shelters with veterinary partners, van transport for injured animals, and ethical foster coordination.',
      icon: 'volunteer_activism',
      badge: 'Community Welfare',
      tag: 'Rescue Support',
      price: 'Non-Profit Partnered',
      duration: 'Ongoing Care',
      image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&q=80&w=600',
      inclusions: [
        'Emergency rescue ambulance coordination',
        'Subsidized emergency surgery & recovery',
        'Foster family onboarding & matching',
        'Community sterilization tracking'
      ]
    }
  ];

  // Guaranteed non-empty realistic adoption data
  const safeAdoptionAnimals = adoptionAnimals && adoptionAnimals.length > 0 ? adoptionAnimals : INITIAL_ADOPTION_ANIMALS;

  const filteredAdoptions = safeAdoptionAnimals.filter((a) => {
    if (adoptFilter === 'All') return true;
    return a.species === adoptFilter || (adoptFilter === 'Dog' && a.species === 'Puppy') || (adoptFilter === 'Cat' && a.species === 'Kitten');
  });

  // Filtered Services based on category tabs
  const filteredServices = services.filter((srv) => {
    if (selectedServiceFilter === 'all') return true;
    if (selectedServiceFilter === 'van') return srv.id.includes('mobile') || srv.id === 'mobile_grooming' || srv.id === 'mobile_vet';
    if (selectedServiceFilter === 'clinic') return srv.id === 'vet_consult' || srv.id === 'grooming';
    if (selectedServiceFilter === 'home') return srv.id === 'walking' || srv.id === 'sitting' || srv.id === 'training';
    return true;
  });

  // Core Booking Handler with Authentication Check & Intent Preservation
  const handleBookServiceClick = (serviceId: string) => {
    if (serviceId === 'adoption' || serviceId === 'rescue_support') {
      const el = document.getElementById('adopt');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        onNavigate('/adopt');
      }
      return;
    }

    if (isAuthenticated) {
      if (onSelectServiceForBooking) {
        onSelectServiceForBooking(serviceId);
      } else {
        onNavigate('/services');
      }
    } else {
      // Save intent so after login user seamlessly enters booking flow!
      sessionStorage.setItem(
        'zooby_pending_intent',
        JSON.stringify({
          action: 'book',
          serviceCategory: serviceId,
          timestamp: Date.now()
        })
      );
      onOpenSignIn();
    }
  };

  const handleAdoptClick = () => {
    const el = document.getElementById('adopt');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigate('/adopt');
    }
  };

  const handleApplyToAdopt = (animal: AdoptionAnimal) => {
    setSelectedPetForModal(null);
    if (isAuthenticated) {
      onNavigate('/adopt');
    } else {
      sessionStorage.setItem(
        'zooby_pending_intent',
        JSON.stringify({
          action: 'adopt',
          petId: animal.id,
          petName: animal.name,
          timestamp: Date.now()
        })
      );
      onOpenSignIn();
    }
  };

  const handleTrackVanClick = () => {
    if (isAuthenticated) {
      onNavigate('/dashboard');
    } else {
      sessionStorage.setItem(
        'zooby_pending_intent',
        JSON.stringify({
          action: 'track_van',
          timestamp: Date.now()
        })
      );
      onOpenSignIn();
    }
  };

  const handleEmergencySOSClick = () => {
    setIsLocalSOSOpen(true);
    if (onOpenSOS) {
      onOpenSOS();
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1b1c1a] font-jakarta selection:bg-[#ffdcbc] selection:text-[#683c00]">
      {/* 1. Public Header */}
      <header className="sticky top-0 z-40 bg-[#fbf9f5]/95 backdrop-blur-md border-b border-[#efeeea]">
        <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="cursor-pointer text-left"
            aria-label="Zooby Home"
          >
            <ZoobyLogo
              size="md"
              subtitle={`Pet Care Ecosystem • ${currentCity.name}`}
              clickable={true}
            />
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-[#544434]">
            <a href="#services" className="hover:text-[#895100] transition-colors">
              Services
            </a>
            <a href="#mobile-van" className="hover:text-[#895100] transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-amber-600">local_shipping</span>
              <span>Mobile Van</span>
            </a>
            <a href="#how-it-works" className="hover:text-[#895100] transition-colors">
              How Zooby Works
            </a>
            <button
              onClick={handleAdoptClick}
              className="hover:text-[#895100] transition-colors flex items-center gap-1 cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined text-[15px] text-rose-500">favorite</span>
              <span>Adopt a Pet</span>
            </button>
            <a href="#about" className="hover:text-[#895100] transition-colors">
              About Us
            </a>
          </nav>

          {/* City Selector & Auth CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <CitySelector variant="header" />

            {isAuthenticated ? (
              <button
                onClick={() => {
                  if (role === 'ADMIN') onNavigate('/admin/dashboard');
                  else if (role === 'PROVIDER') onNavigate('/provider/dashboard');
                  else if (role === 'RESCUE_PARTNER') onNavigate('/rescue/dashboard');
                  else if (role === 'VAN_WORKER') onNavigate('/van/dashboard');
                  else onNavigate('/dashboard');
                }}
                className="px-4 py-2 rounded-full bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] transition-all shadow-xs cursor-pointer"
              >
                My Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenSignIn}
                  className="px-3 sm:px-4 py-2 text-xs font-bold text-[#544434] hover:text-[#895100] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={onOpenSignUp}
                  className="px-4 sm:px-5 py-2.5 rounded-full bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] transition-all shadow-xs cursor-pointer hover:scale-[1.02] active:scale-98"
                >
                  Get Started
                </button>
              </>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#544434] hover:bg-[#f2ece2] transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined text-2xl">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#ebdcc4] px-5 py-4 space-y-4 shadow-xl animate-fade-in text-xs font-bold">
            <nav className="flex flex-col space-y-3 text-[#544434]">
              <a
                href="#services"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1 hover:text-[#895100] flex items-center justify-between"
              >
                <span>Services</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </a>
              <a
                href="#mobile-van"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1 hover:text-[#895100] flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">local_shipping</span>
                  <span>Mobile Van</span>
                </span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </a>
              <a
                href="#how-it-works"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1 hover:text-[#895100] flex items-center justify-between"
              >
                <span>How Zooby Works</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </a>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleAdoptClick();
                }}
                className="py-1 hover:text-[#895100] flex items-center justify-between cursor-pointer text-left font-bold"
              >
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-rose-500">favorite</span>
                  <span>Adopt a Pet</span>
                </span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
              <a
                href="#about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1 hover:text-[#895100] flex items-center justify-between"
              >
                <span>About Us</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </a>
            </nav>

            <div className="pt-2 border-t border-[#efeeea] flex gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSignIn();
                }}
                className="flex-1 py-2.5 rounded-xl border border-[#dac2ae] text-center text-[#544434] font-bold hover:bg-[#f6f4ee]"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSignUp();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#895100] text-white text-center font-bold hover:bg-[#683c00]"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section
        ref={heroRef}
        className="relative overflow-hidden pt-8 pb-16 md:py-20 max-w-[1240px] mx-auto px-4 md:px-8 group"
      >
        {/* Subtle Interactive Paw Print Cursor Trail */}
        <PawCursorHeroTrail heroContainerRef={heroRef} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/70 text-[#895100] text-xs font-bold border border-amber-200">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              <span>Serving All Neighborhoods in {currentCity.name}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-quicksand text-[#1b1c1a] tracking-tight leading-[1.15]">
              Everything your pet needs.{' '}
              <span className="text-[#895100]">Right at your doorstep.</span>
            </h1>

            <p className="text-base text-[#544434] leading-relaxed">
              From climate-controlled mobile grooming vans and licensed clinic veterinarians to dog walkers and verified shelter adoptions. Zooby is {currentCity.name}’s first all-in-one pet care ecosystem.
            </p>

            {/* Quick Service Search / Action Box */}
            <div className="p-3 bg-white rounded-2xl border border-[#e6e2dd] shadow-sm flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full flex items-center gap-2 px-3 py-2 bg-[#f6f4ee] rounded-xl text-xs">
                <span className="material-symbols-outlined text-[18px] text-[#895100]">location_city</span>
                <span className="font-bold text-[#1b1c1a]">Active Hub: {currentCity.name} ({currentCity.coverageAreas.slice(0, 3).join(', ')})</span>
              </div>

              <div className="w-full sm:w-auto">
                <button
                  onClick={() => {
                    const el = document.getElementById('services');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0 hover:scale-[1.02] active:scale-98"
                >
                  <span>Explore {currentCity.name} Services</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-[#716153]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
                <span>BVSc Certified Doctors</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-600">local_shipping</span>
                <span>Sterilized Mobile Van</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-rose-500">favorite</span>
                <span>Verified Rescue Network</span>
              </div>
            </div>
          </div>

          {/* Right Hero Lifestyle Collage */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#e6e2dd] shadow-2xl bg-white aspect-[4/3] sm:aspect-[16/11]">
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800"
                alt="Happy dogs receiving care in Nashik"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Floating Badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-white/60 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#1b1c1a]">Zooby Mobile Van Unit #1</h3>
                    <p className="text-[11px] text-[#716153]">Operating now across Gangapur Rd &amp; College Rd</p>
                  </div>
                </div>
                <button
                  onClick={() => handleBookServiceClick('mobile_grooming')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#895100] text-white text-[11px] font-bold hover:bg-[#683c00] transition-colors cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                >
                  Book Van
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Comprehensive Services Grid */}
      <section id="services" className="py-16 md:py-24 max-w-[1240px] mx-auto px-4 md:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#895100] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Complete Pet Care Spectrum
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-quicksand text-[#1b1c1a] mt-2">
              Services Tailored to Your Pet’s Wellness
            </h2>
            <p className="text-xs sm:text-sm text-[#544434] mt-1">
              Book doorstep mobile van grooming, licensed veterinary visits, walkers, boarding, and rescue adoptions.
            </p>
          </div>

          {/* Service Category Quick Filters */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#e6e2dd] text-xs font-semibold overflow-x-auto">
            {(['all', 'van', 'clinic', 'home'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedServiceFilter(cat)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer uppercase text-[11px] tracking-wider ${
                  selectedServiceFilter === cat
                    ? 'bg-[#895100] text-white shadow-xs'
                    : 'text-[#544434] hover:bg-[#f6f4ee]'
                }`}
              >
                {cat === 'all' ? 'All Services' : cat === 'van' ? 'Mobile Van' : cat === 'clinic' ? 'Vet Clinic' : 'Home Care'}
              </button>
            ))}
          </div>
        </div>

        {/* Services Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-2xl border border-[#e6e2dd] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div
                  onClick={() => setSelectedServiceForDetail(srv)}
                  className="relative aspect-[16/9] overflow-hidden bg-stone-100 cursor-pointer"
                >
                  <img
                    src={srv.image}
                    alt={srv.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-[#895100] backdrop-blur-xs shadow-2xs">
                      {srv.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs">
                      {srv.price}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#895100]">{srv.icon}</span>
                    <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a]">{srv.title}</h3>
                  </div>
                  <p className="text-xs font-semibold text-[#895100]">{srv.subtitle}</p>
                  <p className="text-xs text-[#544434] leading-relaxed">{srv.desc}</p>
                </div>
              </div>

              <div className="p-5 pt-0 flex gap-2">
                <button
                  onClick={() => setSelectedServiceForDetail(srv)}
                  className="flex-1 py-2.5 rounded-xl border border-[#dac2ae] hover:bg-[#f6f4ee] text-xs font-bold text-[#544434] transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">info</span>
                  <span>Learn More</span>
                </button>

                <button
                  onClick={() => handleBookServiceClick(srv.id)}
                  className="flex-1 py-2.5 rounded-xl bg-[#895100] hover:bg-[#683c00] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-98"
                >
                  <span>{srv.id === 'adoption' ? 'Adoption Pets' : 'Book Now'}</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Dedicated Zooby Mobile Van Section */}
      <section id="mobile-van" className="bg-[#1b1c1a] text-white py-16 md:py-24 border-y border-stone-800">
        <div className="max-w-[1240px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
              <span>Zooby Mobile Care Van • Doorstep Salon &amp; Clinic</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold font-quicksand tracking-tight text-white leading-tight">
              A state-of-the-art pet spa &amp; clinic, parked right at your gate.
            </h2>

            <p className="text-sm text-stone-300 leading-relaxed">
              No car rides with nervous pets. No waiting rooms full of barking dogs. The Zooby Mobile Care Van brings certified groomers and veterinary technicians directly to your doorstep across {currentCity.name}.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <span className="material-symbols-outlined text-[18px]">water_drop</span>
                  <span>Warm Water Hydrobath</span>
                </div>
                <p className="text-stone-400">Pure RO water heated to pet-safe 38°C for gentle, soothing cleanses.</p>
              </div>

              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <span className="material-symbols-outlined text-[18px]">air</span>
                  <span>Climate Controlled Salon</span>
                </div>
                <p className="text-stone-400">Low-noise velocity dryers and whisper-quiet AC to eliminate pet anxiety.</p>
              </div>

              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <span className="material-symbols-outlined text-[18px]">sanitizer</span>
                  <span>Hospital-Grade Sanitation</span>
                </div>
                <p className="text-stone-400">UV-C tool sterilization between each appointment with fresh towels.</p>
              </div>

              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <span className="material-symbols-outlined text-[18px]">near_me</span>
                  <span>Live Van Tracking</span>
                </div>
                <p className="text-stone-400">Receive accurate ETA and track the van on map right as it approaches.</p>
              </div>

              {/* 24/7 Emergency Response Informational Point */}
              <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 space-y-1.5 sm:col-span-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <span className="material-symbols-outlined text-[18px]">emergency</span>
                  <span>24/7 Emergency Response</span>
                </div>
                <p className="text-stone-400 leading-relaxed">
                  Need urgent help? Zooby Mobile Care Vans can respond to pet emergencies with GPS-enabled dispatch and live location tracking, providing prompt mobile assistance and connectivity with on-duty veterinary support.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => handleBookServiceClick('mobile_grooming')}
                className="px-6 py-3 rounded-full bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-colors shadow-md cursor-pointer flex items-center gap-2 hover:scale-[1.02] active:scale-98"
              >
                <span>Book a Mobile Van Visit</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
              <button
                onClick={handleTrackVanClick}
                className="px-5 py-3 rounded-full border border-stone-700 text-white text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-400">near_me</span>
                <span>Track My Upcoming Van</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden border border-stone-800 shadow-2xl bg-stone-900">
              <img
                src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800"
                alt="Zooby Mobile Grooming Van Interior"
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="p-6 bg-stone-900 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">Zooby Mobile Unit #1 (MH 15 ZB 4022)</p>
                  <p className="text-stone-400 mt-0.5">Operating across Gangapur Rd, College Rd, Indira Nagar &amp; Mahatma Nagar</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded-full border border-emerald-500/30">
                  Active in {currentCity.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Adoption Showcase Section ("Find Your New Best Friend") */}
      <section id="adopt" className="py-16 md:py-24 max-w-[1240px] mx-auto px-4 md:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#895100] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Adopt, Don’t Shop • {currentCity.name} Rescue Network
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-quicksand text-[#1b1c1a] mt-2">
              Find Your New Best Friend
            </h2>
            <p className="text-xs sm:text-sm text-[#544434] mt-1">
              Every rescue animal is health-checked, vaccinated, and cared for by verified rescue partners in {currentCity.name}.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#e6e2dd] text-xs font-semibold">
            {(['All', 'Dog', 'Cat', 'Puppy', 'Kitten'] as const).map((sp) => (
              <button
                key={sp}
                onClick={() => setAdoptFilter(sp)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  adoptFilter === sp ? 'bg-[#895100] text-white shadow-xs' : 'text-[#544434] hover:bg-[#f6f4ee]'
                }`}
              >
                {sp}
              </button>
            ))}
          </div>
        </div>

        {/* Adoption Grid of Animals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAdoptions.map((animal) => (
            <div
              key={animal.id}
              className="bg-white rounded-2xl border border-[#e6e2dd] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
            >
              <div>
                <div
                  onClick={() => setSelectedPetForModal(animal)}
                  className="relative aspect-[4/3] overflow-hidden bg-stone-100 cursor-pointer"
                >
                  <img
                    src={animal.photoUrl}
                    alt={animal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        animal.status === 'Available' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                      }`}
                    >
                      {animal.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-black/60 text-white">
                      {animal.gender}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/90 text-[#895100] backdrop-blur-xs">
                      {animal.age}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#1b1c1a] font-quicksand">{animal.name}</h3>
                      <p className="text-xs text-[#895100] font-semibold">{animal.breed} • {animal.species}</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#716153] line-clamp-2 leading-relaxed">{animal.description}</p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-[#544434]">
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold truncate max-w-[150px]">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>{animal.healthStatus || 'Vaccinated'}</span>
                    </span>
                    <span className="text-[10px] text-stone-500 truncate">{animal.location}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-2">
                <button
                  onClick={() => setSelectedPetForModal(animal)}
                  className="w-full py-2 rounded-xl border border-[#dac2ae] hover:bg-[#ffdcbc]/30 text-xs font-bold text-[#895100] transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">visibility</span>
                  <span>Meet {animal.name} / View Profile</span>
                </button>

                <button
                  onClick={() => handleApplyToAdopt(animal)}
                  className="w-full py-2 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-98"
                >
                  <span className="material-symbols-outlined text-[15px]">favorite</span>
                  <span>Apply to Adopt</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. How Zooby Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-[#f6f4ee] border-y border-[#e6e2dd]">
        <div className="max-w-[1240px] mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#895100] bg-white px-3 py-1 rounded-full border border-[#e6e2dd]">
              Simple &amp; Reliable
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-quicksand text-[#1b1c1a]">
              How Zooby Delivers Care to Your Pet
            </h2>
            <p className="text-xs sm:text-sm text-[#544434]">
              A continuous, trustworthy experience from booking to verified medical records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Choose a Service',
                desc: 'Select in-home care, mobile van doorstep visit, clinic consultation, or adoption inquiry.'
              },
              {
                step: '02',
                title: 'Select Your Pet Profile',
                desc: 'Attach your pet’s unique medical history, behavioral notes, and vaccine requirements.'
              },
              {
                step: '03',
                title: 'Confirm Appointment',
                desc: 'Pick your preferred date, time slot, and address in Nashik with upfront transparent pricing.'
              },
              {
                step: '04',
                title: 'Receive Care & Records',
                desc: 'Enjoy doorstep care or clinical service, with session notes automatically saved to your PetCare vault.'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-[#e6e2dd] shadow-xs space-y-3 relative hover:shadow-md transition-shadow">
                <span className="text-2xl font-bold text-[#895100] font-quicksand">{item.step}</span>
                <h3 className="text-base font-bold text-[#1b1c1a]">{item.title}</h3>
                <p className="text-xs text-[#544434] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. About Zooby Section */}
      <section id="about" className="py-16 md:py-24 max-w-[1240px] mx-auto px-4 md:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#895100] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              About Zooby
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-quicksand text-[#1b1c1a]">
              Built for compassionate pet parents who demand quality and transparency.
            </h2>
            <p className="text-sm text-[#544434] leading-relaxed">
              Zooby was founded to eliminate fragmented pet care. We bring together certified veterinarians, trained groomers, ethical animal rescue shelters, and mobile service vans into one cohesive ecosystem.
            </p>

            <div className="space-y-3 text-xs">
              <button
                onClick={() => openInfoModal('about')}
                className="w-full text-left p-3.5 rounded-xl bg-white border border-[#e6e2dd] hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer flex items-start gap-3"
              >
                <span className="material-symbols-outlined text-[20px] text-[#895100] mt-0.5">domain</span>
                <div>
                  <h4 className="font-bold text-[#1b1c1a]">Hyperlocal {currentCity.name} Focus</h4>
                  <p className="text-[#716153] mt-0.5">Tailored to local neighborhoods with verified providers and dedicated mobile vans. Tap to learn our story →</p>
                </div>
              </button>

              <button
                onClick={() => openInfoModal('trust')}
                className="w-full text-left p-3.5 rounded-xl bg-white border border-[#e6e2dd] hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer flex items-start gap-3"
              >
                <span className="material-symbols-outlined text-[20px] text-emerald-600 mt-0.5">verified_user</span>
                <div>
                  <h4 className="font-bold text-[#1b1c1a]">Vetted Professionals Only</h4>
                  <p className="text-[#716153] mt-0.5">Every doctor and groomer undergoes credential verification and safety checks. Tap for safety charter →</p>
                </div>
              </button>

              <button
                onClick={() => openInfoModal('about')}
                className="w-full text-left p-3.5 rounded-xl bg-white border border-[#e6e2dd] hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer flex items-start gap-3"
              >
                <span className="material-symbols-outlined text-[20px] text-rose-500 mt-0.5">favorite</span>
                <div>
                  <h4 className="font-bold text-[#1b1c1a]">Shelter Welfare Integration</h4>
                  <p className="text-[#716153] mt-0.5">Every booking contributes to subsidizing medical care for street animals in Nashik.</p>
                </div>
              </button>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden border border-[#e6e2dd] shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800"
              alt="Zooby pet and caregiver in Nashik"
              className="w-full aspect-[4/3] object-cover"
            />
          </div>
        </div>
      </section>

      {/* 8. Call to Action Banner */}
      <section className="bg-gradient-to-r from-[#5a3600] to-[#895100] text-white py-14">
        <div className="max-w-[1000px] mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-quicksand tracking-tight">
            Ready to give your pet the care they deserve?
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 max-w-xl mx-auto leading-relaxed">
            Join hundreds of happy pet parents in {currentCity.name}. Create your pet’s digital health passport and book doorstep grooming or vet care in minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenSignUp}
              className="px-6 py-3 rounded-full bg-white text-[#895100] text-xs font-bold hover:bg-amber-50 transition-colors shadow-md cursor-pointer hover:scale-[1.02] active:scale-98"
            >
              Create Free Account
            </button>
            <button
              onClick={onOpenSignIn}
              className="px-6 py-3 rounded-full bg-black/20 hover:bg-black/30 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Sign In to Your Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* 9. Meet Pet / View Profile Adoption Modal */}
      {selectedPetForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#e6e2dd] animate-fade-in max-h-[90vh] flex flex-col">
            <div className="relative aspect-[16/10] bg-stone-100 shrink-0">
              <img
                src={selectedPetForModal.photoUrl}
                alt={selectedPetForModal.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedPetForModal(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>

              <div className="absolute bottom-3 left-3 flex gap-1.5">
                <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-sm">
                  {selectedPetForModal.status}
                </span>
                <span className="px-3 py-1 bg-black/70 text-white text-xs font-bold rounded-full backdrop-blur-xs">
                  {selectedPetForModal.gender} • {selectedPetForModal.age}
                </span>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold font-quicksand text-[#1b1c1a]">
                    Meet {selectedPetForModal.name}
                  </h3>
                  <span className="px-2.5 py-1 bg-amber-50 text-[#895100] font-bold rounded-lg border border-amber-200">
                    {selectedPetForModal.breed}
                  </span>
                </div>
                <p className="text-stone-500 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-[#895100]">home</span>
                  <span>Shelter: {selectedPetForModal.shelterName || 'Nashik Animal Rescue Network'}</span>
                </p>
                <p className="text-stone-500 flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[15px] text-[#895100]">location_on</span>
                  <span>{selectedPetForModal.location}</span>
                </p>
              </div>

              <div className="p-3.5 bg-[#fbf9f5] rounded-xl border border-[#efeeea] space-y-1">
                <div className="font-bold text-[#1b1c1a]">Medical &amp; Health Record:</div>
                <p className="text-emerald-800 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                  <span>{selectedPetForModal.healthStatus || 'Dewormed, vaccinated and veterinarian checked.'}</span>
                </p>
                <div className="flex gap-2 pt-1 text-[11px] text-[#716153]">
                  <span>Vaccinated: {selectedPetForModal.vaccinated ? 'Yes ✓' : 'Scheduled'}</span>
                  <span>•</span>
                  <span>Neutered/Spayed: {selectedPetForModal.neutered ? 'Yes ✓' : 'Under 6 months'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-[#1b1c1a]">About {selectedPetForModal.name}:</div>
                <p className="text-[#544434] leading-relaxed">
                  {selectedPetForModal.description}
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setSelectedPetForModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f6f4ee] cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => handleApplyToAdopt(selectedPetForModal)}
                  className="flex-1 py-2.5 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">favorite</span>
                  <span>Apply to Adopt {selectedPetForModal.name}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. Service Detail Modal ("Learn More") */}
      <ServiceDetailModal
        isOpen={!!selectedServiceForDetail}
        onClose={() => setSelectedServiceForDetail(null)}
        service={selectedServiceForDetail}
        onBookService={(serviceId) => handleBookServiceClick(serviceId)}
      />

      {/* 11. Company & Info Support Modal */}
      <CompanyInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        initialTab={infoModalTab}
        onOpenSOS={handleEmergencySOSClick}
        onOpenBooking={(cat) => handleBookServiceClick(cat)}
        onNavigate={onNavigate}
      />

      {/* 12. Single Final Professional Footer */}
      <Footer
        onNavigate={onNavigate}
        onOpenBookingForService={handleBookServiceClick}
        onOpenSOS={handleEmergencySOSClick}
      />

      {/* 13. Public Emergency SOS Floating Button */}
      <FloatingSOSButton onClick={handleEmergencySOSClick} />

      {/* 14. Dedicated Public Rapid Van SOS Modal */}
      <RapidVanSOSModal
        isOpen={isLocalSOSOpen}
        onClose={() => setIsLocalSOSOpen(false)}
        currentUser={user}
        pets={[]}
      />

      {/* 15. Active Emergency Minimized Banner */}
      <FloatingEmergencyBar onOpenSOSModal={handleEmergencySOSClick} />
    </div>
  );
};
