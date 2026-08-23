import { Collection } from 'mongodb';
import { getDatabase } from '../config/database';
import { User } from '../models/User';
import { UserRole } from '../constants/roles';

export class UserRepository {
  private collection: Collection<User>;

  constructor() {
    this.collection = getDatabase().collection<User>('users');
  }

  async create(user: User): Promise<User> {
    await this.collection.insertOne(user as any);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.collection.findOne({ email: email.toLowerCase() });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.collection.findOne({ phone });
  }

  async findByUserId(userId: string): Promise<User | null> {
    return this.collection.findOne({ userId });
  }

  async findByEmailOrPhone(emailOrPhone: string): Promise<User | null> {
    const normalized = emailOrPhone.toLowerCase().trim();
    return this.collection.findOne({
      $or: [
        { email: normalized },
        { phone: normalized }
      ]
    });
  }

  async updateByUserId(userId: string, updates: Partial<User>): Promise<User | null> {
    const result = await this.collection.findOneAndUpdate(
      { userId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result || null;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.collection.updateOne(
      { userId },
      { $set: { lastLoginAt: new Date() } }
    );
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.collection.find({ role }).toArray();
  }

  async findAll(filter: any = {}, limit: number = 50, skip: number = 0): Promise<User[]> {
    return this.collection.find(filter).skip(skip).limit(limit).toArray();
  }

  async count(filter: any = {}): Promise<number> {
    return this.collection.countDocuments(filter);
  }

  async updateStatus(userId: string, status: 'Active' | 'Suspended'): Promise<User | null> {
    const result = await this.collection.findOneAndUpdate(
      { userId },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result || null;
  }
}
