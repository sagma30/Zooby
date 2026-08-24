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
    serviceTitle: 'Standard Walk',
    category: 'walking',
    date: 'Today, Aug 25',
    timeSlot: '10:00 AM',
    durationMinutes: 30,
    amount: 149,
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
    serviceTitle: 'Bath + Basic Grooming',
    category: 'grooming',
    date: 'Today, Aug 25',
    timeSlot: '12:30 PM',
    durationMinutes: 60,
    amount: 1299,
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
    serviceTitle: 'Pet Sitting (3 Hours)',
    category: 'sitting',
    date: 'Today, Aug 25',
    timeSlot: '03:00 PM',
    durationMinutes: 180,
    amount: 599,
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
    serviceTitle: 'Individual Training Session',
    category: 'training',
    date: 'Tomorrow, Aug 26',
    timeSlot: '09:00 AM',
    durationMinutes: 60,
    amount: 1000,
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
    serviceTitle: 'Bath + Basic Grooming (Mobile Van)',
    category: 'mobile_grooming',
    date: 'Yesterday, Aug 24',
    timeSlot: '04:00 PM',
    durationMinutes: 45,
    amount: 1299,
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
    serviceRequested: 'Monthly Standard Walk Plan',
    category: 'walking',
    requestedDate: 'Aug 26, 2026',
    requestedTime: '05:30 PM',
    location: 'Indira Nagar, Nashik',
    price: 3500,
    durationMinutes: 30,
    notes: 'High energy young German Shepherd. Needs daily 30-min walk for 26 days.',
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
    serviceRequested: 'Pet Sitting (24 Hours)',
    category: 'sitting',
    requestedDate: 'Aug 29–30, 2026',
    requestedTime: '10:00 AM (Check-in)',
    location: 'Gangapur Road, Nashik',
    price: 1999,
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
    serviceRequested: 'Full Grooming with Haircut',
    category: 'grooming',
    requestedDate: 'Aug 27, 2026',
    requestedTime: '02:00 PM',
    location: 'Parijat Nagar, Nashik',
    price: 1699,
    durationMinutes: 60,
    notes: 'Feather trim on legs and ears. Very friendly puppy.',
    createdAt: '3 hours ago',
    status: 'Pending'
  }
];

