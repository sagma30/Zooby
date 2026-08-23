import { PetRepository } from '../repositories/PetRepository';
import { Pet } from '../models/Pet';
import { generatePetId } from '../utils/generators';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';

export interface CreatePetInput {
  name: string;
  species: 'Dog' | 'Cat' | 'Other';
  breed: string;
  age: string;
  weight: string;
  gender?: 'Male' | 'Female';
  photoUrl?: string;
  bloodGroup?: string;
  allergies?: string;
  currentMedications?: string;
  specialRequirements?: string;
  servicePreferences?: string[];
  microchipId?: string;
  diet?: string;
}

export class PetService {
  private petRepository: PetRepository;

  constructor() {
    this.petRepository = new PetRepository();
  }

  async createPet(ownerId: string, input: CreatePetInput): Promise<Pet> {
    // Validate input
    this.validatePetInput(input);

    const pet: Pet = {
      petId: generatePetId(),
      ownerId,
      name: input.name,
      species: input.species,
      breed: input.breed,
      age: input.age,
      weight: input.weight,
      gender: input.gender,
      photoUrl: input.photoUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400',
      bloodGroup: input.bloodGroup,
      allergies: input.allergies || 'None',
      currentMedications: input.currentMedications || 'None',
      specialRequirements: input.specialRequirements,
      servicePreferences: input.servicePreferences || [],
      microchipId: input.microchipId,
      diet: input.diet,
      vaccinationStatus: 'Up-to-date',
      healthStatusText: 'Healthy',
      isAttentionNeeded: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.petRepository.create(pet);
  }

  async getPetsByOwner(ownerId: string): Promise<Pet[]> {
    return this.petRepository.findByOwner(ownerId);
  }

  async getPetById(petId: string, requesterId: string, requesterRole: string): Promise<Pet> {
    const pet = await this.petRepository.findByPetId(petId);
    if (!pet) {
      throw new NotFoundError('Pet not found');
    }

    // Authorization: only owner or admin can view
    if (pet.ownerId !== requesterId && requesterRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied');
    }

    return pet;
  }

  async updatePet(petId: string, requesterId: string, requesterRole: string, updates: Partial<CreatePetInput>): Promise<Pet> {
    const pet = await this.petRepository.findByPetId(petId);
    if (!pet) {
      throw new NotFoundError('Pet not found');
    }

    // Authorization: only owner or admin can update
    if (pet.ownerId !== requesterId && requesterRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied');
    }

    // Validate updates if name or species are being changed
    if (updates.name && updates.name.trim().length < 2) {
      throw new ValidationError('Name must be at least 2 characters');
    }

    const updated = await this.petRepository.updateByPetId(petId, updates);
    if (!updated) {
      throw new NotFoundError('Pet not found');
    }

    return updated;
  }

  async deletePet(petId: string, requesterId: string, requesterRole: string): Promise<void> {
    const pet = await this.petRepository.findByPetId(petId);
    if (!pet) {
      throw new NotFoundError('Pet not found');
    }

    // Authorization: only owner or admin can delete
    if (pet.ownerId !== requesterId && requesterRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied');
    }

    await this.petRepository.deleteByPetId(petId);
  }

  private validatePetInput(input: CreatePetInput): void {
    const errors: any[] = [];

    if (!input.name || input.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
    }

    if (!input.species || !['Dog', 'Cat', 'Other'].includes(input.species)) {
      errors.push({ field: 'species', message: 'Valid species is required (Dog, Cat, Other)' });
    }

    if (!input.breed || input.breed.trim().length < 2) {
      errors.push({ field: 'breed', message: 'Breed is required' });
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }
  }
}
