import React, { useState, useEffect } from 'react';
import { Pet, ServiceProvider, Booking, PaymentRecord, ServiceCategory } from '../../types';
import { useCity } from '../../context/CityContext';
import { SERVICE_PROVIDERS } from '../../data/mockData';
import { ZOOBY_OFFICIAL_PRICING, formatRupees } from '../../data/pricingConstants';

interface BookingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceCategory?: ServiceCategory | string;
  initialProvider?: ServiceProvider | null;
  pets?: Pet[];
  selectedPet?: Pet;
  onConfirmBooking: (newBooking: Booking) => void;
  onAddPayment?: (payment: PaymentRecord) => void;
  onNavigateToServices?: () => void;
}

const SERVICE_META: Record<string, { title: string; subtitle: string; icon: string; duration: string; defaultPrice: number }> = {
  mobile_grooming: {
    title: 'Grooming Van',
    subtitle: 'Doorstep Luxury Hydrobath Pet Spa',
    icon: 'local_shipping',
    duration: '45 - 75 mins',
    defaultPrice: 1999
  },
  mobile_vet: {
    title: 'Mobile Vet Clinic Van',
    subtitle: 'Doorstep Vet Health Check & Vaccines',
    icon: 'ambulance',
    duration: '30 mins',
    defaultPrice: 899
  },
  vet_consult: {
    title: 'Veterinary Services',
    subtitle: 'Clinical Diagnostics, Vaccines & Preventative Care',
    icon: 'stethoscope',
    duration: '30 mins',
    defaultPrice: 899
  },
  grooming: {
    title: 'Salon Spa & Breed Styling',
    subtitle: 'In-Salon Pampering & De-matting',
    icon: 'content_cut',
    duration: '60 - 75 mins',
    defaultPrice: 1299
  },
  walking: {
    title: 'Pet Walking',
    subtitle: 'GPS-Tracked Energetic Strolls',
    icon: 'directions_walk',
    duration: '30 mins',
    defaultPrice: 149
  },
  sitting: {
    title: 'Pet Sitting',
    subtitle: 'Cage-Free Loving Home Stays & Daycare',
    icon: 'home',
    duration: '3 Hours',
    defaultPrice: 599
  },
  training: {
    title: 'Pet Training',
    subtitle: 'Positive Reinforcement & Behavior Coaching',
    icon: 'school',
    duration: '60 mins',
    defaultPrice: 1000
  },
  rescue_support: {
    title: 'Rescue & Shelter Support',
    subtitle: 'Medical Foster & Rehab',
    icon: 'volunteer_activism',
    duration: 'Community Program',
    defaultPrice: 0
  }
};

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
  isOpen,
  onClose,
  initialServiceCategory = 'mobile_grooming',
  initialProvider,
  pets = [],
  selectedPet,
  onConfirmBooking,
  onAddPayment,
  onNavigateToServices
}) => {
  const { currentCity } = useCity();

  // Normalize initial category
  const normalizedCategory: ServiceCategory =
    initialServiceCategory === 'van'
      ? 'mobile_grooming'
      : initialServiceCategory === 'clinic'
      ? 'vet_consult'
      : (initialServiceCategory as ServiceCategory) || 'mobile_grooming';

  // Step state: 1: Pet, 2: Service, 3: Location, 4: Provider, 5: Date/Time, 6: Summary, 7: Confirmed
  const [step, setStep] = useState<number>(1);

  // Form states
  const fallbackPet: Pet = selectedPet || pets[0] || {
    id: 'p1',
    name: 'Bruno',
    species: 'Dog',
    breed: 'Golden Retriever',
    photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=300'
  };

  const [chosenPet, setChosenPet] = useState<Pet>(fallbackPet);
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>(normalizedCategory);
  const [selectedTierTitle, setSelectedTierTitle] = useState<string>('');
  const [selectedTierPrice, setSelectedTierPrice] = useState<number>(149);
  const [selectedTierDuration, setSelectedTierDuration] = useState<string>('30 mins');
  const [selectedPetSize, setSelectedPetSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [addressInput, setAddressInput] = useState<string>(
    `${currentCity.coverageAreas[0] || 'Main Area'}, ${currentCity.name}`
  );
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(initialProvider || null);
  const [selectedDate, setSelectedDate] = useState<string>('Tomorrow');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:30 AM');
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'pay_on_doorstep'>('pay_on_doorstep');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [notifiedEmail, setNotifiedEmail] = useState<boolean>(false);

  // Sync initial parameters on modal open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setChosenPet(selectedPet || pets[0] || fallbackPet);
      const cat = normalizedCategory;
      setServiceCategory(cat);
      setAddressInput(`${currentCity.coverageAreas[0] || 'Main Area'}, ${currentCity.name}`);
      setConfirmedBooking(null);
      setNotifiedEmail(false);

      // Default Tier setup based on category
      if (cat === 'walking') {
        setSelectedTierTitle('Standard Walk');
        setSelectedTierPrice(149);
        setSelectedTierDuration('30 mins');
      } else if (cat === 'sitting') {
        setSelectedTierTitle('Pet Sitting (3 Hours)');
        setSelectedTierPrice(599);
        setSelectedTierDuration('3 Hours');
      } else if (cat === 'training') {
        setSelectedTierTitle('Individual Training Session');
        setSelectedTierPrice(1000);
        setSelectedTierDuration('60 mins');
      } else if (cat === 'mobile_grooming' || cat === 'grooming') {
        setSelectedTierTitle('Bath + Basic Grooming');
        setSelectedTierPrice(1399); // medium default
        setSelectedTierDuration('60 mins');
      } else if (cat === 'vet_consult' || cat === 'mobile_vet') {
        setSelectedTierTitle('Checking');
        setSelectedTierPrice(899);
        setSelectedTierDuration('30 mins');
      } else {
        setSelectedTierTitle(SERVICE_META[cat]?.title || 'Pet Care Service');
        setSelectedTierPrice(SERVICE_META[cat]?.defaultPrice || 149);
        setSelectedTierDuration(SERVICE_META[cat]?.duration || '30 mins');
      }

      // Find matching city provider if available
      const matching = SERVICE_PROVIDERS.filter(
        (p) => p.category === normalizedCategory && p.city.toLowerCase() === currentCity.name.toLowerCase()
      );
      setSelectedProvider(matching[0] || initialProvider || null);
    }
  }, [isOpen, initialServiceCategory, initialProvider, currentCity.id, selectedPet, pets]);

  if (!isOpen) return null;

  // Filter providers in current city matching selected service
  const cityProviders = SERVICE_PROVIDERS.filter(
    (p) =>
      p.category === serviceCategory &&
      (p.city.toLowerCase() === currentCity.name.toLowerCase() ||
        p.city.toLowerCase() === currentCity.id.toLowerCase())
  );

  const isServiceAvailableInCity = cityProviders.length > 0;
  const meta = SERVICE_META[serviceCategory] || {
    title: 'Zooby Pet Care Service',
    subtitle: 'Professional Pet Care',
    icon: 'pets',
    duration: '30 mins',
    defaultPrice: 149
  };

  const handleConfirm = () => {
    const bookingRef = 'ZB-' + Math.floor(100000 + Math.random() * 900000);
    const bookingId = 'bk-' + Date.now();
    const finalPrice = selectedTierPrice || selectedProvider?.priceNumber || meta.defaultPrice;
    const finalServiceTitle = selectedTierTitle || selectedProvider?.title || meta.title;
    const isMobile = serviceCategory === 'mobile_grooming' || serviceCategory === 'mobile_vet';

    const newBooking: Booking = {
      id: bookingId,
      bookingRef,
      petId: chosenPet.id,
      petName: chosenPet.name,
      petSpecies: chosenPet.species,
      petBreed: chosenPet.breed,
      petPhoto: chosenPet.photoUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=300',
      serviceCategory,
      serviceTitle: finalServiceTitle,
      providerId: selectedProvider?.id || `prov-${currentCity.id}-01`,
      providerName: selectedProvider?.name || `Zooby ${currentCity.name} Care Team`,
      vanWorkerId: isMobile ? `usr-worker-${currentCity.id}` : undefined,
      vanWorkerName: isMobile ? currentCity.assignedVans[0]?.workerName || 'Rahul' : undefined,
      date: `${selectedDate}, ${selectedTimeSlot}`,
      timeSlot: selectedTimeSlot,
      location: addressInput,
      price: finalPrice,
      status: 'Confirmed',
      paymentMethod: paymentMethod === 'pay_on_doorstep' ? 'pay_later' : paymentMethod,
      paymentStatus: paymentMethod === 'pay_on_doorstep' ? 'Pay Later' : 'Paid',
      createdAt: new Date().toISOString().split('T')[0],
      notes: specialNotes.trim(),
      isMobileService: isMobile
    };

    if (onAddPayment) {
      const newPayment: PaymentRecord = {
        id: 'pay-' + Date.now(),
        paymentId: 'PAY-' + Math.floor(100000 + Math.random() * 900000),
        transactionId: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        bookingId: newBooking.id,
        bookingRef,
        userId: 'usr-parent-rohan',
        userName: 'Rohan Mehta',
        userEmail: 'rohan@example.com',
        amount: finalPrice,
        baseFare: finalPrice,
        discount: 0,
        taxes: 0,
        platformFee: 0,
        providerPayout: finalPrice,
        serviceTitle: newBooking.serviceTitle,
        serviceCategory: newBooking.serviceCategory,
        providerName: newBooking.providerName,
        petId: chosenPet.id,
        petName: chosenPet.name,
        petSpecies: chosenPet.species,
        petBreed: chosenPet.breed,
        paymentStatus: paymentMethod === 'pay_on_doorstep' ? 'Pending' : 'Successful',
        refundStatus: 'None',
        paymentMethod: paymentMethod === 'pay_on_doorstep' ? 'pay_later' : paymentMethod,
        paymentMethodDetails: {
          brandOrApp: paymentMethod === 'upi' ? 'UPI / GPay' : 'Card'
        },
        createdAt: new Date().toISOString(),
        invoiceNumber: 'INV-' + Math.floor(100000 + Math.random() * 900000)
      };
      onAddPayment(newPayment);
    }

    onConfirmBooking(newBooking);
    setConfirmedBooking(newBooking);
    setStep(7); // Show Confirmation screen
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#dac2ae]/70 overflow-hidden my-auto animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="bg-[#fbf9f5] px-6 py-4 border-b border-[#efeeea] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#895100] text-white flex items-center justify-center font-bold shadow-xs">
              <span className="material-symbols-outlined text-[20px]">{meta.icon}</span>
            </div>
            <div>
              <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a] leading-none">
                {step === 7 ? 'Booking Confirmed!' : 'Book Zooby Service'}
              </h3>
              <span className="text-[11px] text-[#877462] font-semibold">
                📍 Operating in {currentCity.name}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#efeeea] hover:bg-[#dac2ae] text-[#544434] flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Multi-Step Progress Tracker (Steps 1-6) */}
        {step < 7 && (
          <div className="px-6 pt-3 pb-1 bg-white border-b border-[#f5f3ef]">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#877462]">
              <span>Step {step} of 6: {step === 1 ? 'Select Pet' : step === 2 ? 'Service' : step === 3 ? 'Location' : step === 4 ? 'Provider' : step === 5 ? 'Date & Time' : 'Summary'}</span>
              <span className="text-[#895100]">{Math.round((step / 6) * 100)}%</span>
            </div>
            <div className="w-full bg-[#efeeea] h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-[#895100] h-full rounded-full transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-grow space-y-5">
          {/* ========================================================================= */}
          {/* STEP 1: SELECT PET                                                        */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h4 className="font-quicksand font-bold text-lg text-[#1b1c1a]">Select Your Pet</h4>
                <p className="text-xs text-[#716153]">Choose which pet this appointment is for.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pets.map((p) => {
                  const isSelected = chosenPet.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setChosenPet(p)}
                      className={`p-3.5 rounded-2xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#895100] bg-[#ffeed9]/60 ring-2 ring-[#895100]/30 shadow-xs'
                          : 'border-[#dac2ae]/60 bg-[#fbf9f5] hover:bg-white'
                      }`}
                    >
                      <img src={p.photoUrl} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-[#dac2ae]" />
                      <div className="overflow-hidden">
                        <div className="font-bold text-sm text-[#1b1c1a]">{p.name}</div>
                        <div className="text-xs text-[#716153]">{p.breed}</div>
                        <span className="text-[10px] text-emerald-700 font-bold">Profile Verified ✓</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="py-3 px-6 rounded-2xl bg-[#895100] hover:bg-[#683c00] text-white font-bold text-sm shadow-sm flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Next: Service Details</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: SERVICE DETAILS & OFFICIAL TIER SELECTION                         */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h4 className="font-quicksand font-bold text-lg text-[#1b1c1a]">Service &amp; Package</h4>
                <p className="text-xs text-[#716153]">Select your package with guaranteed transparent Zooby pricing.</p>
              </div>

              {/* Walking Packages */}
              {serviceCategory === 'walking' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider">
                    Select Walking Plan:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ZOOBY_OFFICIAL_PRICING.walking.tiers.map((tier) => {
                      const isSelected = selectedTierTitle === tier.name;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => {
                            setSelectedTierTitle(tier.name);
                            setSelectedTierPrice(tier.price);
                            setSelectedTierDuration(tier.duration);
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#895100] bg-[#ffeed9]/70 ring-2 ring-[#895100]/30 shadow-xs'
                              : 'border-[#dac2ae]/70 bg-[#fbf9f5] hover:bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start w-full">
                            <div>
                              <strong className="font-bold text-xs text-[#1b1c1a] block">{tier.name}</strong>
                              <span className="text-[10px] text-[#716153]">{tier.duration}</span>
                            </div>
                            <span className="font-quicksand font-bold text-sm text-[#895100]">{tier.formatted}</span>
                          </div>
                          {tier.badge && (
                            <span className="mt-2 self-start px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#895100] text-white">
                              {tier.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sitting Packages */}
              {serviceCategory === 'sitting' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider">
                    Select Sitting Duration:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {ZOOBY_OFFICIAL_PRICING.sitting.tiers.map((tier) => {
                      const isSelected = selectedTierTitle === tier.name;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => {
                            setSelectedTierTitle(tier.name);
                            setSelectedTierPrice(tier.price);
                            setSelectedTierDuration(tier.duration);
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#895100] bg-[#ffeed9]/70 ring-2 ring-[#895100]/30 shadow-xs'
                              : 'border-[#dac2ae]/70 bg-[#fbf9f5] hover:bg-white'
                          }`}
                        >
                          <div>
                            <strong className="font-bold text-xs text-[#1b1c1a] block">{tier.duration}</strong>
                            <span className="text-[10px] text-[#716153] line-clamp-1">{tier.description}</span>
                          </div>
                          <span className="font-quicksand font-bold text-base text-[#895100] mt-2">{tier.formatted}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Training Packages */}
              {serviceCategory === 'training' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider">
                    Select Training Curriculum:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ZOOBY_OFFICIAL_PRICING.training.tiers.map((tier) => {
                      const isSelected = selectedTierTitle === tier.name;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => {
                            setSelectedTierTitle(tier.name);
                            setSelectedTierPrice(tier.price);
                            setSelectedTierDuration(tier.duration);
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#895100] bg-[#ffeed9]/70 ring-2 ring-[#895100]/30 shadow-xs'
                              : 'border-[#dac2ae]/70 bg-[#fbf9f5] hover:bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start w-full">
                            <strong className="font-bold text-xs text-[#1b1c1a]">{tier.name}</strong>
                            <span className="font-quicksand font-bold text-sm text-[#895100]">{tier.formatted}</span>
                          </div>
                          <p className="text-[10px] text-[#716153] mt-1 line-clamp-2">{tier.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Grooming Van / Salon Box Pricing */}
              {(serviceCategory === 'mobile_grooming' || serviceCategory === 'grooming') && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                      Select Pet Weight Category:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'small', label: 'Small', note: 'Up to 10 kg' },
                        { key: 'medium', label: 'Medium', note: '10 – 25 kg' },
                        { key: 'large', label: 'Large', note: 'Over 25 kg' }
                      ].map((sz) => (
                        <button
                          key={sz.key}
                          type="button"
                          onClick={() => {
                            const newSize = sz.key as 'small' | 'medium' | 'large';
                            setSelectedPetSize(newSize);
                            // recalculate current tier price
                            const currentBox = ZOOBY_OFFICIAL_PRICING.groomingVan.boxPricing.find(
                              (b) => b.name === selectedTierTitle
                            ) || ZOOBY_OFFICIAL_PRICING.groomingVan.boxPricing[0];
                            setSelectedTierPrice(currentBox[newSize]);
                          }}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            selectedPetSize === sz.key
                              ? 'border-[#895100] bg-[#ffeed9] text-[#895100] font-bold shadow-xs'
                              : 'border-[#dac2ae] bg-white text-[#544434]'
                          }`}
                        >
                          <div className="text-xs font-bold">{sz.label}</div>
                          <div className="text-[9px] text-[#877462]">{sz.note}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider">
                    Select Grooming Box Package:
                  </label>
                  <div className="space-y-2">
                    {ZOOBY_OFFICIAL_PRICING.groomingVan.boxPricing.map((box) => {
                      const isSelected = selectedTierTitle === box.name;
                      const price = box[selectedPetSize];
                      return (
                        <button
                          key={box.id}
                          type="button"
                          onClick={() => {
                            setSelectedTierTitle(box.name);
                            setSelectedTierPrice(price);
                            setSelectedTierDuration('60 - 75 mins');
                          }}
                          className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex justify-between items-center ${
                            isSelected
                              ? 'border-[#895100] bg-[#ffeed9]/70 ring-2 ring-[#895100]/30 shadow-xs'
                              : 'border-[#dac2ae]/70 bg-[#fbf9f5] hover:bg-white'
                          }`}
                        >
                          <div>
                            <strong className="font-bold text-xs text-[#1b1c1a] block">{box.name}</strong>
                            <span className="text-[10px] text-[#716153] line-clamp-1">{box.description}</span>
                          </div>
                          <span className="font-quicksand font-bold text-base text-[#895100] shrink-0 ml-3">
                            {formatRupees(price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Veterinary Services Selection */}
              {(serviceCategory === 'vet_consult' || serviceCategory === 'mobile_vet') && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider">
                    Select Veterinary Care Procedure:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ZOOBY_OFFICIAL_PRICING.veterinary.services.map((svc) => {
                      const isSelected = selectedTierTitle === svc.name;
                      return (
                        <button
                          key={svc.id}
                          type="button"
                          onClick={() => {
                            setSelectedTierTitle(svc.name);
                            setSelectedTierPrice(svc.price);
                            setSelectedTierDuration(svc.duration);
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#895100] bg-[#ffeed9]/70 ring-2 ring-[#895100]/30 shadow-xs'
                              : 'border-[#dac2ae]/70 bg-[#fbf9f5] hover:bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start w-full">
                            <strong className="font-bold text-xs text-[#1b1c1a]">{svc.name}</strong>
                            <span className="font-quicksand font-bold text-sm text-[#895100]">{svc.formatted}</span>
                          </div>
                          <p className="text-[10px] text-[#716153] mt-1 line-clamp-2">{svc.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected Tier Banner */}
              <div className="p-3 bg-[#ffeed9]/40 border border-[#dac2ae] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-[#895100]">{meta.icon}</span>
                  <div>
                    <span className="text-xs font-bold text-[#1b1c1a] block">{selectedTierTitle || meta.title}</span>
                    <span className="text-[10px] text-[#877462]">Duration: {selectedTierDuration}</span>
                  </div>
                </div>
                <span className="font-quicksand font-extrabold text-base text-[#895100]">
                  {formatRupees(selectedTierPrice)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-2.5 px-4 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f5f3ef]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="py-3 px-6 rounded-2xl bg-[#895100] hover:bg-[#683c00] text-white font-bold text-sm shadow-sm flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Next: Service Location</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: LOCATION & CITY AVAILABILITY                                      */}
          {/* ========================================================================= */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h4 className="font-quicksand font-bold text-lg text-[#1b1c1a]">Service Location</h4>
                <p className="text-xs text-[#716153]">Provide your doorstep or neighborhood address.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 bg-[#fbf9f5] rounded-xl border border-[#efeeea]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-[#895100] filled-icon">location_city</span>
                    <span className="text-xs font-bold text-[#1b1c1a]">Operating City: {currentCity.name}</span>
                  </div>
                  <span className="text-[10px] text-[#877462] font-semibold">{currentCity.state}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                    Doorstep Address:
                  </label>
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="e.g. Rowhouse #4, Silver Palm, Gangapur Road"
                    className="w-full p-3 rounded-xl border border-[#dac2ae] bg-white text-sm font-medium focus:ring-2 focus:ring-[#895100] focus:outline-none"
                  />
                </div>

                {/* City Coverage & Availability Alert */}
                {isServiceAvailableInCity ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900">
                    <span className="material-symbols-outlined text-lg text-emerald-600">task_alt</span>
                    <span><strong>{meta.title}</strong> is actively available in {currentCity.name} ({cityProviders.length} verified providers).</span>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <span className="material-symbols-outlined text-lg text-amber-600">info</span>
                      <span>{meta.title} isn't currently available in {currentCity.name}.</span>
                    </div>
                    <p className="text-xs text-[#544434]">
                      We are expanding this service to {currentCity.name} soon. You can explore other services or join the priority waitlist.
                    </p>
                    <div className="flex gap-2 pt-1">
                      {onNavigateToServices && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigateToServices();
                          }}
                          className="py-1.5 px-3 rounded-lg bg-[#895100] text-white font-bold text-xs shadow-xs"
                        >
                          Browse Other Services
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setNotifiedEmail(true)}
                        className="py-1.5 px-3 rounded-lg border border-amber-400 text-[#895100] font-bold text-xs"
                      >
                        {notifiedEmail ? '✓ Waitlist Joined' : 'Notify Me When Available'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="py-2.5 px-4 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f5f3ef]"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!isServiceAvailableInCity}
                  onClick={() => {
                    if (cityProviders.length > 0 && !selectedProvider) {
                      setSelectedProvider(cityProviders[0]);
                    }
                    setStep(4);
                  }}
                  className="py-3 px-6 rounded-2xl bg-[#895100] hover:bg-[#683c00] disabled:opacity-50 text-white font-bold text-sm shadow-sm flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Next: Choose Provider</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: PROVIDER SELECTION                                                */}
          {/* ========================================================================= */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h4 className="font-quicksand font-bold text-lg text-[#1b1c1a]">Choose Care Provider</h4>
                <p className="text-xs text-[#716153]">Select an accredited specialist in {currentCity.name}.</p>
              </div>

              <div className="space-y-2.5">
                {cityProviders.map((prov) => {
                  const isSelected = selectedProvider?.id === prov.id;
                  return (
                    <button
                      key={prov.id}
                      type="button"
                      onClick={() => setSelectedProvider(prov)}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#895100] bg-[#ffeed9]/60 ring-2 ring-[#895100]/30 shadow-xs'
                          : 'border-[#dac2ae]/60 bg-[#fbf9f5] hover:bg-white'
                      }`}
                    >
                      <img src={prov.image} alt={prov.name} className="w-14 h-14 rounded-xl object-cover border border-[#dac2ae] shrink-0" />
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-start">
                          <h5 className="font-bold text-sm text-[#1b1c1a] truncate">{prov.name}</h5>
                          <span className="text-xs font-extrabold text-[#895100]">{prov.priceFormatted}</span>
                        </div>
                        <p className="text-xs text-[#716153] mt-0.5">{prov.area}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                          <span className="font-bold text-amber-700 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs filled-icon">star</span>
                            <span>{prov.rating}</span>
                          </span>
                          <span className="text-[#877462]">({prov.reviewCount} reviews)</span>
                          {prov.isMobileVanEligible && (
                            <span className="bg-amber-200/70 text-[#895100] px-2 py-0.5 rounded-full font-bold text-[9px] uppercase">
                              Mobile Van
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="py-2.5 px-4 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f5f3ef]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="py-3 px-6 rounded-2xl bg-[#895100] hover:bg-[#683c00] text-white font-bold text-sm shadow-sm flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Next: Date &amp; Time</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: SELECT DATE & TIME SLOTS                                          */}
          {/* ========================================================================= */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h4 className="font-quicksand font-bold text-lg text-[#1b1c1a]">Select Date &amp; Time</h4>
                <p className="text-xs text-[#716153]">Choose your preferred appointment window.</p>
              </div>

              {/* Day Selection */}
              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-2">
                  Select Day:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Today', 'Tomorrow', 'This Weekend'].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDate(day)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedDate === day
                          ? 'border-[#895100] bg-[#ffeed9] text-[#895100] shadow-xs'
                          : 'border-[#dac2ae]/60 bg-[#fbf9f5] text-[#544434] hover:bg-white'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-2">
                  Available Time Slots:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '04:30 PM', '06:00 PM'].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedTimeSlot === slot
                          ? 'border-[#895100] bg-[#ffeed9] text-[#895100] shadow-xs'
                          : 'border-[#dac2ae]/60 bg-white text-[#1b1c1a] hover:bg-[#fbf9f5]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Instructions Input */}
              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                  Special Notes for Provider (Optional):
                </label>
                <textarea
                  rows={2}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Bruno is sensitive around his paws, please handle gently..."
                  className="w-full p-2.5 rounded-xl border border-[#dac2ae] bg-white text-xs font-medium focus:ring-2 focus:ring-[#895100] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="py-2.5 px-4 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f5f3ef]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="py-3 px-6 rounded-2xl bg-[#895100] hover:bg-[#683c00] text-white font-bold text-sm shadow-sm flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Next: Review &amp; Confirm</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 6: BOOKING SUMMARY & CONFIRMATION                                    */}
          {/* ========================================================================= */}
          {step === 6 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h4 className="font-quicksand font-bold text-lg text-[#1b1c1a]">Booking Summary</h4>
                <p className="text-xs text-[#716153]">Please verify your appointment details.</p>
              </div>

              <div className="bg-[#fbf9f5] rounded-2xl border border-[#dac2ae] p-4 space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-[#efeeea] pb-2">
                  <span className="text-[#877462]">Pet:</span>
                  <strong className="text-sm text-[#1b1c1a]">{chosenPet.name} ({chosenPet.breed})</strong>
                </div>

                <div className="flex justify-between items-center border-b border-[#efeeea] pb-2">
                  <span className="text-[#877462]">Service &amp; Plan:</span>
                  <strong className="text-[#1b1c1a]">{selectedTierTitle || meta.title} ({selectedTierDuration})</strong>
                </div>

                <div className="flex justify-between items-center border-b border-[#efeeea] pb-2">
                  <span className="text-[#877462]">Provider:</span>
                  <strong className="text-[#1b1c1a]">{selectedProvider?.name || `Zooby ${currentCity.name} Unit`}</strong>
                </div>

                <div className="flex justify-between items-center border-b border-[#efeeea] pb-2">
                  <span className="text-[#877462]">City &amp; Location:</span>
                  <strong className="text-[#1b1c1a] text-right">{addressInput}</strong>
                </div>

                <div className="flex justify-between items-center border-b border-[#efeeea] pb-2">
                  <span className="text-[#877462]">Date &amp; Time:</span>
                  <strong className="text-[#1b1c1a]">{selectedDate}, {selectedTimeSlot}</strong>
                </div>

                <div className="flex justify-between items-center pt-1 text-sm font-bold">
                  <span className="text-[#1b1c1a]">Total Estimated Amount:</span>
                  <span className="text-base text-[#895100]">
                    {formatRupees(selectedTierPrice || selectedProvider?.priceNumber || meta.defaultPrice)}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-2">
                  Payment Method:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pay_on_doorstep')}
                    className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                      paymentMethod === 'pay_on_doorstep'
                        ? 'border-[#895100] bg-[#ffeed9] text-[#895100]'
                        : 'border-[#dac2ae] bg-white text-[#544434]'
                    }`}
                  >
                    Pay on Doorstep
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-[#895100] bg-[#ffeed9] text-[#895100]'
                        : 'border-[#dac2ae] bg-white text-[#544434]'
                    }`}
                  >
                    Instant UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#895100] bg-[#ffeed9] text-[#895100]'
                        : 'border-[#dac2ae] bg-white text-[#544434]'
                    }`}
                  >
                    Card / NetBanking
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="py-2.5 px-4 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f5f3ef]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="py-3.5 px-8 rounded-2xl bg-[#895100] hover:bg-[#683c00] active:scale-98 text-white font-extrabold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>CONFIRM BOOKING</span>
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 7: APPOINTMENT CONFIRMED                                             */}
          {/* ========================================================================= */}
          {step === 7 && confirmedBooking && (
            <div className="space-y-5 text-center py-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <span className="material-symbols-outlined text-3xl">verified</span>
              </div>

              <div className="space-y-1">
                <h4 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">Appointment Confirmed!</h4>
                <p className="text-xs text-[#716153]">
                  Your Zooby appointment has been registered with {confirmedBooking.providerName}.
                </p>
              </div>

              <div className="bg-[#fbf9f5] rounded-2xl border border-[#dac2ae] p-4 text-left space-y-2.5 text-xs max-w-md mx-auto">
                <div className="flex justify-between items-center border-b border-[#efeeea] pb-2">
                  <span className="text-[#877462]">Booking Ref:</span>
                  <strong className="text-sm font-extrabold text-[#895100]">#{confirmedBooking.bookingRef}</strong>
                </div>
                <div className="flex justify-between items-center border-b border-[#efeeea] pb-2">
                  <span className="text-[#877462]">Pet:</span>
                  <strong className="text-[#1b1c1a]">{confirmedBooking.petName}</strong>
                </div>
                <div className="flex justify-between items-center border-b border-[#efeeea] pb-2">
                  <span className="text-[#877462]">Service:</span>
                  <strong className="text-[#1b1c1a]">{confirmedBooking.serviceTitle}</strong>
                </div>
                <div className="flex justify-between items-center border-b border-[#efeeea] pb-2">
                  <span className="text-[#877462]">Date &amp; Time:</span>
                  <strong className="text-[#1b1c1a]">{confirmedBooking.date}</strong>
                </div>
                <div className="flex justify-between items-center border-b border-[#efeeea] pb-2">
                  <span className="text-[#877462]">Location:</span>
                  <strong className="text-[#1b1c1a]">{confirmedBooking.location}</strong>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[#877462]">Status:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                    CONFIRMED
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl bg-[#895100] text-white font-bold text-xs hover:bg-[#683c00] transition-colors shadow-xs cursor-pointer"
                >
                  VIEW IN DASHBOARD
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Appointment #${confirmedBooking.bookingRef} added to your device calendar.`)}
                  className="flex-1 py-3 rounded-2xl bg-white border border-[#dac2ae] text-[#544434] font-bold text-xs hover:bg-[#f5f3ef] cursor-pointer"
                >
                  ADD TO CALENDAR
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
