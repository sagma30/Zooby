export interface ServiceProviderAppointment {
  id: string;
  bookingRef: string;
  petName: string;
  petSpecies: 'Dog' | 'Cat' | 'Puppy' | 'Kitten';
  petBreed: string;
  petPhoto: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  parentLocation: string;
  serviceTitle: string;
  category: 'walking' | 'sitting' | 'grooming' | 'training' | 'mobile_grooming';
  date: string;
  timeSlot: string;
  durationMinutes: number;
  amount: number;
  status: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  notes?: string;
  specialCareInstructions?: string;
}

export interface ServiceProviderRequest {
  id: string;
  requestRef: string;
  petName: string;
  petSpecies: 'Dog' | 'Cat' | 'Puppy' | 'Kitten';
  petBreed: string;
  petPhoto: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  serviceRequested: string;
  category: 'walking' | 'sitting' | 'grooming' | 'training' | 'mobile_grooming';
  requestedDate: string;
  requestedTime: string;
  location: string;
  price: number;
  durationMinutes: number;
  notes: string;
  createdAt: string;
  status: 'Pending' | 'Accepted' | 'Declined';
}

export interface ServiceProviderCatalogItem {
  id: string;
  name: string;
  category: 'walking' | 'sitting' | 'grooming' | 'training' | 'mobile_grooming';
  description: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
  availableDays: string[];
  includes: string[];
}

export interface ServiceProviderAvailabilitySettings {
  workingDays: string[];
  workingHoursStart: string;
  workingHoursEnd: string;
  timeSlots: string[];
  breaks: { id: string; title: string; start: string; end: string }[];
  unavailableDates: string[];
}

export interface ServiceProviderClient {
  id: string;
  parentName: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl: string;
  pets: {
    name: string;
    species: string;
    breed: string;
    photo: string;
  }[];
  totalBookings: number;
  totalSpent: number;
  lastServiceDate: string;
  upcomingServiceDate?: string;
  notes: string;
}

export interface ServiceProviderTransaction {
  id: string;
  transactionRef: string;
  date: string;
  serviceTitle: string;
  customerName: string;
  petName: string;
  grossAmount: number;
  platformFee: number;
  netPayout: number;
  payoutStatus: 'Paid' | 'Processing' | 'Pending';
  paymentMethod: string;
}

export interface ServiceProviderNotification {
  id: string;
  title: string;
  text: string;
  time: string;
  type: 'request' | 'booking' | 'reminder' | 'payment' | 'review';
  read: boolean;
}

// -------------------------------------------------------------
// INITIAL SEED DATA
// -------------------------------------------------------------

