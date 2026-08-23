import { Db, Collection } from 'mongodb';
import { getDatabase } from '../config/database';
import { VanLocation } from '../models/VanLocation';

export class VanLocationRepository {
  private collectionName = 'van_locations';
  
  // In-memory hot cache for ultra-fast, low-latency live GPS location streaming
  private static liveLocations: Map<string, VanLocation> = new Map();

  private getCollection(): Collection<VanLocation> {
    try {
      const db: Db = getDatabase();
      return db.collection<VanLocation>(this.collectionName);
    } catch {
      // Fallback if DB is not yet connected in tests/hot startup
      return null as any;
    }
  }

  async upsertLocation(locationData: VanLocation): Promise<VanLocation> {
    // 1. Update In-Memory Cache
    VanLocationRepository.liveLocations.set(locationData.vanId, locationData);

    // 2. Persist to MongoDB
    try {
      const collection = this.getCollection();
      if (collection) {
        await collection.updateOne(
          { vanId: locationData.vanId },
          { $set: { ...locationData, lastUpdated: new Date() } },
          { upsert: true }
        );
      }
    } catch (error) {
      console.warn('Could not persist van location to MongoDB, using memory cache:', error);
    }

    return locationData;
  }

  async getLocationByVanId(vanId: string): Promise<VanLocation | null> {
    // Check in-memory cache first
    const cached = VanLocationRepository.liveLocations.get(vanId);
    if (cached) return cached;

    try {
      const collection = this.getCollection();
      if (!collection) return null;
      const found = await collection.findOne({ vanId });
      if (found) {
        VanLocationRepository.liveLocations.set(vanId, found);
      }
      return found;
    } catch {
      return null;
    }
  }

  async getLocationByWorkerId(workerId: string): Promise<VanLocation | null> {
    // Check in-memory cache
    for (const loc of VanLocationRepository.liveLocations.values()) {
      if (loc.workerId === workerId) return loc;
    }

    try {
      const collection = this.getCollection();
      if (!collection) return null;
      const found = await collection.findOne({ workerId });
      if (found) {
        VanLocationRepository.liveLocations.set(found.vanId, found);
      }
      return found;
    } catch {
      return null;
    }
  }

  async getAllActiveLocations(): Promise<VanLocation[]> {
    const list = Array.from(VanLocationRepository.liveLocations.values());
    if (list.length > 0) return list;

    try {
      const collection = this.getCollection();
      if (!collection) return [];
      const records = await collection.find({ trackingStatus: { $in: ['ACTIVE', 'PAUSED'] } }).toArray();
      records.forEach((r) => VanLocationRepository.liveLocations.set(r.vanId, r));
      return records;
    } catch {
      return [];
    }
  }

  async getEmergencyAvailableVans(): Promise<VanLocation[]> {
    const active = await this.getAllActiveLocations();
    return active.filter(
      (v) => v.trackingStatus === 'ACTIVE' && v.isEmergencyAvailable !== false
    );
  }
}
