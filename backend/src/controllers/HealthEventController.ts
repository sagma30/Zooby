import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { HealthEventService } from '../services/HealthEventService';
import { successResponse } from '../utils/response';

export class HealthEventController {
  private healthEventService: HealthEventService;

  constructor() {
    this.healthEventService = new HealthEventService();
  }

  getHealthEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      const events = await this.healthEventService.getHealthEventsByPet(
        req.params.petId,
        req.user.userId,
        req.user.role
      );
      return successResponse(res, { events });
    } catch (error) {
      next(error);
    }
  };

  createHealthEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      const event = await this.healthEventService.createHealthEvent(
        req.params.petId,
        req.user.userId,
        req.user.role,
        req.body
      );
      return successResponse(res, { event }, 'Health event created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  updateHealthEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      const event = await this.healthEventService.updateHealthEvent(
        req.params.eventId,
        req.user.userId,
        req.user.role,
        req.body
      );
      return successResponse(res, { event }, 'Health event updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteHealthEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      await this.healthEventService.deleteHealthEvent(
        req.params.eventId,
        req.user.userId,
        req.user.role
      );
      return successResponse(res, null, 'Health event deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
