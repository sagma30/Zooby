import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { VanLocationService } from '../services/VanLocationService';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class VanLocationController {
  private vanLocationService: VanLocationService;

  constructor() {
    this.vanLocationService = new VanLocationService();
  }

  updateLocation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { vanId } = req.params;
      const user = req.user;

      if (!user) {
        throw new UnauthorizedError('Authentication required to submit van GPS location');
      }

      const updated = await this.vanLocationService.updateLocation(
        vanId,
        user.userId,
        (req.body.workerName as string) || 'Lead Mobile Technician',
        user.role,
        req.body
      );

      sendSuccess(res, updated, 'Van location updated successfully');
    } catch (error) {
      next(error);
    }
  };

  getLocation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { vanId } = req.params;
      const location = await this.vanLocationService.getLocation(vanId);
      sendSuccess(res, location);
    } catch (error) {
      next(error);
    }
  };

  getAllLocationsForAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const locations = await this.vanLocationService.getLocationsForAdmin();
      sendSuccess(res, locations);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Server-Sent Events (SSE) stream for real-time live GPS coordinates.
   * Authorized Pet Parents, Van Workers, and Admins can stream updates with zero polling overhead.
   */
  streamLocations = (req: AuthRequest, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Initial ping
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);

    const handleLocationUpdate = (data: any) => {
      res.write(`data: ${JSON.stringify({ type: 'location_update', location: data })}\n\n`);
    };

    VanLocationService.locationEvents.on('location_update', handleLocationUpdate);

    req.on('close', () => {
      VanLocationService.locationEvents.off('location_update', handleLocationUpdate);
      res.end();
    });
  };
}
