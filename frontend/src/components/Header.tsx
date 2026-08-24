import React, { useState } from 'react';
import { Pet, UserProfile } from '../types';
import { useCity } from '../context/CityContext';
import { CitySelector } from './common/CitySelector';
import { getUserDisplayName } from '../utils/identity';
import { ZoobyLogo } from './common/ZoobyLogo';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pets: Pet[];
  selectedPet: Pet;
  setSelectedPet: (pet: Pet) => void;
  unreadCount?: number;
  onOpenNotifications?: () => void;
  onOpenAddPet?: () => void;
  onOpenSOS?: () => void;
  currentUser?: UserProfile | null;
  onOpenSignIn?: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  pets = [],
  selectedPet,
  setSelectedPet,
  unreadCount = 0,
  onOpenNotifications,
  onOpenAddPet,
  onOpenSOS,
  currentUser,
  onOpenSignIn,
  onSignOut
}) => {
  const { currentCity } = useCity();
  const [showPetMenu, setShowPetMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const activePet = selectedPet || pets[0] || {
    id: 'default-pet',
    name: 'Bruno',
    breed: 'Golden Retriever',
    photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=300'
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fbf9f5] border-b border-[#efeeea] shadow-xs">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            id="brand-logo-btn"
            onClick={() => setActiveTab('dashboard')}
            className="cursor-pointer text-left"
          >
            <ZoobyLogo
              size="sm"
              subtitle={`${currentCity.name} Pet Care`}
              clickable={true}
            />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            <button
              id="nav-dashboard-btn"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-full text-[14px] font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'text-[#895100] bg-[#ffdcbc]/40 font-bold'
                  : 'text-[#544434] hover:text-[#895100] hover:bg-[#efeeea]'
              }`}
            >
              Dashboard
            </button>
            <button
              id="nav-mypets-btn"
              onClick={() => setActiveTab('mypets')}
              className={`px-3.5 py-1.5 rounded-full text-[14px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'mypets'
                  ? 'text-[#895100] bg-[#ffdcbc]/40 font-bold'
                  : 'text-[#544434] hover:text-[#895100] hover:bg-[#efeeea]'
              }`}
            >
              <span>My Pets</span>
              <span className="text-xs bg-[#dac2ae]/40 text-[#683c00] px-1.5 py-0.5 rounded-full font-bold">
                {pets.length}
              </span>
            </button>
            <button
              id="nav-services-btn"
              onClick={() => setActiveTab('services')}
              className={`px-3.5 py-1.5 rounded-full text-[14px] font-semibold transition-all cursor-pointer ${
                activeTab === 'services'
                  ? 'text-[#895100] bg-[#ffdcbc]/40 font-bold'
                  : 'text-[#544434] hover:text-[#895100] hover:bg-[#efeeea]'
              }`}
            >
              Services &amp; Van
            </button>
            <button
              id="nav-adopt-btn"
              onClick={() => setActiveTab('adopt')}
              className={`px-3.5 py-1.5 rounded-full text-[14px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'adopt'
                  ? 'text-[#895100] bg-[#ffdcbc]/40 font-bold'
                  : 'text-[#544434] hover:text-[#895100] hover:bg-[#efeeea]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-rose-500">favorite</span>
              <span>Adopt</span>
            </button>
            <button
              id="nav-history-btn"
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-full text-[14px] font-semibold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'text-[#895100] bg-[#ffdcbc]/40 font-bold'
                  : 'text-[#544434] hover:text-[#895100] hover:bg-[#efeeea]'
              }`}
            >
              History
            </button>
            <button
              id="nav-inbox-btn"
              onClick={() => setActiveTab('inbox')}
              className={`px-3.5 py-1.5 rounded-full text-[14px] font-semibold transition-all cursor-pointer ${
                activeTab === 'inbox'
                  ? 'text-[#895100] bg-[#ffdcbc]/40 font-bold'
                  : 'text-[#544434] hover:text-[#895100] hover:bg-[#efeeea]'
              }`}
            >
              Inbox
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick Pet Switcher Dropdown */}
          <div className="relative">
            <button
              id="pet-switcher-btn"
              onClick={() => setShowPetMenu(!showPetMenu)}
              className="flex items-center gap-2 py-1 px-2.5 rounded-full bg-[#ffffff] border border-[#dac2ae]/60 hover:border-[#895100] transition-colors shadow-2xs cursor-pointer text-left"
            >
              <img
                src={activePet.photoUrl}
                alt={activePet.name}
                className="w-7 h-7 rounded-full object-cover border border-[#ff9f1c]"
              />
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-[#1b1c1a] leading-tight flex items-center gap-1">
                  {activePet.name}
                  <span className="material-symbols-outlined text-[14px] text-[#877462]">expand_more</span>
                </span>
                <span className="text-[10px] text-[#544434]">{activePet.breed?.split(' ')[0] || 'Pet'}</span>
              </div>
            </button>

            {showPetMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#efeeea] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-xs font-semibold text-[#877462] uppercase tracking-wider">
                  Switch Active Pet
                </div>
                {pets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPet(p);
                      setShowPetMenu(false);
                    }}
                    className={`w-full px-3 py-2 flex items-center justify-between hover:bg-[#f5f3ef] transition-colors cursor-pointer text-left ${
                      activePet.id === p.id ? 'bg-[#ffdcbc]/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={p.photoUrl} alt={p.name} className="w-8 h-8 rounded-full object-cover border border-[#dac2ae]" />
                      <div>
                        <div className="text-sm font-bold text-[#1b1c1a]">{p.name}</div>
                        <div className="text-xs text-[#544434]">{p.breed}</div>
                      </div>
                    </div>
                    {activePet.id === p.id && (
                      <span className="material-symbols-outlined text-[#41674b] text-[18px] filled-icon">
                        check_circle
                      </span>
                    )}
                  </button>
                ))}
                <div className="border-t border-[#efeeea] my-1"></div>
                <button
                  onClick={() => {
                    setShowPetMenu(false);
                    onOpenAddPet();
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-xs font-bold text-[#895100] hover:bg-[#f5f3ef] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  <span>Add Another Pet Profile</span>
                </button>
              </div>
            )}
          </div>

          {/* City Selector */}
          <CitySelector variant="header" />

          {/* 🔴 24/7 Rapid SOS Emergency Button */}
          {onOpenSOS && (
            <button
              id="header-sos-btn"
              onClick={onOpenSOS}
              className="py-1.5 px-3 rounded-full bg-[#ba1a1a] hover:bg-[#991b1b] active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer border border-white/20"
              title="24/7 Rapid Van SOS Emergency Dispatch"
            >
              <span className="material-symbols-outlined text-[16px]">emergency</span>
              <span className="font-extrabold tracking-wide">SOS</span>
            </button>
          )}

          {/* Notifications Button */}
          <button
            id="header-notification-btn"
            onClick={onOpenNotifications}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#895100] hover:bg-[#efeeea] transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#ff9f1c] text-[#683c00] text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth State */}
          <div className="relative pl-1">
            {currentUser ? (
              <button
                id="user-profile-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-[#ff9f1c]/40 transition-all cursor-pointer"
                title={`${getUserDisplayName(currentUser)} (${currentUser.email || ''})`}
              >
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#ff9f1c] shadow-xs">
                  <img
                    src={currentUser.profilePhoto || currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"}
                    alt={getUserDisplayName(currentUser)}
                    className="w-full h-full object-cover"
                  />
                </div>
              </button>
            ) : (
              <button
                id="header-signin-btn"
                onClick={onOpenSignIn}
                className="py-1.5 px-3 rounded-full bg-[#895100] hover:bg-[#683c00] text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">login</span>
                <span>Sign In</span>
              </button>
            )}

            {/* User Dropdown Menu */}
            {showUserMenu && currentUser && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#efeeea] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-[#efeeea]">
                  <div className="text-sm font-bold text-[#1b1c1a] truncate">{getUserDisplayName(currentUser)}</div>
                  <div className="text-xs text-[#877462] truncate">{currentUser.email || ''}</div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-[#41674b] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#41674b]"></span>
                    <span>Signed In ({currentUser.location || currentUser.city || 'Nashik'})</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    id="header-user-settings-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      setActiveTab('settings');
                    }}
                    className="w-full px-4 py-2 flex items-center gap-2.5 text-xs font-bold text-[#895100] hover:bg-[#ffdcbc]/20 transition-colors cursor-pointer text-left"
                  >
                    <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                    <span className="flex-grow">Account &amp; Photo Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setActiveTab('mypets');
                    }}
                    className="w-full px-4 py-2 flex items-center gap-2.5 text-xs font-semibold text-[#544434] hover:bg-[#f5f3ef] transition-colors cursor-pointer text-left"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#895100]">pets</span>
                    <span>Manage Pet Profiles</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setActiveTab('history');
                    }}
                    className="w-full px-4 py-2 flex items-center gap-2.5 text-xs font-semibold text-[#544434] hover:bg-[#f5f3ef] transition-colors cursor-pointer text-left"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#895100]">receipt_long</span>
                    <span>My Service Bookings</span>
                  </button>
                </div>

                <div className="border-t border-[#efeeea] pt-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenSignIn();
                    }}
                    className="w-full px-4 py-2 flex items-center gap-2.5 text-xs font-semibold text-[#544434] hover:bg-[#f5f3ef] transition-colors cursor-pointer text-left"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#877462]">switch_account</span>
                    <span>Switch / Sign In with Another Account</span>
                  </button>

                  <button
                    id="user-signout-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      onSignOut();
                    }}
                    className="w-full px-4 py-2 flex items-center gap-2.5 text-xs font-bold text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors cursor-pointer text-left"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
