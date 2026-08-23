import { UserRepository } from '../repositories/UserRepository';
import { User, toUserResponse, UserResponse } from '../models/User';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';
import { generateUserId } from '../utils/generators';
import { UserRole } from '../constants/roles';
import { ValidationError, UnauthorizedError, ConflictError, ForbiddenError } from '../utils/errors';

export interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  businessName?: string;
  serviceCategory?: string;
  assignedVanPlate?: string;
}

export interface LoginResult {
  token: string;
  user: UserResponse;
}

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(input: RegisterInput): Promise<LoginResult> {
    // Validate input
    this.validateRegisterInput(input);

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('Email already exists');
    }

    // Check if phone already exists (if provided)
    if (input.phone) {
      const existingPhone = await this.userRepository.findByPhone(input.phone);
      if (existingPhone) {
        throw new ConflictError('Phone number already exists');
      }
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Determine default avatar based on role
    let avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=160';
    if (input.role === UserRole.PROVIDER) {
      avatarUrl = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=240';
    } else if (input.role === UserRole.RESCUE_PARTNER) {
      avatarUrl = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=240';
    } else if (input.role === UserRole.VAN_WORKER) {
      avatarUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=240';
    }

    // Determine verification status
    const isVerified = input.role === UserRole.PET_PARENT || input.role === UserRole.VAN_WORKER;

    // Create user
    const user: User = {
      userId: generateUserId(input.role),
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      passwordHash,
      avatarUrl,
      location: 'Nashik, Maharashtra',
      role: input.role,
      status: 'Active',
      businessName: input.businessName,
      serviceCategory: input.serviceCategory,
      isVerified,
      assignedVanPlate: input.assignedVanPlate,
      createdAt: new Date(),
      updatedAt: new Date(),
      joinedDate: 'Today',
    };

    await this.userRepository.create(user);

    // Generate token
    const token = generateToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: toUserResponse(user),
    };
  }

  async login(emailOrPhone: string, password: string): Promise<LoginResult> {
    // Find user
    const user = await this.userRepository.findByEmailOrPhone(emailOrPhone);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if account is suspended
    if (user.status === 'Suspended') {
      throw new ForbiddenError('Account suspended');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.userId);

    // Generate token
    const token = generateToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: toUserResponse(user),
    };
  }

  async getUserByUserId(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findByUserId(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    return toUserResponse(user);
  }

  private validateRegisterInput(input: RegisterInput): void {
    const errors: any[] = [];

    if (!input.name || input.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
    }

    if (!input.email || !this.isValidEmail(input.email)) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }

    if (!input.password || input.password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
    }

    if (!input.role || !Object.values(UserRole).includes(input.role)) {
      errors.push({ field: 'role', message: 'Valid role is required' });
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
