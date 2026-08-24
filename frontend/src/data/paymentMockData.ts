import { PaymentRecord, ProviderPayoutRecord } from '../types';

export interface CouponDiscount {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  description: string;
  minAmount?: number;
}

export const VALID_COUPONS: Record<string, CouponDiscount> = {
  ZOOBYFIRST: {
    code: 'ZOOBYFIRST',
    discountType: 'percentage',
    value: 15,
    description: '15% Off Your First Zooby Care Experience'
  },
  VETCARE100: {
    code: 'VETCARE100',
    discountType: 'fixed',
    value: 100,
    description: '₹100 Off Clinical Consultations'
  },
  VANSPA20: {
    code: 'VANSPA20',
    discountType: 'percentage',
    value: 20,
    description: '20% Off Doorstep Mobile Van Grooming'
  }
};

export interface PaymentMethodOption {
  id: string;
  type: 'upi' | 'card' | 'netbanking' | 'wallet' | 'pay_later';
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
  isPopular?: boolean;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'pm-upi',
    type: 'upi',
    title: 'UPI (Instant & Zero Fee)',
    subtitle: 'Google Pay, PhonePe, Paytm, or Any UPI ID',
    icon: 'account_balance_wallet',
    badge: 'Fastest',
    isPopular: true
  },
  {
    id: 'pm-card',
    type: 'card',
    title: 'Credit / Debit Cards',
    subtitle: 'Visa, MasterCard, RuPay, Diners',
    icon: 'credit_card'
  },
  {
    id: 'pm-netbanking',
    type: 'netbanking',
    title: 'NetBanking',
    subtitle: 'HDFC, ICICI, SBI, Axis, Kotak & 50+ Banks',
    icon: 'account_balance'
  },
  {
    id: 'pm-wallet',
    type: 'wallet',
    title: 'Wallets',
    subtitle: 'Paytm, Amazon Pay, Mobikwik',
    icon: 'wallet'
  },
  {
    id: 'pm-doorstep',
    type: 'pay_later',
    title: 'Pay on Doorstep',
    subtitle: 'Pay via Cash / QR Code when Zooby Van Arrives',
    icon: 'payments',
    badge: 'Mobile Van Exclusive'
  }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-101',
    paymentId: 'PAY-ZB-882910',
    transactionId: 'TXN-2026-0822-44129',
    bookingId: 'bk-101',
    bookingRef: 'ZB-992144',
    userId: 'usr-parent-sam',
    userName: 'Sam Sharma',
    userEmail: 'sam@zooby.care',
    userPhone: '+91 98220 11223',
    providerId: 'prov-1',
    providerName: 'Zooby Mobile Grooming Van (ZMV-014)',
    serviceTitle: 'Bath + Basic Grooming (Mobile Van)',
    serviceCategory: 'mobile_grooming',
    petId: 'pet-bruno',
    petName: 'Bruno',
    petSpecies: 'Dog',
    petBreed: 'Golden Retriever',
    amount: 1299,
    baseFare: 1180,
    doorstepFee: 0,
    discount: 0,
    taxes: 119,
    platformFee: 130,
    providerPayout: 1169,
    paymentMethod: 'upi',
    paymentMethodDetails: {
      brandOrApp: 'Google Pay',
      maskedAccount: 'sam@okhdfcbank'
    },
    paymentStatus: 'Successful',
    refundStatus: 'None',
    createdAt: '2026-08-22 09:30 AM',
    paidAt: '2026-08-22 09:31 AM',
    invoiceNumber: 'INV-ZB-2026-004412'
  },
  {
    id: 'pay-100',
    paymentId: 'PAY-ZB-771209',
    transactionId: 'TXN-2026-0714-88310',
    bookingId: 'bk-100',
    bookingRef: 'ZB-771209',
    userId: 'usr-parent-sam',
    userName: 'Sam Sharma',
    userEmail: 'sam@zooby.care',
    userPhone: '+91 98220 11223',
    providerId: 'prov-2',
    providerName: 'Dr. Ananya Mehta, Nashik Paws Clinic',
    serviceTitle: 'Checking',
    serviceCategory: 'vet_consult',
    petId: 'pet-bruno',
    petName: 'Bruno',
    petSpecies: 'Dog',
    petBreed: 'Golden Retriever',
    amount: 899,
    baseFare: 800,
    discount: 0,
    taxes: 99,
    platformFee: 90,
    providerPayout: 809,
    paymentMethod: 'card',
    paymentMethodDetails: {
      brandOrApp: 'Visa Debit',
      maskedAccount: '•••• 4242'
    },
    paymentStatus: 'Successful',
    refundStatus: 'None',
    createdAt: '2026-07-14 10:45 AM',
    paidAt: '2026-07-14 10:46 AM',
    invoiceNumber: 'INV-ZB-2026-003180'
  },
  {
    id: 'pay-099',
    paymentId: 'PAY-ZB-662301',
    transactionId: 'TXN-2026-0519-11902',
    bookingId: 'bk-099',
    bookingRef: 'ZB-662301',
    userId: 'usr-parent-sam',
    userName: 'Sam Sharma',
    userEmail: 'sam@zooby.care',
    userPhone: '+91 98220 11223',
    providerId: 'prov-1',
    providerName: 'Zooby Mobile Grooming Van (ZMV-014)',
    serviceTitle: 'Full Grooming with Haircut',
    serviceCategory: 'grooming',
    petId: 'pet-luna',
    petName: 'Luna',
    petSpecies: 'Cat',
    petBreed: 'Persian Cat',
    amount: 1699,
    baseFare: 1600,
    discount: 100,
    couponCode: 'FIRSTSPA',
    taxes: 199,
    platformFee: 170,
    providerPayout: 1529,
    paymentMethod: 'netbanking',
    paymentMethodDetails: {
      brandOrApp: 'HDFC NetBanking',
      maskedAccount: 'HDFC •••• 9012'
    },
    paymentStatus: 'Successful',
    refundStatus: 'None',
    createdAt: '2026-05-19 01:15 PM',
    paidAt: '2026-05-19 01:16 PM',
    invoiceNumber: 'INV-ZB-2026-002011'
  },
  {
    id: 'pay-098',
    paymentId: 'PAY-ZB-551120',
    transactionId: 'TXN-2026-0410-77621',
    bookingId: 'bk-098',
    bookingRef: 'ZB-551120',
    userId: 'usr-parent-sam',
    userName: 'Sam Sharma',
    userEmail: 'sam@zooby.care',
    userPhone: '+91 98220 11223',
    providerId: 'prov-2',
    providerName: 'Dr. Ananya Mehta, Nashik Paws Clinic',
    serviceTitle: 'De-worming',
    serviceCategory: 'vet_consult',
    petId: 'pet-luna',
    petName: 'Luna',
    petSpecies: 'Cat',
    petBreed: 'Persian Cat',
    amount: 399,
    baseFare: 399,
    discount: 0,
    taxes: 0,
    platformFee: 40,
    providerPayout: 359,
    paymentMethod: 'upi',
    paymentMethodDetails: {
      brandOrApp: 'PhonePe',
      maskedAccount: 'sam@ybl'
    },
    paymentStatus: 'Refunded',
    refundStatus: 'Refunded',
    refundAmount: 399,
    refundReason: 'Appointment cancelled by pet parent within grace period',
    refundDate: '2026-04-11 11:20 AM',
    createdAt: '2026-04-10 03:00 PM',
    paidAt: '2026-04-10 03:01 PM',
    invoiceNumber: 'INV-ZB-2026-001844'
  },
  {
    id: 'pay-097',
    paymentId: 'PAY-ZB-440912',
    transactionId: 'TXN-2026-0820-99431',
    bookingId: 'bk-104',
    bookingRef: 'ZB-440912',
    userId: 'usr-parent-aarav',
    userName: 'Aarav Sharma',
    userEmail: 'aarav@zooby.care',
    userPhone: '+91 98220 55667',
    providerId: 'prov-1',
    providerName: 'Zooby Mobile Grooming Van (ZMV-014)',
    serviceTitle: 'Bath + Basic Grooming (Mobile Van)',
    serviceCategory: 'mobile_grooming',
    petId: 'pet-tommy',
    petName: 'Tommy',
    petSpecies: 'Dog',
    petBreed: 'Indie Mix',
    amount: 1299,
    baseFare: 1180,
    discount: 0,
    taxes: 119,
    platformFee: 130,
    providerPayout: 1169,
    paymentMethod: 'card',
    paymentMethodDetails: {
      brandOrApp: 'MasterCard',
      maskedAccount: '•••• 8812'
    },
    paymentStatus: 'Successful',
    refundStatus: 'None',
    createdAt: '2026-08-20 11:10 AM',
    paidAt: '2026-08-20 11:12 AM',
    invoiceNumber: 'INV-ZB-2026-004390'
  },
  {
    id: 'pay-096',
    paymentId: 'PAY-ZB-330182',
    transactionId: 'TXN-2026-0821-66219',
    userId: 'usr-parent-sam',
    userName: 'Sam Sharma',
    userEmail: 'sam@zooby.care',
    userPhone: '+91 98220 11223',
    serviceTitle: 'Shelter Vaccination & Medical Support Fee',
    serviceCategory: 'adoption',
    isAdoptionPayment: true,
    adoptionAnimalId: 'adopt-4',
    petName: 'Daisy',
    petSpecies: 'Dog',
    petBreed: 'Indie Hound',
    amount: 500,
    baseFare: 500,
    discount: 0,
    taxes: 0,
    platformFee: 0,
    providerPayout: 500,
    paymentMethod: 'upi',
    paymentMethodDetails: {
      brandOrApp: 'Google Pay',
      maskedAccount: 'sam@okhdfcbank'
    },
    paymentStatus: 'Successful',
    refundStatus: 'None',
    createdAt: '2026-08-21 02:40 PM',
    paidAt: '2026-08-21 02:41 PM',
    invoiceNumber: 'INV-ZB-ADOPT-00102'
  }
];

