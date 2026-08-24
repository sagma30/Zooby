import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserDisplayName } from '../../utils/identity';

interface AdminHeaderProps {
  title: string;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  onOpenMobileMenu?: () => void;
  onOpenNotifications?: () => void;
  onExitAdmin: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search users, pets, bookings...',
  onOpenMobileMenu,
  onExitAdmin
}) => {
  const { user } = useAuth();
  const displayName = getUserDisplayName(user, 'Priya Sharma');

  return (
    <header className="sticky top-0 z-30 bg-[#fbf9f5]/95 backdrop-blur-md border-b border-[#efeeea] px-6 py-4 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-[#625447] hover:bg-[#f3eee7] cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        )}
        <h1 className="font-quicksand font-bold text-2xl md:text-[26px] text-[#895100] tracking-tight">
          {title}
        </h1>
      </div>

      {/* Center/Right: Search Bar & Actions */}
      <div className="flex items-center gap-3 flex-grow max-w-xl justify-end">
        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#877462]">
            <span className="material-symbols-outlined text-[19px]">search</span>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 bg-[#f0ebe3]/80 border border-[#e5dfd5] rounded-full text-xs md:text-sm text-[#1b1c1a] placeholder-[#877462] focus:outline-none focus:bg-white focus:border-[#ff9f1c] focus:ring-2 focus:ring-[#ff9f1c]/20 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#877462] hover:text-[#1b1c1a]"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-full text-[#625447] hover:bg-[#f3eee7] hover:text-[#1b1c1a] transition-colors cursor-pointer"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-[#fbf9f5]" />
        </button>

        {/* Help Icon */}
        <button
          className="p-2 rounded-full text-[#625447] hover:bg-[#f3eee7] hover:text-[#1b1c1a] transition-colors cursor-pointer"
          title="Help & Documentation"
        >
          <span className="material-symbols-outlined text-[22px]">help</span>
        </button>

        {/* Admin Avatar */}
        <button
          onClick={onExitAdmin}
          className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#ff9f1c]/40 transition-all cursor-pointer"
          title={`${displayName} (Click to switch to User App)`}
        >
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#ff9f1c] shadow-xs">
            <img
              src={user?.profilePhoto || user?.avatarUrl || "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=240"}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          </div>
        </button>
      </div>
    </header>
  );
};
