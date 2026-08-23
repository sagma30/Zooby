import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { UserService } from '../services/UserService';
import { successResponse } from '../utils/response';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      const user = await this.userService.getProfile(req.user.userId);
      return successResponse(res, user);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      const user = await this.userService.updateProfile(req.user.userId, req.body);
      return successResponse(res, user, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  };
}
