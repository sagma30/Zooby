import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_USERS } from '../../data/authDemoData';
import { UserRole } from '../../types';

interface UnifiedSignInViewProps {
  onNavigate: (path: string) => void;
}

export const UnifiedSignInView: React.FC<UnifiedSignInViewProps> = ({ onNavigate }) => {
  const { login, loginWithGoogle, isLoading } = useAuth();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSentMessage, setForgotSentMessage] = useState('');

  const redirectByRole = (userRole: UserRole) => {
    switch (userRole) {
      case 'ADMIN':
        onNavigate('/admin/dashboard');
        break;
      case 'PROVIDER':
        onNavigate('/provider/dashboard');
        break;
      case 'RESCUE_PARTNER':
        onNavigate('/rescue/dashboard');
        break;
      case 'VAN_WORKER':
        onNavigate('/van/dashboard');
        break;
      case 'PET_PARENT':
      default:
        onNavigate('/dashboard');
        break;
    }
  };

  // Unified Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!emailOrPhone.trim()) {
      setErrorMessage('Please enter your email or phone number.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      const authenticatedUser = await login(emailOrPhone, password);
      redirectByRole(authenticatedUser.role);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please check your credentials.');
    }
  };

  // Google OAuth Handler
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    try {
      const authenticatedUser = await loginWithGoogle();
      redirectByRole(authenticatedUser.role);
    } catch (err: any) {
      setErrorMessage('Google sign in could not be completed.');
    }
  };

  // Pre-fill demo credentials helper for seamless role exploration
  const handlePrefillDemo = (roleKey: 'PET_PARENT' | 'PROVIDER' | 'RESCUE_PARTNER' | 'VAN_WORKER' | 'ADMIN') => {
    const demo = DEMO_USERS[roleKey];
    if (demo) {
      setEmailOrPhone(demo.user.email);
      setPassword(demo.passwordHint);
      setErrorMessage('');
    }
  };

  const handleSendForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      return;
    }
    setForgotSentMessage(`Password reset link sent to ${forgotEmail}. Please check your inbox.`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#fbf9f5] font-jakarta text-[#1b1c1a] selection:bg-[#ffdcbc] selection:text-[#683c00]">
      {/* Left Lifestyle & Brand Showcase */}
      <div className="relative w-full lg:w-1/2 min-h-[280px] lg:min-h-screen bg-[#2d241b] overflow-hidden flex flex-col justify-between p-8 md:p-12 text-white">
        <img
          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1400"
          alt="Happy pet parent with golden retriever"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/35 pointer-events-none" />

        {/* Brand Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 cursor-pointer text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#895100] text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">pets</span>
            </div>
            <div>
              <span className="font-quicksand font-bold text-2xl tracking-tight text-white">
                Zooby
              </span>
              <span className="text-[10px] text-amber-200 block">Unified Pet Care Ecosystem</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('/')}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">home</span>
            <span>Back to Home</span>
          </button>
        </div>

        {/* Testimonial card */}
        <div className="relative z-10 max-w-md bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-2xl text-[#1b1c1a] hidden sm:block">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffdcbc] text-[#895100]">
              Unified Ecosystem • Nashik
            </span>
            <div className="flex text-amber-500 text-xs">★★★★★</div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-[#2d2319] leading-snug">
            "One unified portal for pet parents, veterinary clinics, mobile grooming vans, and rescue adoption partners."
          </p>
          <p className="text-[11px] text-[#877462] mt-2 font-semibold">
            Connecting care seamlessly across Nashik neighborhoods.
          </p>
        </div>
      </div>

      {/* Right Column: Unified Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Header Title */}
          <div>
            <h1 className="font-quicksand font-bold text-3xl text-[#1b1c1a] tracking-tight flex items-center gap-2">
              <span>Welcome back to Zooby</span>
              <span className="text-2xl">👋</span>
            </h1>
            <p className="text-sm text-[#877462] mt-1.5">
              Enter your credentials below to access your Zooby account.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 bg-[#ffdad6] text-[#93000a] text-xs font-semibold rounded-xl flex items-center gap-2 border border-[#ffb4ab]">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Unified Sign In Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email / Phone Field */}
            <div>
              <label
                htmlFor="unified-email-input"
                className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5"
              >
                Email / Phone
              </label>
              <input
                id="unified-email-input"
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="name@example.com or mobile number"
                className="w-full px-4 py-3 bg-white border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] placeholder-[#a8998a] focus:outline-hidden focus:ring-2 focus:ring-[#895100] transition-all"
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="unified-password-input"
                  className="block text-xs font-bold text-[#544434] uppercase tracking-wider"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-xs font-bold text-[#895100] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="unified-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-white border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] placeholder-[#a8998a] focus:outline-hidden focus:ring-2 focus:ring-[#895100] transition-all pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#877462] hover:text-[#1b1c1a] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              id="unified-submit-signin-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#895100] text-white font-bold text-sm hover:bg-[#683c00] active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Social Logins */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e2d8ce]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#fbf9f5] px-3 font-bold text-[#877462]">or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 rounded-xl bg-white border border-[#dac2ae] hover:bg-[#f6f4ee] font-bold text-xs text-[#1b1c1a] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Don't have an account */}
          <div className="pt-2 text-center text-xs font-semibold text-[#877462]">
            Don't have an account yet?{' '}
            <button
              onClick={() => onNavigate('/signup')}
              className="font-bold text-[#895100] hover:underline cursor-pointer ml-1"
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo Pre-fill Bar for Easy Testing */}
          <div className="mt-6 pt-4 border-t border-[#efeeea] space-y-2">
            <p className="text-[11px] font-bold text-[#716153] uppercase tracking-wider text-center">
              Quick Demo Accounts (Nashik Ecosystem)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handlePrefillDemo('PET_PARENT')}
                className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-[#895100] rounded-lg font-bold border border-amber-200/70 transition-colors cursor-pointer text-left"
              >
                🐾 Pet Parent (Sam Sharma)
              </button>
              <button
                type="button"
                onClick={() => handlePrefillDemo('PROVIDER')}
                className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg font-bold border border-blue-200/70 transition-colors cursor-pointer text-left"
              >
                🩺 Vet Clinic (Dr. Ananya Mehta)
              </button>
              <button
                type="button"
                onClick={() => handlePrefillDemo('RESCUE_PARTNER')}
                className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold border border-emerald-200/70 transition-colors cursor-pointer text-left"
              >
                🐕 Rescue Org (Neha Patil)
              </button>
              <button
                type="button"
                onClick={() => handlePrefillDemo('VAN_WORKER')}
                className="px-2 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg font-bold border border-purple-200/70 transition-colors cursor-pointer text-left"
              >
                🚐 Van Unit ZMV-014 (Rahul Sharma)
              </button>
              <button
                type="button"
                onClick={() => handlePrefillDemo('ADMIN')}
                className="px-2 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-lg font-bold border border-stone-300 transition-colors cursor-pointer text-left"
              >
                🛡️ Admin (Priya Sharma)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-[#e6e2dd] animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-quicksand text-[#1b1c1a]">Reset Password</h3>
              <button
                onClick={() => {
                  setIsForgotPasswordOpen(false);
                  setForgotSentMessage('');
                }}
                className="text-[#716153] hover:text-[#1b1c1a] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {forgotSentMessage ? (
              <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200">
                {forgotSentMessage}
              </div>
            ) : (
              <form onSubmit={handleSendForgotPassword} className="space-y-3 text-xs">
                <p className="text-[#544434]">
                  Enter your registered email address and we'll send you instructions to reset your password.
                </p>
                <div>
                  <label className="block font-bold text-[#544434] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5] focus:outline-hidden focus:border-[#895100]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#895100] text-white font-bold hover:bg-[#683c00] transition-colors cursor-pointer"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
