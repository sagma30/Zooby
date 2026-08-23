import React from 'react';

interface AdminSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onExitAdmin: () => void;
  onSignOut?: () => void;
  onVerifyProvidersClick?: () => void;
  pendingApprovalsCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  onExitAdmin,
  onSignOut,
  onVerifyProvidersClick,
  pendingApprovalsCount = 45
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
    { id: 'users', label: 'Users', icon: 'group' },
    { id: 'pets', label: 'Pets', icon: 'pets' },
    { id: 'providers', label: 'Service Providers', icon: 'medical_services' },
    { id: 'bookings', label: 'Bookings', icon: 'calendar_month' },
    { id: 'payments', label: 'Payments', icon: 'payments' },
    { id: 'insurance', label: 'Insurance', icon: 'verified_user' },
    { id: 'reviews', label: 'Reviews', icon: 'star' },
    { id: 'complaints', label: 'Complaints', icon: 'warning' },
    { id: 'analytics', label: 'Analytics', icon: 'trending_up' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  return (
    <aside className="w-64 bg-[#fbf9f5] border-r border-[#efeeea] flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto selection:bg-[#ffdcbc]">
      <div>
        {/* Brand Header */}
        <div className="p-6 pb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#895100] text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[20px] filled-icon">pets</span>
          </div>
          <div>
            <h1 className="font-quicksand font-bold text-lg text-[#895100] leading-tight">
              Zooby Admin
            </h1>
            <p className="text-[11px] text-[#877462] font-semibold">Pet-First Ecosystem</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              currentTab === item.id ||
              (currentTab === 'user-detail' && item.id === 'users');

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#f4ebd9] text-[#895100] border-r-4 border-[#895100] font-bold shadow-2xs'
                    : 'text-[#625447] hover:bg-[#f3eee7] hover:text-[#1b1c1a]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isActive ? 'filled-icon text-[#895100]' : 'text-[#877462]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.id === 'providers' && pendingApprovalsCount > 0 && (
                  <span className="bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Actions */}
      <div className="p-4 border-t border-[#efeeea] space-y-3">
        {/* System Status Pill */}
        <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-full bg-[#d2f4d3]/60 text-[#1c6422] text-xs font-bold border border-[#b2e8b5]">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>System Status: Operational</span>
        </div>

        {/* Admin Profile Card */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-[#efeeea] shadow-2xs">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#ff9f1c] shrink-0">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
              alt="Admin"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-[#1b1c1a] truncate">Zooby Admin</div>
            <div className="text-[10px] text-[#877462] font-semibold truncate">
              Super Administrator
            </div>
          </div>
        </div>

        {/* Verify Providers Yellow CTA */}
        <button
          onClick={onVerifyProvidersClick || (() => onSelectTab('providers'))}
          className="w-full py-2.5 px-3 rounded-xl bg-[#f59e0b] hover:bg-[#ea580c] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">verified</span>
          <span>Verify Providers</span>
        </button>

        {/* Switch back to Pet Parent App */}
        <button
          onClick={onExitAdmin}
          className="w-full py-2 px-3 rounded-xl text-xs font-bold text-[#895100] hover:bg-[#f4ebd9] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Pet Parent App</span>
        </button>

        {onSignOut && (
          <button
            onClick={onSignOut}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold text-[#93000a] hover:bg-[#ffdad6]/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-[#dac2ae]/40"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out Admin</span>
          </button>
        )}
      </div>
    </aside>
  );
};
