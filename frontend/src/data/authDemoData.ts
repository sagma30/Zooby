import { UserProfile, UserRole } from '../types';

export const DEMO_USERS: Record<UserRole, { user: UserProfile; passwordHint: string }> = {
  PET_PARENT: {
    user: {
      id: 'usr-parent-sam',
      userId: 'usr-parent-sam',
      firstName: 'Sam',
      lastName: 'Sharma',
      displayName: 'Sam Sharma',
      name: 'Sam Sharma',
      email: 'sam@zooby.care',
      phone: '+91 98220 11223',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=240',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=240',
      city: 'Nashik',
      location: 'Gangapur Road, Nashik',
      role: 'PET_PARENT',
      accountStatus: 'Active',
      createdAt: 'January 2025',
      joinedDate: 'January 2025',
      bio: 'Pet parent to Bruno (Golden Retriever) and Luna (Persian Cat). Dedicated to preventive wellness and 24/7 care.',
      emergencyContact: '+91 98220 99887 (Karan Sharma)',
      savedAddresses: ['Gangapur Road, Nashik, MH 422013', 'College Road, Nashik, MH 422005']
    },
    passwordHint: 'sam123'
  },
  PROVIDER: {
    user: {
      id: 'usr-vet-ananya',
      userId: 'usr-vet-ananya',
      firstName: 'Ananya',
      lastName: 'Mehta',
      displayName: 'Dr. Ananya Mehta',
      name: 'Dr. Ananya Mehta',
      email: 'dr.ananya@zooby.care',
      phone: '+91 98221 44556',
      profilePhoto: 'https://images.unsplash.com/photo-1594824813689-0b73c4d7e2e3?auto=format&fit=crop&q=80&w=240',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813689-0b73c4d7e2e3?auto=format&fit=crop&q=80&w=240',
      city: 'Pune',
      location: 'College Road, Nashik & Shivaji Nagar, Pune',
      role: 'PROVIDER',
      accountStatus: 'Active',
      createdAt: 'March 2024',
      joinedDate: 'March 2024',
      businessName: 'Nashik Paws & Vet Care Clinic',
      organizationName: 'Nashik Paws & Vet Care Clinic',
      serviceCategory: 'vet_consult',
      specialization: 'Companion Animal Surgery & Clinical Diagnostics',
      experience: '10+ Years',
      licenseNumber: 'MH-VET-2015-8842',
      availability: 'Available',
      status: 'Available',
      isVerified: true,
      rating: 4.98,
      bio: 'BVSc & AH certified veterinary surgeon with 10+ years experience in companion diagnostics, preventative vaccinations, and emergency triage.'
    },
    passwordHint: 'ananya123'
  },
  RESCUE_PARTNER: {
    user: {
      id: 'usr-rescue-neha',
      userId: 'usr-rescue-neha',
      firstName: 'Neha',
      lastName: 'Patil',
      displayName: 'Neha Patil',
      name: 'Neha Patil',
      email: 'neha@pawsandhope.org',
      phone: '+91 98222 77889',
      profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=240',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=240',
      city: 'Nashik',
      location: 'Indira Nagar, Nashik',
      role: 'RESCUE_PARTNER',
      accountStatus: 'Active',
      createdAt: 'February 2024',
      joinedDate: 'February 2024',
      businessName: 'Paws & Hope Rescue',
      organizationName: 'Paws & Hope Rescue',
      serviceCategory: 'adoption',
      isVerified: true,
      rating: 4.98,
      bio: 'Dedicated animal rescue coordinator and shelter manager fostering rescue dogs, puppies, and orphaned kittens across Nashik.'
    },
    passwordHint: 'neha123'
  },
  VAN_WORKER: {
    user: {
      id: 'usr-van-rahul',
      userId: 'usr-van-rahul',
      firstName: 'Rahul',
      lastName: 'Sharma',
      displayName: 'Rahul Sharma',
      name: 'Rahul Sharma',
      email: 'rahul.van@zooby.care',
      phone: '+91 98223 99001',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=240',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=240',
      city: 'Nashik',
      location: 'Zooby Mobile Hub, Nashik',
      role: 'VAN_WORKER',
      jobTitle: 'Lead Mobile Technician',
      assignedVanId: 'van-zmv-014',
      assignedVanPlate: 'ZMV-014',
      accountStatus: 'Active',
      status: 'Available',
      availability: 'Available',
      isVerified: true,
      rating: 4.94,
      createdAt: 'May 2025',
      joinedDate: 'May 2025',
      bio: 'Lead mobile groomer & van technician. Trained in low-stress pet handling, hydrobath spa operation, and doorstep emergency safety.'
    },
    passwordHint: 'rahul123'
  },
  ADMIN: {
    user: {
      id: 'usr-admin-priya',
      userId: 'usr-admin-priya',
      firstName: 'Priya',
      lastName: 'Sharma',
      displayName: 'Priya Sharma',
      name: 'Priya Sharma',
      email: 'priya@zooby.care',
      phone: '+91 98220 00001',
      profilePhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=240',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=240',
      city: 'Nashik',
      location: 'Zooby Nashik Central Office',
      role: 'ADMIN',
      jobTitle: 'Administrator',
      accountStatus: 'Active',
      createdAt: 'November 2023',
      joinedDate: 'November 2023',
      isVerified: true,
      bio: 'Central platform operations, provider verification audit, mobile van fleet dispatch, and customer happiness supervisor.'
    },
    passwordHint: 'priya123'
  },
  SERVICE_PROVIDER: {
    user: {
      id: 'usr-sp-vikram',
      userId: 'usr-sp-vikram',
      firstName: 'Vikram',
      lastName: 'Deshmukh',
      displayName: 'Vikram Deshmukh',
      name: 'Vikram Deshmukh',
      email: 'vikram.provider@zooby.care',
      phone: '+91 98224 88771',
      profilePhoto: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=240',
      avatarUrl: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=240',
      city: 'Nashik',
      location: 'Gangapur Road, Nashik',
      role: 'SERVICE_PROVIDER',
      accountStatus: 'Active',
      createdAt: 'April 2024',
      joinedDate: 'April 2024',
      businessName: 'Paws & Trails Pet Care & Grooming Hub',
      organizationName: 'Paws & Trails Pet Care & Grooming Hub',
      serviceCategory: 'grooming',
      specialization: 'Canine Fitness, Pet Sitting & Holistic Grooming',
      experience: '6+ Years',
      licenseNumber: 'MH-PETCARE-2021-9941',
      availability: 'Available',
      status: 'Available',
      isVerified: true,
      rating: 4.92,
      bio: 'Certified pet care professional, canine fitness walker, and master groomer offering personalized care, cage-free sitting, and behavioral coaching across Nashik.'
    },
    passwordHint: 'vikram123'
  }
};

