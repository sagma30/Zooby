import { VanLocation } from '../types';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  altitude?: number;
  timestamp: number;
}

export type GeolocationPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Checks browser geolocation permission status
 */
export async function checkGeolocationPermission(): Promise<GeolocationPermissionState> {
  if (!navigator.geolocation) {
    return 'unsupported';
  }

  if (navigator.permissions && navigator.permissions.query) {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' as any });
      return permission.state as GeolocationPermissionState;
    } catch {
      // Fallback
    }
  }

  return 'prompt';
}

/**
 * Obtains current real GPS coordinates from device
 */
export function getCurrentDeviceLocation(
  options: PositionOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
): Promise<GeoCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by this browser/device.'));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading ?? undefined,
          speed: position.coords.speed ?? undefined,
          altitude: position.coords.altitude ?? undefined,
          timestamp: position.timestamp
        });
      },
      (error) => {
        reject(error);
      },
      options
    );
  });
}

/**
 * Watches continuous real GPS updates from device
 */
export function watchDeviceLocation(
  onLocation: (coords: GeoCoordinates) => void,
  onError?: (error: GeolocationPositionError) => void,
  options: PositionOptions = { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
): () => void {
  if (!navigator.geolocation) {
    if (onError) {
      onError({
        code: 2,
        message: 'Geolocation unsupported',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      } as any);
    }
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading ?? undefined,
        speed: position.coords.speed ?? undefined,
        altitude: position.coords.altitude ?? undefined,
        timestamp: position.timestamp
      });
    },
    (err) => {
      if (onError) onError(err);
    },
    options
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}

/**
 * Calculates Haversine distance in km between two GPS coordinates
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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
  return Math.round(R * c * 10) / 10;
}

/**
 * Calculates genuine estimated travel time in minutes based on distance and traffic factors.
 * If distance cannot be computed, returns null so UI renders "ETA unavailable".
 */
export function calculateTravelEtaMinutes(
  distanceKm: number | null | undefined,
  currentSpeedKmh?: number
): number | null {
  if (distanceKm == null || isNaN(distanceKm) || distanceKm < 0) {
    return null;
  }
  if (distanceKm <= 0.05) return 1;

  // Road trajectory is typically ~1.35x crow-flight distance in urban areas
  const roadDistance = distanceKm * 1.35;
  const speed = currentSpeedKmh && currentSpeedKmh > 10 ? currentSpeedKmh : 24; // 24 km/h average city van speed
  const hours = roadDistance / speed;
  return Math.max(1, Math.ceil(hours * 60));
}

/**
 * Posts genuine Van Worker GPS updates to the Zooby backend
 */
export async function pushVanLocationUpdate(
  vanId: string,
  coords: GeoCoordinates,
  token?: string,
  extra: {
    workerName?: string;
    trackingStatus?: 'ACTIVE' | 'PAUSED' | 'OFFLINE';
    currentJobId?: string;
    currentEmergencyId?: string;
    batteryLevel?: number;
  } = {}
): Promise<VanLocation | null> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/vans/${vanId}/location`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        heading: coords.heading,
        speed: coords.speed,
        altitude: coords.altitude,
        ...extra
      })
    });

    if (!res.ok) {
      throw new Error(`Failed to transmit location: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Live location push to backend failed:', err);
    return null;
  }
}

/**
 * Connects to the real-time Server-Sent Events stream for van location broadcasts
 */
export function subscribeToVanLocationStream(
  onLocation: (location: VanLocation) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const sse = new EventSource(`${API_BASE_URL}/vans/stream`);

    sse.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'location_update' && payload.location) {
          onLocation(payload.location);
        }
      } catch (err) {
        console.error('Failed to parse SSE van location payload:', err);
      }
    };

    sse.onerror = (err) => {
      if (onError) onError(err);
    };

    return () => {
      sse.close();
    };
  } catch (err) {
    if (onError) onError(err);
    return () => {};
  }
}
