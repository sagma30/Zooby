import { HealthEventRepository } from '../repositories/HealthEventRepository';
import { PetRepository } from '../repositories/PetRepository';
import { HealthEvent } from '../models/HealthEvent';
import { generateEventId } from '../utils/generators';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';

export interface CreateHealthEventInput {
  eventType: 'vaccination' | 'medication' | 'vet_visit' | 'routine_checkup' | 'surgery' | 'allergy' | 'treatment' | 'grooming' | 'other';
  eventTitle: string;
  date: string;
  administeredBy: string;
  notes: string;
  reminderEnabled?: boolean;
  reminderDate?: string;
}

export class HealthEventService {
  private healthEventRepository: HealthEventRepository;
  private petRepository: PetRepository;

  constructor() {
    this.healthEventRepository = new HealthEventRepository();
    this.petRepository = new PetRepository();
  }

  async createHealthEvent(petId: string, requesterId: string, requesterRole: string, input: CreateHealthEventInput): Promise<HealthEvent> {
    // Verify pet exists and user has access
    const pet = await this.petRepository.findByPetId(petId);
    if (!pet) {
      throw new NotFoundError('Pet not found');
    }

    if (pet.ownerId !== requesterId && requesterRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied');
    }

    // Validate input
    this.validateHealthEventInput(input);

    const eventDate = new Date(input.date);
    const isUpcoming = eventDate > new Date();

    const event: HealthEvent = {
      eventId: generateEventId(),
      petId,
      ownerId: pet.ownerId,
      eventType: input.eventType,
      eventTitle: input.eventTitle,
      date: eventDate,
      administeredBy: input.administeredBy,
      notes: input.notes,
      reminderEnabled: input.reminderEnabled || false,
      reminderDate: input.reminderDate ? new Date(input.reminderDate) : undefined,
      isUpcoming,
      statusBadge: isUpcoming ? 'Upcoming' : 'Completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.healthEventRepository.create(event);
  }

  async getHealthEventsByPet(petId: string, requesterId: string, requesterRole: string): Promise<HealthEvent[]> {
    // Verify pet exists and user has access
    const pet = await this.petRepository.findByPetId(petId);
    if (!pet) {
      throw new NotFoundError('Pet not found');
    }

    if (pet.ownerId !== requesterId && requesterRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied');
    }

    return this.healthEventRepository.findByPetId(petId);
  }

  async updateHealthEvent(eventId: string, requesterId: string, requesterRole: string, updates: Partial<CreateHealthEventInput>): Promise<HealthEvent> {
    const event = await this.healthEventRepository.findByEventId(eventId);
    if (!event) {
      throw new NotFoundError('Health event not found');
    }

    if (event.ownerId !== requesterId && requesterRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied');
    }

    const updateData: any = { ...updates };
    if (updates.date) {
      updateData.date = new Date(updates.date);
      updateData.isUpcoming = updateData.date > new Date();
    }
    if (updates.reminderDate) {
      updateData.reminderDate = new Date(updates.reminderDate);
    }

    const updated = await this.healthEventRepository.updateByEventId(eventId, updateData);
    if (!updated) {
      throw new NotFoundError('Health event not found');
    }

    return updated;
  }

  async deleteHealthEvent(eventId: string, requesterId: string, requesterRole: string): Promise<void> {
    const event = await this.healthEventRepository.findByEventId(eventId);
    if (!event) {
      throw new NotFoundError('Health event not found');
    }

    if (event.ownerId !== requesterId && requesterRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied');
    }

    await this.healthEventRepository.deleteByEventId(eventId);
  }

  private validateHealthEventInput(input: CreateHealthEventInput): void {
    const errors: any[] = [];

    if (!input.eventType) {
      errors.push({ field: 'eventType', message: 'Event type is required' });
    }

    if (!input.eventTitle || input.eventTitle.trim().length < 2) {
      errors.push({ field: 'eventTitle', message: 'Event title is required' });
    }

    if (!input.date) {
      errors.push({ field: 'date', message: 'Date is required' });
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }
  }
}
