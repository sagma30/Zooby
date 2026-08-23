import React, { useState } from 'react';
import { PaymentRecord, ProviderPayoutRecord } from '../../types';
import { ReceiptModal } from '../payment/ReceiptModal';
import { INITIAL_PROVIDER_PAYOUTS } from '../../data/paymentMockData';

interface AdminPaymentsViewProps {
  payments: PaymentRecord[];
  onUpdatePayment?: (updatedPayment: PaymentRecord) => void;
}

export const AdminPaymentsView: React.FC<AdminPaymentsViewProps> = ({
  payments = [],
  onUpdatePayment
}) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'payouts' | 'analytics'>('transactions');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Successful' | 'Refunded' | 'Failed' | 'Pending'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'upi' | 'card' | 'netbanking' | 'wallet' | 'pay_later'>('all');
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentRecord | null>(null);
  const [auditPayment, setAuditPayment] = useState<PaymentRecord | null>(null);

  // Admin Refund Action Modal State
  const [refundModalPayment, setRefundModalPayment] = useState<PaymentRecord | null>(null);
  const [refundAmountType, setRefundAmountType] = useState<'full' | 'partial'>('full');
  const [customRefundAmount, setCustomRefundAmount] = useState<number>(0);
  const [adminRefundReason, setAdminRefundReason] = useState('Customer dissatisfaction / service cancellation request');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Payouts state
  const [payouts, setPayouts] = useState<ProviderPayoutRecord[]>(INITIAL_PROVIDER_PAYOUTS);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Financial KPIs
  const successfulPayments = payments.filter((p) => p.paymentStatus === 'Successful');
  const totalPlatformGross = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  const platformCommissions = successfulPayments.reduce((sum, p) => sum + p.platformFee, 0);
  const providerNetEarnings = successfulPayments.reduce((sum, p) => sum + p.providerPayout, 0);
  const totalRefundsProcessed = payments
    .filter((p) => p.refundStatus === 'Refunded')
    .reduce((sum, p) => sum + (p.refundAmount || p.amount), 0);
  const failedCount = payments.filter((p) => p.paymentStatus === 'Failed').length;
  const successRate = payments.length > 0
    ? Math.round((successfulPayments.length / payments.length) * 100)
    : 100;

  // Filtered transactions
  const filteredPayments = payments.filter((p) => {
    if (statusFilter !== 'all' && p.paymentStatus !== statusFilter) return false;
    if (methodFilter !== 'all' && p.paymentMethod !== methodFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTxn = p.transactionId.toLowerCase().includes(q) || p.paymentId.toLowerCase().includes(q) || p.invoiceNumber.toLowerCase().includes(q);
      const matchUser = p.userName.toLowerCase().includes(q) || p.userEmail.toLowerCase().includes(q);
      const matchService = p.serviceTitle.toLowerCase().includes(q);
      const matchProvider = (p.providerName || '').toLowerCase().includes(q);
      const matchPet = (p.petName || '').toLowerCase().includes(q);
      return matchTxn || matchUser || matchService || matchProvider || matchPet;
    }
    return true;
  });

  // Handle Admin Process Refund
  const handleExecuteRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalPayment) return;

    const finalRefundAmt = refundAmountType === 'full'
      ? refundModalPayment.amount
      : Math.min(customRefundAmount, refundModalPayment.amount);

    const updated: PaymentRecord = {
      ...refundModalPayment,
      paymentStatus: 'Refunded',
      refundStatus: 'Refunded',
      refundAmount: finalRefundAmt,
      refundReason: adminRefundReason,
      refundDate: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    };

    if (onUpdatePayment) {
      onUpdatePayment(updated);
    }

    showToast(`Refund of ₹${finalRefundAmt} executed for ${refundModalPayment.transactionId}`);
    setRefundModalPayment(null);
  };

  // Handle Approve Payout Batch
  const handleProcessPayoutBatch = (payoutId: string) => {
    setPayouts((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: 'Completed',
              processedAt: new Date().toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })
            }
          : p
      )
    );
    showToast('Provider payout batch transfer authorized and settled via Banking Gateway.');
  };

  return (
    <div className="space-y-6">
      {/* Admin Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#1b1c1a] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-base text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-quicksand font-bold text-2xl text-[#1b1c1a] flex items-center gap-2">
            <span>Platform Financials &amp; Payments</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Gateway Active
            </span>
          </h1>
          <p className="text-xs text-[#877462]">
            Monitor platform gross volume, fee revenues, transaction audit logs, and automated provider settlements.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#fbf9f5] p-1 rounded-2xl border border-[#ebdcc4] text-xs font-bold">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'transactions' ? 'bg-[#895100] text-white shadow-2xs' : 'text-[#544434] hover:bg-[#efeeea]'
            }`}
          >
            Transactions ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'payouts' ? 'bg-[#895100] text-white shadow-2xs' : 'text-[#544434] hover:bg-[#efeeea]'
            }`}
          >
            Provider Payouts ({payouts.filter((p) => p.status !== 'Completed').length} Pending)
          </button>
        </div>
      </div>

      {/* Financial KPI Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-[#ebdcc4] space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-[#877462] uppercase tracking-wider block">
            Platform Gross GMV
          </span>
          <p className="text-xl font-bold font-quicksand text-[#895100]">
            ₹{totalPlatformGross.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[#544434]">All successful bookings</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ebdcc4] space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-[#877462] uppercase tracking-wider block">
            Platform Commission (10%)
          </span>
          <p className="text-xl font-bold font-quicksand text-emerald-700">
            ₹{platformCommissions.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[#544434]">Zooby net revenue</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ebdcc4] space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-[#877462] uppercase tracking-wider block">
            Provider Disbursals
          </span>
          <p className="text-xl font-bold font-quicksand text-[#1b1c1a]">
            ₹{providerNetEarnings.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[#544434]">Net clinic &amp; fleet earnings</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ebdcc4] space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-[#877462] uppercase tracking-wider block">
            Refunds Settled
          </span>
          <p className="text-xl font-bold font-quicksand text-[#ba1a1a]">
            ₹{totalRefundsProcessed.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[#544434]">Reversed to pet parents</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ebdcc4] space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-[#877462] uppercase tracking-wider block">
            Success Rate
          </span>
          <p className="text-xl font-bold font-quicksand text-emerald-700">
            {successRate}%
          </p>
          <p className="text-[10px] text-[#544434]">{failedCount} failed attempts</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ebdcc4] space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-[#877462] uppercase tracking-wider block">
            Active Gateways
          </span>
          <p className="text-xl font-bold font-quicksand text-[#544434]">
            UPI / Cards
          </p>
          <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">check_circle</span>
            <span>All Channels Up</span>
          </p>
        </div>
      </div>

      {/* TAB 1: TRANSACTIONS VIEW */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-3xl p-5 border border-[#ebdcc4] shadow-xs space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center">
            <div className="relative w-full lg:w-96">
              <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[#877462] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Txn ID, customer, provider, pet..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#fbf9f5] border border-[#dac2ae] text-xs text-[#1b1c1a] focus:outline-none focus:border-[#895100]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-[#dac2ae] bg-[#fbf9f5] text-xs font-bold text-[#544434] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="Successful">Successful</option>
                <option value="Refunded">Refunded</option>
                <option value="Failed">Failed</option>
              </select>

              {/* Method Filter */}
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-[#dac2ae] bg-[#fbf9f5] text-xs font-bold text-[#544434] focus:outline-none"
              >
                <option value="all">All Payment Methods</option>
                <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                <option value="card">Cards (Visa / MasterCard)</option>
                <option value="netbanking">Net Banking</option>
                <option value="wallet">Wallets</option>
                <option value="pay_later">Pay Later (Doorstep)</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fbf9f5] text-[#877462] uppercase tracking-wider font-bold border-y border-[#efeeea]">
                <tr>
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4">Pet Parent / User</th>
                  <th className="py-3 px-4">Service &amp; Provider</th>
                  <th className="py-3 px-4">Financials (Gross / Fee / Payout)</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efeeea]">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[#fdfcfa] transition-colors">
                    {/* Txn ID */}
                    <td className="py-3.5 px-4 space-y-0.5">
                      <p className="font-mono font-bold text-[#895100]">{payment.transactionId}</p>
                      <p className="text-[11px] text-[#877462]">{payment.paidAt || payment.createdAt}</p>
                      <p className="text-[10px] text-[#877462] font-mono">{payment.invoiceNumber}</p>
                    </td>

                    {/* Pet Parent */}
                    <td className="py-3.5 px-4 space-y-0.5">
                      <p className="font-bold text-[#1b1c1a]">{payment.userName}</p>
                      <p className="text-[11px] text-[#877462]">{payment.userEmail}</p>
                      <p className="text-[10px] text-[#544434]">Pet: <strong>{payment.petName || 'Bruno'}</strong></p>
                    </td>

                    {/* Service & Provider */}
                    <td className="py-3.5 px-4 space-y-0.5">
                      <p className="font-semibold text-[#1b1c1a]">{payment.serviceTitle}</p>
                      <p className="text-[11px] text-[#877462]">{payment.providerName || 'Zooby Fleet'}</p>
                    </td>

                    {/* Financials Breakup */}
                    <td className="py-3.5 px-4 space-y-0.5">
                      <p className="font-bold text-sm text-[#1b1c1a]">₹{payment.amount}</p>
                      <div className="flex items-center gap-2 text-[10px] text-[#877462]">
                        <span>Fee: <strong className="text-emerald-700">₹{payment.platformFee}</strong></span>
                        <span>•</span>
                        <span>Net: <strong className="text-[#895100]">₹{payment.providerPayout}</strong></span>
                      </div>
                    </td>

                    {/* Method */}
                    <td className="py-3.5 px-4 space-y-0.5">
                      <p className="font-bold text-[#1b1c1a] capitalize">
                        {payment.paymentMethodDetails?.brandOrApp || payment.paymentMethod}
                      </p>
                      <p className="text-[11px] font-mono text-[#877462]">
                        {payment.paymentMethodDetails?.maskedAccount}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setAuditPayment(payment)}
                        title="Audit Log & Breakdown"
                        className="px-2.5 py-1 rounded-lg bg-[#fbf9f5] border border-[#dac2ae] text-[11px] font-bold text-[#544434] hover:bg-[#efeeea] cursor-pointer"
                      >
                        Audit
                      </button>

                      <button
                        onClick={() => setSelectedReceiptPayment(payment)}
                        title="View Official Receipt"
                        className="px-2.5 py-1 rounded-lg bg-[#ffeed9] text-[11px] font-bold text-[#895100] hover:bg-[#ffdcbc] cursor-pointer"
                      >
                        Receipt
                      </button>

                      {payment.paymentStatus === 'Successful' && payment.refundStatus !== 'Refunded' && (
                        <button
                          onClick={() => {
                            setRefundModalPayment(payment);
                            setCustomRefundAmount(payment.amount);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#ffdad6] text-[11px] font-bold text-[#ba1a1a] hover:bg-[#ffb4ab] cursor-pointer"
                        >
                          Refund
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

      {/* TAB 2: PROVIDER PAYOUTS & SETTLEMENTS */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-3xl p-6 border border-[#ebdcc4] shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-quicksand font-bold text-lg text-[#1b1c1a]">
                Provider Weekly Payout Batches &amp; Direct Bank Transfers
              </h2>
              <p className="text-xs text-[#877462]">
                Automated NEFT / IMPS settlements for verified clinics and mobile van technicians in Nashik.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {payouts.map((payout) => (
              <div key={payout.id} className="p-5 rounded-2xl border border-[#ebdcc4] bg-[#fbf9f5] space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-[#1b1c1a]">{payout.providerName}</h3>
                    <p className="text-xs text-[#877462]">
                      Bank: <strong>{payout.bankName}</strong> (•••• {payout.accountLast4})
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      payout.status === 'Completed'
                        ? 'bg-[#c2edca] text-[#294e35]'
                        : 'bg-[#ffeed9] text-[#895100]'
                    }`}
                  >
                    {payout.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#efeeea] text-xs space-y-1">
                  <div className="flex justify-between text-[#544434]">
                    <span>Payable Net Balance</span>
                    <span className="font-bold text-sm text-[#895100]">₹{payout.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#877462]">
                    <span>Reference</span>
                    <span className="font-mono">{payout.referenceNumber}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#877462]">
                    <span>Requested</span>
                    <span>{payout.requestedAt}</span>
                  </div>
                  {payout.processedAt && (
                    <div className="flex justify-between text-[11px] text-emerald-700 font-semibold">
                      <span>Disbursed</span>
                      <span>{payout.processedAt}</span>
                    </div>
                  )}
                </div>

                {payout.status !== 'Completed' && (
                  <button
                    onClick={() => handleProcessPayoutBatch(payout.id)}
                    className="w-full py-2 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] transition-colors cursor-pointer shadow-xs"
                  >
                    Authorize &amp; Transfer Payout
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedReceiptPayment}
        onClose={() => setSelectedReceiptPayment(null)}
        payment={selectedReceiptPayment}
      />

      {/* Audit Log Modal */}
      {auditPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[#ebdcc4] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#895100]">security</span>
                <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a]">
                  Payment Gateway Audit Trail
                </h3>
              </div>
              <button
                onClick={() => setAuditPayment(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#877462] hover:bg-[#efeeea]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#efeeea] space-y-2 text-xs font-mono">
              <p><strong>Transaction ID:</strong> {auditPayment.transactionId}</p>
              <p><strong>Gateway Auth ID:</strong> {auditPayment.paymentId}</p>
              <p><strong>Invoice Number:</strong> {auditPayment.invoiceNumber}</p>
              <p><strong>Booking Reference:</strong> {auditPayment.bookingRef || 'N/A'}</p>
              <p><strong>Created At:</strong> {auditPayment.createdAt}</p>
              <p><strong>Status:</strong> {auditPayment.paymentStatus}</p>
              <p><strong>Gross Fare:</strong> ₹{auditPayment.amount}</p>
              <p><strong>Zooby Commission:</strong> ₹{auditPayment.platformFee}</p>
              <p><strong>Provider Payout:</strong> ₹{auditPayment.providerPayout}</p>
              <p><strong>Security Token:</strong> SHA256-TOKEN-{auditPayment.id.toUpperCase()}</p>
              <p><strong>Risk Score:</strong> 0.02 (Very Low Risk - Approved)</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setAuditPayment(null)}
                className="px-5 py-2 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] cursor-pointer"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Refund Execution Modal */}
      {refundModalPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#ebdcc4] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ba1a1a]">published_with_changes</span>
                <h3 className="font-quicksand font-bold text-lg text-[#ba1a1a]">
                  Execute Platform Refund
                </h3>
              </div>
              <button
                onClick={() => setRefundModalPayment(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#877462] hover:bg-[#efeeea]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fbf9f5] border border-[#efeeea] text-xs space-y-1.5">
              <p><strong>Transaction:</strong> {refundModalPayment.transactionId}</p>
              <p><strong>Customer:</strong> {refundModalPayment.userName} ({refundModalPayment.userEmail})</p>
              <p><strong>Service:</strong> {refundModalPayment.serviceTitle}</p>
              <p><strong>Original Paid Fare:</strong> <span className="font-bold text-[#895100]">₹{refundModalPayment.amount}</span></p>
            </div>

            <form onSubmit={handleExecuteRefund} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#877462]">Refund Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRefundAmountType('full')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      refundAmountType === 'full'
                        ? 'border-[#ba1a1a] bg-rose-50 text-[#ba1a1a]'
                        : 'border-[#efeeea] bg-white text-[#544434]'
                    }`}
                  >
                    Full Refund (₹{refundModalPayment.amount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundAmountType('partial')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      refundAmountType === 'partial'
                        ? 'border-[#ba1a1a] bg-rose-50 text-[#ba1a1a]'
                        : 'border-[#efeeea] bg-white text-[#544434]'
                    }`}
                  >
                    Partial Refund
                  </button>
                </div>
              </div>

              {refundAmountType === 'partial' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#877462]">Custom Amount (₹)</label>
                  <input
                    type="number"
                    max={refundModalPayment.amount}
                    min={1}
                    value={customRefundAmount}
                    onChange={(e) => setCustomRefundAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#dac2ae] text-xs text-[#1b1c1a] focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#877462]">Reason for Refund</label>
                <select
                  value={adminRefundReason}
                  onChange={(e) => setAdminRefundReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#dac2ae] text-xs text-[#1b1c1a] focus:outline-none"
                >
                  <option value="Customer dissatisfaction / service cancellation request">Customer dissatisfaction / cancellation</option>
                  <option value="Provider / Van technician unavailable">Provider / Van technician unavailable</option>
                  <option value="Duplicate booking charge reversal">Duplicate booking charge reversal</option>
                  <option value="Goodwill platform credit adjustment">Goodwill platform credit adjustment</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundModalPayment(null)}
                  className="flex-1 py-2.5 rounded-full bg-[#efeeea] text-[#544434] font-bold text-xs cursor-pointer hover:bg-[#e2ded6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#ba1a1a] text-white font-bold text-xs cursor-pointer hover:bg-[#93000a] shadow-xs"
                >
                  Authorize Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
