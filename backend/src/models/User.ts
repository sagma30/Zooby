import { UserRole } from '../constants/roles';

export interface User {
  _id?: any;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  avatarUrl?: string;
  location?: string;
  role: UserRole;
  status: 'Active' | 'Suspended' | 'New';
  
  // Role-specific fields
  businessName?: string;
  serviceCategory?: string;
  isVerified?: boolean;
  verificationDocuments?: string[];
  rating?: number;
  reviewCount?: number;
  assignedVanId?: string;
  assignedVanPlate?: string;
  
  bio?: string;
  emergencyContact?: string;
  
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  joinedDate?: string;
}

export type UserResponse = Omit<User, 'passwordHash' | '_id'>;

export function toUserResponse(user: User): UserResponse {
  const { passwordHash, _id, ...rest } = user;
  return rest;
}
