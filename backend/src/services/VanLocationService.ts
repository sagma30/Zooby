import { EventEmitter } from 'events';
import { VanLocationRepository } from '../repositories/VanLocationRepository';
import { VanLocation, VanTrackingStatus } from '../models/VanLocation';
import { UnauthorizedError, ValidationError, NotFoundError } from '../utils/errors';

export interface LocationUpdatePayload {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  altitude?: number;
  batteryLevel?: number;
  trackingStatus?: VanTrackingStatus;
  currentJobId?: string;
  currentEmergencyId?: string;
}

export class VanLocationService {
  private vanLocationRepo: VanLocationRepository;
  public static locationEvents = new EventEmitter();

  constructor() {
    this.vanLocationRepo = new VanLocationRepository();
    // Increase event listener limit for SSE multi-client streams
    VanLocationService.locationEvents.setMaxListeners(100);
    this.ensureDefaultFleetSeeded();
  }

  private async ensureDefaultFleetSeeded() {
    const existing = await this.vanLocationRepo.getLocationByVanId('van-nashik-01');
    if (!existing) {
      const defaultVan: VanLocation = {
        vanId: 'van-nashik-01',
        vanPlate: 'MH 15 ZB 4022',
        workerId: 'usr-van-vikram',
        workerName: 'Vikram Pawar',
        latitude: 19.9975, // Nashik College Road Hub
        longitude: 73.7898,
        accuracy: 10,
        heading: 90,
        speed: 0,
        timestamp: new Date(),
        trackingStatus: 'ACTIVE',
        isEmergencyAvailable: true,
        batteryLevel: 94,
        lastUpdated: new Date()
      };
      await this.vanLocationRepo.upsertLocation(defaultVan);
    }
  }

  async updateLocation(
    vanId: string,
    workerId: string,
    workerName: string,
    workerRole: string,
    payload: LocationUpdatePayload
  ): Promise<VanLocation> {
    // 1. Validate coordinates
    if (
      typeof payload.latitude !== 'number' ||
      typeof payload.longitude !== 'number' ||
      payload.latitude < -90 ||
      payload.latitude > 90 ||
      payload.longitude < -180 ||
      payload.longitude > 180
    ) {
      throw new ValidationError('Invalid latitude or longitude coordinates');
    }

    // 2. Validate authorization
    // Only VAN_WORKER or ADMIN can update van location
    if (workerRole !== 'VAN_WORKER' && workerRole !== 'ADMIN') {
      throw new UnauthorizedError('Only authenticated Van Workers or Admins can transmit GPS location');
    }

    const existing = await this.vanLocationRepo.getLocationByVanId(vanId);
    
    // If van exists, ensure worker owns it or is admin
    if (existing && existing.workerId !== workerId && workerRole !== 'ADMIN') {
      throw new UnauthorizedError('You are not authorized to update GPS for this van unit');
    }

    const locationRecord: VanLocation = {
      vanId,
      vanPlate: existing?.vanPlate || 'MH 15 ZB 4022',
      workerId,
      workerName: workerName || existing?.workerName || 'Lead Mobile Technician',
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy,
      heading: payload.heading,
      speed: payload.speed,
      altitude: payload.altitude,
      batteryLevel: payload.batteryLevel ?? existing?.batteryLevel,
      trackingStatus: payload.trackingStatus || existing?.trackingStatus || 'ACTIVE',
      currentJobId: payload.currentJobId ?? existing?.currentJobId,
      currentEmergencyId: payload.currentEmergencyId ?? existing?.currentEmergencyId,
      isEmergencyAvailable: !payload.currentEmergencyId,
      timestamp: new Date(),
      lastUpdated: new Date()
    };

    const saved = await this.vanLocationRepo.upsertLocation(locationRecord);

    // 3. Broadcast real-time event to SSE subscribers
    VanLocationService.locationEvents.emit('location_update', saved);
    VanLocationService.locationEvents.emit(`van_location_${vanId}`, saved);

    return saved;
  }

  async getLocation(vanId: string): Promise<VanLocation> {
    const loc = await this.vanLocationRepo.getLocationByVanId(vanId);
    if (!loc) {
      throw new NotFoundError(`Van location for ${vanId} not found or van is offline`);
    }
    return loc;
  }

  async getLocationsForAdmin(): Promise<VanLocation[]> {
    return this.vanLocationRepo.getAllActiveLocations();
  }

  /**
   * Calculates Haversine distance in kilometers between two GPS coordinates
   */
  static calculateHaversineDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Estimates urban travel ETA in minutes based on distance and average traffic speed (25 km/h)
   */
  static calculateEtaMinutes(distanceKm: number): number {
    if (distanceKm <= 0.1) return 1;
    // Urban road path factor 1.35x crow-flies distance, average speed 25 km/h
    const roadDistanceKm = distanceKm * 1.35;
    const timeHours = roadDistanceKm / 25;
    const minutes = Math.ceil(timeHours * 60);
    return Math.max(1, minutes);
  }
}
