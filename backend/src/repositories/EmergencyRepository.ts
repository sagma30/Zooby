import { Db, Collection } from 'mongodb';
import { getDatabase } from '../config/database';
import { EmergencyIncident, EmergencyStatus } from '../models/EmergencyIncident';

export class EmergencyRepository {
  private collectionName = 'emergency_incidents';
  
  // In-memory hot storage for instant dispatch state
  private static liveIncidents: Map<string, EmergencyIncident> = new Map();

  private getCollection(): Collection<EmergencyIncident> {
    try {
      const db: Db = getDatabase();
      return db.collection<EmergencyIncident>(this.collectionName);
    } catch {
      return null as any;
    }
  }

  async createIncident(incident: EmergencyIncident): Promise<EmergencyIncident> {
    EmergencyRepository.liveIncidents.set(incident.incidentId, incident);

    try {
      const collection = this.getCollection();
      if (collection) {
        await collection.insertOne(incident);
      }
    } catch (error) {
      console.warn('Could not persist emergency incident to MongoDB, memory stored:', error);
    }

    return incident;
  }

  async getIncidentById(incidentId: string): Promise<EmergencyIncident | null> {
    const cached = EmergencyRepository.liveIncidents.get(incidentId);
    if (cached) return cached;

    try {
      const collection = this.getCollection();
      if (!collection) return null;
      const found = await collection.findOne({ incidentId });
      if (found) {
        EmergencyRepository.liveIncidents.set(incidentId, found);
      }
      return found;
    } catch {
      return null;
    }
  }

  async getActiveIncidentForUser(userId: string): Promise<EmergencyIncident | null> {
    const activeStatuses: EmergencyStatus[] = [
      'CREATED',
      'LOCATION_CONFIRMED',
      'TRIAGE_COMPLETED',
      'DISPATCH_SEARCHING',
      'RESOURCE_ASSIGNED',
      'DISPATCH_CONFIRMED',
      'EN_ROUTE',
      'ARRIVED',
      'IN_CARE'
    ];

    for (const inc of EmergencyRepository.liveIncidents.values()) {
      if (inc.userId === userId && activeStatuses.includes(inc.status)) {
        return inc;
      }
    }

    try {
      const collection = this.getCollection();
      if (!collection) return null;
      const found = await collection.findOne({
        userId,
        status: { $in: activeStatuses }
      });
      if (found) {
        EmergencyRepository.liveIncidents.set(found.incidentId, found);
      }
      return found;
    } catch {
      return null;
    }
  }

  async getActiveIncidentForWorker(workerId: string): Promise<EmergencyIncident | null> {
    const activeStatuses: EmergencyStatus[] = [
      'RESOURCE_ASSIGNED',
      'DISPATCH_CONFIRMED',
      'EN_ROUTE',
      'ARRIVED',
      'IN_CARE'
    ];

    for (const inc of EmergencyRepository.liveIncidents.values()) {
      if (inc.assignedWorkerId === workerId && activeStatuses.includes(inc.status)) {
        return inc;
      }
    }

    try {
      const collection = this.getCollection();
      if (!collection) return null;
      const found = await collection.findOne({
        assignedWorkerId: workerId,
        status: { $in: activeStatuses }
      });
      if (found) {
        EmergencyRepository.liveIncidents.set(found.incidentId, found);
      }
      return found;
    } catch {
      return null;
    }
  }

  async updateIncident(
    incidentId: string,
    updates: Partial<EmergencyIncident>
  ): Promise<EmergencyIncident | null> {
    const existing = await this.getIncidentById(incidentId);
    if (!existing) return null;

    const updated: EmergencyIncident = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };

    EmergencyRepository.liveIncidents.set(incidentId, updated);

    try {
      const collection = this.getCollection();
      if (collection) {
        await collection.updateOne(
          { incidentId },
          { $set: { ...updates, updatedAt: new Date() } }
        );
      }
    } catch (error) {
      console.warn('Could not update emergency incident in MongoDB:', error);
    }

    return updated;
  }

  async getAllIncidents(limit = 50): Promise<EmergencyIncident[]> {
    try {
      const collection = this.getCollection();
      if (!collection) {
        return Array.from(EmergencyRepository.liveIncidents.values());
      }
      const list = await collection.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
      list.forEach((i) => EmergencyRepository.liveIncidents.set(i.incidentId, i));
      return list;
    } catch {
      return Array.from(EmergencyRepository.liveIncidents.values());
    }
  }

  async getActiveIncidents(): Promise<EmergencyIncident[]> {
    const activeStatuses: EmergencyStatus[] = [
      'CREATED',
      'LOCATION_CONFIRMED',
      'TRIAGE_COMPLETED',
      'DISPATCH_SEARCHING',
      'RESOURCE_ASSIGNED',
      'DISPATCH_CONFIRMED',
      'EN_ROUTE',
      'ARRIVED',
      'IN_CARE'
    ];

    try {
      const collection = this.getCollection();
      if (!collection) {
        return Array.from(EmergencyRepository.liveIncidents.values()).filter((i) =>
          activeStatuses.includes(i.status)
        );
      }
      const list = await collection
        .find({ status: { $in: activeStatuses } })
        .sort({ createdAt: -1 })
        .toArray();
      list.forEach((i) => EmergencyRepository.liveIncidents.set(i.incidentId, i));
      return list;
    } catch {
      return Array.from(EmergencyRepository.liveIncidents.values()).filter((i) =>
        activeStatuses.includes(i.status)
      );
    }
  }
}
