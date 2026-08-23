export type EmergencyCategory =
  | 'injury_bleeding'
  | 'breathing_problem'
  | 'unconscious_unresponsive'
  | 'possible_poisoning'
  | 'accident_trauma'
  | 'severe_pain'
  | 'severe_illness'
  | 'lost_injured_animal'
  | 'other';

export type EmergencyUrgency = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export type EmergencyStatus =
  | 'CREATED'
  | 'LOCATION_PENDING'
  | 'LOCATION_CONFIRMED'
  | 'TRIAGE_ACTIVE'
  | 'TRIAGE_COMPLETED'
  | 'DISPATCH_SEARCHING'
  | 'RESOURCE_ASSIGNED'
  | 'DISPATCH_CONFIRMED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'IN_CARE'
  | 'RESOLVED'
  | 'CANCELLED'
  | 'NO_RESOURCE_AVAILABLE'
  | 'LOCATION_UNAVAILABLE'
  | 'UNABLE_TO_DISPATCH';

export interface EmergencyLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  landmark?: string;
}

export interface EmergencyTriageDetails {
  urgency: EmergencyUrgency;
  summary: string;
  primaryConcern: string;
  firstAidAdvice: string[];
  suggestedAction: string;
  isLifeThreatening: boolean;
  triageModel: string;
  triagedAt: Date;
}

export interface EmergencyStatusLog {
  status: EmergencyStatus;
  timestamp: Date;
  note?: string;
  updatedBy: string;
}

export interface EmergencyIncident {
  _id?: any;
  incidentId: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  
  petId?: string;
  petName?: string;
  petSpecies?: string;
  petBreed?: string;
  petAge?: string;
  
  category: EmergencyCategory;
  description: string;
  audioTranscript?: string;
  
  location: EmergencyLocation;
  triage: EmergencyTriageDetails;
  
  assignedVanId?: string;
  assignedVanPlate?: string;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  assignedWorkerPhone?: string;
  
  status: EmergencyStatus;
  statusHistory: EmergencyStatusLog[];
  
  etaMinutes?: number;
  distanceKm?: number;
  
  createdAt: Date;
  updatedAt: Date;
  acceptedAt?: Date;
  enRouteAt?: Date;
  arrivedAt?: Date;
  resolvedAt?: Date;
  cancelledAt?: Date;
  
  resolutionNotes?: string;
}
