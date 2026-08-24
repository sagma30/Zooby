export interface ProviderAppointment {
  id: string;
  patientName: string;
  species: 'Dog' | 'Cat';
  breed: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  avatarUrl: string;
  serviceTitle: string;
  category: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Completed' | 'Pending' | 'Cancelled';
  amount: number;
  notes?: string;
}

export interface ProviderCustomer {
  id: string;
  parentName: string;
  phone: string;
  email: string;
  pets: string[];
  totalVisits: number;
  lastVisit: string;
  avatarUrl: string;
}

export interface ProviderServiceItem {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
  description: string;
}

export const INITIAL_PROVIDER_APPOINTMENTS: ProviderAppointment[] = [
  {
    id: 'apt-101',
    patientName: 'Bruno',
    species: 'Dog',
    breed: 'Golden Retriever (3 yrs)',
    parentName: 'Sam Sharma',
    parentPhone: '+91 98220 11223',
    parentEmail: 'sam@zooby.care',
    avatarUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=240',
    serviceTitle: 'Vet Checking & Vaccination (Core 7-in-1)',
    category: 'vet_consult',
    date: 'Today, Aug 20',
    time: '4:30 PM',
    status: 'Confirmed',
    amount: 1899,
    notes: 'DHLPP core vaccination booster due, general physical checking.'
  },
  {
    id: 'apt-102',
    patientName: 'Luna',
    species: 'Cat',
    breed: 'Persian Longhair (2 yrs)',
    parentName: 'Sam Sharma',
    parentPhone: '+91 98220 11223',
    parentEmail: 'sam@zooby.care',
    avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=240',
    serviceTitle: 'Checking',
    category: 'vet_consult',
    date: 'Tomorrow, Aug 21',
    time: '11:00 AM',
    status: 'Confirmed',
    amount: 899,
    notes: 'Comprehensive nose-to-tail examination.'
  },
  {
    id: 'apt-103',
    patientName: 'Tommy',
    species: 'Dog',
    breed: 'Indie Mix (4 yrs)',
    parentName: 'Aarav Sharma',
    parentPhone: '+91 98220 55667',
    parentEmail: 'aarav@zooby.care',
    avatarUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=240',
    serviceTitle: 'De-worming',
    category: 'vet_consult',
    date: 'Aug 22, 2026',
    time: '2:00 PM',
    status: 'Pending',
    amount: 399,
    notes: 'Routine de-worming dose.'
  },
  {
    id: 'apt-104',
    patientName: 'Bella',
    species: 'Dog',
    breed: 'Shih Tzu (1.5 yrs)',
    parentName: 'Sneha Kapur',
    parentPhone: '+91 98333 44556',
    parentEmail: 'sneha.k@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=240',
    serviceTitle: 'Blood Test at Home',
    category: 'vet_consult',
    date: 'Yesterday, Aug 19',
    time: '3:15 PM',
    status: 'Completed',
    amount: 1299,
    notes: 'CBC diagnostic blood panel processed.'
  }
];

export const INITIAL_PROVIDER_CUSTOMERS: ProviderCustomer[] = [
  {
    id: 'pc-1',
    parentName: 'Sam Sharma',
    phone: '+91 98220 11223',
    email: 'sam@zooby.care',
    pets: ['Bruno (Golden Retriever)', 'Luna (Persian Cat)'],
    totalVisits: 8,
    lastVisit: 'Aug 10, 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'pc-2',
    parentName: 'Aarav Sharma',
    phone: '+91 98220 55667',
    email: 'aarav@zooby.care',
    pets: ['Tommy (Indie Mix)'],
    totalVisits: 4,
    lastVisit: 'Aug 14, 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'pc-3',
    parentName: 'Vikram Malhotra',
    phone: '+91 98222 33445',
    email: 'vikram.m@example.com',
    pets: ['Max (Beagle)', 'Coco (Labrador)'],
    totalVisits: 12,
    lastVisit: 'Aug 02, 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120'
  }
];

export const INITIAL_PROVIDER_SERVICES: ProviderServiceItem[] = [
  {
    id: 'ps-1',
    title: 'Checking',
    category: 'vet_consult',
    durationMinutes: 30,
    price: 899,
    isActive: true,
    description: 'Comprehensive physical examination, vitals, temperature, and preventative wellness consultation.'
  },
  {
    id: 'ps-2',
    title: 'Vet Checking & Vaccination',
    category: 'vet_consult',
    durationMinutes: 30,
    price: 1899,
    isActive: true,
    description: 'Physical exam and administration of core immunization vaccines (7-in-1 combo ₹1,599) with official digital passport.'
  },
  {
    id: 'ps-3',
    title: 'De-worming',
    category: 'vet_consult',
    durationMinutes: 15,
    price: 399,
    isActive: true,
    description: 'Oral de-worming dose calibrated for weight and parasite defense schedule.'
  },
  {
    id: 'ps-4',
    title: 'First Aid',
    category: 'vet_consult',
    durationMinutes: 30,
    price: 999,
    isActive: true,
    description: 'Emergency wound cleansing, antiseptic dressing, minor injury treatment, and acute stabilization.'
  },
  {
    id: 'ps-5',
    title: 'Blood Test at Home',
    category: 'vet_consult',
    durationMinutes: 20,
    price: 1299,
    isActive: true,
    description: 'Doorstep sterile blood collection and certified diagnostic laboratory testing (CBC / Organ panel).'
  }
];
