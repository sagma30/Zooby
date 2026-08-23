import { PaymentRecord, ProviderPayoutRecord } from '../types';

export interface CouponDiscount {
  code: string;
  description: string;
  type: 'percentage' | 'flat';
  value: number;
  minAmount?: number;
}

export const VALID_COUPONS: CouponDiscount[] = [
  {
    code: 'ZOOBY10',
    description: '10% off on all pet wellness & grooming services',
    type: 'percentage',
    value: 10,
    minAmount: 500
  },
  {
    code: 'PAWSOME',
    description: 'Flat ₹150 off on mobile van & clinic visits',
    type: 'flat',
    value: 150,
    minAmount: 600
  },
  {
    code: 'FIRSTSPA',
    description: 'Flat ₹100 introductory discount for new pet parents',
    type: 'flat',
    value: 100,
    minAmount: 400
  },
  {
    code: 'RESCUELOVE',
    description: '15% shelter discount on adoption health checkups',
    type: 'percentage',
    value: 15,
    minAmount: 300
  }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-101',
    paymentId: 'PAY-ZB-882910',
    transactionId: 'TXN-2026-0822-44129',
    bookingId: 'bk-101',
    bookingRef: 'ZB-992144',
    userId: 'usr-parent-aisha',
    userName: 'Aisha Sharma',
    userEmail: 'aisha@zooby.care',
    userPhone: '+91 98220 11223',
    providerId: 'prov-1',
    providerName: 'Zooby Mobile Care Van #1',
    serviceTitle: 'Doorstep Hydrobath Spa & Coat Styling',
    serviceCategory: 'mobile_grooming',
    petId: 'pet-bruno',
    petName: 'Bruno',
    petSpecies: 'Dog',
    petBreed: 'Golden Retriever',
    amount: 1199,
    baseFare: 1100,
    doorstepFee: 0,
    discount: 0,
    taxes: 99,
    platformFee: 120,
    providerPayout: 1079,
    paymentMethod: 'upi',
    paymentMethodDetails: {
      brandOrApp: 'Google Pay',
      maskedAccount: 'aisha@okhdfcbank'
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
    userId: 'usr-parent-aisha',
    userName: 'Aisha Sharma',
    userEmail: 'aisha@zooby.care',
    userPhone: '+91 98220 11223',
    providerId: 'prov-2',
    providerName: 'Dr. Rohan Kulkarni, Nashik Paws Clinic',
    serviceTitle: 'Routine Health Checkup & Core Screening',
    serviceCategory: 'vet_consult',
    petId: 'pet-bruno',
    petName: 'Bruno',
    petSpecies: 'Dog',
    petBreed: 'Golden Retriever',
    amount: 650,
    baseFare: 600,
    discount: 0,
    taxes: 50,
    platformFee: 65,
    providerPayout: 585,
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
    userId: 'usr-parent-aisha',
    userName: 'Aisha Sharma',
    userEmail: 'aisha@zooby.care',
    userPhone: '+91 98220 11223',
    providerId: 'prov-1',
    providerName: 'Zooby Mobile Care Van #1',
    serviceTitle: 'Feline Coat De-tangling & Wash',
    serviceCategory: 'grooming',
    petId: 'pet-luna',
    petName: 'Luna',
    petSpecies: 'Cat',
    petBreed: 'Persian Cat',
    amount: 1350,
    baseFare: 1300,
    discount: 100,
    couponCode: 'FIRSTSPA',
    taxes: 150,
    platformFee: 135,
    providerPayout: 1215,
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
    userId: 'usr-parent-aisha',
    userName: 'Aisha Sharma',
    userEmail: 'aisha@zooby.care',
    userPhone: '+91 98220 11223',
    providerId: 'prov-2',
    providerName: 'Dr. Rohan Kulkarni, Nashik Paws Clinic',
    serviceTitle: 'Tele-Consultation & Diet Consultation',
    serviceCategory: 'vet_consult',
    petId: 'pet-luna',
    petName: 'Luna',
    petSpecies: 'Cat',
    petBreed: 'Persian Cat',
    amount: 500,
    baseFare: 500,
    discount: 0,
    taxes: 0,
    platformFee: 50,
    providerPayout: 450,
    paymentMethod: 'upi',
    paymentMethodDetails: {
      brandOrApp: 'PhonePe',
      maskedAccount: 'aisha@ybl'
    },
    paymentStatus: 'Refunded',
    refundStatus: 'Refunded',
    refundAmount: 500,
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
    userId: 'USR-9942-X',
    userName: 'Aditi Sharma',
    userEmail: 'aditi.sharma@example.com',
    userPhone: '+91 98765 43210',
    providerId: 'prov-1',
    providerName: 'Zooby Mobile Care Van #1',
    serviceTitle: 'Mobile Dog Spa & Nail Trim',
    serviceCategory: 'mobile_grooming',
    petId: 'pet-ad-2',
    petName: 'Rocky',
    petSpecies: 'Dog',
    petBreed: 'Golden Retriever',
    amount: 1200,
    baseFare: 1100,
    discount: 0,
    taxes: 100,
    platformFee: 120,
    providerPayout: 1080,
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
    userId: 'usr-parent-aisha',
    userName: 'Aisha Sharma',
    userEmail: 'aisha@zooby.care',
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
      maskedAccount: 'aisha@okhdfcbank'
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
    providerId: 'prov-2',
    providerName: 'Dr. Rohan Kulkarni',
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
    providerId: 'prov-1',
    providerName: 'Zooby Mobile Care Van Fleet',
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
