import { EventEmitter } from 'events';
import { EmergencyRepository } from '../repositories/EmergencyRepository';
import { VanLocationRepository } from '../repositories/VanLocationRepository';
import { AITriageService } from './AITriageService';
import { VanLocationService } from './VanLocationService';
import {
  EmergencyIncident,
  EmergencyCategory,
  EmergencyLocation,
  EmergencyStatus
} from '../models/EmergencyIncident';
import { generateIncidentId } from '../utils/generators';
import { NotFoundError, ValidationError, UnauthorizedError } from '../utils/errors';

export interface DispatchSOSInput {
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  petId?: string;
  petName?: string;
  petSpecies?: string;
  petBreed?: string;
  petAge?: string;
  category: EmergencyCategory;
  description: string;
  audioTranscript?: string;
  location: EmergencyLocation;
}

export class EmergencyService {
  private emergencyRepo: EmergencyRepository;
  private vanLocationRepo: VanLocationRepository;
  private aiTriageService: AITriageService;
  public static emergencyEvents = new EventEmitter();

  constructor() {
    this.emergencyRepo = new EmergencyRepository();
    this.vanLocationRepo = new VanLocationRepository();
    this.aiTriageService = new AITriageService();
    EmergencyService.emergencyEvents.setMaxListeners(100);
  }

  /**
   * Evaluates symptoms without immediately dispatching (Preview / Triage step)
   */
  async triageOnly(input: {
    category: EmergencyCategory;
    description: string;
    petName?: string;
    petSpecies?: string;
    petBreed?: string;
    petAge?: string;
  }) {
    return this.aiTriageService.evaluateTriage(input);
  }

