import {
  EmergencyIncident,
  EmergencyCategory,
  EmergencyStatus,
  EmergencyUrgency,
  Pet
} from '../types';

import { getCityById, findNearestSupportedCity, ZoobyCity } from '../data/citiesData';

export interface EmergencyTimelineEntry {
  time: string;
  description: string;
  badge?: string;
}

export interface EmergencyState extends EmergencyIncident {
  cityId: string;
  cityName: string;
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

type Listener = (...args: any[]) => void;

class EmergencyStore {
  private listeners: { [event: string]: Listener[] } = {};
  private activeIncident: EmergencyState | null = null;
  private movementTimer: any = null;
  private stepIndex: number = 0;
  private simulationSteps: Array<{ distanceKm: number; etaMinutes: number; lat: number; lng: number; msg: string }> = [];

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
   * Initializes and starts a new emergency response with city-aware dispatch
   */
  startEmergency(params: {
    cityId?: string;
    userId?: string;
    userName?: string;
    userPhone?: string;
    userEmail?: string;
    petId?: string;
    petName: string;
    petSpecies?: string;
    petBreed?: string;
    petPhoto?: string;
    category: EmergencyCategory;
    description: string;
    locationCoords?: { lat: number; lng: number; address?: string };
    assignedWorkerName?: string;
    assignedVanPlate?: string;
  }): EmergencyState {
    this.stopMovementSimulation();

    // Determine target city
    let targetCity: ZoobyCity;
    if (params.cityId) {
      targetCity = getCityById(params.cityId);
    } else if (params.locationCoords) {
      const nearest = findNearestSupportedCity(params.locationCoords.lat, params.locationCoords.lng, 150);
      targetCity = nearest ? nearest.city : getCityById('nashik');
    } else {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('zooby_selected_city') : null;
      targetCity = saved ? getCityById(saved) : getCityById('nashik');
    }

    const assignedVan = targetCity.assignedVans[0] || {
      vanId: 'van-zmv-014',
      plate: 'ZMV-014',
      workerName: 'Rahul Sharma',
      workerPhone: '+91 98223 99001'
    };

    const targetLoc = params.locationCoords || {
      lat: targetCity.coordinates.lat,
      lng: targetCity.coordinates.lng,
      address: `${targetCity.coverageAreas[0] || 'Gangapur Road'}, ${targetCity.name}`
    };

    const hubLoc = {
      lat: targetCity.vanHub.lat,
      lng: targetCity.vanHub.lng
    };

    const vanPlate = params.assignedVanPlate || assignedVan.plate || 'ZMV-014';
    const workerName = params.assignedWorkerName || assignedVan.workerName || 'Rahul Sharma';
    const parentName = params.userName || 'Sam Sharma';
    const parentPhone = params.userPhone || '+91 98220 11223';
    const parentId = params.userId || 'usr-parent-sam';
    const petDisplayName = params.petName || 'Bruno';

    // Generate dynamic waypoints from van hub to emergency scene
    this.simulationSteps = [
      { distanceKm: 3.2, etaMinutes: 8, lat: hubLoc.lat, lng: hubLoc.lng, msg: `Your Zooby Mobile Care Van (${vanPlate}) is on the way.` },
      { distanceKm: 2.8, etaMinutes: 7, lat: hubLoc.lat + (targetLoc.lat - hubLoc.lat) * 0.15, lng: hubLoc.lng + (targetLoc.lng - hubLoc.lng) * 0.15, msg: `Your Zooby Van (${workerName}) is navigating via ${targetCity.name} main route.` },
      { distanceKm: 2.1, etaMinutes: 5, lat: hubLoc.lat + (targetLoc.lat - hubLoc.lat) * 0.35, lng: hubLoc.lng + (targetLoc.lng - hubLoc.lng) * 0.35, msg: `Your Zooby Van is approximately 5 minutes away.` },
      { distanceKm: 1.4, etaMinutes: 3, lat: hubLoc.lat + (targetLoc.lat - hubLoc.lat) * 0.60, lng: hubLoc.lng + (targetLoc.lng - hubLoc.lng) * 0.60, msg: `Your Zooby Van is approximately 3 minutes away.` },
      { distanceKm: 0.7, etaMinutes: 2, lat: hubLoc.lat + (targetLoc.lat - hubLoc.lat) * 0.80, lng: hubLoc.lng + (targetLoc.lng - hubLoc.lng) * 0.80, msg: `Your Zooby Van is 700m away in ${targetCity.name}.` },
      { distanceKm: 0.2, etaMinutes: 1, lat: hubLoc.lat + (targetLoc.lat - hubLoc.lat) * 0.95, lng: hubLoc.lng + (targetLoc.lng - hubLoc.lng) * 0.95, msg: `Your Zooby Van is 200m away. Approaching doorstep.` },
      { distanceKm: 0.0, etaMinutes: 0, lat: targetLoc.lat, lng: targetLoc.lng, msg: `Your Zooby Van has arrived at ${parentName}'s doorstep in ${targetCity.name}.` }
    ];

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const incident: EmergencyState = {
      incidentId: 'ZB-1042',
      cityId: targetCity.id,
      cityName: targetCity.name,
      userId: parentId,
      userName: parentName,
      userPhone: parentPhone,
      userEmail: params.userEmail || 'sam@zooby.care',
      petId: params.petId || 'pet-bruno',
      petName: petDisplayName,
      petSpecies: params.petSpecies || 'Dog',
      petBreed: params.petBreed || 'Golden Retriever',
      category: params.category || 'injury_bleeding',
      description: params.description || `Emergency reported for ${petDisplayName} in ${targetCity.name}.`,
      location: {
        latitude: targetLoc.lat,
        longitude: targetLoc.lng,
        address: targetLoc.address || `${targetCity.name}`
      },
      triage: {
        urgency: 'HIGH',
        summary: `Immediate mobile response initiated for ${petDisplayName} in ${targetCity.name}.`,
        primaryConcern: params.category.replace('_', ' ').toUpperCase(),
        firstAidAdvice: [
          'Keep pet calm, warm, and minimize movement.',
          'Do NOT administer human painkillers.',
          'Keep airway straight and clear.'
        ],
        suggestedAction: `Zooby Mobile Care Van ${vanPlate} dispatched from ${targetCity.vanHub.name}.`,
        isLifeThreatening: false,
        triageModel: 'gemini-2.5-flash',
        triagedAt: new Date()
      },
      assignedVanId: assignedVan.vanId || 'van-zmv-014',
      assignedVanPlate: vanPlate,
      assignedWorkerId: 'usr-van-rahul',
      assignedWorkerName: workerName,
      assignedWorkerPhone: assignedVan.workerPhone || '+91 98223 99001',
      status: 'DISPATCH_CONFIRMED',
      statusHistory: [],
      distanceKm: 3.2,
      etaMinutes: 8,
      isMoving: true,
      vanCoordinates: { lat: hubLoc.lat, lng: hubLoc.lng, heading: 320 },
      emergencyCoordinates: {
        lat: targetLoc.lat,
        lng: targetLoc.lng,
        address: targetLoc.address || `${targetCity.name}`
      },
      vetAssigned: {
        id: 'usr-vet-ananya',
        name: 'Dr. Ananya Mehta',
        clinic: 'Nashik Paws & Vet Care Clinic',
        phone: '+91 98221 44556',
        status: 'SUPPORTING',
        avatarUrl: 'https://images.unsplash.com/photo-1594824813689-0b73c4d7e2e3?auto=format&fit=crop&q=80&w=240'
      },
      timeline: [
        { time: timeStr, description: `Pet Parent ${parentName} triggered 24/7 Rapid SOS for ${petDisplayName} in ${targetCity.name}`, badge: 'SOS Triggered' },
        { time: timeStr, description: `Location verified: ${targetLoc.address}`, badge: 'GPS Confirmed' },
        { time: timeStr, description: `Nearest Mobile Care Van (${vanPlate}) dispatched`, badge: 'Van Found' },
        { time: timeStr, description: `Veterinary support notified (Dr. Ananya Mehta)`, badge: 'Vet Notified' },
        { time: timeStr, description: `Van Responder (${workerName}) accepted emergency route`, badge: 'En Route' }
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