export const INITIAL_SP_CATALOG: ServiceProviderCatalogItem[] = [
  {
    id: 'svc-walk-1',
    name: 'Standard Walk',
    category: 'walking',
    description: '30-minute solo/fitness walk with live GPS tracking, clean hydration and post-walk photo updates.',
    durationMinutes: 30,
    price: 149,
    isActive: true,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    includes: [
      '30-minute paced walk',
      'Live GPS map route tracking',
      'Hydration checkpoints',
      'Waste disposal & sanitization'
    ]
  },
  {
    id: 'svc-walk-2',
    name: 'Long Walk',
    category: 'walking',
    description: '45-minute extended walking route for active breeds requiring extra stamina and exploration.',
    durationMinutes: 45,
    price: 199,
    isActive: true,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    includes: [
      '45-minute energetic walk',
      'Live GPS route tracking',
      'Paw wipe & hydration',
      'Post-walk report & photo'
    ]
  },
  {
    id: 'svc-walk-3',
    name: 'Exercise Walk',
    category: 'walking',
    description: '60-minute intensive cardio exercise walk, trot training, and outdoor agility play.',
    durationMinutes: 60,
    price: 279,
    isActive: true,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    includes: [
      '60-minute intensive workout',
      'Speed & distance tracking',
      'Agility drills',
      'Detailed health report'
    ]
  },
  {
    id: 'svc-walk-4',
    name: 'Monthly Standard Walk Plan',
    category: 'walking',
    description: 'Monthly package covering 26 standard daily walks (Mon–Sat) with dedicated verified handler.',
    durationMinutes: 30,
    price: 3500,
    isActive: true,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    includes: [
      '26 daily 30-min walks',
      'Dedicated handler assignment',
      'Monthly fitness tracking',
      'Free rescheduling'
    ]
  },
  {
    id: 'svc-sit-1',
    name: 'Pet Sitting (3 Hours)',
    category: 'sitting',
    description: '3 hours of personalized in-home or host pet sitting with continuous loving care and play.',
    durationMinutes: 180,
    price: 599,
    isActive: true,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    includes: [
      '3 hours attentive supervision',
      'Custom feeding & fresh water',
      'Daily video updates to pet parent',
      'Enclosed safe play sessions'
    ]
  },
  {
    id: 'svc-sit-2',
    name: 'Pet Sitting (8 Hours)',
    category: 'sitting',
    description: '8 hours of cage-free daycare, meal adherence, potty breaks, and interactive enrichment.',
    durationMinutes: 480,
    price: 999,
    isActive: true,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    includes: [
      '8 hours cage-free care',
      '2 meal services',
      'Outdoor play sessions',
      'Hourly photo check-ins'
    ]
  },
  {
    id: 'svc-sit-3',
    name: 'Pet Sitting (24 Hours)',
    category: 'sitting',
    description: 'Full 24-hour overnight stay with round-the-clock supervision in home-like cage-free comfort.',
    durationMinutes: 1440,
    price: 1999,
    isActive: true,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    includes: [
      '24-hour cage-free stay',
      'All meals & treats managed',
      'Night-time sleeping supervision',
      'Video calls with parent'
    ]
  },
  {
    id: 'svc-groom-1',
    name: 'Bath + Basic Grooming',
    category: 'grooming',
    description: 'Warm hydrobath, organic herbal shampoo wash, velocity blow dry, nail clipping, ear cleansing & sanitary tidy.',
    durationMinutes: 60,
    price: 1299,
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
    id: 'svc-groom-2',
    name: 'Full Grooming with Haircut',
    category: 'grooming',
    description: 'Full bath, breed-specific customized haircut/scissor styling, face & hygiene trimming, nail filing, and aroma mist.',
    durationMinutes: 75,
    price: 1699,
    isActive: true,
    availableDays: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    includes: [
      'Full breed haircut & styling',
      'Warm hydrobath & deep conditioning',
      'Face & sanitary trimming',
      'Nail filing & aroma mist'
    ]
  },
  {
    id: 'svc-groom-3',
    name: 'Premium De-shedding',
    category: 'grooming',
    description: 'Specialized deep undercoat de-shedding treatment with high-velocity undercoat blowout and silicone brush-out.',
    durationMinutes: 75,
    price: 1999,
    isActive: true,
    availableDays: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    includes: [
      'Deep de-shedding shampoo & mask',
      'High-velocity undercoat blowout',
      'De-matting & silicone brush-out',
      'Reduces shedding by up to 90%'
    ]
  },
  {
    id: 'svc-train-1',
    name: 'Individual Training Session',
    category: 'training',
    description: '1-on-1 personalized behavioral or obedience session with a certified canine behaviorist.',
    durationMinutes: 60,
    price: 1000,
    isActive: true,
    availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    includes: [
      '60-min trainer assessment',
      'Targeted habit coaching',
      'Parent practice guide',
      'Q&A on behavior'
    ]
  },
  {
    id: 'svc-train-2',
    name: 'Basic Puppy & Home Training',
    category: 'training',
    description: 'Foundational puppy course covering potty training, crate comfort, bite inhibition, sit/stay/come commands.',
    durationMinutes: 60,
    price: 7000,
    isActive: true,
    availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    includes: [
      'Full multi-week curriculum',
      'Potty & crate training',
      'Basic obedience commands',
      'Puppy socialization handbook'
    ]
  },
  {
    id: 'svc-train-3',
    name: 'Leash, Walking & Behaviour Training',
    category: 'training',
    description: 'Structured course to stop leash pulling, greeting reactivity, jumping on guests, and reinforce impulse control.',
    durationMinutes: 60,
    price: 14000,
    isActive: true,
    availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    includes: [
      'Loose-leash walking mastery',
      'Distraction desensitization',
      'Doorway & guest manners',
      'Take-home video lessons'
    ]
  },
  {
    id: 'svc-train-4',
    name: 'Aggression, Anxiety or Biting Training',
    category: 'training',
    description: 'Intensive rehabilitation for fear aggression, separation anxiety, resource guarding, or biting history.',
    durationMinutes: 60,
    price: 20000,
    isActive: true,
    availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    includes: [
      'Clinical behavior diagnosis',
      'Counter-conditioning protocol',
      'Direct trainer hotline access',
      'Long-term behavior maintenance'
    ]
  },
  {
    id: 'svc-mob-1',
    name: 'Grooming Van (Bath + Basic Grooming)',
    category: 'mobile_grooming',
    description: 'Doorstep mobile grooming unit at your residence gate for stress-free luxury bath and sanitary trim.',
    durationMinutes: 50,
    price: 1299,
    isActive: true,
    availableDays: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat'],
    includes: [
      'Doorstep sanitized wash unit',
      'Warm RO hydrobath (38°C)',
      'Anti-tick herbal bath rinse',
      'Sanitary trim & blow styling'
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
      title: 'Lunch & Van Restock',
      start: '01:00 PM',
      end: '02:00 PM'
    }
  ],
  unavailableDates: ['2026-09-01', '2026-09-15']
};

