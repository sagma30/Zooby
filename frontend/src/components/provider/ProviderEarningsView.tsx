import React, { useState } from 'react';
import { PaymentRecord, ProviderPayoutRecord } from '../../types';
import { INITIAL_PROVIDER_PAYOUTS } from '../../data/paymentMockData';
import { ReceiptModal } from '../payment/ReceiptModal';

interface ProviderEarningsViewProps {
  providerId?: string;
  providerName?: string;
  payments?: PaymentRecord[];
}

export const ProviderEarningsView: React.FC<ProviderEarningsViewProps> = ({
  providerId = 'prov-happy-tails',
  providerName = 'Happy Tails Clinic & Mobile Care',
  payments = []
}) => {
  const [payoutsList, setPayoutsList] = useState<ProviderPayoutRecord[]>(INITIAL_PROVIDER_PAYOUTS);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('HDFC Bank (•••• 4821)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentRecord | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter provider-relevant transactions or display all clinic payments
  const providerPayments = payments.filter((p) => p.paymentStatus === 'Successful');
  const grossEarnings = providerPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalCommission = providerPayments.reduce((sum, p) => sum + p.platformFee, 0);
  const netEarnings = providerPayments.reduce((sum, p) => sum + p.providerPayout, 0);
  const totalCompletedPayouts = payoutsList
    .filter((p) => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const availableBalance = Math.max(0, netEarnings - totalCompletedPayouts);

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0 || amt > availableBalance) {
      showToast('Please enter a valid withdrawal amount within your available balance.');
      return;
    }

    const newPayout: ProviderPayoutRecord = {
      id: `payout-${Date.now()}`,
      providerId,
      providerName,
      amount: amt,
      status: 'Pending',
      bankName: 'HDFC Bank',
      accountLast4: '4821',
      referenceNumber: `NEFT-${Math.floor(10000000 + Math.random() * 90000000)}`,
      requestedAt: 'Just now'
    };

    setPayoutsList([newPayout, ...payoutsList]);
    setIsWithdrawModalOpen(false);
    setWithdrawAmount('');
    showToast(`Payout request of ₹${amt.toLocaleString('en-IN')} submitted for banking processing!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#1b1c1a] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-base text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
            Earnings &amp; Payout Settlements
          </h1>
          <p className="text-xs text-[#877462]">
            Review your net service income, platform fee deductions (10%), and direct bank disbursements.
          </p>
        </div>

        <button
          onClick={() => {
            setWithdrawAmount(String(availableBalance));
            setIsWithdrawModalOpen(true);
          }}
          disabled={availableBalance <= 0}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 ${
            availableBalance > 0
              ? 'bg-[#895100] hover:bg-[#683c00] text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span className="material-symbols-outlined text-base">account_balance</span>
          <span>Withdraw Available Balance (₹{availableBalance.toLocaleString('en-IN')})</span>
        </button>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#ebdcc4] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-[#877462] uppercase tracking-wider block">
            Gross Service Revenue
          </span>
          <p className="text-2xl font-bold font-quicksand text-[#1b1c1a]">
            ₹{grossEarnings.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#544434]">{providerPayments.length} Completed Bookings</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#ebdcc4] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-[#877462] uppercase tracking-wider block">
            Zooby Platform Fee (10%)
          </span>
          <p className="text-2xl font-bold font-quicksand text-rose-700">
            -₹{totalCommission.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#544434]">Includes 24/7 support &amp; payment gateway</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#ebdcc4] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-[#877462] uppercase tracking-wider block">
            Total Net Earnings
          </span>
          <p className="text-2xl font-bold font-quicksand text-emerald-700">
            ₹{netEarnings.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#544434]">90% provider take-home rate</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#ffeed9] border border-[#ffdcbc] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-[#895100] uppercase tracking-wider block">
            Available For Payout
          </span>
          <p className="text-2xl font-bold font-quicksand text-[#895100]">
            ₹{availableBalance.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#683c00] font-semibold">Ready for NEFT / IMPS transfer</p>
        </div>
      </div>

      {/* Payout Settlements & History Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#ebdcc4] shadow-xs space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="font-quicksand font-bold text-lg text-[#1b1c1a]">
            Bank Settlement History
          </h2>
          <span className="text-xs text-[#877462]">Primary: HDFC Bank •••• 4821</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fbf9f5] text-[#877462] uppercase tracking-wider font-bold border-y border-[#efeeea]">
              <tr>
                <th className="py-3 px-4">Payout Ref</th>
                <th className="py-3 px-4">Destination Bank</th>
                <th className="py-3 px-4">Amount Disbursed</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Requested Date</th>
                <th className="py-3 px-4">Settled Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efeeea]">
              {payoutsList.map((p) => (
                <tr key={p.id} className="hover:bg-[#fdfcfa] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#895100]">{p.referenceNumber}</td>
                  <td className="py-3 px-4 font-semibold text-[#1b1c1a]">
                    {p.bankName} (•••• {p.accountLast4})
                  </td>
                  <td className="py-3 px-4 font-bold text-sm text-[#1b1c1a]">
                    ₹{p.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        p.status === 'Completed'
                          ? 'bg-[#c2edca] text-[#294e35]'
                          : 'bg-[#ffeed9] text-[#895100]'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#877462]">{p.requestedAt}</td>
                  <td className="py-3 px-4 text-[#877462]">{p.processedAt || 'Pending settlement'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service-by-Service Earnings Ledger */}
      <div className="bg-white rounded-3xl p-6 border border-[#ebdcc4] shadow-xs space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="font-quicksand font-bold text-lg text-[#1b1c1a]">
            Completed Service Revenue Breakdown
          </h2>
          <span className="text-xs text-[#877462]">{providerPayments.length} total entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fbf9f5] text-[#877462] uppercase tracking-wider font-bold border-y border-[#efeeea]">
              <tr>
                <th className="py-3 px-4">Service &amp; Pet</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Gross Fare</th>
                <th className="py-3 px-4">Platform Fee (10%)</th>
                <th className="py-3 px-4">Your Net Share (90%)</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efeeea]">
              {providerPayments.map((p) => (
                <tr key={p.id} className="hover:bg-[#fdfcfa] transition-colors">
                  <td className="py-3.5 px-4 space-y-0.5">
                    <p className="font-bold text-[#1b1c1a]">{p.serviceTitle}</p>
                    <p className="text-[11px] text-[#877462]">Pet: {p.petName || 'Bruno'}</p>
                  </td>
                  <td className="py-3.5 px-4 space-y-0.5">
                    <p className="font-semibold text-[#1b1c1a]">{p.userName}</p>
                    <p className="text-[11px] text-[#877462]">{p.paidAt || p.createdAt}</p>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#1b1c1a]">₹{p.amount}</td>
                  <td className="py-3.5 px-4 text-rose-700 font-semibold">-₹{p.platformFee}</td>
                  <td className="py-3.5 px-4 font-bold text-sm text-emerald-700">₹{p.providerPayout}</td>
                  <td className="py-3.5 px-4 font-mono text-[#877462] capitalize">
                    {p.paymentMethodDetails?.brandOrApp || p.paymentMethod}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedReceiptPayment(p)}
                      className="px-3 py-1 rounded-lg bg-[#fbf9f5] border border-[#dac2ae] text-xs font-bold text-[#895100] hover:bg-[#ffeed9] cursor-pointer"
                    >
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Request Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#ebdcc4] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#895100]">account_balance</span>
                <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a]">
                  Request Payout Disbursement
                </h3>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#877462] hover:bg-[#efeeea]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-[#fbf9f5] border border-[#efeeea] text-xs space-y-1">
                <div className="flex justify-between text-[#544434]">
                  <span>Eligible Available Balance:</span>
                  <span className="font-bold text-[#895100]">₹{availableBalance.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#877462]">
                  <span>Disbursement Account:</span>
                  <span className="font-bold text-[#1b1c1a]">HDFC Bank (•••• 4821)</span>
                </div>
                <div className="flex justify-between text-[#877462]">
                  <span>Processing Time:</span>
                  <span>Same-day NEFT batch</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#877462]">Amount to Transfer (₹)</label>
                <input
                  type="number"
                  min={100}
                  max={availableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#dac2ae] text-sm font-bold text-[#1b1c1a] focus:ring-2 focus:ring-[#895100] focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full bg-[#efeeea] text-[#544434] font-bold text-xs cursor-pointer hover:bg-[#e2ded6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#895100] hover:bg-[#683c00] text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Submit Request
                </button>
              </div>
            </form>
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
