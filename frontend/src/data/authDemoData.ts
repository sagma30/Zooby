import { UserProfile, UserRole } from '../types';

export const DEMO_USERS: Record<UserRole, { user: UserProfile; passwordHint: string }> = {
  PET_PARENT: {
    user: {
      id: 'usr-parent-aisha',
      name: 'Aisha Sharma',
      email: 'aisha@zooby.care',
      phone: '+91 98220 11223',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=160',
      location: 'Gangapur Road, Nashik',
      role: 'PET_PARENT',
      bio: 'Pet parent to Bruno (Golden Retriever) and Luna (Persian Cat). Passionate about animal welfare and preventative care.',
      emergencyContact: '+91 98220 99887 (Karan Sharma)',
      joinedDate: 'January 2025'
    },
    passwordHint: 'parent123'
  },
  PROVIDER: {
    user: {
      id: 'usr-provider-rohan',
      name: 'Dr. Rohan Kulkarni',
      email: 'dr.rohan@zooby.care',
      phone: '+91 98221 44556',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=240',
      location: 'College Road, Nashik',
      role: 'PROVIDER',
      businessName: 'Nashik Paws & Vet Care Clinic',
      serviceCategory: 'vet_consult',
      isVerified: true,
      rating: 4.95,
      bio: 'BVSc & AH certified veterinary specialist with 10+ years experience in companion animal clinical diagnostics, surgery, and wellness.',
      joinedDate: 'March 2024'
    },
    passwordHint: 'provider123'
  },
  RESCUE_PARTNER: {
    user: {
      id: 'usr-rescue-ananya',
      name: 'Ananya Deshmukh',
      email: 'care@nashikstrays.org',
      phone: '+91 98222 77889',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=240',
      location: 'Indira Nagar, Nashik',
      role: 'RESCUE_PARTNER',
      businessName: 'Nashik Strays & Animal Welfare Trust',
      serviceCategory: 'adoption',
      isVerified: true,
      rating: 4.98,
      bio: 'Dedicated animal rescue coordinator and shelter manager fostering rescue dogs, puppies, and orphaned kittens across Nashik.',
      joinedDate: 'February 2024'
    },
    passwordHint: 'rescue123'
  },
  VAN_WORKER: {
    user: {
      id: 'usr-van-vikram',
      name: 'Vikram Pawar',
      email: 'vikram.van@zooby.care',
      phone: '+91 98223 99001',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=240',
      location: 'Zooby Hub, Nashik',
      role: 'VAN_WORKER',
      assignedVanId: 'van-nashik-01',
      assignedVanPlate: 'MH 15 ZB 4022',
      isVerified: true,
      bio: 'Lead mobile groomer & van technician. Trained in low-stress pet handling, hydrobath spa operation, and doorstep safety.',
      joinedDate: 'May 2025'
    },
    passwordHint: 'van123'
  },
  ADMIN: {
    user: {
      id: 'usr-admin-zooby',
      name: 'Zooby Operations Admin',
      email: 'admin@zooby.care',
      phone: '+91 98220 00001',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=240',
      location: 'Zooby Nashik Central Office',
      role: 'ADMIN',
      bio: 'Central platform operations, provider verification audit, mobile van fleet dispatch, and customer happiness supervisor.',
      joinedDate: 'November 2023'
    },
    passwordHint: 'admin123'
  }
};

/**
 * Finds user profile and role by email or phone.
 * Checks known pre-seeded accounts and localStorage registered users.
 */
export function findUserByCredentials(emailOrPhone: string): UserProfile | null {
  const normalized = emailOrPhone.trim().toLowerCase();

  // 1. Check pre-seeded demo accounts
  for (const key of Object.keys(DEMO_USERS) as UserRole[]) {
    const candidate = DEMO_USERS[key].user;
    if (
      candidate.email.toLowerCase() === normalized ||
      candidate.phone?.toLowerCase() === normalized ||
      (normalized.includes('aisha') && key === 'PET_PARENT') ||
      (normalized.includes('parent') && key === 'PET_PARENT') ||
      (normalized.includes('rohan') && key === 'PROVIDER') ||
      (normalized.includes('provider') && key === 'PROVIDER') ||
      (normalized.includes('rescue') && key === 'RESCUE_PARTNER') ||
      (normalized.includes('shelter') && key === 'RESCUE_PARTNER') ||
      (normalized.includes('strays') && key === 'RESCUE_PARTNER') ||
      (normalized.includes('van') && key === 'VAN_WORKER') ||
      (normalized.includes('vikram') && key === 'VAN_WORKER') ||
      (normalized.includes('admin') && key === 'ADMIN')
    ) {
      return candidate;
    }
  }

  // 2. Check localStorage custom registered accounts
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

  // 3. Fallback heuristic for ad-hoc emails
  if (normalized.includes('admin')) {
    return DEMO_USERS.ADMIN.user;
  }
  if (normalized.includes('van') || normalized.includes('driver')) {
    return DEMO_USERS.VAN_WORKER.user;
  }
  if (normalized.includes('rescue') || normalized.includes('shelter') || normalized.includes('adopt')) {
    return DEMO_USERS.RESCUE_PARTNER.user;
  }
  if (normalized.includes('provider') || normalized.includes('dr.') || normalized.includes('vet') || normalized.includes('groom')) {
    return DEMO_USERS.PROVIDER.user;
  }

  // Standard user default is PET_PARENT
  return {
    id: `usr-parent-${Date.now()}`,
    name: normalized.includes('@') ? normalized.split('@')[0].replace('.', ' ') : 'Zooby Pet Parent',
    email: normalized.includes('@') ? normalized : `${normalized}@zooby.care`,
    phone: !normalized.includes('@') ? normalized : '+91 98220 11223',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=160',
    location: 'Nashik, Maharashtra',
    role: 'PET_PARENT',
    joinedDate: 'Today'
  };
}


