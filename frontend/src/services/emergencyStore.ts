import {
  EmergencyIncident,
  EmergencyCategory,
  EmergencyStatus,
  EmergencyUrgency,
  Pet
} from '../types';

export interface EmergencyTimelineEntry {
  time: string;
  description: string;
  badge?: string;
}

export interface EmergencyState extends EmergencyIncident {
  isMoving: boolean;
  vanCoordinates: { lat: number; lng: number; heading?: number };
  emergencyCoordinates: { lat: number; lng: number; address: string };
  vetAssigned?: {
    id: string;
    name: string;
    clinic: string;
    phone: string;
    status: 'NOTIFIED' | 'ACCEPTED' | 'SUPPORTING';
    avatarUrl?: string;
  };
  timeline: EmergencyTimelineEntry[];
  clinicalNotes?: string;
  treatmentAdministered?: string;
}

// Initial Default Emergency Coordinates (Gangapur Road, Nashik)
const DEFAULT_PET_LOCATION = {
  lat: 20.0055,
  lng: 73.7650,
  address: 'Silver Palm Enclave, Gangapur Road, Nashik'
};

// Initial Van Starting Location (College Road Hub, ~3.2 km away)
const DEFAULT_VAN_START = {
  lat: 19.9880,
  lng: 73.7890,
  heading: 320
};

type Listener = (...args: any[]) => void;

class EmergencyStore {
  private listeners: { [event: string]: Listener[] } = {};
  private activeIncident: EmergencyState | null = null;
  private movementTimer: any = null;
  private stepIndex: number = 0;

  on(event: string, fn: Listener) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  off(event: string, fn: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((l) => l !== fn);
  }

