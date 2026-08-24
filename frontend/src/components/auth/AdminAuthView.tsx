import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ZoobyLogo } from '../common/ZoobyLogo';

interface AdminAuthViewProps {
  onNavigate: (path: string) => void;
}

export const AdminAuthView: React.FC<AdminAuthViewProps> = ({ onNavigate }) => {
  const { login, loginDemo, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Super Admin email and security key are required.');
      return;
    }
    try {
      await login(email, 'ADMIN');
      onNavigate('/admin/dashboard');
    } catch (err) {
      setErrorMessage('Admin authentication failed. Access denied.');
    }
  };

  const handleDemoAdminLogin = async () => {
    try {
      await loginDemo('ADMIN');
      onNavigate('/admin/dashboard');
    } catch (err) {
      setErrorMessage('Demo login failed.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#181410] text-[#fbf9f5] font-jakarta p-4 selection:bg-[#ffdcbc] selection:text-[#683c00]">
      {/* Security Top Bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2 text-xs font-semibold text-[#a8998a] hover:text-white transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Return to Zooby Home</span>
        </button>

        <div className="flex items-center gap-2 bg-[#2a221b] px-3 py-1 rounded-full border border-[#42362b] text-[11px] text-[#ffb86c]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Security Gateway v4.2 • Protected</span>
        </div>
      </div>

      {/* Admin Card */}
      <div className="w-full max-w-md bg-[#221c17] rounded-3xl p-8 border border-[#3e3227] shadow-2xl space-y-6">
        {/* Brand & Security Header */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <ZoobyLogo
            size="lg"
            variant="dark"
            subtitle="Platform Operations Console"
            badgeText="Super Admin"
            badgeColor="stone"
          />
          <p className="text-xs text-[#a8998a]">
            Restricted access for platform administrators and system operators.
          </p>
        </div>

        {/* 1-Click Admin Demo Login */}
        <div className="bg-[#2e251e] rounded-2xl p-4 border border-[#524132] flex flex-col items-center justify-between gap-3 text-center">
          <div>
            <span className="text-[11px] font-bold text-[#ffb86c] tracking-wider uppercase">
              Development &amp; Demo Access
            </span>
            <p className="text-xs text-[#d6c7b7] font-mono mt-0.5">
              admin@zooby.care (Super Admin)
            </p>
          </div>
          <button
            onClick={handleDemoAdminLogin}
            disabled={isLoading}
            className="w-full py-2 px-4 rounded-xl bg-[#895100] text-white font-bold text-xs hover:bg-[#a66300] transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">key</span>
            <span>1-Click Super Admin Sign In</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-[#93000a]/20 border border-[#ffdad6]/30 text-[#ffdad6] text-xs font-semibold rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-base">warning</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleAdminSignIn} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-[#d6c7b7] uppercase tracking-wider mb-1.5">
              Admin Username / Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@zooby.care"
              className="w-full px-4 py-3 bg-[#181410] border border-[#42362b] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ffb86c]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#d6c7b7] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 bg-[#181410] border border-[#42362b] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ffb86c]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8998a] hover:text-white p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#d6c7b7] uppercase tracking-wider mb-1.5">
              2FA Security PIN (Optional for Demo)
            </label>
            <input
              type="text"
              maxLength={6}
              value={securityPin}
              onChange={(e) => setSecurityPin(e.target.value)}
              placeholder="6-digit authenticator code"
              className="w-full px-4 py-3 bg-[#181410] border border-[#42362b] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ffb86c] tracking-widest font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#895100] text-white font-bold text-sm hover:bg-[#a66300] transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                <span>Authenticating Admin...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">shield</span>
                <span>Authorize &amp; Access Admin Console</span>
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-[#7a6b5e]">
          All administrative actions are logged and audited in compliance with Zooby Security Policy.
        </p>
      </div>
    </div>
  );
};
