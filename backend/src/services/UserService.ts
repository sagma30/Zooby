import { UserRepository } from '../repositories/UserRepository';
import { UserResponse, toUserResponse } from '../models/User';
import { NotFoundError, ValidationError } from '../utils/errors';

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  location?: string;
  bio?: string;
  emergencyContact?: string;
}

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findByUserId(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return toUserResponse(user);
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserResponse> {
    // Validate input
    if (input.name && input.name.trim().length < 2) {
      throw new ValidationError('Name must be at least 2 characters');
    }

    const user = await this.userRepository.updateByUserId(userId, input);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return toUserResponse(user);
  }
}
