import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { PetService } from '../services/PetService';
import { successResponse } from '../utils/response';

export class PetController {
  private petService: PetService;

  constructor() {
    this.petService = new PetService();
  }

  getPets = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      const pets = await this.petService.getPetsByOwner(req.user.userId);
      return successResponse(res, { pets });
    } catch (error) {
      next(error);
    }
  };

  getPet = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      const pet = await this.petService.getPetById(req.params.petId, req.user.userId, req.user.role);
      return successResponse(res, { pet });
    } catch (error) {
      next(error);
    }
  };

  createPet = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      const pet = await this.petService.createPet(req.user.userId, req.body);
      return successResponse(res, { pet }, 'Pet added successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  updatePet = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      const pet = await this.petService.updatePet(req.params.petId, req.user.userId, req.user.role, req.body);
      return successResponse(res, { pet }, 'Pet updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deletePet = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      await this.petService.deletePet(req.params.petId, req.user.userId, req.user.role);
      return successResponse(res, null, 'Pet deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
