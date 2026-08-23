import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CameraPhotoCaptureModal } from './common/CameraPhotoCaptureModal';

interface UserSettingsViewProps {
  onNavigateTab?: (tab: string) => void;
  onNavigate?: (path: string) => void;
}

export const UserSettingsView: React.FC<UserSettingsViewProps> = ({ onNavigateTab, onNavigate }) => {
  const { user, updateUserProfile } = useAuth();

  // Form states initialized with current user record
  const [name, setName] = useState(user?.name || 'Zooby Member');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98201 23456');
  const [location, setLocation] = useState(user?.location || 'Mumbai, MH');
  const [bio, setBio] = useState('Loving pet parent passionate about canine nutrition and positive reinforcement.');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(
    user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=240'
  );

  // Emergency & Preferences state
  const [emergencyContactName, setEmergencyContactName] = useState('Pooja Deshmukh (Spouse)');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98201 99887');
  const [vaccineReminders, setVaccineReminders] = useState(true);
  const [bookingSmsAlerts, setBookingSmsAlerts] = useState(true);
  const [marketingTips, setMarketingTips] = useState(false);

  // UI state
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState<'profile' | 'preferences' | 'security'>('profile');

  // File input ref for upload alternative
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state if auth user changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.location) setLocation(user.location);
      if (user.avatarUrl) setCurrentAvatarUrl(user.avatarUrl);
      if (user.businessName) setBusinessName(user.businessName);
    }
  }, [user]);

  // Handle saving photo captured from camera
  const handlePhotoCaptured = (newImageDataUrl: string) => {
    setCurrentAvatarUrl(newImageDataUrl);
    // Persist directly to user profile record
    updateUserProfile({ avatarUrl: newImageDataUrl });
    setSavedSuccessMessage('Profile photo captured with camera and saved to your account!');
    setTimeout(() => setSavedSuccessMessage(''), 4000);
  };

  // Handle fallback file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        if (result) {
          setCurrentAvatarUrl(result);
          updateUserProfile({ avatarUrl: result });
          setSavedSuccessMessage('New profile photo uploaded and saved!');
          setTimeout(() => setSavedSuccessMessage(''), 4000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Preset Avatar Selection
  const handleSelectPresetAvatar = (url: string) => {
    setCurrentAvatarUrl(url);
    updateUserProfile({ avatarUrl: url });
    setSavedSuccessMessage('Avatar updated!');
    setTimeout(() => setSavedSuccessMessage(''), 3000);
  };

  // Handle full profile form submission
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      avatarUrl: currentAvatarUrl,
      ...(user?.role === 'PROVIDER' ? { businessName: businessName.trim() } : {})
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSavedSuccessMessage('Account details and profile settings saved successfully.');
      setTimeout(() => setSavedSuccessMessage(''), 4000);
    }, 300);
  };

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=240',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=240',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=240',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=240',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=240'
  ];

  return (
    <div id="user-settings-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#efeeea] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#877462] mb-1">
            <button
              onClick={() => onNavigateTab ? onNavigateTab('dashboard') : (onNavigate ? onNavigate('/dashboard') : null)}
              className="hover:text-[#895100] transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">home</span>
              <span>Home</span>
            </button>
            <span>/</span>
            <span className="text-[#1b1c1a]">Account Settings</span>
          </div>
          <h1 className="font-quicksand font-bold text-2xl sm:text-3xl text-[#1b1c1a] tracking-tight">
            Profile &amp; Account Settings
          </h1>
          <p className="text-sm text-[#877462] mt-1">
            Manage your personal profile details, camera headshot, notifications, and pet parent account.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center bg-[#f4ebd9]/60 p-1 rounded-2xl border border-[#dac2ae]/40 self-start sm:self-auto">
          <button
            id="settings-tab-profile"
            onClick={() => setActiveSubSection('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubSection === 'profile'
                ? 'bg-white text-[#895100] shadow-2xs'
                : 'text-[#544434] hover:text-[#1b1c1a]'
            }`}
          >
            <span className="material-symbols-outlined text-base">person</span>
            <span>Profile</span>
          </button>
          <button
            id="settings-tab-preferences"
            onClick={() => setActiveSubSection('preferences')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubSection === 'preferences'
                ? 'bg-white text-[#895100] shadow-2xs'
                : 'text-[#544434] hover:text-[#1b1c1a]'
            }`}
          >
            <span className="material-symbols-outlined text-base">notifications</span>
            <span>Alerts</span>
          </button>
          <button
            id="settings-tab-security"
            onClick={() => setActiveSubSection('security')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubSection === 'security'
                ? 'bg-white text-[#895100] shadow-2xs'
                : 'text-[#544434] hover:text-[#1b1c1a]'
            }`}
          >
            <span className="material-symbols-outlined text-base">security</span>
            <span>Security</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {savedSuccessMessage && (
        <div
          id="settings-success-alert"
          className="p-4 bg-[#e8f5e9] border border-[#a5d6a7] text-[#1b5e20] rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-xl text-[#2e7d32]">check_circle</span>
            <span className="text-sm font-semibold">{savedSuccessMessage}</span>
          </div>
          <button
            onClick={() => setSavedSuccessMessage('')}
            className="text-[#2e7d32] hover:text-[#1b5e20] p-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* SECTION 1: PROFILE & PHOTO CAPTURE */}
      {activeSubSection === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Photo & Camera Feature Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#dac2ae]/60 shadow-xs space-y-6 text-center">
              <div>
                <h3 className="font-quicksand font-bold text-lg text-[#1b1c1a]">Profile Photo</h3>
                <p className="text-xs text-[#877462] mt-0.5">
                  Your headshot shown on appointments &amp; reviews
                </p>
              </div>

              {/* Avatar Frame with Active Camera Trigger */}
              <div className="relative inline-block mx-auto group">
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-[#ff9f1c] shadow-lg bg-[#f5f3ef] mx-auto">
                  <img
                    id="settings-user-avatar-img"
                    src={currentAvatarUrl}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Instant Camera Trigger overlay button */}
                <button
                  id="camera-photo-avatar-trigger-btn"
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-[#895100] text-white hover:bg-[#683c00] flex items-center justify-center shadow-md border-2 border-white transition-all cursor-pointer hover:scale-110"
                  title="Capture photo using camera"
                >
                  <span className="material-symbols-outlined text-xl">photo_camera</span>
                </button>
              </div>

              {/* User Identity Badges */}
              <div className="space-y-1">
                <h4 className="font-quicksand font-bold text-base text-[#1b1c1a]">{name}</h4>
                <div className="flex items-center justify-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffdcbc] text-[#895100]">
                    {user?.role === 'ADMIN'
                      ? 'Super Admin'
                      : user?.role === 'PROVIDER'
                      ? 'Care Partner'
                      : 'Pet Parent'}
                  </span>
                  <span className="text-xs text-[#877462]">• {location}</span>
                </div>
              </div>

              {/* Dedicated Camera & Upload Action Buttons */}
              <div className="space-y-2.5 pt-2 border-t border-[#efeeea]">
                {/* Main Camera Button */}
                <button
                  id="open-camera-capture-btn"
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="w-full py-3 px-4 rounded-xl bg-[#895100] hover:bg-[#683c00] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
                >
                  <span className="material-symbols-outlined text-lg">photo_camera</span>
                  <span>Capture with Camera</span>
                </button>

                {/* Secondary Device File Upload */}
                <button
                  id="upload-photo-file-btn"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#dac2ae] text-[#544434] hover:bg-[#f5f3ef] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">upload_file</span>
                  <span>Upload Image File</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Quick Preset Avatars Picker */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-[#877462] mb-2 uppercase tracking-wider">
                  Or pick a preset
                </p>
                <div className="flex items-center justify-center gap-2">
                  {presetAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPresetAvatar(url)}
                      className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer hover:scale-110 ${
                        currentAvatarUrl === url ? 'border-[#895100] ring-2 ring-[#895100]/30' : 'border-[#dac2ae]/60'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Account Snapshot Card */}
            <div className="bg-[#fffaf4] rounded-3xl p-5 border border-[#ffdcbc]/60 text-xs text-[#544434] space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-[#895100]">
                <span className="material-symbols-outlined text-base">verified_user</span>
                <span>Account Status: Active</span>
              </div>
              <p className="text-[11px] text-[#877462] leading-relaxed">
                Registered account ID: <code className="text-[#1b1c1a] font-mono">{user?.id || 'usr-demo'}</code>
              </p>
              <p className="text-[11px] text-[#877462]">
                Member since: <span className="font-semibold text-[#1b1c1a]">{user?.joinedDate || 'September 2024'}</span>
              </p>
            </div>
          </div>

          {/* Right Column: Personal & Account Details Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dac2ae]/60 shadow-xs space-y-6">
              <div>
                <h3 className="font-quicksand font-bold text-xl text-[#1b1c1a]">Personal Details</h3>
                <p className="text-xs text-[#877462] mt-0.5">
                  Update your contact info and personal preferences.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="user-name-input" className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="user-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#fbf9f5] border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100] transition-all"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="user-email-input" className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="user-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#fbf9f5] border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100] transition-all"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="user-phone-input" className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                    Mobile Phone
                  </label>
                  <input
                    id="user-phone-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98201 23456"
                    className="w-full px-4 py-3 bg-[#fbf9f5] border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100] transition-all"
                  />
                </div>

                {/* Primary Location */}
                <div>
                  <label htmlFor="user-location-input" className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                    City / Neighborhood
                  </label>
                  <input
                    id="user-location-input"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Bandra West, Mumbai"
                    className="w-full px-4 py-3 bg-[#fbf9f5] border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100] transition-all"
                  />
                </div>
              </div>

              {/* Provider specific field */}
              {user?.role === 'PROVIDER' && (
                <div>
                  <label htmlFor="user-business-name" className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                    Clinic / Service Brand Name
                  </label>
                  <input
                    id="user-business-name"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Bandra Pet Wellness Clinic"
                    className="w-full px-4 py-3 bg-[#fbf9f5] border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100]"
                  />
                </div>
              )}

              {/* Bio / About */}
              <div>
                <label htmlFor="user-bio-input" className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                  About You / Pet Parent Notes
                </label>
                <textarea
                  id="user-bio-input"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 bg-[#fbf9f5] border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100] transition-all resize-none"
                  placeholder="Share a short bio or notes for sitters, groomers, and vets..."
                />
              </div>

              {/* Emergency Contact Information */}
              <div className="pt-4 border-t border-[#efeeea] space-y-4">
                <div>
                  <h4 className="font-quicksand font-bold text-base text-[#1b1c1a]">Emergency Contact</h4>
                  <p className="text-xs text-[#877462]">
                    Contact person in case of pet health or booking emergencies.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1">
                      Contact Name &amp; Relationship
                    </label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1">
                      Emergency Phone
                    </label>
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#efeeea] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (user) {
                      setName(user.name);
                      setEmail(user.email);
                      if (user.phone) setPhone(user.phone);
                      if (user.location) setLocation(user.location);
                      if (user.avatarUrl) setCurrentAvatarUrl(user.avatarUrl);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl border border-[#dac2ae] text-[#544434] hover:bg-[#f5f3ef] font-semibold text-xs cursor-pointer transition-colors"
                >
                  Reset
                </button>

                <button
                  id="save-settings-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-[#895100] hover:bg-[#683c00] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-101"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">save</span>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 2: NOTIFICATIONS & REMINDERS */}
      {activeSubSection === 'preferences' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dac2ae]/60 shadow-xs space-y-6 max-w-3xl">
          <div>
            <h3 className="font-quicksand font-bold text-xl text-[#1b1c1a]">Notification &amp; Reminder Preferences</h3>
            <p className="text-xs text-[#877462] mt-0.5">
              Choose how and when Zooby alerts you about upcoming vaccines, meds, and bookings.
            </p>
          </div>

          <div className="space-y-4 divide-y divide-[#efeeea]">
            <div className="pt-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-[#1b1c1a]">Vaccination &amp; Medication Reminders</div>
                <div className="text-xs text-[#877462]">Receive alerts 3 days before booster shots or scheduled deworming</div>
              </div>
              <input
                type="checkbox"
                checked={vaccineReminders}
                onChange={(e) => setVaccineReminders(e.target.checked)}
                className="w-5 h-5 accent-[#895100] cursor-pointer rounded"
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-[#1b1c1a]">Booking Status &amp; Doctor Chat Alerts</div>
                <div className="text-xs text-[#877462]">Instant updates when a vet or groomer confirms your appointment</div>
              </div>
              <input
                type="checkbox"
                checked={bookingSmsAlerts}
                onChange={(e) => setBookingSmsAlerts(e.target.checked)}
                className="w-5 h-5 accent-[#895100] cursor-pointer rounded"
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-[#1b1c1a]">Weekly Pet Wellness &amp; Nutrition Digest</div>
                <div className="text-xs text-[#877462]">Curated breed care guides, seasonal tips, and local pet events</div>
              </div>
              <input
                type="checkbox"
                checked={marketingTips}
                onChange={(e) => setMarketingTips(e.target.checked)}
                className="w-5 h-5 accent-[#895100] cursor-pointer rounded"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#efeeea] flex justify-end">
            <button
              type="button"
              onClick={() => {
                setSavedSuccessMessage('Alert preferences saved.');
                setTimeout(() => setSavedSuccessMessage(''), 3000);
              }}
              className="px-6 py-2.5 rounded-xl bg-[#895100] text-white font-bold text-xs hover:bg-[#683c00] transition-colors cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* SECTION 3: SECURITY & SESSION */}
      {activeSubSection === 'security' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dac2ae]/60 shadow-xs space-y-6 max-w-3xl">
          <div>
            <h3 className="font-quicksand font-bold text-xl text-[#1b1c1a]">Account Security</h3>
            <p className="text-xs text-[#877462] mt-0.5">
              Manage your password, login credentials, and active session tokens.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#fbf9f5] border border-[#dac2ae] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-[#1b1c1a]">Password</div>
                <div className="text-xs text-[#877462]">Last updated 2 months ago</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  alert(`Password reset link sent to ${email}`);
                }}
                className="px-4 py-2 rounded-xl bg-white border border-[#dac2ae] text-[#544434] hover:bg-[#f5f3ef] font-bold text-xs cursor-pointer self-start sm:self-auto"
              >
                Change Password
              </button>
            </div>

            <div className="p-4 bg-[#fbf9f5] border border-[#dac2ae] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-[#1b1c1a]">Two-Factor Verification</div>
                <div className="text-xs text-[#877462]">SMS OTP verification on phone: {phone}</div>
              </div>
              <span className="px-3 py-1 bg-[#c2edca] text-[#294e35] text-xs font-bold rounded-full self-start sm:self-auto">
                Enabled
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Camera Photo Capture Modal */}
      <CameraPhotoCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onPhotoCaptured={handlePhotoCaptured}
        currentPhotoUrl={currentAvatarUrl}
        userName={name}
      />
    </div>
  );
};
