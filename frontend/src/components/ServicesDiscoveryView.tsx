import React, { useState } from 'react';
import { ServiceProvider, ServiceCategory, Pet } from '../types';
import { useCity } from '../context/CityContext';
import { CitySelector } from './common/CitySelector';

interface ServicesDiscoveryViewProps {
  providers?: ServiceProvider[];
  selectedCategory: ServiceCategory | 'all';
  onSelectCategory: (category: ServiceCategory | 'all') => void;
  onBookProvider: (provider: ServiceProvider) => void;
  activePet?: Pet;
  onQuickBookCareVan?: () => void;
}

export const ServicesDiscoveryView: React.FC<ServicesDiscoveryViewProps> = ({
  providers = [],
  selectedCategory,
  onSelectCategory,
  onBookProvider,
  activePet,
  onQuickBookCareVan
}) => {
  const { currentCity } = useCity();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const petDisplayName = activePet?.name || 'your pet';

  const safeProviders = providers || [];
  const filteredProviders = safeProviders.filter((p) => {
    const matchesCity =
      p.city.toLowerCase() === currentCity.name.toLowerCase() ||
      p.city.toLowerCase() === currentCity.id.toLowerCase();
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      (p?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p?.area || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8 animate-fade-in">
      {/* Header & City Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-quicksand font-bold text-3xl md:text-4xl text-[#895100]">
            Trusted Pet Care Services
          </h1>
          <p className="text-sm md:text-base text-[#544434] mt-1">
            Vetted groomers, certified clinics, vans, walkers, and sitters in{' '}
            <strong className="text-[#895100]">{currentCity.name}</strong> for{' '}
            <strong className="text-[#895100]">{petDisplayName}</strong>.
          </p>
        </div>

        {/* City Filter using CitySelector */}
        <div className="flex items-center gap-2">
          <CitySelector variant="hero" />
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-3 rounded-2xl border border-[#e5e0d8] shadow-xs">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#895100] text-white shadow-xs'
                : 'bg-[#f5f3ef] text-[#544434] hover:bg-[#efeeea]'
            }`}
          >
            All Services
          </button>
          <button
            onClick={() => onSelectCategory('grooming')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'grooming'
                ? 'bg-[#ff9f1c] text-[#683c00] shadow-xs'
                : 'bg-[#f5f3ef] text-[#544434] hover:bg-[#efeeea]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">content_cut</span>
            <span>Grooming</span>
          </button>
          <button
            onClick={() => onSelectCategory('walking')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'walking'
                ? 'bg-[#41674b] text-white shadow-xs'
                : 'bg-[#f5f3ef] text-[#544434] hover:bg-[#efeeea]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">directions_walk</span>
            <span>Dog Walking</span>
          </button>
          <button
            onClick={() => onSelectCategory('sitting')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'sitting'
                ? 'bg-[#475b9c] text-white shadow-xs'
                : 'bg-[#f5f3ef] text-[#544434] hover:bg-[#efeeea]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">chair</span>
            <span>Pet Sitting</span>
          </button>
          <button
            onClick={() => onSelectCategory('vet_consult')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'vet_consult'
                ? 'bg-[#ba1a1a] text-white shadow-xs'
                : 'bg-[#f5f3ef] text-[#544434] hover:bg-[#efeeea]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">local_hospital</span>
            <span>Vet Consults</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search provider, area..."
            className="w-full bg-[#fbf9f5] border border-[#dac2ae] rounded-full px-4 py-2 pl-9 text-xs text-[#1b1c1a] placeholder:text-[#877462] focus:outline-none focus:ring-2 focus:ring-[#895100]"
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#877462] text-sm">
            search
          </span>
        </div>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            className="bg-white rounded-2xl border border-[#e5e0d8] shadow-xs overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="p-6">
              {/* Header: Title, Category Badge, Rating */}
              <div className="flex gap-4 items-start">
                <img
                  src={provider.image}
                  alt={provider.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[#dac2ae]"
                />
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        provider.category === 'grooming'
                          ? 'bg-[#ffdcbc] text-[#683c00]'
                          : provider.category === 'walking'
                          ? 'bg-[#c2edca] text-[#294e35]'
                          : provider.category === 'sitting'
                          ? 'bg-[#dce1ff] text-[#314685]'
                          : 'bg-[#ffdad6] text-[#93000a]'
                      }`}
                    >
                      {provider.category.replace('_', ' ')}
                    </span>

                    <div className="flex items-center gap-1 text-xs font-bold text-[#1b1c1a] bg-[#f5f3ef] px-2 py-0.5 rounded-md">
                      <span className="material-symbols-outlined text-[14px] text-[#ff9f1c] filled-icon">
                        star
                      </span>
                      <span>{provider.rating}</span>
                      <span className="text-[#877462] font-normal">({provider.reviewCount})</span>
                    </div>
                  </div>

                  <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a] mt-1.5">
                    {provider.name}
                  </h3>
                  <p className="text-xs text-[#895100] font-semibold">{provider.title}</p>
                </div>
              </div>

              {/* Bio & Details */}
              <p className="text-xs text-[#544434] mt-4 leading-relaxed line-clamp-2">
                {provider.bio}
              </p>

              {/* Location & Slots */}
              <div className="mt-4 pt-3 border-t border-[#efeeea] flex flex-wrap justify-between items-center gap-2 text-xs text-[#544434]">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#475b9c]">location_on</span>
                  <span>{provider.area}</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-[#41674b]">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>Next available: {provider.availableDays[0]}</span>
                </div>
              </div>
            </div>

            {/* Price & Book Action */}
            <div className="bg-[#fbf9f5] px-6 py-4 border-t border-[#efeeea] flex justify-between items-center">
              <div>
                <span className="text-[10px] text-[#877462] uppercase tracking-wider block font-semibold">
                  Starting from
                </span>
                <span className="font-quicksand font-bold text-lg text-[#895100]">
                  {provider.priceFormatted}
                </span>
              </div>

              <button
                id={`book-provider-${provider.id}`}
                onClick={() => onBookProvider(provider)}
                className="bg-[#ff9f1c] hover:bg-[#ff8f00] text-[#683c00] px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-[0_2px_8px_rgba(255,159,28,0.3)] hover:shadow-none active:translate-y-0.5 cursor-pointer flex items-center gap-1"
              >
                <span>Book for {petDisplayName}</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
