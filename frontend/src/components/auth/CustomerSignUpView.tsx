import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ZoobyLogo } from '../common/ZoobyLogo';

interface CustomerSignUpViewProps {
  onNavigate: (path: string) => void;
}

export const CustomerSignUpView: React.FC<CustomerSignUpViewProps> = ({ onNavigate }) => {
  const { signup, loginWithGoogle, isLoading } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('PET_PARENT');
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [petName, setPetName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!emailOrPhone.trim()) {
      setErrorMessage('Please enter your email or phone number.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    try {
      const email = emailOrPhone.includes('@') ? emailOrPhone.trim() : `${emailOrPhone.trim()}@zooby.care`;
      const phone = !emailOrPhone.includes('@') ? emailOrPhone.trim() : '+91 98220 11223';

      const newUser = await signup({
        name: fullName.trim(),
        email,
        phone,
        role: selectedRole,
        businessName: businessName || (selectedRole === 'PROVIDER' ? `${fullName}'s Clinic` : selectedRole === 'RESCUE_PARTNER' ? `${fullName} Animal Rescue` : undefined)
      });

      if (newUser.role === 'ADMIN') {
        onNavigate('/admin/dashboard');
      } else if (newUser.role === 'PROVIDER') {
        onNavigate('/provider/dashboard');
      } else if (newUser.role === 'RESCUE_PARTNER') {
        onNavigate('/rescue/dashboard');
      } else if (newUser.role === 'VAN_WORKER') {
        onNavigate('/van/dashboard');
      } else {
        onNavigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration failed. Please try again.');
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const user = await loginWithGoogle();
      if (user.role === 'ADMIN') {
        onNavigate('/admin/dashboard');
      } else if (user.role === 'PROVIDER') {
        onNavigate('/provider/dashboard');
      } else if (user.role === 'RESCUE_PARTNER') {
        onNavigate('/rescue/dashboard');
      } else if (user.role === 'VAN_WORKER') {
        onNavigate('/van/dashboard');
      } else {
        onNavigate('/dashboard');
      }
    } catch {
      setErrorMessage('Google sign up could not be completed.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#fbf9f5] font-jakarta text-[#1b1c1a] selection:bg-[#ffdcbc] selection:text-[#683c00]">
      {/* Left Column: Welcome image */}
      <div className="relative w-full lg:w-1/2 min-h-[280px] lg:min-h-screen bg-[#2d241b] overflow-hidden flex flex-col justify-between p-8 md:p-12 text-white">
        <img
          src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=1400"
          alt="Happy puppy"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/35 pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <ZoobyLogo
            size="md"
            variant="dark"
            subtitle="Pet Care Platform • Nashik"
            clickable={true}
            onClick={() => onNavigate('/')}
          />

          <button
            onClick={() => onNavigate('/')}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">home</span>
            <span>Back to Home</span>
          </button>
        </div>

        {/* Value Prop */}
        <div className="relative z-10 max-w-md bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-2xl text-[#1b1c1a] hidden sm:block">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffdcbc] text-[#895100]">
              Unified Ecosystem Membership
            </span>
            <div className="flex text-amber-500 text-xs">★★★★★</div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-[#2d2319] leading-snug">
            "Join hundreds of Nashik pet parents and certified professionals on the city's integrated pet care network."
          </p>
          <p className="text-[11px] text-[#877462] mt-2 font-semibold">
            Doorstep mobile van • Certified vet clinics • Ethical rescue shelters
          </p>
        </div>
      </div>

      {/* Right Column: Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-5">
          <div>
            <h1 className="font-quicksand font-bold text-3xl text-[#1b1c1a] tracking-tight">
              Create your Zooby Account
            </h1>
            <p className="text-xs sm:text-sm text-[#877462] mt-1">
              Select your role to get started with the right experience.
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-[#544434] uppercase tracking-wider">
              I am registering as:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              {[
                { role: 'PET_PARENT' as UserRole, label: 'Pet Parent', icon: 'pets' },
                { role: 'PROVIDER' as UserRole, label: 'Clinic / Care Pro', icon: 'medical_services' },
                { role: 'RESCUE_PARTNER' as UserRole, label: 'Rescue / Shelter', icon: 'volunteer_activism' },
                { role: 'VAN_WORKER' as UserRole, label: 'Mobile Van Tech', icon: 'local_shipping' }
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => setSelectedRole(item.role)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer text-left ${
                    selectedRole === item.role
                      ? 'bg-[#895100] text-white border-[#895100] shadow-xs'
                      : 'bg-white text-[#544434] border-[#dac2ae] hover:bg-[#f6f4ee]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-[#ffdad6] text-[#93000a] text-xs font-semibold rounded-xl flex items-center gap-2 border border-[#ffb4ab]">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-[#544434] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 bg-white border border-[#dac2ae] rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#895100]"
              />
            </div>

            {(selectedRole === 'PROVIDER' || selectedRole === 'RESCUE_PARTNER') && (
              <div>
                <label className="block font-bold text-[#544434] mb-1">
                  {selectedRole === 'PROVIDER' ? 'Clinic / Business Name' : 'Organization / Shelter Name'}
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Nashik Animal Care Clinic"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#dac2ae] rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#895100]"
                />
              </div>
            )}

            {selectedRole === 'PET_PARENT' && (
              <div>
                <label className="block font-bold text-[#544434] mb-1">Pet's Name (Optional)</label>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="e.g. Bruno or Simba"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#dac2ae] rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#895100]"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-[#544434] mb-1">Email or Mobile Number</label>
              <input
                type="text"
                required
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="name@example.com or +91 98220 11223"
                className="w-full px-3.5 py-2.5 bg-white border border-[#dac2ae] rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#895100]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#544434] mb-1">Create Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#dac2ae] rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#895100] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#877462] hover:text-[#1b1c1a]"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#895100] text-white font-bold text-xs hover:bg-[#683c00] active:scale-[0.99] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Create Zooby Account</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs font-semibold text-[#877462]">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('/signin')}
              className="font-bold text-[#895100] hover:underline cursor-pointer ml-1"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
