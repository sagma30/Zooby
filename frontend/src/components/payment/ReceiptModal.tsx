import React from 'react';
import { PaymentRecord } from '../../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentRecord | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  payment
}) => {
  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate a simple text-based or trigger browser print-to-pdf
    alert(`Receipt ${payment.invoiceNumber} downloaded as official PDF.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[620px] rounded-3xl shadow-2xl border border-[#e5e0d8] overflow-hidden my-auto animate-in zoom-in-95 duration-200 print:shadow-none print:border-none print:m-0 print:max-w-none">
        {/* Modal Top Bar (Hidden during print) */}
        <div className="px-6 py-4 bg-[#fbf9f5] border-b border-[#efeeea] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#895100]">receipt_long</span>
            <h2 className="font-quicksand font-bold text-lg text-[#895100]">
              Official Zooby Payment Receipt
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Print Receipt"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#544434] hover:bg-[#efeeea] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">print</span>
            </button>
            <button
              onClick={handleDownload}
              title="Download PDF"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#544434] hover:bg-[#efeeea] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">download</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#544434] hover:bg-[#efeeea] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Printable Receipt Canvas */}
        <div className="p-6 sm:p-8 space-y-6 text-[#1b1c1a] bg-white">
          {/* Header Brand & Status */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#ebdcc4]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#895100] text-white flex items-center justify-center font-bold text-xl shadow-xs">
                <span className="material-symbols-outlined text-[26px]">pets</span>
              </div>
              <div>
                <h1 className="font-quicksand font-bold text-2xl text-[#895100] leading-tight">
                  Zooby Pet Care
                </h1>
                <p className="text-xs text-[#877462]">
                  Nashik Verified Pet Health &amp; Mobile Van Network
                </p>
                <p className="text-[10px] text-[#877462]">GSTIN: 27AABCZ9921K1Z4 • CIN: U85100MH2024PTC192831</p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  payment.paymentStatus === 'Successful'
                    ? 'bg-[#c2edca] text-[#294e35]'
                    : payment.paymentStatus === 'Refunded'
                    ? 'bg-[#ffdad6] text-[#ba1a1a]'
                    : payment.paymentStatus === 'Processing'
                    ? 'bg-[#ffeed9] text-[#895100]'
                    : 'bg-[#efeeea] text-[#544434]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {payment.paymentStatus === 'Successful'
                    ? 'check_circle'
                    : payment.paymentStatus === 'Refunded'
                    ? 'published_with_changes'
                    : 'schedule'}
                </span>
                <span>{payment.paymentStatus.toUpperCase()}</span>
              </span>
              <p className="text-xs text-[#877462] mt-1 font-mono">{payment.invoiceNumber}</p>
            </div>
          </div>

          {/* Key Identifiers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#fbf9f5] border border-[#efeeea] text-xs">
            <div>
              <span className="text-[#877462] block text-[10px] uppercase font-bold">Date &amp; Time</span>
              <span className="font-bold text-[#1b1c1a]">{payment.paidAt || payment.createdAt}</span>
            </div>
            <div>
              <span className="text-[#877462] block text-[10px] uppercase font-bold">Transaction ID</span>
              <span className="font-bold font-mono text-[#895100] text-[11px] truncate block" title={payment.transactionId}>
                {payment.transactionId}
              </span>
            </div>
            <div>
              <span className="text-[#877462] block text-[10px] uppercase font-bold">Booking Ref</span>
              <span className="font-bold text-[#1b1c1a]">{payment.bookingRef || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[#877462] block text-[10px] uppercase font-bold">Payment Method</span>
              <span className="font-bold text-[#1b1c1a] capitalize">
                {payment.paymentMethodDetails?.brandOrApp || payment.paymentMethod}
              </span>
            </div>
          </div>

          {/* Billed To & Provider Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pb-4 border-b border-[#efeeea]">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#877462] uppercase tracking-wider block">
                Billed To (Pet Parent)
              </span>
              <p className="font-bold text-sm text-[#1b1c1a]">{payment.userName}</p>
              <p className="text-[#544434]">{payment.userEmail}</p>
              {payment.userPhone && <p className="text-[#544434]">{payment.userPhone}</p>}
              {payment.petName && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f4ebd9]/60 text-[#683c00] font-semibold text-[11px]">
                  <span className="material-symbols-outlined text-[14px]">pets</span>
                  <span>Pet Patient: <strong>{payment.petName}</strong> {payment.petBreed ? `(${payment.petBreed})` : ''}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#877462] uppercase tracking-wider block">
                Service Provider / Fleet Unit
              </span>
              <p className="font-bold text-sm text-[#1b1c1a]">{payment.providerName || 'Zooby Care Network'}</p>
              <p className="text-[#544434]">Verified Partner • Nashik Zone</p>
              <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                <span>Verified Zooby Professional</span>
              </p>
            </div>
          </div>

          {/* Itemized Line Items */}
          <div>
            <span className="text-[10px] font-bold text-[#877462] uppercase tracking-wider block mb-2">
              Itemized Service Summary
            </span>
            <table className="w-full text-xs">
              <thead className="border-b border-[#efeeea] text-[#877462] text-[11px]">
                <tr>
                  <th className="text-left py-2">Description</th>
                  <th className="text-center py-2">Qty</th>
                  <th className="text-right py-2">Rate</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efeeea]">
                <tr>
                  <td className="py-3 pr-2">
                    <p className="font-bold text-[#1b1c1a]">{payment.serviceTitle}</p>
                    <p className="text-[10px] text-[#877462]">
                      {payment.isAdoptionPayment
                        ? 'Shelter animal medical, deworming & vaccination record certificate fee'
                        : 'Professional doorstep pet care session in Nashik'}
                    </p>
                  </td>
                  <td className="py-3 text-center text-[#544434]">1</td>
                  <td className="py-3 text-right text-[#544434]">₹{payment.baseFare}</td>
                  <td className="py-3 text-right font-bold text-[#1b1c1a]">₹{payment.baseFare}</td>
                </tr>

                {payment.doorstepFee && payment.doorstepFee > 0 ? (
                  <tr>
                    <td className="py-2.5 pr-2">
                      <p className="font-medium text-[#1b1c1a]">Van Travel &amp; Doorstep Sanitization</p>
                    </td>
                    <td className="py-2.5 text-center text-[#544434]">1</td>
                    <td className="py-2.5 text-right text-[#544434]">₹{payment.doorstepFee}</td>
                    <td className="py-2.5 text-right font-bold text-[#1b1c1a]">₹{payment.doorstepFee}</td>
                  </tr>
                ) : null}

                {payment.discount > 0 && (
                  <tr className="text-emerald-700">
                    <td className="py-2.5 pr-2">
                      <p className="font-medium">
                        Promotional Coupon Discount {payment.couponCode ? `(${payment.couponCode})` : ''}
                      </p>
                    </td>
                    <td className="py-2.5 text-center">1</td>
                    <td className="py-2.5 text-right">-₹{payment.discount}</td>
                    <td className="py-2.5 text-right font-bold">-₹{payment.discount}</td>
                  </tr>
                )}

                {payment.taxes > 0 && (
                  <tr>
                    <td className="py-2.5 pr-2">
                      <p className="font-medium text-[#544434]">Applicable Taxes (GST 18% inclusive)</p>
                    </td>
                    <td className="py-2.5 text-center text-[#544434]">-</td>
                    <td className="py-2.5 text-right text-[#544434]">₹{payment.taxes}</td>
                    <td className="py-2.5 text-right font-medium text-[#544434]">₹{payment.taxes}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#ebdcc4] space-y-2 text-xs">
            <div className="flex justify-between text-[#544434]">
              <span>Subtotal</span>
              <span>₹{payment.baseFare + (payment.doorstepFee || 0)}</span>
            </div>
            {payment.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount Applied</span>
                <span>-₹{payment.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-[#544434]">
              <span>Taxes &amp; Platform Handling</span>
              <span>₹{payment.taxes}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#ebdcc4] text-base font-bold text-[#895100]">
              <span>Total Paid Amount</span>
              <span>₹{payment.amount}</span>
            </div>
          </div>

          {/* Refund Notice (if refunded) */}
          {payment.refundStatus === 'Refunded' && (
            <div className="p-4 rounded-2xl bg-[#fff0f0] border border-[#ffdad6] text-xs text-[#ba1a1a] space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="material-symbols-outlined text-[18px]">published_with_changes</span>
                <span>Refund Processed Successfully (₹{payment.refundAmount || payment.amount})</span>
              </div>
              <p className="text-[11px] text-[#93000a]">
                Reason: {payment.refundReason || 'Booking cancelled within grace period'}. Amount credited back to original payment method ({payment.paymentMethodDetails?.brandOrApp || payment.paymentMethod}).
              </p>
              {payment.refundDate && (
                <p className="text-[10px] text-[#877462]">Processed on {payment.refundDate}</p>
              )}
            </div>
          )}

          {/* Security & Verification Footer */}
          <div className="pt-4 border-t border-[#efeeea] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#877462]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">lock</span>
              <span>Secured by Zooby 256-bit Encrypted Payment Gateway</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px]">AUTH: {payment.paymentId}</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-[#fbf9f5] border-t border-[#efeeea] flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#efeeea] transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="px-5 py-2 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Download Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
