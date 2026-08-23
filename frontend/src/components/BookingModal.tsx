import React, { useState } from 'react';
import { Pet, ServiceProvider, Booking, PaymentRecord } from '../types';
import { PaymentGatewayModal, PaymentIntentDetails } from './payment/PaymentGatewayModal';
import { ReceiptModal } from './payment/ReceiptModal';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ServiceProvider | null;
  pets?: Pet[];
  selectedPet?: Pet;
  onConfirmBooking: (newBooking: Booking) => void;
  onAddPayment?: (payment: PaymentRecord) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  provider,
  pets = [],
  selectedPet,
  onConfirmBooking,
  onAddPayment
}) => {
  const fallbackPet: Pet = selectedPet || pets[0] || {
    id: 'p1',
    name: 'Bruno',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: '2.5 yrs',
    weight: '28 kg',
    photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600',
    gender: 'Male',
    microchipId: '985141002348911',
    diet: 'Royal Canin Maxi Adult (300g twice daily)',
    allergies: 'Chicken protein sensitivity',
    emergencyContact: 'Dr. Aarav Mehta (+91 98230 11223)',
    statusSummary: 'Happy & Active',
    vaccinationsCount: 5,
    upcomingRemindersCount: 1,
    recentEvents: []
  };

  const [petId, setPetId] = useState(fallbackPet.id);
  const [bookingDate, setBookingDate] = useState('Tomorrow');
  const [timeSlot, setTimeSlot] = useState(provider?.slots[0] || '10:00 AM');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdRef, setCreatedRef] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [confirmedPayment, setConfirmedPayment] = useState<PaymentRecord | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  if (!isOpen || !provider) return null;

  const currentPet = pets.find((p) => p.id === petId) || selectedPet || fallbackPet;

  const handleOpenPaymentGateway = (e: React.FormEvent) => {
    e.preventDefault();
    const refCode = 'ZB-' + Math.floor(100000 + Math.random() * 900000);
    setCreatedRef(refCode);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (payment: PaymentRecord) => {
    setIsPaymentModalOpen(false);

    const refCode = createdRef || payment.bookingRef || 'ZB-' + Math.floor(100000 + Math.random() * 900000);
    const newBooking: Booking = {
      id: 'bk-' + Date.now(),
      petId: currentPet.id,
      petName: currentPet.name,
      petSpecies: currentPet.species,
      petBreed: currentPet.breed,
      petPhoto: currentPet.photoUrl,
      serviceCategory: provider.category,
      serviceTitle: provider.title,
      providerId: provider.id,
      providerName: provider.name,
      vanWorkerId: provider.category === 'mobile_grooming' ? 'usr-van-vikram' : undefined,
      vanWorkerName: provider.category === 'mobile_grooming' ? 'Vikram Pawar' : undefined,
      date: `${bookingDate}, ${timeSlot}`,
      timeSlot,
      location: `${provider.area}, ${provider.city}`,
      price: payment.amount,
      status: 'Confirmed',
      paymentId: payment.id,
      transactionId: payment.transactionId,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentMethod === 'pay_later' ? 'Pay Later' : 'Paid',
      createdAt: new Date().toISOString().split('T')[0],
      bookingRef: refCode,
      notes: notes.trim(),
      isMobileService: provider.category === 'mobile_grooming'
    };

    // Update payment reference
    const finalizedPayment: PaymentRecord = {
      ...payment,
      bookingId: newBooking.id,
      bookingRef: refCode,
      petId: currentPet.id,
      petName: currentPet.name,
      petSpecies: currentPet.species,
      petBreed: currentPet.breed
    };

    setConfirmedBooking(newBooking);
    setConfirmedPayment(finalizedPayment);

    if (onAddPayment) {
      onAddPayment(finalizedPayment);
    }
    onConfirmBooking(newBooking);
    setIsSuccess(true);
  };

  const handleFinish = () => {
    setIsSuccess(false);
    setConfirmedBooking(null);
    setConfirmedPayment(null);
    onClose();
  };

  const paymentIntent: PaymentIntentDetails = {
    bookingRef: createdRef,
    serviceTitle: provider.title,
    serviceCategory: provider.category,
    providerId: provider.id,
    providerName: provider.name,
    petId: currentPet.id,
    petName: currentPet.name,
    petSpecies: currentPet.species,
    petBreed: currentPet.breed,
    petPhoto: currentPet.photoUrl,
    date: bookingDate,
    timeSlot,
    location: `${provider.area}, ${provider.city}`,
    priceNumber: provider.priceNumber,
    isMobileService: provider.category === 'mobile_grooming'
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-[#fbf9f5] w-full max-w-[560px] rounded-3xl shadow-2xl border border-[#e5e0d8] overflow-hidden my-auto animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-6 py-4 bg-[#fbf9f5] border-b border-[#efeeea] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#895100]">calendar_month</span>
              <h2 className="font-quicksand font-bold text-xl text-[#895100]">
                {isSuccess ? 'Booking Confirmed!' : 'Book Pet Service'}
              </h2>
            </div>
            <button
              onClick={handleFinish}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#544434] hover:bg-[#efeeea] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {isSuccess ? (
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#c2edca] text-[#294e35] mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl filled-icon">check_circle</span>
              </div>

              <div>
                <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                  Appointment Confirmed
                </h3>
                <p className="text-sm text-[#544434] mt-1.5">
                  Booking Reference: <strong className="text-[#895100]">{createdRef}</strong>
                </p>
                {confirmedPayment && (
                  <p className="text-xs text-emerald-700 font-semibold mt-1">
                    {confirmedPayment.paymentMethod === 'pay_later'
                      ? '● Pay Later: To be settled upon Doorstep arrival'
                      : `● Verified Payment: ${confirmedPayment.transactionId}`}
                  </p>
                )}
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#e5e0d8] text-left space-y-2 text-xs">
                <div className="flex justify-between pb-2 border-b border-[#f5f3ef]">
                  <span className="text-[#877462]">Pet:</span>
                  <span className="font-bold text-[#1b1c1a]">{currentPet.name} ({currentPet.breed})</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#f5f3ef]">
                  <span className="text-[#877462]">Provider:</span>
                  <span className="font-bold text-[#1b1c1a]">{provider.name}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#f5f3ef]">
                  <span className="text-[#877462]">Schedule:</span>
                  <span className="font-bold text-[#41674b]">{bookingDate} • {timeSlot}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-[#877462]">Total Amount:</span>
                  <span className="font-bold text-[#895100]">
                    ₹{confirmedPayment?.amount || provider.priceNumber}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {confirmedPayment && (
                  <button
                    type="button"
                    onClick={() => setIsReceiptModalOpen(true)}
                    className="flex-1 py-3 rounded-full bg-white border border-[#dac2ae] text-[#895100] font-bold text-xs hover:bg-[#ffeed9] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                    <span>View Official Receipt</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleFinish}
                  className="flex-1 py-3 rounded-full bg-[#ff9f1c] hover:bg-[#ff8f00] text-[#683c00] font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Done &amp; Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleOpenPaymentGateway} className="p-6 space-y-5">
              {/* Provider Brief */}
              <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-[#e5e0d8]">
                <img
                  src={provider.image}
                  alt={provider.name}
                  className="w-14 h-14 rounded-xl object-cover border border-[#dac2ae]"
                />
                <div className="flex-grow">
                  <h4 className="font-quicksand font-bold text-base text-[#1b1c1a]">
                    {provider.name}
                  </h4>
                  <p className="text-xs text-[#544434]">{provider.title}</p>
                  <div className="text-xs font-bold text-[#895100] mt-0.5">
                    {provider.priceFormatted}
                  </div>
                </div>
              </div>

              {/* Select Pet */}
              <div>
                <label className="block text-xs font-bold text-[#00164d] mb-1.5">
                  Select Pet
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {pets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPetId(p.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        petId === p.id
                          ? 'border-[#ff9f1c] bg-[#ffdcbc]/30'
                          : 'border-[#dac2ae] bg-white hover:bg-[#efeeea]'
                      }`}
                    >
                      <img src={p.photoUrl} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-bold text-[#1b1c1a]">{p.name}</div>
                        <div className="text-[10px] text-[#544434]">{p.breed.split(' ')[0]}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Date */}
              <div>
                <label className="block text-xs font-bold text-[#00164d] mb-1.5">
                  Preferred Day
                </label>
                <div className="flex gap-2">
                  {provider.availableDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setBookingDate(day)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        bookingDate === day
                          ? 'bg-[#895100] text-white shadow-xs'
                          : 'bg-white border border-[#dac2ae] text-[#544434] hover:bg-[#efeeea]'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Slot */}
              <div>
                <label className="block text-xs font-bold text-[#00164d] mb-1.5">
                  Available Time Slot
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {provider.slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`p-2 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-all ${
                        timeSlot === slot
                          ? 'border-[#41674b] bg-[#c2edca]/40 text-[#294e35] font-bold'
                          : 'border-[#dac2ae] bg-white text-[#544434] hover:bg-[#efeeea]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-bold text-[#00164d] mb-1">
                  Special Care Instructions (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Sensitive ears, gentle grooming, nervous with hair dryers..."
                  rows={2}
                  className="w-full bg-white border border-[#dac2ae] rounded-xl px-3 py-2 text-xs text-[#1b1c1a] focus:ring-2 focus:ring-[#895100] focus:outline-none resize-none"
                />
              </div>

              {/* Price Summary */}
              <div className="bg-[#efeeea] p-3.5 rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <span className="text-[#544434] font-medium block">Total Service Fee</span>
                  <span className="text-[10px] text-[#877462]">Coupons &amp; payment options on next step</span>
                </div>
                <span className="font-quicksand font-bold text-base text-[#895100]">
                  ₹{provider.priceNumber}
                </span>
              </div>

              {/* Submit to Payment Gateway */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 rounded-full border border-[#dac2ae] text-[#544434] hover:bg-[#efeeea] font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-full bg-[#ff9f1c] hover:bg-[#ff8f00] text-[#683c00] font-bold text-xs shadow-md transition-all cursor-pointer active:translate-y-0.5 flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  <span>Proceed to Payment</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        intent={paymentIntent}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentCancel={() => setIsPaymentModalOpen(false)}
      />

      {/* Official Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        payment={confirmedPayment}
      />
    </>
  );
};

