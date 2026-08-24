import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { ZoobyLogo } from './common/ZoobyLogo';

interface SignInViewProps {
  onSignInSuccess: (user: UserProfile) => void;
  onNavigateTab?: (tab: string) => void;
  onNavigate?: (path: string) => void;
  onContinueAsGuest?: () => void;
}

export const SignInView: React.FC<SignInViewProps> = ({ onSignInSuccess, onNavigateTab, onNavigate, onContinueAsGuest }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [petName, setPetName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!emailOrPhone.trim()) {
      setErrorMessage('Please enter your email or mobile phone number.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const user: UserProfile = {
        id: 'usr-parent-sam',
        name: 'Sam Sharma',
        displayName: 'Sam Sharma',
        firstName: 'Sam',
        lastName: 'Sharma',
        email: emailOrPhone.includes('@') ? emailOrPhone : 'sam@zooby.care',
        phone: !emailOrPhone.includes('@') ? emailOrPhone : '+91 98220 11223',
        location: 'Gangapur Road, Nashik',
        role: 'PET_PARENT'
      };
      onSignInSuccess(user);
    }, 400);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!fullName.trim() || !emailOrPhone.trim() || !password) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const user: UserProfile = {
        id: 'usr-parent-sam',
        name: fullName.trim(),
        displayName: fullName.trim(),
        firstName: fullName.trim().split(' ')[0],
        lastName: fullName.trim().split(' ').slice(1).join(' '),
        email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone}@zooby.care`,
        phone: !emailOrPhone.includes('@') ? emailOrPhone : '+91 98220 11223',
        location: 'Gangapur Road, Nashik',
        role: 'PET_PARENT'
      };
      onSignInSuccess(user);
    }, 500);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!emailOrPhone.trim()) {
      setErrorMessage('Please enter your registered email or phone.');
      return;
    }

    setInfoMessage(`We've sent a 6-digit verification code to ${emailOrPhone}.`);
  };

  // Demo 1-click Quick Login
  const handleQuickDemoLogin = (role: UserRole = 'PET_PARENT') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user: UserProfile = {
        id: 'usr-parent-sam',
        name: 'Sam Sharma',
        displayName: 'Sam Sharma',
        firstName: 'Sam',
        lastName: 'Sharma',
        email: 'sam@zooby.care',
        phone: '+91 98220 11223',
        location: 'Gangapur Road, Nashik',
        role
      };
      onSignInSuccess(user);
    }, 400);
  };

  const handleGoogleSignIn = () => handleQuickDemoLogin('PET_PARENT');
  const handleDemoSignIn = () => handleQuickDemoLogin('PET_PARENT');
  const handleAdminSignIn = () => handleQuickDemoLogin('ADMIN');

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#fcfbfa] font-jakarta selection:bg-[#ffdcbc] selection:text-[#683c00]">
      {/* Left Column: Visual Brand Experience */}
      <div className="relative w-full lg:w-1/2 min-h-[360px] lg:min-h-screen bg-[#f3eee8] overflow-hidden flex flex-col justify-end">
        {/* Warm Pet & Owner Lifestyle Photo */}
        <img
          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1400"
          alt="Woman smiling and petting a golden retriever puppy on a couch"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Subtle Bottom Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent pointer-events-none" />

        {/* Floating Social Proof Card */}
        <div className="relative z-10 p-6 md:p-10 lg:p-12">
          <div className="max-w-md bg-white/85 backdrop-blur-md rounded-2xl p-5 md:p-6 border border-white/60 shadow-xl transition-all hover:bg-white/95">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xl">🧡</span>
              <h3 className="font-bold text-sm md:text-base text-[#1b1c1a]">
                Trusted by 10k+ Pet Parents
              </h3>
            </div>
            <p className="text-xs md:text-sm text-[#544434] leading-relaxed">
              Experience stress-free scheduling, health tracking, and professional care
              coordination all in one beautiful platform.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-14 lg:p-16">
        <div className="w-full max-w-[440px] space-y-7">
          {/* Logo */}
          <ZoobyLogo
            size="sm"
            subtitle="Pet Care Platform"
            clickable={true}
            onClick={() => onNavigate ? onNavigate('/') : null}
          />

          {/* Heading and Subtitle */}
          <div>
            <h1 className="font-quicksand font-bold text-3xl md:text-[34px] text-[#1b1c1a] tracking-tight leading-tight">
              {mode === 'signin' && 'Welcome back to Zooby'}
              {mode === 'signup' && 'Create your Zooby account'}
              {mode === 'forgot' && 'Reset your password'}
            </h1>
            <p className="text-sm md:text-[15px] text-[#705e4f] mt-2">
              {mode === 'signin' && "Your pet's care, health, and services — all in one place."}
              {mode === 'signup' && "Join thousands of pet parents managing pet wellness with love."}
              {mode === 'forgot' && "Enter your email or phone and we'll send a password recovery code."}
            </p>
          </div>

          {/* Error / Info alerts */}
          {errorMessage && (
            <div className="bg-[#ffdad6] text-[#93000a] text-xs font-semibold px-4 py-3 rounded-xl border border-[#ffb4ab] flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="bg-[#c2edca] text-[#1e4a2b] text-xs font-semibold px-4 py-3 rounded-xl border border-[#91d5a1] flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#544434] mb-1.5">
                  Email or Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#877462]">
                    <span className="material-symbols-outlined text-[19px]">mail</span>
                  </div>
                  <input
                    id="signin-email-input"
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="Enter your email or phone"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] placeholder-[#a69788] focus:outline-none focus:border-[#ff9f1c] focus:ring-2 focus:ring-[#ff9f1c]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#544434]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage('');
                      setInfoMessage('');
                    }}
                    className="text-xs font-semibold text-[#2b4c8a] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#877462]">
                    <span className="material-symbols-outlined text-[19px]">lock</span>
                  </div>
                  <input
                    id="signin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 bg-white border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] placeholder-[#a69788] focus:outline-none focus:border-[#ff9f1c] focus:ring-2 focus:ring-[#ff9f1c]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#877462] hover:text-[#1b1c1a] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Sign In Primary CTA */}
              <button
                id="signin-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-[#f59e0b] hover:bg-[#ea580c] active:scale-[0.99] text-white font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#544434] mb-1">
                  Your Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#877462]">
                    <span className="material-symbols-outlined text-[19px]">person</span>
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rohan Deshmukh"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] placeholder-[#a69788] focus:outline-none focus:border-[#ff9f1c] focus:ring-2 focus:ring-[#ff9f1c]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#544434] mb-1">
                  Pet's Name (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#877462]">
                    <span className="material-symbols-outlined text-[19px]">pets</span>
                  </div>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="e.g. Bruno or Luna"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] placeholder-[#a69788] focus:outline-none focus:border-[#ff9f1c] focus:ring-2 focus:ring-[#ff9f1c]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#544434] mb-1">
                  Email or Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#877462]">
                    <span className="material-symbols-outlined text-[19px]">mail</span>
                  </div>
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="Enter your email or phone"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] placeholder-[#a69788] focus:outline-none focus:border-[#ff9f1c] focus:ring-2 focus:ring-[#ff9f1c]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#544434] mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#877462]">
                    <span className="material-symbols-outlined text-[19px]">lock</span>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-11 py-2.5 bg-white border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] placeholder-[#a69788] focus:outline-none focus:border-[#ff9f1c] focus:ring-2 focus:ring-[#ff9f1c]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#877462]"
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3.5 px-6 rounded-xl bg-[#f59e0b] hover:bg-[#ea580c] text-white font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Forgot Password Mode */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#544434] mb-1.5">
                  Registered Email or Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#877462]">
                    <span className="material-symbols-outlined text-[19px]">mail</span>
                  </div>
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="Enter your registered email or phone"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] placeholder-[#a69788] focus:outline-none focus:border-[#ff9f1c] focus:ring-2 focus:ring-[#ff9f1c]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-[#f59e0b] hover:bg-[#ea580c] text-white font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Send Recovery Instructions</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage('');
                    setInfoMessage('');
                  }}
                  className="text-xs font-bold text-[#895100] hover:underline cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Social Auth & OR Divider (when in signin or signup mode) */}
          {mode !== 'forgot' && (
            <>
              {/* OR Divider */}
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-[#e2dcd4]" />
                <span className="absolute bg-[#fcfbfa] px-3 text-[11px] font-bold tracking-wider uppercase text-[#877462]">
                  OR
                </span>
              </div>

              {/* Continue with Google */}
              <button
                id="google-signin-btn"
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-3 px-4 rounded-xl bg-white border border-[#d8d1c7] hover:bg-[#f7f5f2] hover:border-[#bfb5a8] text-[#1b1c1a] font-semibold text-sm flex items-center justify-center gap-3 shadow-2xs transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Quick Demo Log In */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  className="w-full text-xs font-semibold py-2 px-3 rounded-lg bg-[#ffdcbc]/40 text-[#895100] hover:bg-[#ffdcbc]/70 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-[#ff9f1c]/30"
                >
                  <span className="material-symbols-outlined text-[15px]">pets</span>
                  <span>Demo: Rohan &amp; Bruno</span>
                </button>

                <button
                  type="button"
                  onClick={handleAdminSignIn}
                  className="w-full text-xs font-semibold py-2 px-3 rounded-lg bg-[#f4ebd9] text-[#895100] hover:bg-[#ebdcc4] transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-[#895100]/20 font-bold"
                >
                  <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
                  <span>Demo: Admin Portal</span>
                </button>
              </div>
            </>
          )}

          {/* Footer toggle between sign in / sign up */}
          <div className="text-center pt-2 text-xs md:text-sm text-[#544434]">
            {mode === 'signin' && (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage('');
                    setInfoMessage('');
                  }}
                  className="font-bold text-[#895100] underline hover:text-[#683c00] cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage('');
                    setInfoMessage('');
                  }}
                  className="font-bold text-[#895100] underline hover:text-[#683c00] cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}

            {onContinueAsGuest && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="text-xs text-[#877462] hover:text-[#1b1c1a] underline cursor-pointer"
                >
                  Continue browsing as guest →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
