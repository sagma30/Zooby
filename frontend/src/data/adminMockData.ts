import { AdminUser, ProviderVerification, AdminDashboardBooking } from '../types';

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'USR-9942-X',
    name: 'Aditi Sharma',
    email: 'aditi.sharma@example.com',
    phone: '+91 98765 43210',
    role: 'PET_PARENT',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=240',
    location: 'Nashik',
    primaryAddress: '1402, Sea View Apartments, Gangapur Road, Nashik 422005',
    joinedDate: 'Jan 12, 2024',
    status: 'Active',
    paymentMethod: {
      brand: 'Visa',
      last4: '4242',
      expiry: '09/25'
    },
    pets: [
      {
        id: 'pet-ad-1',
        name: 'Luna',
        type: 'cat',
        breed: 'Persian Cat',
        age: '3 yrs',
        avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200'
      },
      {
        id: 'pet-ad-2',
        name: 'Rocky',
        type: 'dog',
        breed: 'Golden Retriever',
        age: '5 yrs',
        avatarUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=200'
      }
    ],
    recentBookings: [
      {
        id: 'b-ad-1',
        service: 'Full Grooming (Luna)',
        provider: 'Zooby Mobile Care Van #1',
        date: 'Oct 24, 2023',
        status: 'Completed',
        amount: 1500
      },
      {
        id: 'b-ad-2',
        service: 'Dog Walk (Rocky)',
        provider: 'Rahul V.',
        date: 'Oct 22, 2023',
        status: 'Completed',
        amount: 300
      },
      {
        id: 'b-ad-3',
        service: 'Vet Consult (Luna)',
        provider: 'Dr. Rohan Kulkarni Clinic',
        date: 'Oct 15, 2023',
        status: 'Cancelled',
        amount: 800
      }
    ],
    activityTimeline: [
      {
        id: 't-1',
        title: 'User Logged In',
        description: 'Mobile App (iOS) - Nashik, India',
        timestamp: 'Today, 09:42 AM',
        type: 'login'
      },
      {
        id: 't-2',
        title: 'Profile Updated',
        description: 'Updated primary address to Gangapur Road.',
        timestamp: 'Oct 20, 2023',
        type: 'profile'
      },
      {
        id: 't-3',
        title: 'New Pet Added',
        description: "Added 'Luna' (Persian Cat) to profile.",
        timestamp: 'Sep 05, 2023',
        type: 'pet'
      }
    ]
  },
  {
    id: 'USR-8812-M',
    name: 'Dr. Aarav Iyer',
    email: 'dr.aarav@zooby.care',
    phone: '+91 98220 44556',
    role: 'PROVIDER',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=240',
    location: 'Nashik',
    primaryAddress: 'Shop 4, Palm Court, College Road, Nashik 422005',
    joinedDate: 'Feb 05, 2024',
    status: 'Active',
    paymentMethod: {
      brand: 'MasterCard',
      last4: '8819',
      expiry: '11/26'
    },
    pets: [],
    recentBookings: [
      {
        id: 'b-rm-1',
        service: 'General Wellness Exam',
        provider: 'Nashik Paws Clinic',
        date: 'Nov 02, 2023',
        status: 'Completed',
        amount: 650
      }
    ],
    activityTimeline: [
      {
        id: 't-rm-1',
        title: 'Clinic Verification Approved',
        description: 'Veterinary license VET-MH-2024-882 verified.',
        timestamp: 'Yesterday, 06:15 PM',
        type: 'system'
      },
      {
        id: 't-rm-2',
        title: 'User Logged In',
        description: 'Provider Portal - Nashik, India',
        timestamp: 'Nov 01, 2023',
        type: 'login'
      }
    ]
  },
  {
    id: 'USR-7731-S',
    name: 'Ananya Deshmukh',
    email: 'ananya@zooby.care',
    phone: '+91 98220 77889',
    role: 'RESCUE_PARTNER',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=240',
    location: 'Nashik',
    primaryAddress: 'Nashik Strays Trust Shelter, Trimbak Road, Nashik 422007',
    joinedDate: 'Mar 15, 2024',
    status: 'Active',
    paymentMethod: {
      brand: 'UPI / GPay',
      last4: '9901',
      expiry: 'N/A'
    },
    pets: [],
    recentBookings: [],
    activityTimeline: [
      {
        id: 't-sr-1',
        title: 'Account Created',
        description: 'Registered as Rescue Partner.',
        timestamp: 'Mar 15, 2024, 02:30 PM',
        type: 'profile'
      }
    ]
  },
  {
    id: 'USR-6520-V',
    name: 'Vikram Pawar',
    email: 'vikram@zooby.care',
    phone: '+91 98220 99001',
    role: 'VAN_WORKER',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=240',
    location: 'Nashik',
    primaryAddress: 'Zooby Van Hub #1, Gangapur Road, Nashik 422013',
    joinedDate: 'Nov 18, 2023',
    status: 'Active',
    paymentMethod: {
      brand: 'Visa',
      last4: '1092',
      expiry: '04/27'
    },
    pets: [],
    recentBookings: [],
    activityTimeline: [
      {
        id: 't-vp-1',
        title: 'Van Inspection Completed',
        description: 'Van Unit MH 15 ZB 4022 hygiene check cleared.',
        timestamp: 'Dec 05, 2023',
        type: 'system'
      }
    ]
  },
  {
    id: 'USR-5419-P',
    name: 'Priya Sen',
    email: 'priya@zooby.care',
    phone: '+91 98220 00112',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=240',
    location: 'Nashik',
    primaryAddress: 'Zooby HQ, Canada Corner, Nashik 422002',
    joinedDate: 'Aug 04, 2023',
    status: 'Active',
    paymentMethod: {
      brand: 'MasterCard',
      last4: '5543',
      expiry: '02/25'
    },
    pets: [],
    recentBookings: [],
    activityTimeline: [
      {
        id: 't-pd-1',
        title: 'Platform Audit Completed',
        description: 'Nashik region operational review passed.',
        timestamp: 'Oct 01, 2023',
        type: 'system'
      }
    ]
  }
];

