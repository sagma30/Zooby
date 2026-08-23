export interface HealthEvent {
  _id?: any;
  eventId: string;
  petId: string;
  ownerId: string;
  
  eventType: 'vaccination' | 'medication' | 'vet_visit' | 'routine_checkup' | 'surgery' | 'allergy' | 'treatment' | 'grooming' | 'other';
  eventTitle: string;
  date: Date;
  administeredBy: string;
  notes: string;
  
  reminderEnabled: boolean;
  reminderDate?: Date;
  isUpcoming?: boolean;
  statusBadge?: string;
  
  attachments?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}
