import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_CITIES, ZoobyCity, getCityById, findNearestSupportedCity } from '../data/citiesData';
import { getCurrentDeviceLocation } from '../services/gpsTracking';

interface CityContextType {
  currentCity: ZoobyCity;
  supportedCities: ZoobyCity[];
  setCityById: (cityId: string) => void;
  detectLocationCity: () => Promise<{ success: boolean; city?: ZoobyCity; message?: string }>;
  cityToastMessage: string | null;
  clearCityToast: () => void;
  isUnsupportedLocation: boolean;
  clearUnsupportedAlert: () => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCity, setCurrentCity] = useState<ZoobyCity>(() => {
    if (typeof window !== 'undefined') {
      const savedCityId = localStorage.getItem('zooby_selected_city');
      if (savedCityId) {
        return getCityById(savedCityId);
      }
    }
    return SUPPORTED_CITIES[0]; // Default Nashik
  });

  const [cityToastMessage, setCityToastMessage] = useState<string | null>(null);
  const [isUnsupportedLocation, setIsUnsupportedLocation] = useState<boolean>(false);

  const setCityById = (cityId: string) => {
    const matched = getCityById(cityId);
    setCurrentCity(matched);
    setIsUnsupportedLocation(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zooby_selected_city', matched.id);
    }
    setCityToastMessage(`Showing Zooby services available in ${matched.name}.`);
    setTimeout(() => {
      setCityToastMessage((prev) => (prev?.includes(matched.name) ? null : prev));
    }, 4000);
  };

  const detectLocationCity = async (): Promise<{ success: boolean; city?: ZoobyCity; message?: string }> => {
    try {
      const coords = await getCurrentDeviceLocation({ timeout: 8000, enableHighAccuracy: true });
      const nearest = findNearestSupportedCity(coords.latitude, coords.longitude, 120);

      if (nearest) {
        setCityById(nearest.city.id);
        return {
          success: true,
          city: nearest.city,
          message: `Detected your location near ${nearest.city.name} (${nearest.distanceKm} km away).`
        };
      } else {
        setIsUnsupportedLocation(true);
        return {
          success: false,
          message: `Zooby isn't available in your detected region yet.`
        };
      }
    } catch {
      // Fallback
      return {
        success: false,
        message: 'Could not acquire GPS permission. Please select your city manually.'
      };
    }
  };

  const clearCityToast = () => setCityToastMessage(null);
  const clearUnsupportedAlert = () => setIsUnsupportedLocation(false);

  return (
    <CityContext.Provider
      value={{
        currentCity,
        supportedCities: SUPPORTED_CITIES,
        setCityById,
        detectLocationCity,
        cityToastMessage,
        clearCityToast,
        isUnsupportedLocation,
        clearUnsupportedAlert
      }}
    >
      {children}
      {/* Global City Switch Toast */}
      {cityToastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1b1c1a] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 border border-[#dac2ae]/30">
          <span className="material-symbols-outlined text-base text-amber-400 filled-icon">location_on</span>
          <span>{cityToastMessage}</span>
          <button
            onClick={clearCityToast}
            className="ml-2 text-stone-400 hover:text-white"
            title="Dismiss"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
    </CityContext.Provider>
  );
};

export const useCity = (): CityContextType => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};
