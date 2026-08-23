export type VanTrackingStatus = 'ACTIVE' | 'PAUSED' | 'OFFLINE';

export interface VanLocation {
  _id?: any;
  vanId: string;
  vanPlate: string;
  workerId: string;
  workerName: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  altitude?: number;
  timestamp: Date;
  trackingStatus: VanTrackingStatus;
  currentJobId?: string;
  currentEmergencyId?: string;
  batteryLevel?: number;
  isEmergencyAvailable: boolean;
  lastUpdated: Date;
}
