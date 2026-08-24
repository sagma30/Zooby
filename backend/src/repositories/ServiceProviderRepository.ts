import { Collection } from 'mongodb';
import { getDatabase } from '../config/database';
import { ServiceProvider } from '../models/ServiceProvider';

export class ServiceProviderRepository {
  private get collection(): Collection<ServiceProvider> {
    return getDatabase().collection<ServiceProvider>('service_providers');
  }

  async create(provider: ServiceProvider): Promise<ServiceProvider> {
    await this.collection.insertOne(provider as any);
    return provider;
  }

  async findByProviderId(providerId: string): Promise<ServiceProvider | null> {
    return this.collection.findOne({ providerId });
  }

  async findByUserId(userId: string): Promise<ServiceProvider | null> {
    return this.collection.findOne({ userId });
  }

  async search(filters: any, limit: number = 20, skip: number = 0): Promise<ServiceProvider[]> {
    return this.collection.find(filters).skip(skip).limit(limit).toArray();
  }

  async count(filters: any): Promise<number> {
    return this.collection.countDocuments(filters);
  }

  async updateByProviderId(providerId: string, updates: Partial<ServiceProvider>): Promise<ServiceProvider | null> {
    const result = await this.collection.findOneAndUpdate(
      { providerId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result || null;
  }

  async findPending(): Promise<ServiceProvider[]> {
    return this.collection.find({ status: 'Pending' }).toArray();
  }
}