  /**
   * Dispatches 24/7 Rapid SOS:
   * 1. Evaluates AI Triage
   * 2. Scans for nearest available Zooby mobile van
   * 3. Calculates true distance and travel ETA
   * 4. Persists incident and broadcasts to Van Worker & Admin
   */
  async createAndDispatchSOS(input: DispatchSOSInput): Promise<EmergencyIncident> {
    if (!input.location || typeof input.location.latitude !== 'number' || typeof input.location.longitude !== 'number') {
      throw new ValidationError('Valid GPS location is required to dispatch an emergency mobile van');
    }

    // 1. Perform AI Clinical Triage
    const triage = await this.aiTriageService.evaluateTriage({
      category: input.category,
      description: input.description || input.audioTranscript || 'Emergency reported',
      petName: input.petName,
      petSpecies: input.petSpecies,
      petBreed: input.petBreed,
      petAge: input.petAge
    });

    const incidentId = generateIncidentId();

    // 2. Scan active vans and find nearest available
    const availableVans = await this.vanLocationRepo.getEmergencyAvailableVans();

    let matchedVan = null;
    let shortestDistance = Infinity;
    let calculatedEta: number | undefined = undefined;

    for (const van of availableVans) {
      const dist = VanLocationService.calculateHaversineDistanceKm(
        input.location.latitude,
        input.location.longitude,
        van.latitude,
        van.longitude
      );
      if (dist < shortestDistance) {
        shortestDistance = dist;
        matchedVan = van;
      }
    }

    let initialStatus: EmergencyStatus = 'NO_RESOURCE_AVAILABLE';
    if (matchedVan) {
      initialStatus = 'RESOURCE_ASSIGNED';
      calculatedEta = VanLocationService.calculateEtaMinutes(shortestDistance);
    }

    const incident: EmergencyIncident = {
      incidentId,
      userId: input.userId,
      userName: input.userName,
      userPhone: input.userPhone,
      userEmail: input.userEmail,
      petId: input.petId,
      petName: input.petName,
      petSpecies: input.petSpecies,
      petBreed: input.petBreed,
      petAge: input.petAge,
      category: input.category,
      description: input.description,
      audioTranscript: input.audioTranscript,
      location: input.location,
      triage,
      assignedVanId: matchedVan?.vanId,
      assignedVanPlate: matchedVan?.vanPlate,
      assignedWorkerId: matchedVan?.workerId,
      assignedWorkerName: matchedVan?.workerName,
      assignedWorkerPhone: '+91 98223 99001',
      status: initialStatus,
      statusHistory: [
        {
          status: 'CREATED',
          timestamp: new Date(),
          note: 'Rapid SOS triggered by pet parent',
          updatedBy: input.userName
        },
        {
          status: 'LOCATION_CONFIRMED',
          timestamp: new Date(),
          note: `GPS coordinates logged: ${input.location.latitude.toFixed(4)}, ${input.location.longitude.toFixed(4)}`,
          updatedBy: 'System'
        },
        {
          status: 'TRIAGE_COMPLETED',
          timestamp: new Date(),
          note: `AI Triage: Urgency ${triage.urgency} (${triage.primaryConcern})`,
          updatedBy: 'Zooby Triage Engine'
        },
        {
          status: initialStatus,
          timestamp: new Date(),
          note: matchedVan
            ? `Assigned nearest unit ${matchedVan.vanPlate} (${shortestDistance} km away)`
            : 'No available mobile van in sector. Escalated to hotline dispatch.',
          updatedBy: 'Dispatch Engine'
        }
      ],
      distanceKm: matchedVan ? shortestDistance : undefined,
      etaMinutes: calculatedEta,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const saved = await this.emergencyRepo.createIncident(incident);

    // If van matched, mark van as currently engaged in emergency
    if (matchedVan) {
      await this.vanLocationRepo.upsertLocation({
        ...matchedVan,
        currentEmergencyId: incidentId,
        isEmergencyAvailable: false,
        lastUpdated: new Date()
      });
    }

    // Broadcast real-time dispatch event
    EmergencyService.emergencyEvents.emit('incident_created', saved);
    EmergencyService.emergencyEvents.emit(`incident_${incidentId}`, saved);
    if (matchedVan) {
      EmergencyService.emergencyEvents.emit(`worker_dispatch_${matchedVan.workerId}`, saved);
    }

    return saved;
  }

  async getIncident(incidentId: string): Promise<EmergencyIncident> {
    const inc = await this.emergencyRepo.getIncidentById(incidentId);
    if (!inc) {
      throw new NotFoundError(`Emergency incident ${incidentId} not found`);
    }
    return inc;
  }

  async getActiveIncidentForUser(userId: string): Promise<EmergencyIncident | null> {
    return this.emergencyRepo.getActiveIncidentForUser(userId);
  }

  async getActiveIncidentForWorker(workerId: string): Promise<EmergencyIncident | null> {
    return this.emergencyRepo.getActiveIncidentForWorker(workerId);
  }

  async updateIncidentStatus(
    incidentId: string,
    newStatus: EmergencyStatus,
    updater: { userId: string; role: string; name: string },
    note?: string
  ): Promise<EmergencyIncident> {
    const inc = await this.getIncident(incidentId);

    // Validate permission
    const isOwner = inc.userId === updater.userId;
    const isAssignedWorker = inc.assignedWorkerId === updater.userId;
    const isAdmin = updater.role === 'ADMIN';

    if (!isOwner && !isAssignedWorker && !isAdmin) {
      throw new UnauthorizedError('Not authorized to update this emergency incident');
    }

    const updates: Partial<EmergencyIncident> = {
      status: newStatus,
      statusHistory: [
        ...inc.statusHistory,
        {
          status: newStatus,
          timestamp: new Date(),
          note: note || `Status updated to ${newStatus}`,
          updatedBy: updater.name
        }
      ]
    };

    if (newStatus === 'DISPATCH_CONFIRMED') updates.acceptedAt = new Date();
    if (newStatus === 'EN_ROUTE') updates.enRouteAt = new Date();
    if (newStatus === 'ARRIVED') updates.arrivedAt = new Date();
    if (newStatus === 'RESOLVED') {
      updates.resolvedAt = new Date();
      updates.resolutionNotes = note;
    }
    if (newStatus === 'CANCELLED') updates.cancelledAt = new Date();

    // If resolved or cancelled, release assigned van
    if (['RESOLVED', 'CANCELLED', 'NO_RESOURCE_AVAILABLE'].includes(newStatus) && inc.assignedVanId) {
      const van = await this.vanLocationRepo.getLocationByVanId(inc.assignedVanId);
      if (van) {
        await this.vanLocationRepo.upsertLocation({
          ...van,
          currentEmergencyId: undefined,
          isEmergencyAvailable: true,
          lastUpdated: new Date()
        });
      }
    }

    const updated = await this.emergencyRepo.updateIncident(incidentId, updates);
    if (!updated) throw new NotFoundError('Failed to update incident');

    EmergencyService.emergencyEvents.emit('incident_updated', updated);
    EmergencyService.emergencyEvents.emit(`incident_${incidentId}`, updated);
    return updated;
  }

  async getAllActiveIncidents(): Promise<EmergencyIncident[]> {
    return this.emergencyRepo.getActiveIncidents();
  }

  async getAllIncidents(): Promise<EmergencyIncident[]> {
    return this.emergencyRepo.getAllIncidents();
  }
}
