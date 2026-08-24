import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AccessDeniedViewProps {
  requiredRole?: UserRole | string;
  attemptedPath?: string;
  onNavigate: (path: string) => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  requiredRole,
  attemptedPath,
  onNavigate
}) => {
  const { user, role, logout } = useAuth();

  const getMyDashboardPath = () => {
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'PROVIDER') return '/provider/dashboard';
    if (role === 'SERVICE_PROVIDER') return '/service-provider/dashboard';
    if (role === 'RESCUE_PARTNER') return '/rescue/dashboard';
    if (role === 'VAN_WORKER') return '/van/dashboard';
    return '/dashboard';
  };

  const getRoleDisplayName = (r?: UserRole | string | null) => {
    if (r === 'ADMIN') return 'Super Administrator';
    if (r === 'PROVIDER') return 'Veterinary Specialist';
    if (r === 'SERVICE_PROVIDER') return 'Pet Service Provider';
    if (r === 'RESCUE_PARTNER') return 'Rescue Partner / Shelter';
    if (r === 'VAN_WORKER') return 'Mobile Van Specialist';
    if (r === 'PET_PARENT') return 'Pet Parent';
    return 'Unauthenticated Guest';
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] flex flex-col justify-center items-center p-6 text-center font-jakarta selection:bg-[#ffdcbc]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#e5e0d8] shadow-lg space-y-6">
        {/* Shield Lock Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#ffeed9] text-[#895100] flex items-center justify-center shadow-inner">
          <span className="material-symbols-outlined text-4xl">gpp_maybe</span>
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-[#ffdad6] text-[#93000a] mb-2">
            403 • Access Denied
          </span>
          <h1 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
            Restricted Dashboard Area
          </h1>
          <p className="text-sm text-[#877462] mt-2 leading-relaxed">
            You do not have the required permissions to view{' '}
            <code className="bg-[#f3eee8] px-2 py-0.5 rounded text-xs font-mono text-[#895100]">
              {attemptedPath || 'this page'}
            </code>
            .
          </p>
        </div>

        {/* Current Auth Status Badge */}
        <div className="bg-[#f9f7f4] rounded-2xl p-4 border border-[#ebdcc4] text-left text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[#877462]">Your Current Role:</span>
            <span className="font-bold text-[#895100] px-2 py-0.5 bg-white rounded-md border border-[#dac2ae]/40">
              {getRoleDisplayName(role)}
            </span>
          </div>
          {user && (
            <div className="flex justify-between items-center text-[#544434]">
              <span className="text-[#877462]">Signed In As:</span>
              <span className="font-medium truncate max-w-[180px]">{user.name} ({user.email})</span>
            </div>
          )}
          {requiredRole && (
            <div className="flex justify-between items-center text-[#93000a] font-medium pt-1 border-t border-[#dac2ae]/30">
              <span>Required Role:</span>
              <span>{getRoleDisplayName(requiredRole)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => onNavigate(getMyDashboardPath())}
            className="w-full py-3 px-4 rounded-xl bg-[#895100] text-white font-bold text-sm hover:bg-[#683c00] transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">dashboard</span>
            <span>Go to My {getRoleDisplayName(role)} Dashboard</span>
          </button>

          <button
            onClick={() => {
              logout('/login');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#dac2ae] text-[#544434] font-semibold text-xs hover:bg-[#f5f3ef] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">switch_account</span>
            <span>Sign In with Another Account</span>
          </button>

          <button
            onClick={() => onNavigate('/')}
            className="w-full py-2 text-xs text-[#877462] hover:text-[#1b1c1a] hover:underline cursor-pointer"
          >
            Return to Zooby Public Home
          </button>
        </div>
      </div>
    </div>
  );
};