export const INITIAL_PROVIDER_PAYOUTS: ProviderPayoutRecord[] = [
  {
    id: 'payout-101',
    providerId: 'usr-vet-ananya',
    providerName: 'Dr. Ananya Mehta',
    amount: 14250,
    status: 'Completed',
    requestedAt: '2026-08-15 06:00 PM',
    processedAt: '2026-08-16 10:30 AM',
    bankName: 'HDFC Bank',
    accountLast4: '4192',
    referenceNumber: 'NEFT-ZB-9941029'
  },
  {
    id: 'payout-102',
    providerId: 'usr-van-rahul',
    providerName: 'Rahul Sharma (Zooby Van ZMV-014)',
    amount: 28400,
    status: 'Completed',
    requestedAt: '2026-08-18 07:15 PM',
    processedAt: '2026-08-19 11:00 AM',
    bankName: 'ICICI Bank',
    accountLast4: '8830',
    referenceNumber: 'IMPS-ZB-7731904'
  },
  {
    id: 'payout-103',
    providerId: 'prov-6',
    providerName: 'Canine Academy Positive Training',
    amount: 9800,
    status: 'Processing',
    requestedAt: '2026-08-22 04:00 PM',
    bankName: 'State Bank of India',
    accountLast4: '1093',
    referenceNumber: 'RTGS-ZB-8812903'
  }
];
