import React, { useState } from 'react';
import {
  PaymentMethodType,
  PaymentRecord,
  PaymentStatus,
  RefundStatus,
  ServiceCategory
} from '../../types';
import { VALID_COUPONS, CouponDiscount } from '../../data/paymentMockData';

export interface PaymentIntentDetails {
  bookingId?: string;
  bookingRef?: string;
  serviceTitle: string;
  serviceCategory?: ServiceCategory;
  providerId?: string;
  providerName?: string;
  petId?: string;
  petName?: string;
  petSpecies?: string;
  petBreed?: string;
  petPhoto?: string;
  date: string;
  timeSlot?: string;
  location: string;
  priceNumber: number;
  isMobileService?: boolean;
  isAdoptionPayment?: boolean;
  adoptionAnimalId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  intent: PaymentIntentDetails | null;
  onPaymentSuccess: (payment: PaymentRecord) => void;
  onPaymentCancel?: () => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  intent,
  onPaymentSuccess,
  onPaymentCancel
}) => {
  // Method selection state
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'custom'>('gpay');
  const [customUpiId, setCustomUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm');

  // Card details state (Masked/demo)
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('•••');
  const [cardHolder, setCardHolder] = useState(intent?.customerName || 'Aisha Sharma');
  const [saveCard, setSaveCard] = useState(true);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponDiscount | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Gateway execution state
  const [step, setStep] = useState<'details' | 'otp' | 'processing' | 'success' | 'failed'>('details');
  const [testOutcome, setTestOutcome] = useState<'success' | 'fail'>('success');
  const [failureReason, setFailureReason] = useState('Bank server temporarily unreachable. Please try another card or UPI.');
  const [otpValue, setOtpValue] = useState('123456');
  const [processingMessage, setProcessingMessage] = useState('Securing connection to payment gateway...');
  const [createdPayment, setCreatedPayment] = useState<PaymentRecord | null>(null);

  if (!isOpen || !intent) return null;

  // Pricing calculations
  const basePrice = intent.priceNumber || 0;
  const doorstepFee = intent.isMobileService ? 99 : 0;
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = Math.round((basePrice * appliedCoupon.value) / 100);
    } else {
      discountAmount = appliedCoupon.value;
    }
    // Cap discount to basePrice
    discountAmount = Math.min(discountAmount, basePrice);
  }

  const taxableAmount = Math.max(0, basePrice + doorstepFee - discountAmount);
  // Estimate GST at 18% (standard Indian tax inclusive or calculated)
  const taxes = Math.round(taxableAmount * 0.05); // 5% pet care service GST / platform charge
  const totalAmount = Math.max(0, taxableAmount + taxes);
  const platformCommission = Math.round(totalAmount * 0.10); // 10% platform fee
  const providerPayout = totalAmount - platformCommission;

  // Coupon handler
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    const found = VALID_COUPONS.find(
      (c) => c.code.toLowerCase() === couponInput.trim().toLowerCase()
    );

    if (found) {
      if (found.minAmount && basePrice < found.minAmount) {
        setCouponError(`Coupon requires minimum booking amount of ₹${found.minAmount}`);
        return;
      }
      setAppliedCoupon(found);
      setCouponSuccess(`Coupon applied! ${found.description}`);
    } else {
      setCouponError('Invalid coupon code. Try "ZOOBY10", "PAWSOME" or "FIRSTSPA".');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponSuccess(null);
    setCouponError(null);
  };

  // Generate finalized PaymentRecord
  const generatePaymentRecord = (status: PaymentStatus, failReason?: string): PaymentRecord => {
    const txnNum = Math.floor(100000 + Math.random() * 900000);
    const invoiceNum = 'INV-ZB-2026-' + Math.floor(10000 + Math.random() * 90000);
    const paymentId = 'PAY-ZB-' + txnNum;
    const transactionId = `TXN-2026-${Date.now().toString().slice(-8)}`;

    let brandOrApp = 'UPI';
    let maskedAccount = 'user@okhdfcbank';

    if (selectedMethod === 'upi') {
      brandOrApp = selectedUpiApp === 'gpay' ? 'Google Pay' : selectedUpiApp === 'phonepe' ? 'PhonePe' : selectedUpiApp === 'paytm' ? 'Paytm UPI' : 'Custom UPI';
      maskedAccount = customUpiId || (intent.customerEmail ? `${intent.customerEmail.split('@')[0]}@okaxis` : 'aisha@okhdfcbank');
    } else if (selectedMethod === 'card') {
      brandOrApp = cardNumber.startsWith('4') ? 'Visa Card' : 'MasterCard';
      maskedAccount = '•••• ' + (cardNumber.slice(-4) || '4242');
    } else if (selectedMethod === 'netbanking') {
      brandOrApp = `${selectedBank} NetBanking`;
      maskedAccount = `${selectedBank} •••• 9921`;
    } else if (selectedMethod === 'wallet') {
      brandOrApp = `${selectedWallet} Wallet`;
      maskedAccount = `Linked Phone (${intent.customerPhone || '+91 98220 11223'})`;
    } else if (selectedMethod === 'pay_later') {
      brandOrApp = 'Pay on Doorstep (Cash / UPI)';
      maskedAccount = 'Doorstep Settlement';
    }

    return {
      id: `pay-${Date.now()}`,
      paymentId,
      transactionId,
      bookingId: intent.bookingId,
      bookingRef: intent.bookingRef,
      userId: 'usr-parent-aisha',
      userName: intent.customerName || 'Aisha Sharma',
      userEmail: intent.customerEmail || 'aisha@zooby.care',
      userPhone: intent.customerPhone || '+91 98220 11223',
      providerId: intent.providerId,
      providerName: intent.providerName || 'Zooby Care Provider',
      serviceTitle: intent.serviceTitle,
      serviceCategory: intent.serviceCategory,
      petId: intent.petId,
      petName: intent.petName || 'Bruno',
      petSpecies: intent.petSpecies || 'Dog',
      petBreed: intent.petBreed || 'Pet',
      amount: totalAmount,
      baseFare: basePrice,
      doorstepFee,
      discount: discountAmount,
      couponCode: appliedCoupon?.code,
      taxes,
      platformFee: platformCommission,
      providerPayout,
      paymentMethod: selectedMethod,
      paymentMethodDetails: {
        brandOrApp,
        maskedAccount
      },
      paymentStatus: status,
      refundStatus: 'None',
      createdAt: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }),
      paidAt: status === 'Successful' ? new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }) : undefined,
      invoiceNumber: invoiceNum,
      failureReason: failReason,
      isAdoptionPayment: intent.isAdoptionPayment,
      adoptionAnimalId: intent.adoptionAnimalId
    };
  };

  // Execution Flow Trigger
  const handleInitiatePayment = () => {
    // If Pay Later, immediately confirm
    if (selectedMethod === 'pay_later') {
      const rec = generatePaymentRecord('Successful');
      setCreatedPayment(rec);
      setStep('success');
      onPaymentSuccess(rec);
      return;
    }

    // If card or netbanking and test mode requires OTP, show OTP step
    if ((selectedMethod === 'card' || selectedMethod === 'netbanking') && step !== 'otp') {
      setStep('otp');
      return;
    }

    // Processing simulation
    setStep('processing');
    setProcessingMessage('Initiating 256-bit encrypted banking session...');

    setTimeout(() => {
      setProcessingMessage('Validating tokenized credentials & risk scoring...');
    }, 800);

    setTimeout(() => {
      if (testOutcome === 'success') {
        setProcessingMessage('Authorization confirmed! Finalizing invoice...');
        setTimeout(() => {
          const rec = generatePaymentRecord('Successful');
          setCreatedPayment(rec);
          setStep('success');
          onPaymentSuccess(rec);
        }, 700);
      } else {
        setProcessingMessage('Bank rejected transaction...');
        setTimeout(() => {
          const failMsg = 'Card declined by issuing bank (Simulated Test Failure). Please verify balance or try UPI.';
          setFailureReason(failMsg);
          const rec = generatePaymentRecord('Failed', failMsg);
          setCreatedPayment(rec);
          setStep('failed');
        }, 700);
      }
    }, 1800);
  };

  const handleCancel = () => {
    if (onPaymentCancel) {
      onPaymentCancel();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[760px] rounded-3xl shadow-2xl border border-[#e5e0d8] overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#fbf9f5] border-b border-[#efeeea] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#ffeed9] text-[#895100] flex items-center justify-center font-bold shadow-2xs">
              <span className="material-symbols-outlined text-[20px]">lock</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-quicksand font-bold text-lg text-[#895100]">
                  Zooby Secure Payment Gateway
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  256-bit Encrypted
                </span>
              </div>
              <p className="text-[11px] text-[#877462]">
                PCI-DSS Level 1 &amp; RBI Compliant Checkout
              </p>
            </div>
          </div>

          <button
            onClick={handleCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#544434] hover:bg-[#efeeea] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* STEP 1: DETAILS & GATEWAY SELECTION */}
        {step === 'details' && (
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 text-[#1b1c1a]">
            {/* Left Column: Payment Method Selection (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#877462] uppercase tracking-wider">
                  Select Payment Method
                </span>
                {/* Prototype Simulation Toggle */}
                <div className="flex items-center gap-1.5 bg-[#fbf9f5] px-2.5 py-1 rounded-full border border-[#e5e0d8] text-[10px]">
                  <span className="font-bold text-[#877462]">Simulation:</span>
                  <button
                    type="button"
                    onClick={() => setTestOutcome('success')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                      testOutcome === 'success' ? 'bg-emerald-600 text-white' : 'text-[#877462]'
                    }`}
                  >
                    Success
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestOutcome('fail')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                      testOutcome === 'fail' ? 'bg-rose-600 text-white' : 'text-[#877462]'
                    }`}
                  >
                    Fail
                  </button>
                </div>
              </div>

              {/* Method Navigation Tabs */}
              <div className="grid grid-cols-5 gap-1 bg-[#fbf9f5] p-1.5 rounded-2xl border border-[#efeeea] text-[11px] font-bold text-center">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('upi')}
                  className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    selectedMethod === 'upi'
                      ? 'bg-white text-[#895100] shadow-xs border border-[#ebdcc4]'
                      : 'text-[#544434] hover:bg-white/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                  <span>UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    selectedMethod === 'card'
                      ? 'bg-white text-[#895100] shadow-xs border border-[#ebdcc4]'
                      : 'text-[#544434] hover:bg-white/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">credit_card</span>
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('netbanking')}
                  className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    selectedMethod === 'netbanking'
                      ? 'bg-white text-[#895100] shadow-xs border border-[#ebdcc4]'
                      : 'text-[#544434] hover:bg-white/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">account_balance</span>
                  <span>NetBank</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('wallet')}
                  className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    selectedMethod === 'wallet'
                      ? 'bg-white text-[#895100] shadow-xs border border-[#ebdcc4]'
                      : 'text-[#544434] hover:bg-white/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">wallet</span>
                  <span>Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('pay_later')}
                  className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    selectedMethod === 'pay_later'
                      ? 'bg-white text-[#895100] shadow-xs border border-[#ebdcc4]'
                      : 'text-[#544434] hover:bg-white/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">handshake</span>
                  <span>Pay Later</span>
                </button>
              </div>

              {/* TAB 1: UPI METHOD */}
              {selectedMethod === 'upi' && (
                <div className="space-y-3.5 p-4 rounded-2xl bg-[#fdfcfa] border border-[#ebdcc4]">
                  <p className="text-xs font-bold text-[#1b1c1a]">Instant UPI Checkout</p>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp('gpay')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        selectedUpiApp === 'gpay'
                          ? 'border-[#895100] bg-[#ffeed9]/50 shadow-xs'
                          : 'border-[#efeeea] bg-white hover:border-[#dac2ae]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-black text-xs flex items-center justify-center">
                        GPay
                      </div>
                      <span className="text-[11px] font-bold text-[#1b1c1a]">Google Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp('phonepe')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        selectedUpiApp === 'phonepe'
                          ? 'border-[#895100] bg-[#ffeed9]/50 shadow-xs'
                          : 'border-[#efeeea] bg-white hover:border-[#dac2ae]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 font-black text-xs flex items-center justify-center">
                        Pe
                      </div>
                      <span className="text-[11px] font-bold text-[#1b1c1a]">PhonePe</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp('paytm')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        selectedUpiApp === 'paytm'
                          ? 'border-[#895100] bg-[#ffeed9]/50 shadow-xs'
                          : 'border-[#efeeea] bg-white hover:border-[#dac2ae]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 font-black text-xs flex items-center justify-center">
                        Paytm
                      </div>
                      <span className="text-[11px] font-bold text-[#1b1c1a]">Paytm UPI</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-bold text-[#877462] flex justify-between">
                      <span>Or Enter Any UPI ID (VPA)</span>
                      <span className="text-emerald-700 font-semibold">Auto-verified</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customUpiId}
                        onChange={(e) => {
                          setCustomUpiId(e.target.value);
                          setSelectedUpiApp('custom');
                        }}
                        placeholder="e.g. yourname@okhdfcbank"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#dac2ae] bg-white text-xs text-[#1b1c1a] focus:outline-none focus:border-[#895100]"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-700">
                        VERIFIED
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-[#683c00] flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-amber-600">qr_code_scanner</span>
                    <span>No need to switch apps — simulated instant verification active.</span>
                  </div>
                </div>
              )}

              {/* TAB 2: CREDIT / DEBIT CARD */}
              {selectedMethod === 'card' && (
                <div className="space-y-3 p-4 rounded-2xl bg-[#fdfcfa] border border-[#ebdcc4]">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-[#1b1c1a]">Credit or Debit Card</p>
                    <div className="flex gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-bold">VISA</span>
                      <span className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-700 rounded font-bold">MasterCard</span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded font-bold">RuPay</span>
                    </div>
                  </div>

                  {/* Card Quick Preset */}
                  <div className="flex gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        setCardNumber('4242 •••• •••• 4242');
                        setCardExpiry('08/28');
                        setCardCvv('789');
                      }}
                      className="px-2 py-1 bg-white border border-[#dac2ae] rounded-lg font-bold text-[#895100] hover:bg-[#ffeed9] cursor-pointer"
                    >
                      Use Test Visa (4242)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCardNumber('5521 •••• •••• 8812');
                        setCardExpiry('11/27');
                        setCardCvv('432');
                      }}
                      className="px-2 py-1 bg-white border border-[#dac2ae] rounded-lg font-bold text-[#895100] hover:bg-[#ffeed9] cursor-pointer"
                    >
                      Use Test MasterCard (8812)
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#877462]">Card Number (Masked)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#dac2ae] bg-white text-xs font-mono text-[#1b1c1a] focus:outline-none focus:border-[#895100]"
                      />
                      <span className="material-symbols-outlined text-[#877462] absolute right-3 top-2 text-base">credit_card</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#877462]">Valid Thru</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#dac2ae] bg-white text-xs font-mono text-[#1b1c1a] focus:outline-none focus:border-[#895100]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#877462]">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#dac2ae] bg-white text-xs font-mono text-[#1b1c1a] focus:outline-none focus:border-[#895100]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#877462]">Name on Card</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#dac2ae] bg-white text-xs text-[#1b1c1a] focus:outline-none focus:border-[#895100]"
                    />
                  </div>

                  <label className="flex items-center gap-2 pt-1 cursor-pointer text-[11px] text-[#544434]">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="rounded text-[#895100] focus:ring-[#895100]"
                    />
                    <span>Save card securely for 1-click Zooby checkout (Tokenized)</span>
                  </label>
                </div>
              )}

              {/* TAB 3: NET BANKING */}
              {selectedMethod === 'netbanking' && (
                <div className="space-y-3 p-4 rounded-2xl bg-[#fdfcfa] border border-[#ebdcc4]">
                  <p className="text-xs font-bold text-[#1b1c1a]">Select Your Bank</p>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedBank === bank
                            ? 'border-[#895100] bg-[#ffeed9] font-bold text-[#895100] shadow-2xs'
                            : 'border-[#efeeea] bg-white text-[#544434] hover:border-[#dac2ae]'
                        }`}
                      >
                        <span className="text-[11px] block truncate">{bank}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-bold text-[#877462]">Other Banks</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#dac2ae] bg-white text-xs text-[#1b1c1a] focus:outline-none focus:border-[#895100]"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="State Bank of India">State Bank of India</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                      <option value="Union Bank of India">Union Bank of India</option>
                      <option value="Canara Bank">Canara Bank</option>
                      <option value="IndusInd Bank">IndusInd Bank</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 4: WALLETS */}
              {selectedMethod === 'wallet' && (
                <div className="space-y-3 p-4 rounded-2xl bg-[#fdfcfa] border border-[#ebdcc4]">
                  <p className="text-xs font-bold text-[#1b1c1a]">Digital &amp; Prepaid Wallets</p>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    {['Paytm', 'Amazon Pay', 'PhonePe Wallet', 'MobiKwik'].map((wallet) => (
                      <button
                        key={wallet}
                        type="button"
                        onClick={() => setSelectedWallet(wallet)}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          selectedWallet === wallet
                            ? 'border-[#895100] bg-[#ffeed9] font-bold text-[#895100] shadow-2xs'
                            : 'border-[#efeeea] bg-white text-[#544434] hover:border-[#dac2ae]'
                        }`}
                      >
                        <span className="text-xs">{wallet}</span>
                        <span className="material-symbols-outlined text-base">
                          {selectedWallet === wallet ? 'radio_button_checked' : 'radio_button_unchecked'}
                        </span>
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] text-[#877462]">
                    Linked to verified phone: <strong>{intent.customerPhone || '+91 98220 11223'}</strong>
                  </p>
                </div>
              )}

              {/* TAB 5: PAY LATER / DOORSTEP CASH */}
              {selectedMethod === 'pay_later' && (
                <div className="space-y-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-200 text-[#544434]">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                    <span className="material-symbols-outlined text-lg">local_shipping</span>
                    <span>Pay Upon Doorstep Visit</span>
                  </div>

                  <p className="text-xs leading-relaxed">
                    You can pay <strong>₹{totalAmount}</strong> in cash or via on-the-spot UPI QR code when our Zooby Mobile Van technician or specialist arrives at your location ({intent.location}).
                  </p>

                  <div className="p-3 rounded-xl bg-white border border-amber-200 text-[11px] space-y-1">
                    <p className="font-bold text-[#1b1c1a]">Booking will be Confirmed Immediately:</p>
                    <p className="text-[#877462]">• Mobile Van / Provider schedule slot is reserved</p>
                    <p className="text-[#877462]">• Job status marked as "Pay Later (Collect on Delivery)"</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Order Summary, Coupon & Price Breakdown (5 cols) */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-4 border-t md:border-t-0 md:border-l md:pl-6 border-[#efeeea]">
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#877462] uppercase tracking-wider block">
                  Booking Summary
                </span>

                {/* Service & Pet Card */}
                <div className="p-3.5 rounded-2xl bg-[#fbf9f5] border border-[#ebdcc4] space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-[#1b1c1a] leading-tight">
                        {intent.serviceTitle}
                      </h4>
                      <p className="text-[11px] text-[#877462] mt-0.5">
                        {intent.providerName || 'Zooby Care Professional'}
                      </p>
                    </div>
                    {intent.petPhoto && (
                      <img
                        src={intent.petPhoto}
                        alt={intent.petName || 'Pet'}
                        className="w-9 h-9 rounded-full object-cover border border-[#ff9f1c]"
                      />
                    )}
                  </div>

                  <div className="text-[11px] text-[#544434] space-y-0.5 pt-1 border-t border-[#efeeea]">
                    <p><strong>Pet:</strong> {intent.petName} {intent.petBreed ? `(${intent.petBreed})` : ''}</p>
                    <p><strong>Schedule:</strong> {intent.date} {intent.timeSlot ? `• ${intent.timeSlot}` : ''}</p>
                    <p className="truncate"><strong>Location:</strong> {intent.location}</p>
                  </div>
                </div>

                {/* Coupon Input */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#877462]">Have a Promo Code?</span>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                      <div>
                        <span className="font-bold">{appliedCoupon.code}</span>
                        <span className="text-[10px] block text-emerald-700">(-₹{discountAmount})</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="e.g. ZOOBY10"
                        className="w-full px-3 py-1.5 rounded-xl border border-[#dac2ae] bg-white text-xs uppercase focus:outline-none focus:border-[#895100]"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </form>
                  )}

                  {couponError && <p className="text-[10px] text-rose-600 font-semibold">{couponError}</p>}
                  {couponSuccess && <p className="text-[10px] text-emerald-700 font-semibold">{couponSuccess}</p>}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-2 border-t border-[#efeeea] text-xs">
                  <div className="flex justify-between text-[#544434]">
                    <span>Base Service Fare</span>
                    <span>₹{basePrice}</span>
                  </div>

                  {doorstepFee > 0 && (
                    <div className="flex justify-between text-[#544434]">
                      <span>Doorstep Van Travel &amp; Sanitization</span>
                      <span>₹{doorstepFee}</span>
                    </div>
                  )}

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#544434]">
                    <span>Taxes &amp; Platform Fee (5%)</span>
                    <span>₹{taxes}</span>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-[#ebdcc4] text-base font-bold text-[#895100]">
                    <span>Total Payable</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleInitiatePayment}
                  className="w-full py-3 rounded-full bg-[#ff9f1c] hover:bg-[#ff8f00] text-[#683c00] font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  <span>
                    {selectedMethod === 'pay_later'
                      ? `Confirm Booking (Pay ₹${totalAmount} Later)`
                      : `Pay ₹${totalAmount} Securely`}
                  </span>
                </button>

                <p className="text-[10px] text-center text-[#877462]">
                  Safe &amp; encrypted transaction powered by Zooby Pay
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: 3D SECURE OTP SIMULATION */}
        {step === 'otp' && (
          <div className="p-8 text-center space-y-6 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto shadow-xs">
              <span className="material-symbols-outlined text-3xl">sms</span>
            </div>

            <div>
              <h3 className="font-quicksand font-bold text-xl text-[#1b1c1a]">
                Bank 3D-Secure Verification
              </h3>
              <p className="text-xs text-[#544434] mt-1">
                Enter the 6-digit One Time Password (OTP) sent to your registered mobile ending in <strong>•• 1223</strong> for amount <strong>₹{totalAmount}</strong>.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                maxLength={6}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                className="w-48 mx-auto text-center tracking-widest text-xl font-bold py-2.5 rounded-xl border-2 border-[#895100] focus:outline-none font-mono"
              />
              <p className="text-[11px] text-[#877462]">
                Prototype Demo OTP auto-filled: <strong>123456</strong>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="flex-1 py-2.5 rounded-full bg-[#efeeea] text-[#544434] font-bold text-xs cursor-pointer hover:bg-[#e2ded6]"
              >
                Back / Cancel
              </button>
              <button
                type="button"
                onClick={handleInitiatePayment}
                className="flex-1 py-2.5 rounded-full bg-[#895100] text-white font-bold text-xs cursor-pointer hover:bg-[#683c00] shadow-xs"
              >
                Verify &amp; Authorize
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PROCESSING SCREEN */}
        {step === 'processing' && (
          <div className="p-12 text-center space-y-6 max-w-md mx-auto">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-[#ffdcbc] border-t-[#895100] animate-spin" />
              <span className="material-symbols-outlined text-2xl text-[#895100] absolute">lock</span>
            </div>

            <div className="space-y-2">
              <h3 className="font-quicksand font-bold text-xl text-[#1b1c1a]">
                Processing Payment
              </h3>
              <p className="text-xs text-[#544434] animate-pulse font-medium">
                {processingMessage}
              </p>
              <p className="text-[10px] text-[#877462]">
                Please do not close or refresh this window...
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION */}
        {step === 'success' && createdPayment && (
          <div className="p-8 text-center space-y-6 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#c2edca] text-[#294e35] mx-auto flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-4xl filled-icon">check_circle</span>
            </div>

            <div>
              <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                {createdPayment.paymentMethod === 'pay_later'
                  ? 'Booking Confirmed (Pay Later)'
                  : 'Payment Successful!'}
              </h3>
              <p className="text-xs text-[#544434] mt-1">
                Transaction Reference: <strong className="text-[#895100] font-mono">{createdPayment.transactionId}</strong>
              </p>
            </div>

            <div className="bg-[#fbf9f5] rounded-2xl p-4 border border-[#ebdcc4] text-left text-xs space-y-2">
              <div className="flex justify-between pb-1.5 border-b border-[#efeeea]">
                <span className="text-[#877462]">Service &amp; Pet:</span>
                <span className="font-bold text-[#1b1c1a]">{createdPayment.serviceTitle} ({createdPayment.petName})</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-[#efeeea]">
                <span className="text-[#877462]">Paid Amount:</span>
                <span className="font-bold text-[#895100]">₹{createdPayment.amount}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-[#efeeea]">
                <span className="text-[#877462]">Payment Mode:</span>
                <span className="font-bold text-[#1b1c1a] capitalize">{createdPayment.paymentMethodDetails?.brandOrApp || createdPayment.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#877462]">Invoice Ref:</span>
                <span className="font-mono text-[#544434]">{createdPayment.invoiceNumber}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-full bg-[#ff9f1c] hover:bg-[#ff8f00] text-[#683c00] font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                View in Dashboard / Bookings
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: FAILED SCREEN */}
        {step === 'failed' && (
          <div className="p-8 text-center space-y-6 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#ffdad6] text-[#ba1a1a] mx-auto flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-4xl">error</span>
            </div>

            <div>
              <h3 className="font-quicksand font-bold text-2xl text-[#ba1a1a]">
                Payment Could Not Be Completed
              </h3>
              <p className="text-xs text-[#544434] mt-2 bg-rose-50 p-3 rounded-xl border border-rose-200">
                {failureReason}
              </p>
            </div>

            <p className="text-xs text-[#877462]">
              Your card or account was <strong>not charged</strong>. You can retry with another payment method or switch to UPI / Pay Later.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2.5 rounded-full bg-[#efeeea] text-[#544434] font-bold text-xs cursor-pointer hover:bg-[#e2ded6]"
              >
                Cancel Booking
              </button>
              <button
                type="button"
                onClick={() => {
                  setTestOutcome('success');
                  setStep('details');
                }}
                className="flex-1 py-2.5 rounded-full bg-[#895100] text-white font-bold text-xs cursor-pointer hover:bg-[#683c00] shadow-xs"
              >
                Try Again with Different Method
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
