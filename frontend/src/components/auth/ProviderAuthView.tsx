import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_USERS } from '../../data/authDemoData';
import { ServiceCategory } from '../../types';

interface ProviderAuthViewProps {
  onNavigate: (path: string) => void;
}

export const ProviderAuthView: React.FC<ProviderAuthViewProps> = ({ onNavigate }) => {
  const { login, signup, loginDemo, isLoading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('vet_consult');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please enter your provider email and password.');
      return;
    }
    try {
      await login(email, 'PROVIDER');
      onNavigate('/provider/dashboard');
    } catch (err) {
      setErrorMessage('Invalid provider credentials.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!businessName || !contactName || !email || !password) {
      setErrorMessage('Please complete all practice / business registration fields.');
      return;
    }
    try {
      await signup({
        name: contactName,
        email: email,
        phone: phone || '+91 98330 00000',
        businessName: businessName,
        role: 'PROVIDER',
        serviceCategory: serviceCategory
      });
      onNavigate('/provider/dashboard');
    } catch (err) {
      setErrorMessage('Registration failed. Please try again.');
    }
  };

  const handleDemoProviderLogin = async () => {
    try {
      await loginDemo('PROVIDER');
      onNavigate('/provider/dashboard');
    } catch (err) {
      setErrorMessage('Demo login failed.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f8f6f2] font-jakarta selection:bg-[#ffdcbc] selection:text-[#683c00]">
      {/* Left Column: Provider Partner Spotlight */}
      <div className="relative w-full lg:w-1/2 min-h-[340px] lg:min-h-screen bg-[#241e17] overflow-hidden flex flex-col justify-between p-8 md:p-12 text-white">
        <img
          src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=1400"
          alt="Veterinary doctor examining pet"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b150e] via-[#241e17]/80 to-transparent pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#ff9f1c] text-[#1b150e] flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px] filled-icon">medical_services</span>
            </div>
            <div>
              <span className="font-quicksand font-bold text-2xl tracking-tight text-white block">
                Zooby Pro
              </span>
              <span className="text-[10px] tracking-widest uppercase font-bold text-[#ff9f1c]">
                Provider Network
              </span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('/')}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Public Site</span>
          </button>
        </div>

        {/* Provider Proof Panel */}
        <div className="relative z-10 max-w-md bg-[#2d241b]/90 backdrop-blur-md rounded-3xl p-6 border border-[#524436] shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ff9f1c]/20 text-[#ff9f1c] border border-[#ff9f1c]/30">
              Verified Care Partner
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
              <span>★ 4.95 Rating</span>
            </div>
          </div>
          <h3 className="font-quicksand font-bold text-lg text-white">
            Grow Your Pet Care Practice with Zooby
          </h3>
          <p className="text-xs text-[#d6c7b7] leading-relaxed">
            Automate booking schedules, digitize patient health records, issue automated reminders, and receive guaranteed payouts.
          </p>
          <div className="pt-2 border-t border-[#463a2e] flex items-center gap-3 text-xs text-[#ebdcc4]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-[#ff9f1c]">verified</span>
              Direct Payouts
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-[#ff9f1c]">calendar_month</span>
              Smart Schedule
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Provider Sign In & Onboarding */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffeed9] text-[#895100] mb-2">
              Provider &amp; Clinic Portal
            </span>
            <h1 className="font-quicksand font-bold text-3xl text-[#1b1c1a]">
              {mode === 'signin' ? 'Provider Sign In' : 'Join as Care Partner'}
            </h1>
            <p className="text-sm text-[#877462] mt-1">
              {mode === 'signin'
                ? 'Sign in to manage appointments, client records, and service revenue.'
                : 'Register your clinic, salon, walking or pet sitting business.'}
            </p>
          </div>

          {/* 1-Click Demo Login Banner */}
          <div className="bg-[#fff6ea] rounded-2xl p-4 border border-[#ffdcbc] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#895100] text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">stethoscope</span>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#895100]">Demo Provider Account</p>
                <p className="text-[11px] text-[#877462] font-mono">dr.ananya@zooby.care (Dr. Ananya Mehta)</p>
              </div>
            </div>
            <button
              onClick={handleDemoProviderLogin}
              disabled={isLoading}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-[#895100] text-white font-bold text-xs hover:bg-[#683c00] transition-colors cursor-pointer shrink-0 shadow-xs flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">login</span>
              <span>1-Click Provider Demo</span>
            </button>
          </div>

          {/* Mode Switcher */}
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
              Provider Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#895100] font-bold shadow-xs'
                  : 'hover:text-[#1b1c1a]'
              }`}
            >
              Partner Registration
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-[#ffdad6] text-[#93000a] text-xs font-semibold rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                  Business / Practice Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. dr.ananya@zooby.care or clinic email"
                  className="w-full px-4 py-3 bg-white border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-[#544434] uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-xs text-[#877462]">Hint: ananya123</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your provider password"
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
                    <span>Authenticating Provider...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Provider Dashboard</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                  Business / Practice Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Paws & Claws Veterinary Wellness"
                  className="w-full px-4 py-3 bg-white border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                  Primary Service Category
                </label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
                  className="w-full px-4 py-3 bg-white border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100]"
                >
                  <option value="vet_consult">Veterinary Clinic &amp; Consultations</option>
                  <option value="grooming">Pet Grooming &amp; Spa Services</option>
                  <option value="walking">Professional Dog Walking</option>
                  <option value="sitting">Pet Sitting &amp; Boarding Care</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                    Lead Practitioner Name
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Dr. Aarav Mehta"
                    className="w-full px-3.5 py-3 bg-white border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98330 00000"
                    className="w-full px-3.5 py-3 bg-white border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                  Practice Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@practice.com"
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
                  placeholder="Minimum 6 characters"
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
                    <span>Creating Partner Account...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Partner Application</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Link back to Customer / Pet Parent Portal */}
          <div className="pt-4 border-t border-[#efeeea] text-center">
            <p className="text-xs text-[#877462] mb-1.5">
              Looking for pet care for your furry friend?
            </p>
            <button
              onClick={() => onNavigate('/login')}
              className="text-xs font-bold text-[#895100] hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <span>Go to Pet Parent Sign In →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