export const INITIAL_SP_APPOINTMENTS: ServiceProviderAppointment[] = [
  {
    id: 'sp-apt-1',
    bookingRef: 'ZB-40192',
    petName: 'Bruno',
    petSpecies: 'Dog',
    petBreed: 'Golden Retriever (3 yrs)',
    petPhoto: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=300',
    parentName: 'Sam Sharma',
    parentPhone: '+91 98220 11223',
    parentEmail: 'sam@zooby.care',
    parentLocation: 'Gangapur Road, Nashik',
    serviceTitle: 'GPS Tracked Solo Fitness Walk',
    category: 'walking',
    date: 'Today, Aug 25',
    timeSlot: '10:00 AM',
    durationMinutes: 30,
    amount: 500,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    notes: 'Please bring his favorite rubber ball for the park pause.',
    specialCareInstructions: 'Gentle on leash; enjoys shaded jogging intervals.'
  },
  {
    id: 'sp-apt-2',
    bookingRef: 'ZB-40215',
    petName: 'Luna',
    petSpecies: 'Cat',
    petBreed: 'Persian Longhair (2 yrs)',
    petPhoto: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=300',
    parentName: 'Sam Sharma',
    parentPhone: '+91 98220 11223',
    parentEmail: 'sam@zooby.care',
    parentLocation: 'Gangapur Road, Nashik',
    serviceTitle: 'In-Salon Luxury Bath & De-matting Spa',
    category: 'grooming',
    date: 'Today, Aug 25',
    timeSlot: '12:30 PM',
    durationMinutes: 60,
    amount: 1200,
    status: 'In Progress',
    paymentStatus: 'Paid',
    notes: 'Warm water wash with organic aloe shampoo. Ear cleaning required.',
    specialCareInstructions: 'Sensitive ears; use low-noise velocity dryer.'
  },
  {
    id: 'sp-apt-3',
    bookingRef: 'ZB-40288',
    petName: 'Max',
    petSpecies: 'Dog',
    petBreed: 'Beagle (2 yrs)',
    petPhoto: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&q=80&w=300',
    parentName: 'Vikram Malhotra',
    parentPhone: '+91 98222 33445',
    parentEmail: 'vikram.m@example.com',
    parentLocation: 'College Road, Nashik',
    serviceTitle: 'Half-Day In-Home Pet Sitting & Play Care',
    category: 'sitting',
    date: 'Today, Aug 25',
    timeSlot: '03:00 PM',
    durationMinutes: 180,
    amount: 800,
    status: 'Pending',
    paymentStatus: 'Paid',
    notes: 'Afternoon feeding schedule at 4:30 PM (1 cup kibble provided).',
    specialCareInstructions: 'Loves belly rubs, keep front yard gate securely latched.'
  },
  {
    id: 'sp-apt-4',
    bookingRef: 'ZB-40342',
    petName: 'Bella',
    petSpecies: 'Dog',
    petBreed: 'Shih Tzu (1.5 yrs)',
    petPhoto: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300',
    parentName: 'Sneha Kapur',
    parentPhone: '+91 98333 44556',
    parentEmail: 'sneha.k@example.com',
    parentLocation: 'Mahatma Nagar, Nashik',
    serviceTitle: 'Puppy Socialization & Leash Discipline',
    category: 'training',
    date: 'Tomorrow, Aug 26',
    timeSlot: '09:00 AM',
    durationMinutes: 45,
    amount: 1500,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    notes: 'Focus on doorbell barking prevention and heel walk.',
    specialCareInstructions: 'Reward with dried chicken liver treats.'
  },
  {
    id: 'sp-apt-5',
    bookingRef: 'ZB-39982',
    petName: 'Tommy',
    petSpecies: 'Dog',
    petBreed: 'Indie Mix (4 yrs)',
    petPhoto: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=300',
    parentName: 'Aarav Sharma',
    parentPhone: '+91 98220 55667',
    parentEmail: 'aarav@zooby.care',
    parentLocation: 'Canada Corner, Nashik',
    serviceTitle: 'Doorstep Mobile Bath & Coat Conditioning',
    category: 'mobile_grooming',
    date: 'Yesterday, Aug 24',
    timeSlot: '04:00 PM',
    durationMinutes: 45,
    amount: 1250,
    status: 'Completed',
    paymentStatus: 'Paid',
    notes: 'Completed successfully. Tommy was calm throughout bath.',
    specialCareInstructions: 'Paws thoroughly dried.'
  }
];

export const INITIAL_SP_REQUESTS: ServiceProviderRequest[] = [
  {
    id: 'req-101',
    requestRef: 'REQ-8812',
    petName: 'Rocky',
    petSpecies: 'Dog',
    petBreed: 'German Shepherd (1 yr)',
    petPhoto: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5455?auto=format&fit=crop&q=80&w=300',
    parentName: 'Rohan Deshpande',
    parentPhone: '+91 98225 11990',
    parentEmail: 'rohan.d@example.com',
    serviceRequested: 'Daily Evening Dog Walk (Monthly Package)',
    category: 'walking',
    requestedDate: 'Aug 26, 2026',
    requestedTime: '05:30 PM',
    location: 'Indira Nagar, Nashik',
    price: 450,
    durationMinutes: 40,
    notes: 'High energy young German Shepherd. Needs energetic handler who can do 2 km pace.',
    createdAt: '15 mins ago',
    status: 'Pending'
  },
  {
    id: 'req-102',
    requestRef: 'REQ-8819',
    petName: 'Simba',
    petSpecies: 'Cat',
    petBreed: 'Domestic Short Hair (3 yrs)',
    petPhoto: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=300',
    parentName: 'Pooja Kulkarni',
    parentPhone: '+91 98228 33221',
    parentEmail: 'pooja.k@example.com',
    serviceRequested: 'Weekend Overnight Pet Sitting',
    category: 'sitting',
    requestedDate: 'Aug 29–30, 2026',
    requestedTime: '10:00 AM (Check-in)',
    location: 'Gangapur Road, Nashik',
    price: 2400,
    durationMinutes: 1440,
    notes: 'Looking for a verified sitter for weekend travel. Simba needs feeding twice a day.',
    createdAt: '1 hour ago',
    status: 'Pending'
  },
  {
    id: 'req-103',
    requestRef: 'REQ-8825',
    petName: 'Coco',
    petSpecies: 'Dog',
    petBreed: 'Cocker Spaniel (2 yrs)',
    petPhoto: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&q=80&w=300',
    parentName: 'Amit Joshi',
    parentPhone: '+91 98229 44882',
    parentEmail: 'amit.j@example.com',
    serviceRequested: 'Full Breed Styling & Coat Spa',
    category: 'grooming',
    requestedDate: 'Aug 27, 2026',
    requestedTime: '02:00 PM',
    location: 'Parijat Nagar, Nashik',
    price: 1350,
    durationMinutes: 60,
    notes: 'Feather trim on legs and ears. Very friendly puppy.',
    createdAt: '3 hours ago',
    status: 'Pending'
  }
];

