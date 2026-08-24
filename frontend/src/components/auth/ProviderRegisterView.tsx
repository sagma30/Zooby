import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ServiceCategory } from '../../types';
import { ZoobyLogo } from '../common/ZoobyLogo';

interface ProviderRegisterViewProps {
  onNavigate: (path: string) => void;
}

export const ProviderRegisterView: React.FC<ProviderRegisterViewProps> = ({ onNavigate }) => {
  const { signup, isLoading } = useAuth();

  const [providerName, setProviderName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('vet_consult');
  const [city, setCity] = useState('Mumbai');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!providerName.trim() || !businessName.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try {
      await signup({
        name: providerName.trim(),
        email: email.trim(),
        phone: phone.trim() || '+91 98330 44556',
        role: 'PROVIDER',
        businessName: businessName.trim(),
        serviceCategory: serviceCategory
      });
      onNavigate('/provider/dashboard');
    } catch (err: any) {
      setErrorMessage('Provider registration could not be completed.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#fbf9f5] font-jakarta text-[#1b1c1a]">
      {/* Left Banner */}
      <div className="relative w-full lg:w-1/2 min-h-[300px] lg:min-h-screen bg-[#2d241b] overflow-hidden flex flex-col justify-between p-8 md:p-12 text-white">
        <img
          src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=1400"
          alt="Veterinary team"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <ZoobyLogo
            size="md"
            variant="dark"
            subtitle="Partner Network Registration"
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

        <div className="relative z-10 max-w-md bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-2xl text-[#1b1c1a]">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffdcbc] text-[#895100] mb-2 inline-block">
            Care Provider Network
          </span>
          <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a] mt-1">
            Grow Your Pet Care Practice
          </h3>
          <p className="text-xs text-[#544434] mt-1.5 leading-relaxed">
            Gain verified status, accept bookings, manage medical records, and receive direct digital payments with zero hassle.
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="font-quicksand font-bold text-3xl text-[#1b1c1a] tracking-tight">
              Join as a Care Partner
            </h1>
            <p className="text-sm text-[#877462] mt-1.5">
              Register your veterinary clinic, grooming salon, sitting, or walking service.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-[#ffdad6] text-[#93000a] text-xs font-semibold rounded-xl flex items-center gap-2 border border-[#ffb4ab]">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1">
                Your Full Name &amp; Title
              </label>
              <input
                type="text"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="e.g. Dr. Aarav Mehta / Rahul Sen"
                className="w-full px-4 py-2.5 bg-white border border-[#dac2ae] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#895100]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1">
                Clinic / Service Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Paws & Claws Veterinary Wellness Clinic"
                className="w-full px-4 py-2.5 bg-white border border-[#dac2ae] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#895100]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1">
                  Primary Service
                </label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
                  className="w-full px-3 py-2.5 bg-white border border-[#dac2ae] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#895100]"
                >
                  <option value="vet_consult">Veterinary Care</option>
                  <option value="grooming">Grooming &amp; Spa</option>
                  <option value="walking">Dog Walking</option>
                  <option value="sitting">Pet Sitting &amp; Boarding</option>
                  <option value="training">Training</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1">
                  Operating City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#dac2ae] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#895100]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1">
                  Business Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@clinic.com"
                  className="w-full px-3 py-2.5 bg-white border border-[#dac2ae] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#895100]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98330 44556"
                  className="w-full px-3 py-2.5 bg-white border border-[#dac2ae] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#895100]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1">
                Create Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-2.5 bg-white border border-[#dac2ae] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#895100]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#895100] text-white font-bold text-sm hover:bg-[#683c00] transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  <span>Registering Provider Profile...</span>
                </>
              ) : (
                <>
                  <span>Submit Application &amp; Access Portal</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-[#877462]">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="font-bold text-[#895100] hover:underline cursor-pointer"
              >
                Sign In to your account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