/**
 * Alternate Pet Parent Demo account (Aarav Sharma) for multi-user isolation verification
 */
export const ALTERNATE_DEMO_USERS: Record<string, { user: UserProfile; passwordHint: string }> = {
  'usr-parent-aarav': {
    user: {
      id: 'usr-parent-aarav',
      userId: 'usr-parent-aarav',
      firstName: 'Aarav',
      lastName: 'Sharma',
      displayName: 'Aarav Sharma',
      name: 'Aarav Sharma',
      email: 'aarav@zooby.care',
      phone: '+91 98220 55667',
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=240',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=240',
      city: 'Nashik',
      location: 'College Road, Nashik',
      role: 'PET_PARENT',
      accountStatus: 'Active',
      createdAt: 'February 2025',
      joinedDate: 'February 2025',
      bio: 'Pet parent to Tommy (Indie / Terrier Mix). Passionate about canine agility and adoption awareness.',
      emergencyContact: '+91 98220 33221 (Pooja Sharma)'
    },
    passwordHint: 'aarav123'
  }
};

/**
 * Finds user profile and role by email, phone, or name token.
 * Checks known pre-seeded accounts and localStorage registered users.
 */
export function findUserByCredentials(emailOrPhone: string): UserProfile | null {
  const normalized = emailOrPhone.trim().toLowerCase();

  // 1. Check primary demo accounts
  for (const key of Object.keys(DEMO_USERS) as UserRole[]) {
    const candidate = DEMO_USERS[key].user;
    if (
      candidate.email.toLowerCase() === normalized ||
      candidate.phone?.toLowerCase() === normalized ||
      (normalized.includes('sam') && key === 'PET_PARENT') ||
      (normalized.includes('parent') && key === 'PET_PARENT') ||
      (normalized.includes('vikram') && key === 'SERVICE_PROVIDER') ||
      (normalized.includes('service_provider') && key === 'SERVICE_PROVIDER') ||
      (normalized.includes('paws & trails') && key === 'SERVICE_PROVIDER') ||
      (normalized.includes('ananya') && key === 'PROVIDER') ||
      (normalized.includes('provider') && key === 'PROVIDER') ||
      (normalized.includes('vet') && key === 'PROVIDER') ||
      (normalized.includes('doctor') && key === 'PROVIDER') ||
      (normalized.includes('neha') && key === 'RESCUE_PARTNER') ||
      (normalized.includes('rescue') && key === 'RESCUE_PARTNER') ||
      (normalized.includes('paws') && key === 'RESCUE_PARTNER') ||
      (normalized.includes('shelter') && key === 'RESCUE_PARTNER') ||
      (normalized.includes('rahul') && key === 'VAN_WORKER') ||
      (normalized.includes('van') && key === 'VAN_WORKER') ||
      (normalized.includes('technician') && key === 'VAN_WORKER') ||
      (normalized.includes('priya') && key === 'ADMIN') ||
      (normalized.includes('admin') && key === 'ADMIN')
    ) {
      return candidate;
    }
  }

  // 2. Check alternate demo accounts (e.g. Aarav Sharma)
  for (const key of Object.keys(ALTERNATE_DEMO_USERS)) {
    const candidate = ALTERNATE_DEMO_USERS[key].user;
    if (
      candidate.email.toLowerCase() === normalized ||
      candidate.phone?.toLowerCase() === normalized ||
      normalized.includes('aarav')
    ) {
      return candidate;
    }
  }

  // 3. Check localStorage custom registered accounts
  try {
    const stored = localStorage.getItem('zooby_registered_accounts');
    if (stored) {
      const accounts: UserProfile[] = JSON.parse(stored);
      const found = accounts.find(
        (a) =>
          a.email.toLowerCase() === normalized ||
          (a.phone && a.phone.toLowerCase() === normalized)
      );
      if (found) {
        return found;
      }
    }
  } catch (err) {
    console.error('Error reading registered accounts:', err);
  }

  // 4. Dynamic user creation heuristic for new ad-hoc emails
  const namePart = normalized.includes('@') ? normalized.split('@')[0].replace(/[._-]/g, ' ') : normalized;
  const capitalizedName = namePart
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || 'Zooby Member';

  const firstName = capitalizedName.split(' ')[0] || capitalizedName;
  const lastName = capitalizedName.split(' ').slice(1).join(' ') || undefined;

  let assignedRole: UserRole = 'PET_PARENT';
  let avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=240';

  if (normalized.includes('admin')) {
    assignedRole = 'ADMIN';
    avatar = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=240';
  } else if (normalized.includes('van') || normalized.includes('driver') || normalized.includes('tech')) {
    assignedRole = 'VAN_WORKER';
    avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=240';
  } else if (normalized.includes('rescue') || normalized.includes('shelter') || normalized.includes('adopt')) {
    assignedRole = 'RESCUE_PARTNER';
    avatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=240';
  } else if (normalized.includes('vet') || normalized.includes('dr.') || normalized.includes('clinic')) {
    assignedRole = 'PROVIDER';
    avatar = 'https://images.unsplash.com/photo-1594824813689-0b73c4d7e2e3?auto=format&fit=crop&q=80&w=240';
  } else if (normalized.includes('walker') || normalized.includes('sitter') || normalized.includes('groomer') || normalized.includes('trainer') || normalized.includes('service_provider') || normalized.includes('vikram') || normalized.includes('service-provider')) {
    assignedRole = 'SERVICE_PROVIDER';
    avatar = 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=240';
  }

  const generatedId = `usr-${assignedRole.toLowerCase()}-${Date.now()}`;
  return {
    id: generatedId,
    userId: generatedId,
    firstName,
    lastName,
    displayName: capitalizedName,
    name: capitalizedName,
    email: normalized.includes('@') ? normalized : `${normalized}@zooby.care`,
    phone: !normalized.includes('@') ? normalized : '+91 98220 11223',
    profilePhoto: avatar,
    avatarUrl: avatar,
    city: 'Nashik',
    location: 'Nashik, Maharashtra',
    role: assignedRole,
    accountStatus: 'Active',
    createdAt: 'Today',
    joinedDate: 'Today'
  };
}
