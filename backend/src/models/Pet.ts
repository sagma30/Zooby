export interface LiveLocation {
  city: string;
  state: string;
  status: string;
  battery: number;
  lastUpdated: Date;
  latitude?: number;
  longitude?: number;
  mapImage?: string;
}

export interface Pet {
  _id?: any;
  petId: string;
  ownerId: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Other';
  breed: string;
  age: string;
  weight: string;
  gender?: 'Male' | 'Female';
  photoUrl?: string;
  
  bloodGroup?: string;
  allergies?: string;
  currentMedications?: string;
  specialRequirements?: string;
  servicePreferences?: string[];
  
  microchipId?: string;
  diet?: string;
  
  vaccinationStatus?: string;
  healthStatusText?: string;
  isAttentionNeeded?: boolean;
  
  liveLocation?: LiveLocation;
  
  createdAt: Date;
  updatedAt: Date;
}
