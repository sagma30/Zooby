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
    parentName: 'Rohan Deshmukh',
    parentPhone: '+91 98201 23456',
    parentEmail: 'rohan.deshmukh@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=240',
    serviceTitle: 'Annual Vaccination Booster & Physical Exam',
    category: 'vet_consult',
    date: 'Today, Aug 20',
    time: '4:30 PM',
    status: 'Confirmed',
    amount: 1200,
    notes: 'DHLPP booster due, mild ear scratch check.'
  },
  {
    id: 'apt-102',
    patientName: 'Luna',
    species: 'Cat',
    breed: 'Persian Longhair (2 yrs)',
    parentName: 'Aditi Sharma',
    parentPhone: '+91 98111 22334',
    parentEmail: 'aditi.sharma@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=240',
    serviceTitle: 'Dental Hygiene Checkup & Scaling Assessment',
    category: 'vet_consult',
    date: 'Tomorrow, Aug 21',
    time: '11:00 AM',
    status: 'Confirmed',
    amount: 1500,
    notes: 'Plaque inspection, prescribe dental chew.'
  },
  {
    id: 'apt-103',
    patientName: 'Max',
    species: 'Dog',
    breed: 'Beagle (4 yrs)',
    parentName: 'Vikram Malhotra',
    parentPhone: '+91 98222 33445',
    parentEmail: 'vikram.m@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=240',
    serviceTitle: 'Medicated Skin Treatment & De-shedding',
    category: 'grooming',
    date: 'Aug 22, 2026',
    time: '2:00 PM',
    status: 'Pending',
    amount: 1800,
    notes: 'Sensitive skin formula requested.'
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
    serviceTitle: 'Puppy Wellness Consultation & Microchipping',
    category: 'vet_consult',
    date: 'Yesterday, Aug 19',
    time: '3:15 PM',
    status: 'Completed',
    amount: 2200,
    notes: 'Microchip ISO-11784 implanted successfully.'
  }
];

export const INITIAL_PROVIDER_CUSTOMERS: ProviderCustomer[] = [
  {
    id: 'pc-1',
    parentName: 'Rohan Deshmukh',
    phone: '+91 98201 23456',
    email: 'rohan.deshmukh@gmail.com',
    pets: ['Bruno (Golden Retriever)'],
    totalVisits: 8,
    lastVisit: 'Aug 10, 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'pc-2',
    parentName: 'Aditi Sharma',
    phone: '+91 98111 22334',
    email: 'aditi.sharma@example.com',
    pets: ['Luna (Persian Cat)'],
    totalVisits: 5,
    lastVisit: 'Aug 14, 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120'
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
    title: 'General Health & Diagnostic Consult',
    category: 'vet_consult',
    durationMinutes: 30,
    price: 800,
    isActive: true,
    description: 'Comprehensive physical examination, vitals, nutrition and routine health advice.'
  },
  {
    id: 'ps-2',
    title: 'Vaccination Booster Pack (Core DHLPP + Rabies)',
    category: 'vet_consult',
    durationMinutes: 20,
    price: 1200,
    isActive: true,
    description: 'Administration of core immunization vaccines with official digital certificate.'
  },
  {
    id: 'ps-3',
    title: 'Dental Scale & Polish Assessment',
    category: 'vet_consult',
    durationMinutes: 45,
    price: 1500,
    isActive: true,
    description: 'Ultrasonic scaling, tartar removal, gum inspection, and polishing.'
  },
  {
    id: 'ps-4',
    title: 'Emergency Triage & Wound Dressing',
    category: 'vet_consult',
    durationMinutes: 60,
    price: 2500,
    isActive: true,
    description: 'Immediate diagnostic care, sterile dressing, pain management and antibiotics.'
  }
];
