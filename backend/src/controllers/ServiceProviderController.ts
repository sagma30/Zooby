import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { ServiceProviderService } from '../services/ServiceProviderService';
import { successResponse } from '../utils/response';

export class ServiceProviderController {
  private providerService: ServiceProviderService;

  constructor() {
    this.providerService = new ServiceProviderService();
  }

  searchProviders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { category, city, search, page, limit } = req.query;
      const result = await this.providerService.searchProviders(
        category as string,
        city as string,
        search as string,
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 20
      );
      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  };

  getProvider = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const provider = await this.providerService.getProviderById(req.params.providerId);
      return successResponse(res, { provider });
    } catch (error) {
      next(error);
    }
  };

  createProvider = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      const provider = await this.providerService.createProvider(req.user.userId, req.user.role, req.body);
      return successResponse(res, { provider }, 'Provider profile created successfully. Pending verification.', 201);
    } catch (error) {
      next(error);
    }
  };

  updateProvider = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      const provider = await this.providerService.updateProvider(
        req.params.providerId,
        req.user.userId,
        req.user.role,
        req.body
      );
      return successResponse(res, { provider }, 'Provider updated successfully');
    } catch (error) {
      next(error);
    }
  };
}