export const INITIAL_SP_CLIENTS: ServiceProviderClient[] = [
  {
    id: 'cl-1',
    parentName: 'Sam Sharma',
    phone: '+91 98220 11223',
    email: 'sam@zooby.care',
    location: 'Rowhouse #4, Silver Palm, Gangapur Road, Nashik',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    pets: [
      {
        name: 'Bruno',
        species: 'Dog',
        breed: 'Golden Retriever (3 yrs)',
        photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=300'
      },
      {
        name: 'Luna',
        species: 'Cat',
        breed: 'Persian Longhair (2 yrs)',
        photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=300'
      }
    ],
    totalBookings: 8,
    totalSpent: 8740,
    lastServiceDate: 'Aug 25, 2026',
    notes: 'Long-time Zooby regular. Bruno prefers gentle handling with front paws.'
  },
  {
    id: 'cl-2',
    parentName: 'Sneha Kapur',
    phone: '+91 98333 44556',
    email: 'sneha.k@example.com',
    location: 'Bungalow 18, Serene Meadows, Mahatma Nagar, Nashik',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    pets: [
      {
        name: 'Bella',
        species: 'Dog',
        breed: 'Shih Tzu (1.5 yrs)',
        photo: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300'
      }
    ],
    totalBookings: 4,
    totalSpent: 4200,
    lastServiceDate: 'Aug 19, 2026',
    notes: 'Bella loves treats during training.'
  },
  {
    id: 'cl-3',
    parentName: 'Vikram Malhotra',
    phone: '+91 98222 33445',
    email: 'vikram.m@example.com',
    location: 'Flat 402, Green Acres, College Road, Nashik',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    pets: [
      {
        name: 'Max',
        species: 'Dog',
        breed: 'Beagle (2 yrs)',
        photo: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&q=80&w=300'
      }
    ],
    totalBookings: 6,
    totalSpent: 5100,
    lastServiceDate: 'Aug 20, 2026',
    notes: 'Max is very vocal during feeding time.'
  }
];

export const INITIAL_SP_TRANSACTIONS: ServiceProviderTransaction[] = [
  {
    id: 'tx-sp-101',
    transactionRef: 'TXN-ZB-9941',
    date: 'Aug 25, 2026',
    serviceTitle: 'Bath + Basic Grooming',
    customerName: 'Sam Sharma',
    petName: 'Luna',
    grossAmount: 1299,
    platformFee: 130,
    netPayout: 1169,
    payoutStatus: 'Processing',
    paymentMethod: 'UPI (GPay)'
  },
  {
    id: 'tx-sp-102',
    transactionRef: 'TXN-ZB-9918',
    date: 'Aug 25, 2026',
    serviceTitle: 'Standard Walk',
    customerName: 'Sam Sharma',
    petName: 'Bruno',
    grossAmount: 149,
    platformFee: 15,
    netPayout: 134,
    payoutStatus: 'Paid',
    paymentMethod: 'Zooby Wallet'
  },
  {
    id: 'tx-sp-103',
    transactionRef: 'TXN-ZB-9892',
    date: 'Aug 24, 2026',
    serviceTitle: 'Full Grooming with Haircut',
    customerName: 'Aarav Sharma',
    petName: 'Tommy',
    grossAmount: 1699,
    platformFee: 170,
    netPayout: 1529,
    payoutStatus: 'Paid',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'tx-sp-104',
    transactionRef: 'TXN-ZB-9840',
    date: 'Aug 22, 2026',
    serviceTitle: 'Individual Training Session',
    customerName: 'Sneha Kapur',
    petName: 'Bella',
    grossAmount: 1000,
    platformFee: 100,
    netPayout: 900,
    payoutStatus: 'Paid',
    paymentMethod: 'UPI'
  },
  {
    id: 'tx-sp-105',
    transactionRef: 'TXN-ZB-9801',
    date: 'Aug 20, 2026',
    serviceTitle: 'Pet Sitting (3 Hours)',
    customerName: 'Vikram Malhotra',
    petName: 'Max',
    grossAmount: 599,
    platformFee: 60,
    netPayout: 539,
    payoutStatus: 'Paid',
    paymentMethod: 'Net Banking'
  }
];

export const INITIAL_SP_NOTIFICATIONS: ServiceProviderNotification[] = [
  {
    id: 'sp-notif-1',
    title: 'New Service Request',
    text: 'Rohan Deshpande requested a Monthly Standard Walk Plan for Rocky (German Shepherd).',
    time: '15m ago',
    type: 'request',
    read: false
  },
  {
    id: 'sp-notif-2',
    title: 'Booking Confirmed',
    text: 'Your booking with Bruno (Sam Sharma) for Standard Walk at 10:00 AM has been confirmed.',
    time: '1h ago',
    type: 'booking',
    read: false
  },
  {
    id: 'sp-notif-3',
    title: 'Upcoming Service Reminder',
    text: 'Bath + Basic Grooming with Luna starts in 30 minutes at Gangapur Hub.',
    time: '2h ago',
    type: 'reminder',
    read: false
  },
  {
    id: 'sp-notif-4',
    title: 'Payment Received',
    text: '₹1,169 transferred to your provider wallet for Luna’s Grooming session.',
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
