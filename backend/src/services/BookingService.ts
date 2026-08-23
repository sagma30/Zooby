import { BookingRepository } from '../repositories/BookingRepository';
import { PetRepository } from '../repositories/PetRepository';
import { ServiceProviderRepository } from '../repositories/ServiceProviderRepository';
import { Booking } from '../models/Booking';
import { generateBookingId, generateBookingRef } from '../utils/generators';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';

export interface CreateBookingInput {
  petId: string;
  providerId: string;
  serviceCategory: string;
  serviceTitle: string;
  date: string;
  timeSlot: string;
  location: string;
  price: number;
  isMobileService?: boolean;
  notes?: string;
}

export class BookingService {
  private bookingRepository: BookingRepository;
  private petRepository: PetRepository;
  private providerRepository: ServiceProviderRepository;

  constructor() {
    this.bookingRepository = new BookingRepository();
    this.petRepository = new PetRepository();
    this.providerRepository = new ServiceProviderRepository();
  }

  async createBooking(userId: string, input: CreateBookingInput): Promise<Booking> {
    // Verify pet belongs to user
    const pet = await this.petRepository.findByPetId(input.petId);
    if (!pet) {
      throw new NotFoundError('Pet not found');
    }
    if (pet.ownerId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    // Verify provider exists
    const provider = await this.providerRepository.findByProviderId(input.providerId);
    if (!provider) {
      throw new NotFoundError('Provider not found');
    }

    const booking: Booking = {
      bookingId: generateBookingId(),
      bookingRef: generateBookingRef(),
      userId,
      petId: input.petId,
      petName: pet.name,
      petPhoto: pet.photoUrl,
      petSpecies: pet.species,
      petBreed: pet.breed,
      serviceCategory: input.serviceCategory,
      serviceTitle: input.serviceTitle,
      providerId: input.providerId,
      providerName: provider.name,
      date: new Date(input.date),
      timeSlot: input.timeSlot,
      location: input.location,
      customerAddress: input.location,
      price: input.price,
      baseFare: input.price,
      status: 'Confirmed',
      paymentStatus: 'Pending',
      notes: input.notes,
      isMobileService: input.isMobileService || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.bookingRepository.create(booking);
  }

  async getBookingsByUser(userId: string, status?: string): Promise<Booking[]> {
    const filters: any = {};
    if (status) {
      filters.status = status;
    }
    return this.bookingRepository.findByUser(userId, filters);
  }

  async getBookingById(bookingId: string, userId: string, userRole: string): Promise<Booking> {
    const booking = await this.bookingRepository.findByBookingId(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Authorization check
    const isOwner = booking.userId === userId;
    const isProvider = booking.providerId && await this.isUserProvider(userId, booking.providerId);
    const isVanWorker = booking.vanWorkerId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isProvider && !isVanWorker && !isAdmin) {
      throw new ForbiddenError('Access denied');
    }

    return booking;
  }

  async updateBookingStatus(bookingId: string, userId: string, userRole: string, newStatus: string): Promise<Booking> {
    const booking = await this.bookingRepository.findByBookingId(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Only providers, van workers, or admin can update status
    const isProvider = await this.isUserProvider(userId, booking.providerId);
    const isVanWorker = booking.vanWorkerId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isProvider && !isVanWorker && !isAdmin) {
      throw new ForbiddenError('Access denied');
    }

    // If status is Completed, set completedAt
    const updates: any = { status: newStatus };
    if (newStatus === 'Completed') {
      updates.completedAt = new Date();
    }

    const updated = await this.bookingRepository.updateByBookingId(bookingId, updates);
    if (!updated) {
      throw new NotFoundError('Booking not found');
    }

    return updated;
  }

  async cancelBooking(bookingId: string, userId: string, userRole: string): Promise<Booking> {
    const booking = await this.bookingRepository.findByBookingId(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Only owner or admin can cancel
    if (booking.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied');
    }

    if (booking.status === 'Completed') {
      throw new ValidationError('Cannot cancel completed booking');
    }

    const updated = await this.bookingRepository.updateByBookingId(bookingId, { status: 'Cancelled' });
    if (!updated) {
      throw new NotFoundError('Booking not found');
    }

    return updated;
  }

  private async isUserProvider(userId: string, providerId: string): Promise<boolean> {
    const provider = await this.providerRepository.findByProviderId(providerId);
    return provider ? provider.userId === userId : false;
  }
}
