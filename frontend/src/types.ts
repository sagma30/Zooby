export type PetSpecies = 'Dog' | 'Cat' | 'Other';

export interface HealthEvent {
  id: string;
  petId: string;
  eventType: 'vaccination' | 'medication' | 'vet_visit' | 'routine_checkup' | 'surgery' | 'allergy' | 'treatment' | 'grooming' | 'other';
  eventTitle: string;
  date: string;
  administeredBy: string;
  notes: string;
  reminderEnabled: boolean;
  reminderDate?: string;
  isUpcoming?: boolean;
  statusBadge?: string;
}

export interface PetCareRecord {
  id: string;
  petId: string;
  date: string;
  serviceTitle: string;
  serviceCategory: string;
  providerOrVanName: string;
  notes: string;
  vitals?: {
    weight?: string;
    temperature?: string;
    coatCondition?: string;
    behaviorNote?: string;
  };
  verifiedBadge: boolean;
}

export interface LiveLocationData {
  city: string;
  state: string;
  status: 'At Home' | 'On a Walk' | 'At Vet' | 'With Sitter' | 'In Van Session';
  battery: number;
  lastUpdated: string;
  mapImage: string;
}

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  age: string;
  weight: string;
  gender?: 'Male' | 'Female';
  location: string;
  description: string;
  photoUrl: string;
  bloodGroup: string;
  allergies: string;
  currentMedications: string;
  specialRequirements?: string;
  servicePreferences: string[];
  liveLocation: LiveLocationData;
  vaccinationStatus: string;
  healthStatusText: string;
  isAttentionNeeded?: boolean;
  healthEvents: HealthEvent[];
  careRecords?: PetCareRecord[];
}

export type ServiceCategory =
  | 'grooming'
  | 'walking'
  | 'sitting'
  | 'vet_consult'
  | 'training'
  | 'mobile_grooming'
  | 'mobile_vet'
  | 'adoption';

export interface ServiceProvider {
  id: string;
  name: string;
  category: ServiceCategory;
  title: string;
  rating: number;
  reviewCount: number;
  priceFormatted: string;
  priceNumber: number;
  city: string;
  area: string;
  image: string;
  isVerified: boolean;
  isMobileVanEligible?: boolean;
  bio: string;
  badge?: string;
  availableDays: string[];
  slots: string[];
}

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Assigned'
  | 'On the Way'
  | 'Arrived'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'wallet' | 'pay_later';

export type PaymentStatus =
  | 'Pending'
  | 'Processing'
  | 'Successful'
  | 'Failed'
  | 'Cancelled'
  | 'Refunded'
  | 'Partially Refunded';

export type RefundStatus =
  | 'None'
  | 'Requested'
  | 'Processing'
  | 'Refunded'
  | 'Failed';

export interface PaymentRecord {
  id: string;
  paymentId: string;
  transactionId: string;
  bookingId?: string;
  bookingRef?: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  providerId?: string;
  providerName?: string;
  serviceId?: string;
  serviceTitle: string;
  serviceCategory?: ServiceCategory;
  petId?: string;
  petName?: string;
  petSpecies?: string;
  petBreed?: string;
  amount: number;
  baseFare: number;
  doorstepFee?: number;
  discount: number;
  couponCode?: string;
  taxes: number;
  platformFee: number;
  providerPayout: number;
  paymentMethod: PaymentMethodType;
  paymentMethodDetails: {
    brandOrApp?: string;
    maskedAccount?: string;
  };
  paymentStatus: PaymentStatus;
  refundStatus: RefundStatus;
  refundAmount?: number;
  refundReason?: string;
  refundDate?: string;
  createdAt: string;
  paidAt?: string;
  invoiceNumber: string;
  failureReason?: string;
  isAdoptionPayment?: boolean;
  adoptionAnimalId?: string;
}

export interface ProviderPayoutRecord {
  id: string;
  providerId: string;
  providerName: string;
  amount: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  requestedAt: string;
  processedAt?: string;
  bankName: string;
  accountLast4: string;
  referenceNumber: string;
}

