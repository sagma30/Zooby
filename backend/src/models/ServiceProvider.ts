export interface ServiceProvider {
  _id?: any;
  providerId: string;
  userId: string; // Link to user account
  
  name: string;
  category: string;
  title: string;
  
  rating: number;
  reviewCount: number;
  priceFormatted: string;
  priceNumber: number;
  
  city: string;
  area: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  
  image?: string;
  images?: string[];
  
  isVerified: boolean;
  isMobileVanEligible?: boolean;
  badge?: string;
  bio?: string;
  
  availableDays?: string[];
  slots?: string[];
  
  certifications?: string[];
  experience?: string;
  
  status: 'Active' | 'Pending' | 'Suspended';
  
  createdAt: Date;
  updatedAt: Date;
}