export const INITIAL_VERIFICATIONS: ProviderVerification[] = [
  {
    id: 'v-1',
    name: 'Dr. Rohan Kulkarni',
    initials: 'RK',
    service: 'Veterinary Surgery & Consult',
    status: 'Pending',
    avatarBg: 'bg-[#d2f4d3] text-[#1c6422]',
    submittedDate: '2026-08-20'
  },
  {
    id: 'v-2',
    name: 'Paws & Whiskers Spa',
    initials: 'PW',
    service: 'Pet Grooming & Spa',
    status: 'Reviewing',
    avatarBg: 'bg-[#e2dcfe] text-[#4b35b6]',
    submittedDate: '2026-08-21'
  },
  {
    id: 'v-3',
    name: 'Nashik Pet Boarding',
    initials: 'NP',
    service: 'Boarding & Daycare',
    status: 'Pending',
    avatarBg: 'bg-[#d2f4d3] text-[#1c6422]',
    submittedDate: '2026-08-22'
  },
  {
    id: 'v-4',
    name: 'Barking Lot Training',
    initials: 'BL',
    service: 'Dog Training & Behavior',
    status: 'Reviewing',
    avatarBg: 'bg-[#ffedc2] text-[#895100]',
    submittedDate: '2026-08-23'
  }
];

export const INITIAL_ADMIN_BOOKINGS: AdminDashboardBooking[] = [
  {
    id: '#ZB-8492',
    pet: 'Bruno (Dog)',
    service: 'Doorstep Hydrobath Spa',
    amount: 1199,
    status: 'Confirmed'
  },
  {
    id: '#ZB-8491',
    pet: 'Luna (Cat)',
    service: 'Feline Coat Styling',
    amount: 1350,
    status: 'Completed'
  },
  {
    id: '#ZB-8490',
    pet: 'Coco (Dog)',
    service: 'Mobile Dog Spa & Nail Trim',
    amount: 999,
    status: 'Pending'
  },
  {
    id: '#ZB-8489',
    pet: 'Rocky (Dog)',
    service: 'Mobile De-Shedding',
    amount: 1299,
    status: 'Confirmed'
  }
];

export const REVENUE_CHART_DATA_MONTHLY = [
  { name: 'Jan', bookings: 2100, revenue: 82000 },
  { name: 'Feb', bookings: 2400, revenue: 95000 },
  { name: 'Mar', bookings: 2800, revenue: 104000 },
  { name: 'Apr', bookings: 2600, revenue: 98000 },
  { name: 'May', bookings: 3100, revenue: 118000 },
  { name: 'Jun', bookings: 3200, revenue: 124000 }
];

export const REVENUE_CHART_DATA_WEEKLY = [
  { name: 'Mon', bookings: 420, revenue: 16500 },
  { name: 'Tue', bookings: 510, revenue: 19800 },
  { name: 'Wed', bookings: 480, revenue: 18200 },
  { name: 'Thu', bookings: 560, revenue: 21400 },
  { name: 'Fri', bookings: 680, revenue: 27900 },
  { name: 'Sat', bookings: 820, revenue: 34100 },
  { name: 'Sun', bookings: 750, revenue: 31200 }
];
