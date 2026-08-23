import React, { useState } from 'react';
import { Booking, PaymentRecord } from '../types';
import { ReceiptModal } from './payment/ReceiptModal';
import { PetParentPaymentsView } from './payment/PetParentPaymentsView';

interface HistoryViewProps {
  bookings?: Booking[];
  payments?: PaymentRecord[];
  onBookNewService?: () => void;
  onBookAgain?: (booking: Booking) => void;
  onExploreServices?: () => void;
  onRequestRefund?: (paymentId: string, reason: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  bookings = [],
  payments = [],
  onBookNewService,
  onBookAgain,
  onExploreServices,
  onRequestRefund
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'bookings' | 'payments'>('bookings');
  const [filter, setFilter] = useState<'all' | 'Confirmed' | 'Completed'>('all');
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentRecord | null>(null);

  const safeBookings = bookings || [];
  const filteredBookings = safeBookings.filter(
    (b) => filter === 'all' || b.status === filter
  );

  const handleBookClick = () => {
    if (onBookNewService) {
      onBookNewService();
    } else if (onExploreServices) {
      onExploreServices();
    }
  };

  const handleViewBookingReceipt = (booking: Booking) => {
    // Check if there is a matching payment record
    const match = payments.find((p) => p.bookingRef === booking.bookingRef || p.bookingId === booking.id || p.id === booking.paymentId);
    if (match) {
      setSelectedReceiptPayment(match);
    } else {
      // Synthesize payment record from booking
      const syntheticPayment: PaymentRecord = {
        id: booking.paymentId || `pay-${booking.id}`,
        paymentId: booking.paymentId || `PAY-ZB-${Math.floor(100000 + Math.random() * 900000)}`,
        transactionId: booking.transactionId || `TXN-ZB-${Math.floor(100000 + Math.random() * 900000)}`,
        invoiceNumber: `INV-2026-${booking.bookingRef ? booking.bookingRef.replace('ZB-', '') : '000000'}`,
        userId: 'usr-parent-1',
        userName: 'Aarav Mehta',
        userEmail: 'aarav.mehta@zooby.care',
        userPhone: '+91 98201 22334',
        amount: booking.price,
        baseFare: Math.round(booking.price / 1.18),
        discount: 0,
        taxes: Math.round(booking.price - booking.price / 1.18),
        platformFee: Math.round(booking.price * 0.1),
        providerPayout: Math.round(booking.price * 0.9),
        paymentMethod: (booking.paymentMethod as any) || 'upi',
        paymentMethodDetails: {
          brandOrApp: 'UPI / GPay',
          maskedAccount: 'aarav@okaxis'
        },
        paymentStatus: booking.paymentStatus === 'Pay Later' ? 'Pending' : 'Successful',
        refundStatus: 'None',
        bookingId: booking.id,
        bookingRef: booking.bookingRef,
        serviceTitle: booking.serviceTitle,
        serviceCategory: booking.serviceCategory,
        providerId: booking.providerId,
        providerName: booking.providerName,
        petId: booking.petId,
        petName: booking.petName,
        petSpecies: booking.petSpecies,
        petBreed: booking.petBreed,
        createdAt: booking.createdAt || new Date().toISOString().split('T')[0],
        paidAt: booking.paymentStatus === 'Pay Later' ? undefined : `${booking.createdAt || '2026-03-24'} 10:15 AM`
      };
      setSelectedReceiptPayment(syntheticPayment);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-quicksand font-bold text-3xl md:text-4xl text-[#895100]">
            Bookings &amp; Financials
          </h1>
          <p className="text-sm md:text-base text-[#544434] mt-1">
            Track appointments, instant UPI/Card receipts, and payment transactions across Zooby.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBookClick}
            className="bg-[#ff9f1c] hover:bg-[#ff8f00] text-[#683c00] px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Book New Service</span>
          </button>
        </div>
      </div>

      {/* Main Tab Toggle: Bookings vs Invoices/Payments */}
      <div className="flex border-b border-[#efeeea] gap-8">
        <button
          onClick={() => setActiveMainTab('bookings')}
          className={`pb-3 font-quicksand font-bold text-sm transition-all relative cursor-pointer ${
            activeMainTab === 'bookings'
              ? 'text-[#895100] border-b-2 border-[#895100]'
              : 'text-[#877462] hover:text-[#1b1c1a]'
          }`}
        >
          <span>Appointments &amp; Service History ({safeBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('payments')}
          className={`pb-3 font-quicksand font-bold text-sm transition-all relative cursor-pointer ${
            activeMainTab === 'payments'
              ? 'text-[#895100] border-b-2 border-[#895100]'
              : 'text-[#877462] hover:text-[#1b1c1a]'
          }`}
        >
          <span>Payment Receipts &amp; Refunds ({payments.length})</span>
        </button>
      </div>

      {activeMainTab === 'payments' ? (
        <PetParentPaymentsView
          payments={payments}
          onRequestRefund={onRequestRefund}
        />
      ) : (
        <div className="space-y-6">
          {/* Filter Tabs */}
          <div className="flex gap-2 bg-white p-2 rounded-2xl border border-[#e5e0d8] shadow-xs w-fit">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'all' ? 'bg-[#895100] text-white shadow-xs' : 'text-[#544434] hover:bg-[#efeeea]'
              }`}
            >
              All Bookings ({safeBookings.length})
            </button>
            <button
              onClick={() => setFilter('Confirmed')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'Confirmed' ? 'bg-[#41674b] text-white shadow-xs' : 'text-[#544434] hover:bg-[#efeeea]'
              }`}
            >
              Upcoming / Confirmed
            </button>
            <button
              onClick={() => setFilter('Completed')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'Completed' ? 'bg-[#475b9c] text-white shadow-xs' : 'text-[#544434] hover:bg-[#efeeea]'
              }`}
            >
              Completed
            </button>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#e5e0d8] text-[#877462] space-y-3">
                <span className="material-symbols-outlined text-5xl text-[#dac2ae]">event_busy</span>
                <p className="text-sm font-medium">No bookings found in this category.</p>
              </div>
            ) : (
              filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl p-6 border border-[#e5e0d8] shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-5"
                >
                  {/* Pet & Service Details */}
                  <div className="flex items-start gap-4">
                    <img
                      src={b.petPhoto}
                      alt={b.petName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#ff9f1c] shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            b.status === 'Confirmed'
                              ? 'bg-[#c2edca] text-[#294e35]'
                              : 'bg-[#dce1ff] text-[#314685]'
                          }`}
                        >
                          {b.status}
                        </span>
                        <span className="text-xs text-[#877462]">Ref: {b.bookingRef}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            b.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.paymentStatus === 'Pay Later'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          ● {b.paymentStatus || 'Paid'}
                        </span>
                      </div>

                      <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a]">
                        {b.serviceTitle} for {b.petName}
                      </h3>
                      <p className="text-xs text-[#544434] mt-0.5">
                        {b.providerName} • {b.location}
                      </p>
                      {b.notes && (
                        <p className="text-xs text-[#877462] italic mt-1">
                          Note: "{b.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Schedule & Price */}
                  <div className="flex flex-col md:items-end gap-1 text-left md:text-right w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-[#efeeea]">
                    <div className="text-sm font-bold text-[#1b1c1a] flex items-center md:justify-end gap-1.5">
                      <span className="material-symbols-outlined text-[#475b9c] text-sm">schedule</span>
                      <span>{b.date}</span>
                    </div>
                    <span className="font-quicksand font-bold text-lg text-[#895100]">
                      ₹{b.price}
                    </span>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleViewBookingReceipt(b)}
                        className="text-xs font-bold text-[#895100] hover:bg-[#ffeed9] px-3.5 py-1.5 bg-[#fbf9f5] border border-[#ebdcc4] rounded-full cursor-pointer flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                        <span>View Receipt</span>
                      </button>

                      {b.status === 'Completed' && (
                        <button
                          onClick={() => alert(`Thank you for rating ${b.providerName} 5 Stars!`)}
                          className="text-xs font-bold text-[#895100] hover:underline px-3 py-1 bg-[#ffdcbc]/40 rounded-full cursor-pointer"
                        >
                          Rate &amp; Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedReceiptPayment}
        onClose={() => setSelectedReceiptPayment(null)}
        payment={selectedReceiptPayment}
      />
    </div>
  );
};