export const INITIAL_SP_CATALOG: ServiceProviderCatalogItem[] = [
  {
    id: 'svc-walk-1',
    name: 'Dog Walking (Solo Fitness Stroll)',
    category: 'walking',
    description: 'Energetic GPS-tracked exercise walk tailored to your dog’s stamina, including clean hydration and waste cleanup.',
    durationMinutes: 30,
    price: 500,
    isActive: true,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    includes: [
      'Live GPS map route tracking',
      'Hydration checkpoints',
      'Waste disposal & sanitization',
      'Post-walk photo & distance summary'
    ]
  },
  {
    id: 'svc-sit-1',
    name: 'Pet Sitting & Daycare (In-Home & Host)',
    category: 'sitting',
    description: 'Cage-free loving care in home environment with personalized feeding, playtime, medication adherence, and video check-ins.',
    durationMinutes: 180,
    price: 800,
    isActive: true,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    includes: [
      '100% cage-free supervision',
      'Custom feeding & fresh water',
      'Daily video updates to pet parent',
      'Enclosed safe play sessions'
    ]
  },
  {
    id: 'svc-groom-1',
    name: 'Pet Grooming & Spa Pampering',
    category: 'grooming',
    description: 'Full hygiene bath, organic oatmeal shampoo wash, blow dry, ear cleansing, nail trimming, and coat finishing.',
    durationMinutes: 60,
    price: 1200,
    isActive: true,
    availableDays: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    includes: [
      'Warm water bath & herbal shampoo',
      'Nail clipping & paw balm',
      'Ear cleansing & de-matting brush',
      'Aromatic coat conditioning mist'
    ]
  },
  {
    id: 'svc-train-1',
    name: 'Pet Training & Behavior Coaching',
    category: 'training',
    description: 'Positive reinforcement, reward-based training for leash walking, basic obedience, recall, and mild anxiety relief.',
    durationMinutes: 45,
    price: 1500,
    isActive: true,
    availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    includes: [
      '1-on-1 certified trainer session',
      'Force-free positive methods',
      'Parent coaching & practice card',
      'Behavioral habit tracking'
    ]
  },
  {
    id: 'svc-mob-1',
    name: 'Mobile Doorstep Grooming',
    category: 'mobile_grooming',
    description: 'Doorstep mobile grooming unit at your residence gate for stress-free luxury bath and sanitary trim.',
    durationMinutes: 50,
    price: 1400,
    isActive: true,
    availableDays: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat'],
    includes: [
      'Doorstep sanitized wash unit',
      'Anti-tick herbal bath rinse',
      'Sanitary trim & blow styling',
      'Zero travel anxiety for pet'
    ]
  }
];

export const INITIAL_SP_AVAILABILITY: ServiceProviderAvailabilitySettings = {
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  workingHoursStart: '08:00 AM',
  workingHoursEnd: '07:00 PM',
  timeSlots: [
    '08:30 AM',
    '10:00 AM',
    '11:30 AM',
    '01:00 PM',
    '02:30 PM',
    '04:00 PM',
    '05:30 PM'
  ],
  breaks: [
    {
      id: 'brk-1',
      title: 'Lunch & Gear Recharge',
      start: '01:00 PM',
      end: '02:00 PM'
    }
  ],
  unavailableDates: ['2026-08-31', '2026-09-07']
};

export const INITIAL_SP_CLIENTS: ServiceProviderClient[] = [
  {
    id: 'spc-1',
    parentName: 'Sam Sharma',
    email: 'sam@zooby.care',
    phone: '+91 98220 11223',
    location: 'Gangapur Road, Nashik',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=240',
    pets: [
      {
        name: 'Bruno',
        species: 'Dog',
        breed: 'Golden Retriever',
        photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=240'
      },
      {
        name: 'Luna',
        species: 'Cat',
        breed: 'Persian Longhair',
        photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=240'
      }
    ],
    totalBookings: 14,
    totalSpent: 11400,
    lastServiceDate: 'Aug 25, 2026',
    upcomingServiceDate: 'Today, 10:00 AM',
    notes: 'Bruno loves tennis ball pauses; Luna is comfortable with soft voice handlers.'
  },
  {
    id: 'spc-2',
    parentName: 'Aarav Sharma',
    email: 'aarav@zooby.care',
    phone: '+91 98220 55667',
    location: 'Canada Corner, Nashik',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=240',
    pets: [
      {
        name: 'Tommy',
        species: 'Dog',
        breed: 'Indie Mix',
        photo: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=240'
      }
    ],
    totalBookings: 6,
    totalSpent: 4800,
    lastServiceDate: 'Aug 24, 2026',
    upcomingServiceDate: 'Aug 28, 2026',
    notes: 'Responsive rescue dog, gentle leash handling appreciated.'
  },
  {
    id: 'spc-3',
    parentName: 'Vikram Malhotra',
    email: 'vikram.m@example.com',
    phone: '+91 98222 33445',
    location: 'College Road, Nashik',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=240',
    pets: [
      {
        name: 'Max',
        species: 'Dog',
        breed: 'Beagle',
        photo: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&q=80&w=240'
      }
    ],
    totalBookings: 8,
    totalSpent: 6400,
    lastServiceDate: 'Aug 18, 2026',
    upcomingServiceDate: 'Today, 03:00 PM',
    notes: 'Food-motivated beagle; ensure no food scraps accessible on walks.'
  },
  {
    id: 'spc-4',
    parentName: 'Sneha Kapur',
    email: 'sneha.k@example.com',
    phone: '+91 98333 44556',
    location: 'Mahatma Nagar, Nashik',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=240',
    pets: [
      {
        name: 'Bella',
        species: 'Dog',
        breed: 'Shih Tzu',
        photo: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=240'
      }
    ],
    totalBookings: 5,
    totalSpent: 7500,
    lastServiceDate: 'Aug 12, 2026',
    upcomingServiceDate: 'Tomorrow, 09:00 AM',
    notes: 'Needs positive praise during training sessions.'
  }
];

