import React, { useState } from 'react';
import { PaymentRecord, Booking } from '../../types';
import { ReceiptModal } from './ReceiptModal';

interface PetParentPaymentsViewProps {
  payments: PaymentRecord[];
  bookings?: Booking[];
  onNavigate?: (path: string) => void;
  onRequestRefund?: (paymentId: string, reason: string) => void;
}

export const PetParentPaymentsView: React.FC<PetParentPaymentsViewProps> = ({
  payments = [],
  bookings = [],
  onNavigate,
  onRequestRefund
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Successful' | 'Refunded' | 'Failed' | 'Pending'>('all');
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentRecord | null>(null);
  const [refundPromptPayment, setRefundPromptPayment] = useState<PaymentRecord | null>(null);
  const [refundReason, setRefundReason] = useState('Change of schedule / need to reschedule');
  const [refundSuccessToast, setRefundSuccessToast] = useState<string | null>(null);

  // Financial statistics calculation
  const successfulPayments = payments.filter((p) => p.paymentStatus === 'Successful');
  const totalSpent = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = payments
    .filter((p) => p.refundStatus === 'Refunded')
    .reduce((sum, p) => sum + (p.refundAmount || p.amount), 0);
  const pendingTransactions = payments.filter((p) => p.paymentStatus === 'Pending' || p.paymentMethod === 'pay_later').length;

  // Filtered payments list
  const filteredPayments = payments.filter((p) => {
    // Status filter
    if (statusFilter !== 'all' && p.paymentStatus !== statusFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = p.transactionId.toLowerCase().includes(q) || p.paymentId.toLowerCase().includes(q) || p.invoiceNumber.toLowerCase().includes(q);
      const matchService = p.serviceTitle.toLowerCase().includes(q);
      const matchPet = (p.petName || '').toLowerCase().includes(q);
      const matchProvider = (p.providerName || '').toLowerCase().includes(q);
      return matchId || matchService || matchPet || matchProvider;
    }
    return true;
  });

  const handleTriggerRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundPromptPayment) return;

    if (onRequestRefund) {
      onRequestRefund(refundPromptPayment.id, refundReason);
    }

    setRefundSuccessToast(`Refund request submitted for ${refundPromptPayment.transactionId}. Amount ₹${refundPromptPayment.amount} is being processed.`);
    setRefundPromptPayment(null);
    setTimeout(() => setRefundSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {refundSuccessToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#1b1c1a] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-base text-emerald-400">check_circle</span>
          <span>{refundSuccessToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ebdcc4] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#ffeed9] text-[#895100] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
            <h1 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
              Payments &amp; Billing History
            </h1>
          </div>
          <p className="text-xs text-[#877462]">
            View all verified Zooby transactions, download tax invoices, and track refunds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">verified_user</span>
            <span>100% RBI &amp; PCI-DSS Secure</span>
          </span>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#ebdcc4] space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-[#877462] uppercase tracking-wider block">
            Total Spent (Net)
          </span>
          <p className="text-xl font-bold font-quicksand text-[#895100]">
            ₹{totalSpent.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[#544434]">{successfulPayments.length} paid appointments</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ebdcc4] space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-[#877462] uppercase tracking-wider block">
            Refunds Credited
          </span>
          <p className="text-xl font-bold font-quicksand text-emerald-700">
            ₹{totalRefunded.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[#544434]">Direct bank/UPI reversals</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ebdcc4] space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-[#877462] uppercase tracking-wider block">
            Pay Later / Doorstep
          </span>
          <p className="text-xl font-bold font-quicksand text-[#1b1c1a]">
            {pendingTransactions}
          </p>
          <p className="text-[10px] text-[#544434]">Settled upon van arrival</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ebdcc4] space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-[#877462] uppercase tracking-wider block">
            Saved Payment Modes
          </span>
          <p className="text-xl font-bold font-quicksand text-[#544434]">
            3 Modes
          </p>
          <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">lock</span>
            <span>Tokenized &amp; Encrypted</span>
          </p>
        </div>
      </div>

      {/* Filters & Search Controls */}
      <div className="bg-white rounded-3xl p-5 border border-[#ebdcc4] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[#877462] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Txn ID, service, pet, invoice..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#fbf9f5] border border-[#dac2ae] text-xs text-[#1b1c1a] focus:outline-none focus:border-[#895100]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Transactions' },
              { id: 'Successful', label: 'Successful' },
              { id: 'Refunded', label: 'Refunded' },
              { id: 'Failed', label: 'Failed' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#895100] text-white shadow-2xs'
                    : 'bg-[#fbf9f5] text-[#544434] hover:bg-[#efeeea] border border-[#efeeea]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table / Cards */}
        {filteredPayments.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#ffeed9] text-[#895100] mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">receipt_long</span>
            </div>
            <h3 className="font-quicksand font-bold text-base text-[#1b1c1a]">
              No transactions match your search
            </h3>
            <p className="text-xs text-[#877462] max-w-sm mx-auto">
              Try adjusting your search keywords or clear your active filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fbf9f5] text-[#877462] uppercase tracking-wider font-bold border-y border-[#efeeea]">
                <tr>
                  <th className="py-3 px-4">Transaction &amp; Date</th>
                  <th className="py-3 px-4">Service &amp; Pet</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Invoice &amp; Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efeeea]">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[#fdfcfa] transition-colors">
                    {/* Txn ID & Date */}
                    <td className="py-4 px-4 space-y-0.5">
                      <p className="font-mono font-bold text-[#895100]">{payment.transactionId}</p>
                      <p className="text-[11px] text-[#877462]">{payment.paidAt || payment.createdAt}</p>
                      <p className="text-[10px] text-[#877462] font-mono">{payment.invoiceNumber}</p>
                    </td>

                    {/* Service & Pet */}
                    <td className="py-4 px-4 space-y-1">
                      <p className="font-bold text-[#1b1c1a]">{payment.serviceTitle}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#544434]">
                        <span className="material-symbols-outlined text-[13px] text-[#895100]">pets</span>
                        <span>{payment.petName || 'Bruno'}</span>
                        <span className="text-[#877462]">• {payment.providerName || 'Zooby Mobile Care'}</span>
                      </div>
                    </td>

                    {/* Payment Method */}
                    <td className="py-4 px-4 space-y-0.5">
                      <span className="font-bold text-[#1b1c1a] capitalize">
                        {payment.paymentMethodDetails?.brandOrApp || payment.paymentMethod}
                      </span>
                      <p className="text-[11px] text-[#877462] font-mono">
                        {payment.paymentMethodDetails?.maskedAccount || 'Encrypted'}
                      </p>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-sm text-[#1b1c1a]">₹{payment.amount}</p>
                      {payment.discount > 0 && (
                        <p className="text-[10px] text-emerald-700 font-semibold">
                          Saved ₹{payment.discount} ({payment.couponCode})
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          payment.paymentStatus === 'Successful'
                            ? 'bg-[#c2edca] text-[#294e35]'
                            : payment.paymentStatus === 'Refunded'
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : payment.paymentStatus === 'Failed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-[#ffeed9] text-[#895100]'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{payment.paymentStatus}</span>
                      </span>
                      {payment.refundStatus === 'Refunded' && (
                        <p className="text-[10px] text-[#ba1a1a] mt-0.5 font-medium">
                          Refunded ₹{payment.refundAmount || payment.amount}
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedReceiptPayment(payment)}
                        className="px-3 py-1 rounded-xl bg-[#fbf9f5] border border-[#dac2ae] text-[11px] font-bold text-[#895100] hover:bg-[#ffeed9] transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">receipt</span>
                        <span>Receipt</span>
                      </button>

                      {payment.paymentStatus === 'Successful' && payment.refundStatus !== 'Refunded' && (
                        <button
                          onClick={() => setRefundPromptPayment(payment)}
                          className="text-[11px] font-bold text-[#544434] hover:text-[#ba1a1a] transition-colors cursor-pointer"
                        >
                          Request Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official Printable Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedReceiptPayment}
        onClose={() => setSelectedReceiptPayment(null)}
        payment={selectedReceiptPayment}
      />

      {/* Pet Parent Refund Request Modal */}
      {refundPromptPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#ebdcc4] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a]">
                Request Cancellation &amp; Refund
              </h3>
              <button
                onClick={() => setRefundPromptPayment(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#877462] hover:bg-[#efeeea]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fbf9f5] border border-[#efeeea] text-xs space-y-1.5">
              <p><strong>Transaction:</strong> {refundPromptPayment.transactionId}</p>
              <p><strong>Service:</strong> {refundPromptPayment.serviceTitle}</p>
              <p><strong>Refundable Amount:</strong> <span className="text-[#895100] font-bold">₹{refundPromptPayment.amount}</span></p>
              <p className="text-[11px] text-[#877462]">
                Refund will be credited to original payment method ({refundPromptPayment.paymentMethodDetails?.brandOrApp || refundPromptPayment.paymentMethod}).
              </p>
            </div>

            <form onSubmit={handleTriggerRefund} className="space-y-3">
              <label className="text-xs font-bold text-[#877462] block">
                Reason for Refund Request
              </label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#dac2ae] text-xs text-[#1b1c1a] focus:outline-none"
              >
                <option value="Change of schedule / need to reschedule">Change of schedule / need to reschedule</option>
                <option value="Pet was unwell / emergency vet visit">Pet was unwell / emergency vet visit</option>
                <option value="Booked incorrect service category">Booked incorrect service category</option>
                <option value="Other personal reasons">Other personal reasons</option>
              </select>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundPromptPayment(null)}
                  className="flex-1 py-2.5 rounded-full bg-[#efeeea] text-[#544434] font-bold text-xs cursor-pointer hover:bg-[#e2ded6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#ba1a1a] text-white font-bold text-xs cursor-pointer hover:bg-[#93000a] shadow-xs"
                >
                  Confirm Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
