import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export interface MapStop {
  id: string;
  lat: number;
  lng: number;
  title: string;
  petName?: string;
  status?: string;
  sequence?: number;
}

export interface ZoobyRealMapProps {
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  vanPosition?: {
    lat: number;
    lng: number;
    heading?: number;
    title?: string;
    plate?: string;
    status?: string;
    speed?: number;
  } | null;
  userPosition?: {
    lat: number;
    lng: number;
    title?: string;
    address?: string;
  } | null;
  destinationPosition?: {
    lat: number;
    lng: number;
    title?: string;
  } | null;
  stops?: MapStop[];
  showRouteLine?: boolean;
  accuracyRadius?: number;
  height?: string;
  className?: string;
  interactive?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}

export const ZoobyRealMap: React.FC<ZoobyRealMapProps> = ({
  center,
  zoom = 14,
  vanPosition,
  userPosition,
  destinationPosition,
  stops = [],
  showRouteLine = true,
  accuracyRadius,
  height = '360px',
  className = '',
  interactive = true,
  onMapClick
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  // Default coordinate center (Nashik Central Hub fallback if none provided)
  const defaultCenter: [number, number] = center || [
    vanPosition?.lat || userPosition?.lat || 19.9975,
    vanPosition?.lng || userPosition?.lng || 73.7898
  ];

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom,
        zoomControl: interactive,
        dragging: interactive,
        touchZoom: interactive,
        scrollWheelZoom: false,
        doubleClickZoom: interactive
      });

      // Production OpenStreetMap Tile Layer (Clean CartoDB Positron / OSM style)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      if (onMapClick) {
        map.on('click', (e) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }
    }

    return () => {
      // Map cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Render Markers, Accuracy Circles, and Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
    if (accuracyCircleRef.current) {
      map.removeLayer(accuracyCircleRef.current);
      accuracyCircleRef.current = null;
    }

    const boundsPoints: L.LatLngExpression[] = [];

    // --- Van Marker (Custom Animated SVG Van) ---
    if (vanPosition && !isNaN(vanPosition.lat) && !isNaN(vanPosition.lng)) {
      const vanLatLng = L.latLng(vanPosition.lat, vanPosition.lng);
      boundsPoints.push(vanLatLng);

      const vanIcon = L.divIcon({
        className: 'zooby-van-marker-custom',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;">
            <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(245, 158, 11, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 38px; height: 38px; border-radius: 12px; background: #1b1c1a; border: 2.5px solid #f59e0b; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transform: rotate(${vanPosition.heading || 0}deg); transition: transform 0.3s ease;">
              <span style="color: #fbbf24; font-family: 'Material Symbols Outlined'; font-size: 22px;">local_shipping</span>
            </div>
            <div style="position: absolute; bottom: -18px; background: #1b1c1a; color: #fbbf24; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 6px; border: 1px solid #f59e0b; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
              ${vanPosition.plate || 'Zooby Van'}
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      const vanMarker = L.marker(vanLatLng, { icon: vanIcon }).addTo(markersGroup);
      vanMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
          <strong style="color: #895100; display: block; margin-bottom: 2px;">🚐 ${vanPosition.title || 'Zooby Mobile Care Unit'}</strong>
          <div>Plate: <strong>${vanPosition.plate || 'MH 15 ZB 4022'}</strong></div>
          <div>Status: <span style="color: #059669; font-weight: bold;">${vanPosition.status || 'Active GPS'}</span></div>
          ${vanPosition.speed ? `<div>Speed: ${Math.round(vanPosition.speed * 3.6)} km/h</div>` : ''}
          <div style="color: #666; font-size: 10px; margin-top: 4px;">GPS: ${vanPosition.lat.toFixed(4)}, ${vanPosition.lng.toFixed(4)}</div>
        </div>
      `);
    }

    // --- User / Pet Parent / Emergency Marker ---
    if (userPosition && !isNaN(userPosition.lat) && !isNaN(userPosition.lng)) {
      const userLatLng = L.latLng(userPosition.lat, userPosition.lng);
      boundsPoints.push(userLatLng);

      const userIcon = L.divIcon({
        className: 'zooby-user-marker-custom',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
            <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: rgba(225, 29, 72, 0.25); animation: pulse 1.5s infinite;"></div>
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #e11d48; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(225,29,72,0.4);">
              <span style="color: white; font-family: 'Material Symbols Outlined'; font-size: 18px;">location_on</span>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const userMarker = L.marker(userLatLng, { icon: userIcon }).addTo(markersGroup);
      userMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
          <strong style="color: #e11d48; display: block;">📍 ${userPosition.title || 'Your Location'}</strong>
          <div style="color: #444; margin-top: 2px;">${userPosition.address || 'Doorstep Service Point'}</div>
        </div>
      `);

      // Draw accuracy radius if provided
      if (accuracyRadius && accuracyRadius > 0) {
        accuracyCircleRef.current = L.circle(userLatLng, {
          radius: Math.min(accuracyRadius, 200),
          color: '#e11d48',
          fillColor: '#e11d48',
          fillOpacity: 0.1,
          weight: 1.5
        }).addTo(map);
      }
    }

    // --- Destination Position Marker ---
    if (destinationPosition && !isNaN(destinationPosition.lat) && !isNaN(destinationPosition.lng)) {
      const destLatLng = L.latLng(destinationPosition.lat, destinationPosition.lng);
      boundsPoints.push(destLatLng);

      const destIcon = L.divIcon({
        className: 'zooby-dest-marker-custom',
        html: `
          <div style="width: 30px; height: 30px; border-radius: 50%; background: #475b9c; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.25);">
            <span style="color: white; font-family: 'Material Symbols Outlined'; font-size: 16px;">flag</span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const destMarker = L.marker(destLatLng, { icon: destIcon }).addTo(markersGroup);
      destMarker.bindPopup(`<strong>🏁 ${destinationPosition.title || 'Destination'}</strong>`);
    }

    // --- Route Stops (for Van Worker Route View) ---
    if (stops && stops.length > 0) {
      stops.forEach((stop, index) => {
        if (isNaN(stop.lat) || isNaN(stop.lng)) return;
        const stopLatLng = L.latLng(stop.lat, stop.lng);
        boundsPoints.push(stopLatLng);

        const stopIcon = L.divIcon({
          className: 'zooby-stop-marker-custom',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: ${stop.status === 'Completed' ? '#10b981' : '#895100'}; border: 2px solid white; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">
                ${stop.sequence ?? index + 1}
              </div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const stopMarker = L.marker(stopLatLng, { icon: stopIcon }).addTo(markersGroup);
        stopMarker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px;">
            <strong>Stop #${stop.sequence ?? index + 1}: ${stop.petName || 'Pet'}</strong>
            <div>${stop.title}</div>
            <div style="color: #895100; font-weight: bold; margin-top: 2px;">${stop.status || 'Pending'}</div>
          </div>
        `);
      });
    }

    // --- Polyline Route Path ---
    if (showRouteLine && boundsPoints.length >= 2) {
      polylineRef.current = L.polyline(boundsPoints, {
        color: '#f59e0b',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
    }

    // --- Fit Bounds ---
    if (boundsPoints.length > 1) {
      const bounds = L.latLngBounds(boundsPoints);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    } else if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], zoom);
    }
  }, [vanPosition, userPosition, destinationPosition, stops, showRouteLine, accuracyRadius, zoom]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[#e5e0d8] shadow-xs ${className}`}>
      <div
        ref={mapContainerRef}
        style={{ height, width: '100%' }}
        className="z-0"
      />
      {/* Visual Live GPS Badge */}
      <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-black/10 shadow-xs flex items-center gap-1.5 text-[11px] font-bold text-[#1b1c1a] pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Live OSM Map</span>
      </div>
    </div>
  );
};
