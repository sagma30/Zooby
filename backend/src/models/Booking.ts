export interface Booking {
  _id?: any;
  bookingId: string;
  bookingRef: string; // ZB-XXXXXX
  
  userId: string;
  petId: string;
  petName: string;
  petPhoto?: string;
  petSpecies?: string;
  petBreed?: string;
  
  serviceCategory: string;
  serviceTitle: string;
  providerId: string;
  providerName: string;
  
  vanWorkerId?: string;
  vanWorkerName?: string;
  
  date: Date;
  timeSlot: string;
  location: string;
  customerAddress?: string;
  
  price: number;
  baseFare?: number;
  doorstepFee?: number;
  discount?: number;
  taxes?: number;
  platformFee?: number;
  
  status: 'Pending' | 'Confirmed' | 'Assigned' | 'On the Way' | 'Arrived' | 'In Progress' | 'Completed' | 'Cancelled';
  
  paymentId?: string;
  transactionId?: string;
  paymentMethod?: string;
  paymentStatus: 'Pending' | 'Paid' | 'Pay Later' | 'Refunded' | 'Failed';
  refundStatus?: string;
  
  notes?: string;
  specialInstructions?: string;
  
  isMobileService?: boolean;
  etaMinutes?: number;
  
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
