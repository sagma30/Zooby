import { Collection } from 'mongodb';
import { getDatabase } from '../config/database';
import { Booking } from '../models/Booking';

export class BookingRepository {
  private collection: Collection<Booking>;

  constructor() {
    this.collection = getDatabase().collection<Booking>('bookings');
  }

  async create(booking: Booking): Promise<Booking> {
    await this.collection.insertOne(booking as any);
    return booking;
  }

  async findByBookingId(bookingId: string): Promise<Booking | null> {
    return this.collection.findOne({ bookingId });
  }

  async findByUser(userId: string, filters: any = {}): Promise<Booking[]> {
    return this.collection.find({ userId, ...filters }).sort({ createdAt: -1 }).toArray();
  }

  async findByProvider(providerId: string, filters: any = {}): Promise<Booking[]> {
    return this.collection.find({ providerId, ...filters }).sort({ createdAt: -1 }).toArray();
  }

  async findByVanWorker(vanWorkerId: string, filters: any = {}): Promise<Booking[]> {
    return this.collection.find({ vanWorkerId, ...filters }).sort({ createdAt: -1 }).toArray();
  }

  async updateByBookingId(bookingId: string, updates: Partial<Booking>): Promise<Booking | null> {
    const result = await this.collection.findOneAndUpdate(
      { bookingId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result || null;
  }

  async findAll(filters: any = {}, limit: number = 50, skip: number = 0): Promise<Booking[]> {
    return this.collection.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }).toArray();
  }

  async count(filters: any = {}): Promise<number> {
    return this.collection.countDocuments(filters);
  }
}
