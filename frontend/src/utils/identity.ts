import { UserProfile, UserRole } from '../types';

/**
 * Returns the best display name for a user.
 */
export function getUserDisplayName(user: UserProfile | null | undefined, fallback = 'Zooby Member'): string {
  if (!user) return fallback;
  if (user.displayName && user.displayName.trim().length > 0) return user.displayName.trim();
  if (user.firstName) {
    return user.lastName ? `${user.firstName} ${user.lastName}`.trim() : user.firstName.trim();
  }
  return user.name?.trim() || fallback;
}

/**
 * Returns the user's first name for conversational greetings.
 */
export function getUserFirstName(user: UserProfile | null | undefined, fallback = 'Friend'): string {
  if (!user) return fallback;
  if (user.firstName && user.firstName.trim().length > 0) return user.firstName.trim();
  const raw = user.displayName || user.name || '';
  const cleaned = raw.replace(/^Dr\.\s+/i, '').trim();
  const parts = cleaned.split(' ').filter(Boolean);
  return parts[0] || fallback;
}

/**
 * Returns time of day prefix: 'Good morning', 'Good afternoon', or 'Good evening'.
 */
export function getTimeOfDayGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 4 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Generates dynamic, natural greetings for the authenticated user based on role and time of day.
 * Examples:
 * - Pet Parent: "Good morning, Sam." or "Welcome back, Sam"
 * - Vet: "Good morning, Dr. Ananya." or "Welcome back, Dr. Ananya Mehta"
 * - Van Worker: "Good morning, Rahul." or "Welcome back, Rahul"
 * - Rescue Partner: "Good morning, Neha." or "Welcome back, Neha"
 * - Admin: "Good morning, Priya." or "Welcome back, Priya"
 */
export function getDynamicGreeting(
  user: UserProfile | null | undefined,
  mode: 'greeting' | 'welcome' = 'greeting'
): string {
  if (!user) {
    return mode === 'welcome' ? 'Welcome to Zooby' : `${getTimeOfDayGreeting()}!`;
  }

  const timePrefix = getTimeOfDayGreeting();
  const firstName = getUserFirstName(user);
  const displayName = getUserDisplayName(user);

  // Role-specific tailored greeting
  if (user.role === 'PROVIDER') {
    const isDr = displayName.toLowerCase().startsWith('dr.');
    const vetName = isDr ? displayName : `Dr. ${firstName}`;
    return mode === 'welcome' ? `Welcome back, ${displayName}` : `${timePrefix}, ${vetName}.`;
  }

  if (mode === 'welcome') {
    return `Welcome back, ${displayName}`;
  }

  return `${timePrefix}, ${firstName}!`;
}

/**
 * Generates personalized, natural empty state messages.
 */
export function getPersonalizedEmptyState(
  user: UserProfile | null | undefined,
  section: 'appointments' | 'emergencies' | 'schedule' | 'adoptions' | 'escalations' | 'pets' | 'bookings' | 'history' | 'notifications'
): string {
  const firstName = getUserFirstName(user, 'You');
  const displayName = getUserDisplayName(user);

  switch (section) {
    case 'appointments':
      return `${firstName}, you don't have any upcoming appointments.`;
    case 'emergencies':
      return `${firstName}, you have no emergency assignments right now.`;
    case 'schedule':
      return user?.role === 'PROVIDER'
        ? `${displayName.startsWith('Dr.') ? displayName : `Dr. ${firstName}`}, your schedule is clear.`
        : `${firstName}, your schedule is clear today.`;
    case 'adoptions':
      return `${firstName}, no new adoption requests at this moment.`;
    case 'escalations':
      return `${firstName}, there are no unresolved escalations.`;
    case 'pets':
      return `${firstName}, you haven't registered any pets yet. Add your first pet profile to get started!`;
    case 'bookings':
      return `${firstName}, you don't have any active bookings right now.`;
    case 'history':
      return `${firstName}, no previous service history found.`;
    case 'notifications':
      return `${firstName}, you are all caught up! No unread notifications.`;
    default:
      return `${firstName}, no records found.`;
  }
}

/**
 * Returns role human-readable metadata.
 */
export function getRoleBadgeInfo(role?: UserRole | null): {
  label: string;
  shortLabel: string;
  badgeClass: string;
  icon: string;
} {
  switch (role) {
    case 'PET_PARENT':
      return {
        label: 'Pet Parent',
        shortLabel: 'Parent',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        icon: 'pets'
      };
    case 'PROVIDER':
      return {
        label: 'Veterinarian / Specialist',
        shortLabel: 'Doctor / Vet',
        badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
        icon: 'medical_services'
      };
    case 'SERVICE_PROVIDER':
      return {
        label: 'Service Provider / Care Pro',
        shortLabel: 'Service Pro',
        badgeClass: 'bg-orange-100 text-orange-900 border-orange-300',
        icon: 'handshake'
      };
    case 'RESCUE_PARTNER':
      return {
        label: 'Rescue Partner',
        shortLabel: 'Rescue Org',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        icon: 'volunteer_activism'
      };
    case 'VAN_WORKER':
      return {
        label: 'Lead Mobile Technician',
        shortLabel: 'Mobile Tech',
        badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
        icon: 'local_shipping'
      };
    case 'ADMIN':
      return {
        label: 'Administrator',
        shortLabel: 'Admin',
        badgeClass: 'bg-stone-200 text-stone-900 border-stone-400',
        icon: 'admin_panel_settings'
      };
    default:
      return {
        label: 'Guest Member',
        shortLabel: 'Guest',
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: 'person'
      };
  }
}
