import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { EmergencyService } from '../services/EmergencyService';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class EmergencyController {
  private emergencyService: EmergencyService;

  constructor() {
    this.emergencyService = new EmergencyService();
  }

  evaluateTriage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const triage = await this.emergencyService.triageOnly(req.body);
      sendSuccess(res, triage, 'AI Triage completed');
    } catch (error) {
      next(error);
    }
  };

  createAndDispatchSOS = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const payload = {
        userId: user?.userId || `usr-guest-${Date.now()}`,
        userName: req.body.userName || 'Pet Parent',
        userPhone: req.body.userPhone || '+91 98220 00000',
        userEmail: req.body.userEmail || user?.email,
        petId: req.body.petId,
        petName: req.body.petName,
        petSpecies: req.body.petSpecies,
        petBreed: req.body.petBreed,
        petAge: req.body.petAge,
        category: req.body.category || 'other',
        description: req.body.description || req.body.audioTranscript || 'Emergency SOS',
        audioTranscript: req.body.audioTranscript,
        location: req.body.location
      };

      const incident = await this.emergencyService.createAndDispatchSOS(payload);
      sendSuccess(res, incident, 'Emergency SOS dispatched', 201);
    } catch (error) {
      next(error);
    }
  };

  getIncident = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { incidentId } = req.params;
      const incident = await this.emergencyService.getIncident(incidentId);
      sendSuccess(res, incident);
    } catch (error) {
      next(error);
    }
  };

  getActiveIncident = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        throw new UnauthorizedError('Authentication required');
      }

      let active = null;
      if (user.role === 'VAN_WORKER') {
        active = await this.emergencyService.getActiveIncidentForWorker(user.userId);
      } else {
        active = await this.emergencyService.getActiveIncidentForUser(user.userId);
      }

      sendSuccess(res, active);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { incidentId } = req.params;
      const user = req.user;
      if (!user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { status, note } = req.body;
      const updated = await this.emergencyService.updateIncidentStatus(
        incidentId,
        status,
        { userId: user.userId, role: user.role, name: (req.body.updaterName as string) || 'User' },
        note
      );

      sendSuccess(res, updated, 'Emergency status updated');
    } catch (error) {
      next(error);
    }
  };

  getAllForAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const incidents = await this.emergencyService.getAllIncidents();
      sendSuccess(res, incidents);
    } catch (error) {
      next(error);
    }
  };

  streamEmergencies = (req: AuthRequest, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);

    const handleCreated = (data: any) => {
      res.write(`data: ${JSON.stringify({ type: 'incident_created', incident: data })}\n\n`);
    };

    const handleUpdated = (data: any) => {
      res.write(`data: ${JSON.stringify({ type: 'incident_updated', incident: data })}\n\n`);
    };

    EmergencyService.emergencyEvents.on('incident_created', handleCreated);
    EmergencyService.emergencyEvents.on('incident_updated', handleUpdated);

    req.on('close', () => {
      EmergencyService.emergencyEvents.off('incident_created', handleCreated);
      EmergencyService.emergencyEvents.off('incident_updated', handleUpdated);
      res.end();
    });
  };
}