export const INITIAL_SP_TRANSACTIONS: ServiceProviderTransaction[] = [
  {
    id: 'tx-sp-101',
    transactionRef: 'TXN-ZB-9921',
    date: 'Aug 25, 2026',
    serviceTitle: 'In-Salon Luxury Bath & De-matting Spa',
    customerName: 'Sam Sharma',
    petName: 'Luna',
    grossAmount: 1200,
    platformFee: 120,
    netPayout: 1080,
    payoutStatus: 'Processing',
    paymentMethod: 'UPI (GPay)'
  },
  {
    id: 'tx-sp-102',
    transactionRef: 'TXN-ZB-9918',
    date: 'Aug 25, 2026',
    serviceTitle: 'GPS Tracked Solo Fitness Walk',
    customerName: 'Sam Sharma',
    petName: 'Bruno',
    grossAmount: 500,
    platformFee: 50,
    netPayout: 450,
    payoutStatus: 'Paid',
    paymentMethod: 'Zooby Wallet'
  },
  {
    id: 'tx-sp-103',
    transactionRef: 'TXN-ZB-9892',
    date: 'Aug 24, 2026',
    serviceTitle: 'Doorstep Mobile Bath & Conditioning',
    customerName: 'Aarav Sharma',
    petName: 'Tommy',
    grossAmount: 1250,
    platformFee: 125,
    netPayout: 1125,
    payoutStatus: 'Paid',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'tx-sp-104',
    transactionRef: 'TXN-ZB-9840',
    date: 'Aug 22, 2026',
    serviceTitle: 'Puppy Socialization & Leash Training',
    customerName: 'Sneha Kapur',
    petName: 'Bella',
    grossAmount: 1500,
    platformFee: 150,
    netPayout: 1350,
    payoutStatus: 'Paid',
    paymentMethod: 'UPI'
  },
  {
    id: 'tx-sp-105',
    transactionRef: 'TXN-ZB-9801',
    date: 'Aug 20, 2026',
    serviceTitle: 'Half-Day In-Home Pet Sitting',
    customerName: 'Vikram Malhotra',
    petName: 'Max',
    grossAmount: 800,
    platformFee: 80,
    netPayout: 720,
    payoutStatus: 'Paid',
    paymentMethod: 'Net Banking'
  }
];

export const INITIAL_SP_NOTIFICATIONS: ServiceProviderNotification[] = [
  {
    id: 'sp-notif-1',
    title: 'New Service Request',
    text: 'Rohan Deshpande requested a daily walking package for Rocky (German Shepherd).',
    time: '15m ago',
    type: 'request',
    read: false
  },
  {
    id: 'sp-notif-2',
    title: 'Booking Confirmed',
    text: 'Your booking with Bruno (Sam Sharma) for GPS Walk at 10:00 AM has been confirmed.',
    time: '1h ago',
    type: 'booking',
    read: false
  },
  {
    id: 'sp-notif-3',
    title: 'Upcoming Service Reminder',
    text: 'In-Salon Luxury Bath with Luna starts in 30 minutes at Gangapur Hub.',
    time: '2h ago',
    type: 'reminder',
    read: false
  },
  {
    id: 'sp-notif-4',
    title: 'Payment Received',
    text: '₹1,080 transferred to your provider wallet for Luna’s Grooming session.',
    time: '4h ago',
    type: 'payment',
    read: true
  },
  {
    id: 'sp-notif-5',
    title: '5-Star Review Received',
    text: 'Sam Sharma rated your service 5 stars: "Always gentle with our pets!"',
    time: '1 day ago',
    type: 'review',
    read: true
  }
];
