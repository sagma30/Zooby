import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { AuthService } from '../services/AuthService';
import { successResponse } from '../utils/response';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.register(req.body);
      return successResponse(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { emailOrPhone, password } = req.body;
      const result = await this.authService.login(emailOrPhone, password);
      return successResponse(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }
      
      const user = await this.authService.getUserByUserId(req.user.userId);
      return successResponse(res, { user });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // JWT is stateless, so logout is handled client-side
      return successResponse(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  };
}
