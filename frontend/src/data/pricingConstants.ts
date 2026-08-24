/**
 * ZOOBY OFFICIAL SERVICE PRICING — SINGLE SOURCE OF TRUTH
 * All prices in Indian Rupees (₹) with exact official rate structures.
 */

export interface ServiceTierOption {
  id: string;
  name: string;
  price: number;
  formatted: string;
  duration: string;
  durationMinutes: number;
  description: string;
  badge?: string;
  inclusions?: string[];
}

export interface VanBoxPricingTier {
  id: string;
  name: string;
  small: number;
  medium: number;
  large: number;
  smallFormatted: string;
  mediumFormatted: string;
  largeFormatted: string;
  description: string;
  inclusions: string[];
}

export const ZOOBY_OFFICIAL_PRICING = {
  // 1. PET WALKING
  walking: {
    title: 'Pet Walking',
    startingPrice: 149,
    startingFormatted: '₹149',
    unit: '/ walk',
    tiers: [
      {
        id: 'walk_standard',
        name: 'Standard Walk',
        price: 149,
        formatted: '₹149',
        duration: '30 mins',
        durationMinutes: 30,
        description: '30-minute solo/fitness walk with live GPS tracking, hydration checkpoints, and post-walk photos.',
        badge: 'Most Popular',
        inclusions: ['30-minute paced walk', 'Live GPS route tracking', 'Hydration break', 'Post-walk report & photo']
      },
      {
        id: 'walk_long',
        name: 'Long Walk',
        price: 199,
        formatted: '₹199',
        duration: '45 mins',
        durationMinutes: 45,
        description: '45-minute extended walking route for active breeds requiring extra stamina and exploration.',
        inclusions: ['45-minute energetic walk', 'Live GPS route tracking', 'Paw wipe & hydration', 'Post-walk report & photo']
      },
      {
        id: 'walk_exercise',
        name: 'Exercise Walk',
        price: 279,
        formatted: '₹279',
        duration: '60 mins',
        durationMinutes: 60,
        description: '60-minute intensive cardio exercise walk, trot training, and outdoor agility play.',
        inclusions: ['60-minute intensive workout', 'Speed & distance tracking', 'Agility drills', 'Detailed health report']
      },
      {
        id: 'walk_monthly',
        name: 'Monthly Standard Walk Plan',
        price: 3500,
        formatted: '₹3,500',
        duration: '26 days / month',
        durationMinutes: 30,
        description: 'Monthly package covering 26 standard daily walks (Mon–Sat) with dedicated verified handler.',
        badge: 'Best Value',
        inclusions: ['26 daily 30-min walks', 'Dedicated handler assignment', 'Monthly fitness tracking', 'Free rescheduling']
      }
    ] as ServiceTierOption[]
  },

  // 2. PET SITTING
  sitting: {
    title: 'Pet Sitting & Boarding',
    startingPrice: 599,
    startingFormatted: '₹599',
    unit: 'for 3 hrs',
    tiers: [
      {
        id: 'sitting_3h',
        name: 'Pet Sitting (3 Hours)',
        price: 599,
        formatted: '₹599',
        duration: '3 Hours',
        durationMinutes: 180,
        description: '3 hours of personalized in-home or host pet sitting with continuous loving care and play.',
        inclusions: ['3 hours attentive supervision', 'Fresh food & water refill', 'Play & cuddle session', 'Photo/video updates']
      },
      {
        id: 'sitting_8h',
        name: 'Pet Sitting (8 Hours / Daycare)',
        price: 999,
        formatted: '₹999',
        duration: '8 Hours',
        durationMinutes: 480,
        description: '8 hours of cage-free daycare, meal adherence, potty breaks, and interactive enrichment.',
        badge: 'Daycare Choice',
        inclusions: ['8 hours cage-free care', '2 meal services', 'Outdoor play sessions', 'Hourly photo check-ins']
      },
      {
        id: 'sitting_24h',
        name: 'Pet Sitting (24 Hours / Overnight)',
        price: 1999,
        formatted: '₹1,999',
        duration: '24 Hours',
        durationMinutes: 1440,
        description: 'Full 24-hour overnight stay with round-the-clock supervision in home-like cage-free comfort.',
        badge: 'Full Overnight',
        inclusions: ['24-hour cage-free stay', 'All meals & treats managed', 'Night-time sleeping supervision', 'Video calls with parent']
      }
    ] as ServiceTierOption[]
  },

  // 3. PET TRAINING
  training: {
    title: 'Pet Training',
    startingPrice: 1000,
    startingFormatted: '₹1,000',
    unit: '/ session',
    tiers: [
      {
        id: 'training_individual',
        name: 'Individual Training Session',
        price: 1000,
        formatted: '₹1,000',
        duration: '60 mins',
        durationMinutes: 60,
        description: '1-on-1 personalized behavioral or obedience session with a certified canine behaviorist.',
        inclusions: ['60-min trainer assessment', 'Targeted habit coaching', 'Parent practice guide', 'Q&A on behavior']
      },
      {
        id: 'training_basic_puppy',
        name: 'Basic Puppy & Home Training',
        price: 7000,
        formatted: '₹7,000',
        duration: 'Complete Foundation Course',
        durationMinutes: 60,
        description: 'Foundational puppy course covering potty training, crate comfort, bite inhibition, sit/stay/come commands.',
        badge: 'Puppy Essential',
        inclusions: ['Full multi-week curriculum', 'Potty & crate training', 'Basic obedience commands', 'Puppy socialization handbook']
      },
      {
        id: 'training_leash_behaviour',
        name: 'Leash, Walking & Behaviour Training',
        price: 14000,
        formatted: '₹14,000',
        duration: 'Intermediate Mastery Course',
        durationMinutes: 60,
        description: 'Structured course to stop leash pulling, greeting reactivity, jumping on guests, and reinforce impulse control.',
        badge: 'High Demand',
        inclusions: ['Loose-leash walking mastery', 'Distraction desensitization', 'Doorway & guest manners', 'Take-home video lessons']
      },
      {
        id: 'training_aggression_anxiety',
        name: 'Aggression, Anxiety or Biting Training',
        price: 20000,
        formatted: '₹20,000',
        duration: 'Specialist Clinical Program',
        durationMinutes: 60,
        description: 'Intensive rehabilitation for fear aggression, separation anxiety, resource guarding, or biting history.',
        badge: 'Specialist Rehab',
        inclusions: ['Clinical behavior diagnosis', 'Counter-conditioning protocol', 'Direct trainer hotline access', 'Long-term behavior maintenance']
      }
    ] as ServiceTierOption[]
  },

  // 4. GROOMING VAN
  groomingVan: {
    title: 'Grooming Van',
    basePrice: 1999,
    baseFormatted: '₹1,999',
    startingPrice: 1299,
    startingFormatted: '₹1,299',
    unit: 'starting',
    boxPricing: [
      {
        id: 'van_bath_basic',
        name: 'Bath + Basic Grooming',
        small: 1299,
        medium: 1399,
        large: 1999,
        smallFormatted: '₹1,299',
        mediumFormatted: '₹1,399',
        largeFormatted: '₹1,999',
        description: 'Warm RO hydrobath (38°C), organic herbal shampoo wash, velocity blow dry, nail clipping, ear cleansing & sanitary tidy.',
        inclusions: ['Warm hydrobath spa', 'Organic herbal shampoo', 'Low-noise blow dry', 'Nail clipping & ear cleaning', 'Paw pad balm']
      },
      {
        id: 'van_full_grooming',
        name: 'Full Grooming with Haircut',
        small: 1699,
        medium: 2099,
        large: 2599,
        smallFormatted: '₹1,699',
        mediumFormatted: '₹2,099',
        largeFormatted: '₹2,599',
        description: 'Full hydrobath bath, breed-specific customized haircut/scissor styling, face & hygiene trimming, nail filing, and aroma mist.',
        inclusions: ['Bath + Basic package', 'Full breed haircut & styling', 'Face & sanitary trimming', 'Nail filing', 'Aromatherapy coat mist']
      },
      {
        id: 'van_premium_deshedding',
        name: 'Premium De-shedding',
        small: 1999,
        medium: 2499,
        large: 2999,
        smallFormatted: '₹1,999',
        mediumFormatted: '₹2,499',
        largeFormatted: '₹2,999',
        description: 'Specialized deep undercoat de-shedding treatment with de-shed shampoo, high-velocity undercoat blowout, and silicone brush-out.',
        inclusions: ['Bath + Basic package', 'Deep de-shedding shampoo & mask', 'Undercoat blowout & de-matting', 'Reduces shedding by up to 90%']
      }
    ] as VanBoxPricingTier[]
  },

  // 5. VETERINARY SERVICES
  veterinary: {
    title: 'Veterinary Services',
    startingPrice: 399,
    startingFormatted: '₹399',
    unit: 'starting',
    consultStartingPrice: 899,
    consultStartingFormatted: '₹899',
    services: [
      {
        id: 'vet_checking',
        name: 'Checking',
        price: 899,
        formatted: '₹899',
        duration: '30 mins',
        durationMinutes: 30,
        description: 'Comprehensive nose-to-tail clinical physical examination, temperature, vitals check, dietary & wellness consultation.',
        badge: 'General Checkup',
        inclusions: ['Nose-to-tail physical exam', 'Vitals, heart & lung check', 'Weight & body condition score', 'Digital prescription & advice']
      },
      {
        id: 'vet_checking_vaccination',
        name: 'Vet Checking & Vaccination',
        price: 1899,
        price7in1: 1599,
        formatted: '₹1,899 / ₹1,599 (7-in-1)',
        duration: '30 mins',
        durationMinutes: 30,
        description: 'Complete physical examination along with core vaccination administration (DHLPP / Anti-Rabies / 7-in-1 combo) and official certification.',
        badge: 'Essential Vaccine',
        inclusions: ['Full veterinary checking exam', 'Core vaccine administration', 'Official digital vaccine passport', 'Post-vaccine observation']
      },
      {
        id: 'vet_deworming',
        name: 'De-worming',
        price: 399,
        formatted: '₹399',
        duration: '15 mins',
        durationMinutes: 15,
        description: 'Weight-calibrated internal parasite de-worming dose administered safely by veterinary staff.',
        badge: 'Parasite Defense',
        inclusions: ['Weight-based dosage calculation', 'Oral dewormer administration', 'Parasite prevention schedule', 'Digital health update']
      },
      {
        id: 'vet_first_aid',
        name: 'First Aid',
        price: 999,
        formatted: '₹999',
        duration: '30 mins',
        durationMinutes: 30,
        description: 'Immediate clinical care for minor lacerations, wound disinfection, sterile bandaging, tick removal, or acute pain stabilization.',
        badge: 'Urgent Care',
        inclusions: ['Antiseptic wound cleansing', 'Sterile dressing & bandage', 'Pain relief administration', 'Aftercare instructions']
      },
      {
        id: 'vet_blood_test_home',
        name: 'Blood Test at Home',
        price: 1299,
        formatted: '₹1,299',
        duration: '20 mins',
        durationMinutes: 20,
        description: 'Doorstep sterile blood/sample collection by trained technician with diagnostic lab analysis (CBC / Liver / Kidney panel).',
        badge: 'Doorstep Lab',
        inclusions: ['Doorstep sterile sample draw', 'Certified diagnostic lab test', 'Digital report delivery within 24h', 'Doctor tele-review']
      }
    ] as ServiceTierOption[]
  }
};

/**
 * Formats any amount into standard Indian Rupees (₹) with comma grouping.
 * Example: 1999 -> "₹1,999", 14000 -> "₹14,000"
 */
export function formatRupees(amount: number): string {
  if (isNaN(amount) || amount == null) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Resolves standard base price for any service category code.
 */
export function getCategoryStartingPrice(category: string): { price: number; formatted: string } {
  switch (category) {
    case 'walking':
      return { price: 149, formatted: '₹149' };
    case 'sitting':
      return { price: 599, formatted: '₹599' };
    case 'training':
      return { price: 1000, formatted: '₹1,000' };
    case 'mobile_grooming':
      return { price: 1299, formatted: '₹1,299' };
    case 'grooming':
      return { price: 1299, formatted: '₹1,299' };
    case 'vet_consult':
      return { price: 899, formatted: '₹899' };
    case 'mobile_vet':
      return { price: 899, formatted: '₹899' };
    default:
      return { price: 149, formatted: '₹149' };
  }
}