export interface Booking {
  id: string;
  petId: string;
  petName: string;
  petPhoto: string;
  petSpecies?: string;
  petBreed?: string;
  serviceCategory: ServiceCategory;
  serviceTitle: string;
  providerId: string;
  providerName: string;
  vanWorkerId?: string;
  vanWorkerName?: string;
  date: string;
  timeSlot: string;
  location: string;
  price: number;
  status: BookingStatus;
  paymentId?: string;
  transactionId?: string;
  paymentMethod?: PaymentMethodType;
  paymentStatus: 'Pending' | 'Paid' | 'Pay Later' | 'Refunded' | 'Failed';
  refundStatus?: RefundStatus;
  createdAt: string;
  notes?: string;
  specialInstructions?: string;
  bookingRef: string;
  isMobileService?: boolean;
  etaMinutes?: number;
}

export interface AgendaItem {
  id: string;
  category: 'Grooming' | 'Health' | 'Walking' | 'Sitting' | 'Training';
  title: string;
  timeText: string;
  locationOrDoctor: string;
  dueBadge: string;
  petName: string;
  actionText?: string;
  actionType?: 'book_vet' | 'view_booking';
}

export interface NotificationUpdate {
  id: string;
  text: string;
  time: string;
  type: 'booking' | 'health' | 'reminder' | 'adoption' | 'van';
  read: boolean;
}

// 5 Core Roles of Zooby Ecosystem
export type UserRole =
  | 'PET_PARENT'
  | 'PROVIDER'
  | 'RESCUE_PARTNER'
  | 'VAN_WORKER'
  | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl: string;
  location: string;
  role: UserRole;
  businessName?: string;
  serviceCategory?: ServiceCategory;
  isVerified?: boolean;
  rating?: number;
  joinedDate?: string;
  assignedVanId?: string;
  assignedVanPlate?: string;
  bio?: string;
  emergencyContact?: string;
}

// Adoption Entity & Application
export interface AdoptionAnimal {
  id: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Puppy' | 'Kitten';
  breed: string;
  age: string;
  gender: 'Male' | 'Female';
  location: string;
  description: string;
  photoUrl: string;
  shelterName: string;
  shelterId: string;
  vaccinated: boolean;
  neutered: boolean;
  healthStatus: string;
  status: 'Available' | 'Pending' | 'Adopted';
  postedDate: string;
  adoptionFee?: number; // 0 for free adoption, e.g. 500 for medical/shelter microchip fee
  feeDescription?: string;
}

export interface AdoptionApplication {
  id: string;
  animalId: string;
  animalName: string;
  animalPhoto: string;
  shelterId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantAddress: string;
  housingType: string;
  hasOtherPets: string;
  experienceNotes: string;
  submittedDate: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Declined';
  partnerNotes?: string;
  feeAmount?: number;
  paymentId?: string;
  paymentStatus?: 'Free' | 'Paid' | 'Pending' | 'Refunded';
}

// Mobile Van Job / Stop
export interface VanJob {
  id: string;
  bookingId: string;
  vanWorkerId: string;
  vanNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  petName: string;
  petSpecies: string;
  petBreed: string;
  petPhoto: string;
  handlingNotes: string;
  serviceTitle: string;
  scheduledTime: string;
  status: 'Assigned' | 'On the Way' | 'Arrived' | 'Service Started' | 'Service Completed';
  sequenceOrder: number;
  latitude?: number;
  longitude?: number;
  completedAt?: string;
  amount?: number;
  paymentStatus?: 'Pending' | 'Paid' | 'Pay Later' | 'Refunded';
}

export interface AdminUserPet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  age: string;
  avatarUrl: string;
}

export interface AdminUserBooking {
  id: string;
  service: string;
  provider: string;
  date: string;
  status: 'Completed' | 'Confirmed' | 'Pending' | 'Cancelled';
  amount: number;
}

export interface AdminUserTimeline {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'login' | 'profile' | 'pet' | 'booking' | 'system' | 'adoption' | 'van';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  location: string;
  primaryAddress: string;
  joinedDate: string;
  status: 'Active' | 'Suspended' | 'New';
  role: UserRole;
  paymentMethod: {
    brand: string;
    last4: string;
    expiry: string;
  };
  pets: AdminUserPet[];
  recentBookings: AdminUserBooking[];
  activityTimeline: AdminUserTimeline[];
}

export interface ProviderVerification {
  id: string;
  name: string;
  initials: string;
  service: string;
  status: 'Pending' | 'Reviewing' | 'Approved' | 'Rejected';
  avatarBg: string;
  submittedDate: string;
  licenseNumber?: string;
}

export interface AdminDashboardBooking {
  id: string;
  pet: string;
  service: string;
  amount: number;
  status: 'Confirmed' | 'Completed' | 'Pending' | 'Cancelled';
}