  emit(event: string, ...args: any[]) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((fn) => {
      try {
        fn(...args);
      } catch (err) {
        console.error('Error in emergencyStore listener:', err);
      }
    });
  }

  // Waypoint steps for realistic simulation approach
  private simulationSteps = [
    { distanceKm: 3.2, etaMinutes: 8, lat: 19.9880, lng: 73.7890, msg: 'Your Zooby Van is on the way.' },
    { distanceKm: 2.8, etaMinutes: 7, lat: 19.9920, lng: 73.7840, msg: 'Your Zooby Van is on the way.' },
    { distanceKm: 2.1, etaMinutes: 5, lat: 19.9960, lng: 73.7780, msg: 'Your Zooby Van is approximately 5 minutes away.' },
    { distanceKm: 1.4, etaMinutes: 3, lat: 20.0000, lng: 73.7720, msg: 'Your Zooby Van is approximately 3 minutes away.' },
    { distanceKm: 0.7, etaMinutes: 2, lat: 20.0035, lng: 73.7675, msg: 'Your Zooby Van is 700m away.' },
    { distanceKm: 0.2, etaMinutes: 1, lat: 20.0050, lng: 73.7655, msg: 'Your Zooby Van is 200m away. Approaching doorstep.' },
    { distanceKm: 0.0, etaMinutes: 0, lat: 20.0055, lng: 73.7650, msg: 'Your Zooby Van has arrived.' }
  ];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('zooby_active_emergency');
      if (saved) {
        this.activeIncident = JSON.parse(saved);
      }
    } catch {
      // ignore
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      if (this.activeIncident) {
        localStorage.setItem('zooby_active_emergency', JSON.stringify(this.activeIncident));
      } else {
        localStorage.removeItem('zooby_active_emergency');
      }
    } catch {
      // ignore
    }
  }

  getActiveEmergency(): EmergencyState | null {
    return this.activeIncident;
  }

  /**
   * Initializes and starts a new emergency response
   */
  startEmergency(params: {
    petName: string;
    petSpecies?: string;
    petBreed?: string;
    petPhoto?: string;
    category: EmergencyCategory;
    description: string;
    locationCoords?: { lat: number; lng: number; address?: string };
    userName?: string;
    userPhone?: string;
  }): EmergencyState {
    this.stopMovementSimulation();

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetLoc = params.locationCoords || DEFAULT_PET_LOCATION;

    const incident: EmergencyState = {
      incidentId: 'ZB-1042',
      userId: 'usr-parent-rohan',
      userName: params.userName || 'Rohan Mehta',
      userPhone: params.userPhone || '+91 98201 45678',
      petName: params.petName || 'Bruno',
      petSpecies: params.petSpecies || 'Dog',
      petBreed: params.petBreed || 'Golden Retriever',
      category: params.category || 'injury_bleeding',
      description: params.description || 'Pet injured and unable to move normally.',
      location: {
        latitude: targetLoc.lat,
        longitude: targetLoc.lng,
        address: targetLoc.address || 'Gangapur Road, Nashik'
      },
      triage: {
        urgency: 'HIGH',
        summary: `Immediate mobile response initiated for ${params.petName || 'Bruno'}.`,
        primaryConcern: params.category.replace('_', ' ').toUpperCase(),
        firstAidAdvice: [
          'Keep pet calm, warm, and minimize movement.',
          'Do NOT administer human painkillers.',
          'Keep airway straight and clear.'
        ],
        suggestedAction: 'Zooby Mobile Care Van ZMV-014 dispatched with emergency trauma kit.',
        isLifeThreatening: false,
        triageModel: 'gemini-2.5-flash',
        triagedAt: new Date()
      },
      assignedVanId: 'van-zmv-014',
      assignedVanPlate: 'ZMV-014',
      assignedWorkerId: 'usr-van-rahul',
      assignedWorkerName: 'Rahul',
      assignedWorkerPhone: '+91 98223 99001',
      status: 'DISPATCH_CONFIRMED',
      statusHistory: [],
      distanceKm: 3.2,
      etaMinutes: 8,
      isMoving: true,
      vanCoordinates: { ...DEFAULT_VAN_START },
      emergencyCoordinates: {
        lat: targetLoc.lat,
        lng: targetLoc.lng,
        address: targetLoc.address || 'Gangapur Road, Nashik'
      },
      vetAssigned: {
        id: 'prov-vet-mehta',
        name: 'Dr. Aarav Mehta',
        clinic: 'Zooby Care Vet Clinic, Nashik',
        phone: '+91 98221 44556',
        status: 'SUPPORTING',
        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=120'
      },
      timeline: [
        { time: timeStr, description: 'Pet Parent triggered 24/7 Rapid SOS', badge: 'SOS Triggered' },
        { time: timeStr, description: `Emergency location verified: ${targetLoc.address || 'Gangapur Road'}`, badge: 'GPS Confirmed' },
        { time: timeStr, description: 'Nearest Mobile Care Van ZMV-014 identified', badge: 'Van Found' },
        { time: timeStr, description: 'Nearby veterinary support notified (Dr. Mehta)', badge: 'Vet Notified' },
        { time: timeStr, description: 'Van Worker Rahul accepted emergency dispatch', badge: 'En Route' }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.activeIncident = incident;
    this.stepIndex = 0;
    this.saveToStorage();
    this.emit('emergency_updated', this.activeIncident);

    // Start progressive van movement simulation
    this.startMovementSimulation();

    return incident;
  }

  /**
   * Starts smooth progression of vehicle approaching the Pet Parent
   */
  startMovementSimulation() {
    this.stopMovementSimulation();
    if (!this.activeIncident) return;

    this.movementTimer = setInterval(() => {
      if (!this.activeIncident) {
        this.stopMovementSimulation();
        return;
      }

      if (this.stepIndex < this.simulationSteps.length - 1) {
        this.stepIndex++;
        const nextStep = this.simulationSteps[this.stepIndex];
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const isArrived = nextStep.distanceKm === 0;

        this.activeIncident = {
          ...this.activeIncident,
          distanceKm: nextStep.distanceKm,
          etaMinutes: nextStep.etaMinutes,
          vanCoordinates: {
            lat: nextStep.lat,
            lng: nextStep.lng,
            heading: 320
          },
          status: isArrived ? 'ARRIVED' : 'EN_ROUTE',
          timeline: [
            ...this.activeIncident.timeline,
            {
              time: timeStr,
              description: isArrived
                ? 'Zooby Mobile Care Van arrived at doorstep'
                : `Van is ${nextStep.distanceKm} km away (${nextStep.etaMinutes} mins)`,
              badge: isArrived ? 'Van Arrived' : undefined
            }
          ],
          updatedAt: new Date()
        };

        this.saveToStorage();
        this.emit('emergency_updated', this.activeIncident);

        if (isArrived) {
          this.stopMovementSimulation();
        }
      }
    }, 4500); // Progresses every 4.5 seconds
  }

  stopMovementSimulation() {
    if (this.movementTimer) {
      clearInterval(this.movementTimer);
      this.movementTimer = null;
    }
  }

  /**
   * Van Worker accepts emergency
   */
  acceptByWorker() {
    if (!this.activeIncident) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.activeIncident = {
      ...this.activeIncident,
      status: 'EN_ROUTE',
      timeline: [
        ...this.activeIncident.timeline,
        { time: timeStr, description: 'Van Worker Rahul started emergency route', badge: 'Route Started' }
      ],
      updatedAt: new Date()
    };

    this.saveToStorage();
    this.emit('emergency_updated', this.activeIncident);
  }

  /**
   * Van Worker or Vet marks van arrived
   */
  markArrived() {
    if (!this.activeIncident) return;
    this.stopMovementSimulation();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.activeIncident = {
      ...this.activeIncident,
      distanceKm: 0,
      etaMinutes: 0,
      vanCoordinates: {
        lat: this.activeIncident.emergencyCoordinates.lat,
        lng: this.activeIncident.emergencyCoordinates.lng
      },
      status: 'ARRIVED',
      timeline: [
        ...this.activeIncident.timeline,
        { time: timeStr, description: 'Zooby Emergency Van arrived at scene', badge: 'Arrived' }
      ],
      arrivedAt: new Date(),
      updatedAt: new Date()
    };

    this.saveToStorage();
    this.emit('emergency_updated', this.activeIncident);
  }

  /**
   * Starts on-scene medical care
   */
  startActiveCare() {
    if (!this.activeIncident) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.activeIncident = {
      ...this.activeIncident,
      status: 'IN_CARE',
      timeline: [
        ...this.activeIncident.timeline,
        { time: timeStr, description: 'Emergency stabilization & care started', badge: 'In Care' }
      ],
      updatedAt: new Date()
    };

    this.saveToStorage();
    this.emit('emergency_updated', this.activeIncident);
  }

  /**
   * Adds clinical notes by Van Worker or Vet
   */
  addClinicalNotes(notes: string, treatment?: string) {
    if (!this.activeIncident) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.activeIncident = {
      ...this.activeIncident,
      clinicalNotes: notes,
      treatmentAdministered: treatment,
      timeline: [
        ...this.activeIncident.timeline,
        { time: timeStr, description: `Clinical Note: ${notes}`, badge: 'Clinical Update' }
      ],
      updatedAt: new Date()
    };

    this.saveToStorage();
    this.emit('emergency_updated', this.activeIncident);
  }

  /**
   * Resolves emergency and saves to pet health records
   */
  resolveEmergency(resolutionNotes?: string): EmergencyState | null {
    if (!this.activeIncident) return null;
    this.stopMovementSimulation();

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const resolved: EmergencyState = {
      ...this.activeIncident,
      status: 'RESOLVED',
      resolutionNotes: resolutionNotes || 'Emergency stabilized successfully. Follow-up consultation scheduled.',
      resolvedAt: new Date(),
      timeline: [
        ...this.activeIncident.timeline,
        { time: timeStr, description: 'Emergency successfully resolved and closed', badge: 'Resolved' }
      ],
      updatedAt: new Date()
    };

    // Save into Pet Health History in localStorage
    try {
      const existingHistory = JSON.parse(localStorage.getItem('zooby_emergency_history') || '[]');
      localStorage.setItem('zooby_emergency_history', JSON.stringify([resolved, ...existingHistory]));

      // Also append to Bruno's pet health events if present
      const pets = JSON.parse(localStorage.getItem('zooby_pets') || '[]');
      const updatedPets = pets.map((p: Pet) => {
        if (p.name === resolved.petName || p.id === resolved.petId) {
          const newEvent = {
            id: `evt-${Date.now()}`,
            eventTitle: `Emergency #${resolved.incidentId} — ${resolved.category.replace('_', ' ')}`,
            eventType: 'treatment',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            notes: `Emergency response handled by ${resolved.assignedWorkerName} (${resolved.assignedVanPlate}) & ${resolved.vetAssigned?.name}. Outcome: ${resolved.resolutionNotes}`,
            administeredBy: `${resolved.vetAssigned?.name || 'Dr. Mehta'} & Zooby Mobile Van`,
            isUpcoming: false
          };
          return {
            ...p,
            healthEvents: [newEvent, ...(p.healthEvents || [])]
          };
        }
        return p;
      });
      localStorage.setItem('zooby_pets', JSON.stringify(updatedPets));
    } catch (e) {
      console.warn('Failed to persist health event for resolved emergency:', e);
    }

    this.activeIncident = resolved;
    this.saveToStorage();
    this.emit('emergency_updated', resolved);
    this.emit('emergency_resolved', resolved);

    return resolved;
  }

  /**
   * Resets active emergency state
   */
  clearEmergency() {
    this.stopMovementSimulation();
    this.activeIncident = null;
    this.saveToStorage();
    this.emit('emergency_cleared');
  }
}

export const emergencyStore = new EmergencyStore();
