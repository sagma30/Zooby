import { Collection } from 'mongodb';
import { getDatabase } from '../config/database';
import { Pet } from '../models/Pet';

export class PetRepository {
  private get collection(): Collection<Pet> {
    return getDatabase().collection<Pet>('pets');
  }

  async create(pet: Pet): Promise<Pet> {
    await this.collection.insertOne(pet as any);
    return pet;
  }

  async findByPetId(petId: string): Promise<Pet | null> {
    return this.collection.findOne({ petId });
  }

  async findByOwner(ownerId: string): Promise<Pet[]> {
    return this.collection.find({ ownerId }).toArray();
  }

  async updateByPetId(petId: string, updates: Partial<Pet>): Promise<Pet | null> {
    const result = await this.collection.findOneAndUpdate(
      { petId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result || null;
  }

  async deleteByPetId(petId: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ petId });
    return result.deletedCount > 0;
  }
}
