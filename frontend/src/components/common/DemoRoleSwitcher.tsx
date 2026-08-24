import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface DemoRoleSwitcherProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const DemoRoleSwitcher: React.FC<DemoRoleSwitcherProps> = ({ currentPath, onNavigate }) => {
  const { user, role, isAuthenticated, loginDemo, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end font-jakarta text-xs">
      {/* Expanded Menu */}
      {isExpanded && (
        <div className="mb-2 bg-[#221c17] text-[#fbf9f5] border border-[#524436] rounded-2xl p-4 shadow-2xl w-80 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between border-b border-[#3e3227] pb-2">
            <span className="font-bold text-[#ffb86c] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px]">switch_account</span>
              <span>Zooby Demo Personas (Nashik)</span>
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-[#a8998a] hover:text-white p-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <div className="text-[11px] text-[#a8998a] space-y-1">
            <p>
              Current User: <strong className="text-white">{user ? user.name : 'Guest (Public Website)'}</strong>
            </p>
            <p>
              Active Role:{' '}
              <span
                className={`px-1.5 py-0.5 rounded-full font-bold text-[10px] ${
                  role === 'ADMIN'
                    ? 'bg-stone-500/30 text-stone-200'
                    : role === 'PROVIDER'
                    ? 'bg-blue-400/20 text-blue-300'
                    : role === 'RESCUE_PARTNER'
                    ? 'bg-emerald-400/20 text-emerald-300'
                    : role === 'VAN_WORKER'
                    ? 'bg-purple-400/20 text-purple-300'
                    : role === 'PET_PARENT'
                    ? 'bg-amber-400/20 text-amber-300'
                    : 'bg-zinc-700 text-zinc-300'
                }`}
              >
                {role || 'PUBLIC_GUEST'}
              </span>
            </p>
            <p className="font-mono text-[10px] text-[#7a6b5e] truncate">Route: {currentPath}</p>
          </div>

          <div className="space-y-1 pt-1 max-h-60 overflow-y-auto pr-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#d6c7b7]">
              Switch Persona (1-Click)
            </p>

            <button
              onClick={async () => {
                await loginDemo('PET_PARENT');
                onNavigate('/dashboard');
              }}
              className="w-full py-1.5 px-2.5 rounded-xl bg-[#2e251e] hover:bg-[#3d3228] text-[#fbf9f5] border border-[#524132] font-semibold text-left flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-amber-400">pets</span>
                <span>Pet Parent (Sam Sharma)</span>
              </span>
              {role === 'PET_PARENT' && <span className="text-[10px] text-amber-400 font-bold">Active</span>}
            </button>

            <button
              onClick={async () => {
                await loginDemo('PROVIDER');
                onNavigate('/provider/dashboard');
              }}
              className="w-full py-1.5 px-2.5 rounded-xl bg-[#2e251e] hover:bg-[#3d3228] text-[#fbf9f5] border border-[#524132] font-semibold text-left flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-blue-400">medical_services</span>
                <span>Vet Clinic (Dr. Ananya Mehta)</span>
              </span>
              {role === 'PROVIDER' && <span className="text-[10px] text-blue-400 font-bold">Active</span>}
            </button>

            <button
              onClick={async () => {
                await loginDemo('RESCUE_PARTNER');
                onNavigate('/rescue/dashboard');
              }}
              className="w-full py-1.5 px-2.5 rounded-xl bg-[#2e251e] hover:bg-[#3d3228] text-[#fbf9f5] border border-[#524132] font-semibold text-left flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-emerald-400">volunteer_activism</span>
                <span>Rescue Partner (Neha Patil)</span>
              </span>
              {role === 'RESCUE_PARTNER' && <span className="text-[10px] text-emerald-400 font-bold">Active</span>}
            </button>

            <button
              onClick={async () => {
                await loginDemo('VAN_WORKER');
                onNavigate('/van/dashboard');
              }}
              className="w-full py-1.5 px-2.5 rounded-xl bg-[#2e251e] hover:bg-[#3d3228] text-[#fbf9f5] border border-[#524132] font-semibold text-left flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-purple-400">local_shipping</span>
                <span>Mobile Van Tech (Rahul Sharma)</span>
              </span>
              {role === 'VAN_WORKER' && <span className="text-[10px] text-purple-400 font-bold">Active</span>}
            </button>

            <button
              onClick={async () => {
                await loginDemo('ADMIN');
                onNavigate('/admin/dashboard');
              }}
              className="w-full py-1.5 px-2.5 rounded-xl bg-[#2e251e] hover:bg-[#3d3228] text-[#fbf9f5] border border-[#524132] font-semibold text-left flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-stone-300">admin_panel_settings</span>
                <span>Super Admin (Priya Sharma)</span>
              </span>
              {role === 'ADMIN' && <span className="text-[10px] text-stone-300 font-bold">Active</span>}
            </button>
          </div>

          <div className="pt-2 border-t border-[#3e3227] flex items-center justify-between">
            <button
              onClick={() => {
                logout('/');
              }}
              className="py-1 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">public</span>
              <span>View Public Landing</span>
            </button>
            <button
              onClick={() => onNavigate('/signin')}
              className="py-1 px-3 rounded-lg bg-[#895100] hover:bg-[#683c00] text-white text-[11px] font-bold cursor-pointer"
            >
              Sign In Page
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Pill */}
      <button
        id="demo-role-switcher-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#1b1c1a] hover:bg-[#2d241b] text-white shadow-xl border border-[#544434] transition-all cursor-pointer group"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-bold text-amber-200">
          {isAuthenticated ? `${role} Role` : 'Public (Guest)'}
        </span>
        <span className="material-symbols-outlined text-[16px] text-stone-400 group-hover:text-white">
          {isExpanded ? 'expand_more' : 'unfold_more'}
        </span>
      </button>
    </div>
  );
};
