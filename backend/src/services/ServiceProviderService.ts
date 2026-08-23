import { ServiceProviderRepository } from '../repositories/ServiceProviderRepository';
import { ServiceProvider } from '../models/ServiceProvider';
import { generateProviderId } from '../utils/generators';
import { ValidationError, NotFoundError, ForbiddenError, ConflictError } from '../utils/errors';

export interface CreateProviderInput {
  name: string;
  category: string;
  title: string;
  city: string;
  area: string;
  address?: string;
  priceNumber: number;
  bio?: string;
  availableDays?: string[];
  slots?: string[];
  certifications?: string[];
}

export class ServiceProviderService {
  private providerRepository: ServiceProviderRepository;

  constructor() {
    this.providerRepository = new ServiceProviderRepository();
  }

  async createProvider(userId: string, userRole: string, input: CreateProviderInput): Promise<ServiceProvider> {
    if (userRole !== 'PROVIDER') {
      throw new ForbiddenError('Only PROVIDER role can create provider profiles');
    }

    // Check if user already has a provider profile
    const existing = await this.providerRepository.findByUserId(userId);
    if (existing) {
      throw new ConflictError('Provider profile already exists');
    }

    const provider: ServiceProvider = {
      providerId: generateProviderId(),
      userId,
      name: input.name,
      category: input.category,
      title: input.title,
      rating: 0,
      reviewCount: 0,
      priceFormatted: `₹${input.priceNumber}`,
      priceNumber: input.priceNumber,
      city: input.city,
      area: input.area,
      address: input.address,
      image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600',
      isVerified: false,
      bio: input.bio,
      availableDays: input.availableDays || [],
      slots: input.slots || [],
      certifications: input.certifications || [],
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.providerRepository.create(provider);
  }

  async searchProviders(category?: string, city?: string, search?: string, page: number = 1, limit: number = 20): Promise<{ providers: ServiceProvider[]; pagination: any }> {
    const filters: any = { isVerified: true, status: 'Active' };
    
    if (category && category !== 'all') {
      filters.category = category;
    }
    
    if (city) {
      filters.city = new RegExp(city, 'i');
    }
    
    if (search) {
      filters.$or = [
        { name: new RegExp(search, 'i') },
        { title: new RegExp(search, 'i') },
        { area: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;
    const providers = await this.providerRepository.search(filters, limit, skip);
    const total = await this.providerRepository.count(filters);

    return {
      providers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProviderById(providerId: string): Promise<ServiceProvider> {
    const provider = await this.providerRepository.findByProviderId(providerId);
    if (!provider) {
      throw new NotFoundError('Provider not found');
    }
    return provider;
  }

  async updateProvider(providerId: string, userId: string, userRole: string, updates: Partial<CreateProviderInput>): Promise<ServiceProvider> {
    const provider = await this.providerRepository.findByProviderId(providerId);
    if (!provider) {
      throw new NotFoundError('Provider not found');
    }

    if (provider.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied');
    }

    // Prevent changing verification status unless admin
    if (updates.hasOwnProperty('isVerified') && userRole !== 'ADMIN') {
      delete (updates as any).isVerified;
    }

    const updated = await this.providerRepository.updateByProviderId(providerId, updates);
    if (!updated) {
      throw new NotFoundError('Provider not found');
    }

    return updated;
  }
}
