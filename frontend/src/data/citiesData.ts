export interface ZoobyCity {
  id: string;
  name: string;
  state: string;
  isPrimary?: boolean;
  aliases?: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  vanHub: {
    name: string;
    lat: number;
    lng: number;
  };
  assignedVans: Array<{
    vanId: string;
    plate: string;
    workerName: string;
    workerPhone: string;
  }>;
  vetSupport: {
    name: string;
    clinic: string;
    phone: string;
    lat: number;
    lng: number;
  };
  coverageAreas: string[];
  contactPhone: string;
  tagline: string;
}

export const SUPPORTED_CITIES: ZoobyCity[] = [
  {
    id: 'nashik',
    name: 'Nashik',
    state: 'Maharashtra',
    isPrimary: true,
    aliases: ['nasik'],
    coordinates: {
      lat: 20.0055,
      lng: 73.7650
    },
    vanHub: {
      name: 'College Road Mobile Hub',
      lat: 19.9880,
      lng: 73.7890
    },
    assignedVans: [
      { vanId: 'van-zmv-014', plate: 'ZMV-014', workerName: 'Rahul', workerPhone: '+91 98223 99001' },
      { vanId: 'van-zmv-001', plate: 'ZMV-001', workerName: 'Vikram Pawar', workerPhone: '+91 98223 99002' },
      { vanId: 'van-zmv-002', plate: 'ZMV-002', workerName: 'Santosh Shinde', workerPhone: '+91 98223 99003' }
    ],
    vetSupport: {
      name: 'Dr. Aarav Mehta',
      clinic: 'Zooby Care Vet Hospital, Nashik',
      phone: '+91 98221 44556',
      lat: 19.9910,
      lng: 73.7920
    },
    coverageAreas: ['Gangapur Road', 'College Road', 'Mahatma Nagar', 'Indira Nagar', 'Panchavati', 'Govind Nagar', 'Anandwalli'],
    contactPhone: '+91 98223 99001',
    tagline: 'Primary Zooby Mobile Care & Emergency Hub'
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    aliases: ['bombay'],
    coordinates: {
      lat: 19.0760,
      lng: 72.8777
    },
    vanHub: {
      name: 'Bandra West Mobile Hub',
      lat: 19.0596,
      lng: 72.8295
    },
    assignedVans: [
      { vanId: 'van-zmv-101', plate: 'ZMV-101', workerName: 'Arjun Desai', workerPhone: '+91 98220 22001' },
      { vanId: 'van-zmv-102', plate: 'ZMV-102', workerName: 'Prashant More', workerPhone: '+91 98220 22002' }
    ],
    vetSupport: {
      name: 'Dr. Ananya Sen',
      clinic: 'Zooby Vet Emergency Care, Bandra',
      phone: '+91 98220 22556',
      lat: 19.0620,
      lng: 72.8330
    },
    coverageAreas: ['Bandra West', 'Andheri West', 'Juhu', 'Powai', 'Worli', 'Colaba', 'Khar West'],
    contactPhone: '+91 98220 22001',
    tagline: 'Doorstep Mobile Salon & 24/7 Rapid Ambulance in Mumbai'
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    aliases: ['poona'],
    coordinates: {
      lat: 18.5204,
      lng: 73.8567
    },
    vanHub: {
      name: 'Koregaon Park Mobile Hub',
      lat: 18.5362,
      lng: 73.8940
    },
    assignedVans: [
      { vanId: 'van-zmv-201', plate: 'ZMV-201', workerName: 'Sanjay Kadam', workerPhone: '+91 98220 33001' },
      { vanId: 'van-zmv-202', plate: 'ZMV-202', workerName: 'Ramesh Patil', workerPhone: '+91 98220 33002' }
    ],
    vetSupport: {
      name: 'Dr. Vikram Joshi',
      clinic: 'Zooby Companion Animal Hospital, Pune',
      phone: '+91 98220 33556',
      lat: 18.5380,
      lng: 73.8960
    },
    coverageAreas: ['Koregaon Park', 'Kothrud', 'Aundh', 'Viman Nagar', 'Baner', 'Kalyani Nagar', 'Wakad'],
    contactPhone: '+91 98220 33001',
    tagline: 'Doorstep Pet Spa & Emergency Van Response in Pune'
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    aliases: ['bangalore', 'bengaluru'],
    coordinates: {
      lat: 12.9716,
      lng: 77.5946
    },
    vanHub: {
      name: 'Indiranagar Mobile Care Hub',
      lat: 12.9784,
      lng: 77.6408
    },
    assignedVans: [
      { vanId: 'van-zmv-301', plate: 'ZMV-301', workerName: 'Kiran Gowda', workerPhone: '+91 98220 44001' }
    ],
    vetSupport: {
      name: 'Dr. Priya Rao',
      clinic: 'Zooby Advanced Vet Center, Bengaluru',
      phone: '+91 98220 44556',
      lat: 12.9795,
      lng: 77.6420
    },
    coverageAreas: ['Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield', 'Jayanagar', 'JP Nagar', 'Malleshwaram'],
    contactPhone: '+91 98220 44001',
    tagline: 'High-Tech Mobile Grooming & Rapid SOS in Bengaluru'
  },
  {
    id: 'nagpur',
    name: 'Nagpur',
    state: 'Maharashtra',
    aliases: ['nagpore'],
    coordinates: {
      lat: 21.1458,
      lng: 79.0882
    },
    vanHub: {
      name: 'Dharampeth Mobile Hub',
      lat: 21.1415,
      lng: 79.0620
    },
    assignedVans: [
      { vanId: 'van-zmv-401', plate: 'ZMV-401', workerName: 'Amit Bhave', workerPhone: '+91 98220 55001' }
    ],
    vetSupport: {
      name: 'Dr. Sameer Deshmukh',
      clinic: 'Zooby Pet Wellness & Emergency Clinic, Nagpur',
      phone: '+91 98220 55556',
      lat: 21.1430,
      lng: 79.0645
    },
    coverageAreas: ['Dharampeth', 'Ramdaspeth', 'Civil Lines', 'Pratap Nagar', 'Sadar', 'Laxmi Nagar'],
    contactPhone: '+91 98220 55001',
    tagline: 'Premier Doorstep Van Care in Nagpur'
  }
];

// Calculate Haversine distance in km
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds closest supported Zooby city based on GPS coordinates.
 * Returns null if distance to nearest city exceeds maximum threshold (e.g. 150 km).
 */
export function findNearestSupportedCity(
  lat: number,
  lng: number,
  maxDistanceThresholdKm: number = 150
): { city: ZoobyCity; distanceKm: number } | null {
  let closestCity: ZoobyCity | null = null;
  let minDistance = Infinity;

  for (const city of SUPPORTED_CITIES) {
    const dist = haversineDistance(lat, lng, city.coordinates.lat, city.coordinates.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestCity = city;
    }
  }

  if (closestCity && minDistance <= maxDistanceThresholdKm) {
    return { city: closestCity, distanceKm: Math.round(minDistance) };
  }

  return null;
}

export function getCityById(cityId: string): ZoobyCity {
  const found = SUPPORTED_CITIES.find(
    (c) =>
      c.id.toLowerCase() === cityId.toLowerCase() ||
      c.name.toLowerCase() === cityId.toLowerCase() ||
      (c.aliases && c.aliases.includes(cityId.toLowerCase()))
  );
  return found || SUPPORTED_CITIES[0]; // Default to Nashik
}
