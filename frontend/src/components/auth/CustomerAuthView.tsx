import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_USERS } from '../../data/authDemoData';

interface CustomerAuthViewProps {
  initialMode?: 'signin' | 'signup';
  onNavigate: (path: string) => void;
}

export const CustomerAuthView: React.FC<CustomerAuthViewProps> = ({
  initialMode = 'signin',
  onNavigate
}) => {
  const { login, signup, loginDemo, isLoading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [petName, setPetName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!emailOrPhone) {
      setErrorMessage('Please enter your email or phone.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }
    try {
      await login(emailOrPhone, 'PET_PARENT');
      onNavigate('/dashboard');
    } catch (err: any) {
      setErrorMessage('Login failed. Please verify your credentials.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!fullName || !emailOrPhone || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    try {
      await signup({
        name: fullName,
        email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone}@zooby.care`,
        phone: !emailOrPhone.includes('@') ? emailOrPhone : '+91 98201 23456',
        role: 'PET_PARENT'
      });
      onNavigate('/dashboard');
    } catch (err: any) {
      setErrorMessage('Registration failed. Please try again.');
    }
  };

  const handleDemoLogin = async () => {
    try {
      await loginDemo('PET_PARENT');
      onNavigate('/dashboard');
    } catch (err) {
      setErrorMessage('Demo login failed');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone) {
      setErrorMessage('Enter your email or phone to reset password.');
      return;
    }
    setInfoMessage(`Password reset link sent to ${emailOrPhone}`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#fcfbfa] font-jakarta selection:bg-[#ffdcbc] selection:text-[#683c00]">
      {/* Left Column: Pet Parent Lifestyle & Brand */}
      <div className="relative w-full lg:w-1/2 min-h-[320px] lg:min-h-screen bg-[#f3eee8] overflow-hidden flex flex-col justify-between p-8 md:p-12">
        <img
          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1400"
          alt="Happy pet parent with golden retriever"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20 pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 text-white hover:opacity-90 transition-opacity cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-full bg-[#895100] text-white flex items-center justify-center font-bold text-xl shadow-md">
              <span className="material-symbols-outlined text-[22px] filled-icon">pets</span>
            </div>
            <span className="font-quicksand font-bold text-2xl tracking-tight text-white">
              Zooby
            </span>
          </button>

          <button
            onClick={() => onNavigate('/')}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">home</span>
            <span>Back to Home</span>
          </button>
        </div>

        {/* Value Proposition */}
        <div className="relative z-10 max-w-md bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffdcbc] text-[#895100]">
              Pet Parent Portal
            </span>
            <div className="flex text-amber-500 text-xs">★★★★★</div>
          </div>
          <p className="text-sm font-medium text-[#2d2319] leading-snug">
            "Zooby makes managing Bruno's vet checkups, grooming appointments, and vaccination reminders effortless!"
          </p>
          <p className="text-xs text-[#877462] mt-2 font-semibold">
            — Rohan Deshmukh • Pet Parent to Bruno (Golden Retriever)
          </p>
        </div>
      </div>

      {/* Right Column: Authentication Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Header Title */}
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffdcbc] text-[#895100] mb-2">
              Customer Access
            </span>
            <h1 className="font-quicksand font-bold text-3xl text-[#1b1c1a]">
              {mode === 'signin'
                ? 'Welcome Back, Pet Parent'
                : mode === 'signup'
                ? 'Join Zooby Family'
                : 'Reset Your Password'}
            </h1>
            <p className="text-sm text-[#877462] mt-1">
              {mode === 'signin'
                ? 'Access your pet’s health vault, appointments, and care network.'
                : mode === 'signup'
                ? 'Create an account to start managing comprehensive pet wellness.'
                : 'Enter your registered details to recover account access.'}
            </p>
          </div>

          {/* Quick 1-Click Demo Login Banner */}
          <div className="bg-[#fff6ea] rounded-2xl p-4 border border-[#ffdcbc] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#895100] text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">pets</span>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#895100]">Demo Account: Pet Parent</p>
                <p className="text-[11px] text-[#877462] font-mono">aisha@zooby.care (Aisha &amp; Bruno)</p>
              </div>
            </div>
            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-[#895100] text-white font-bold text-xs hover:bg-[#683c00] transition-colors cursor-pointer shrink-0 shadow-xs flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">login</span>
              <span>1-Click Demo Login</span>
            </button>
          </div>

          {/* Toggle between Sign In / Sign Up */}
          {mode !== 'forgot' && (
            <div className="flex p-1 bg-[#efeeea] rounded-xl text-sm font-semibold text-[#877462]">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-white text-[#895100] font-bold shadow-xs'
                    : 'hover:text-[#1b1c1a]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white text-[#895100] font-bold shadow-xs'
                    : 'hover:text-[#1b1c1a]'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Error & Info Alerts */}
          {errorMessage && (
            <div className="p-3 bg-[#ffdad6] text-[#93000a] text-xs font-semibold rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3 bg-[#c2edca] text-[#294e35] text-xs font-semibold rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="e.g. aisha@zooby.care or phone"
                  className="w-full px-4 py-3 bg-white border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-[#544434] uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-[#895100] font-bold hover:underline cursor-pointer"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-white border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#877462] hover:text-[#1b1c1a] p-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#895100] text-white font-bold text-sm hover:bg-[#683c00] transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Pet Parent Dashboard</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rohan Deshmukh"
                  className="w-full px-4 py-3 bg-white border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                  Email or Mobile Number
                </label>
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="e.g. aisha@zooby.care"
                  className="w-full px-4 py-3 bg-white border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                  Pet's Name (Optional)
                </label>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="e.g. Bruno or Luna"
                  className="w-full px-4 py-3 bg-white border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                  Create Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 bg-white border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#895100] text-white font-bold text-sm hover:bg-[#683c00] transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account &amp; Get Started</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                  Registered Email or Phone
                </label>
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full px-4 py-3 bg-white border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#895100] text-white font-bold text-sm hover:bg-[#683c00] transition-colors shadow-md cursor-pointer"
              >
                Send Password Reset Link
              </button>

              <button
                type="button"
                onClick={() => setMode('signin')}
                className="w-full text-xs font-bold text-[#895100] hover:underline cursor-pointer text-center block pt-2"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* Dedicated Link for Service Providers */}
          <div className="pt-4 border-t border-[#efeeea] text-center space-y-2">
            <p className="text-xs text-[#877462]">
              Are you a veterinarian, groomer, walker, or pet sitter?
            </p>
            <button
              onClick={() => onNavigate('/provider/login')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#895100] hover:underline cursor-pointer bg-[#fff4e8] px-3 py-1.5 rounded-full border border-[#ffdcbc]"
            >
              <span className="material-symbols-outlined text-[16px]">medical_services</span>
              <span>Go to Provider &amp; Partner Portal →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
