import { Collection } from 'mongodb';
import { getDatabase } from '../config/database';
import { HealthEvent } from '../models/HealthEvent';

export class HealthEventRepository {
  private get collection(): Collection<HealthEvent> {
    return getDatabase().collection<HealthEvent>('health_events');
  }

  async create(event: HealthEvent): Promise<HealthEvent> {
    await this.collection.insertOne(event as any);
    return event;
  }

  async findByPetId(petId: string): Promise<HealthEvent[]> {
    return this.collection.find({ petId }).sort({ date: -1 }).toArray();
  }

  async findByEventId(eventId: string): Promise<HealthEvent | null> {
    return this.collection.findOne({ eventId });
  }

  async updateByEventId(eventId: string, updates: Partial<HealthEvent>): Promise<HealthEvent | null> {
    const result = await this.collection.findOneAndUpdate(
      { eventId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result || null;
  }

  async deleteByEventId(eventId: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ eventId });
    return result.deletedCount > 0;
  }

  async findUpcomingByOwner(ownerId: string): Promise<HealthEvent[]> {
    return this.collection.find({
      ownerId,
      isUpcoming: true,
      date: { $gte: new Date() }
    }).sort({ date: 1 }).toArray();
  }
}
