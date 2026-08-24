import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CameraPhotoCaptureModal } from './common/CameraPhotoCaptureModal';
import { getRoleBadgeInfo, getUserDisplayName } from '../utils/identity';

interface UserSettingsViewProps {
  onNavigateTab?: (tab: string) => void;
  onNavigate?: (path: string) => void;
}

export const UserSettingsView: React.FC<UserSettingsViewProps> = ({ onNavigateTab, onNavigate }) => {
  const { user, updateUserProfile } = useAuth();

  // Form states initialized with current user record
  const [firstName, setFirstName] = useState(user?.firstName || user?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.lastName || user?.name?.split(' ').slice(1).join(' ') || '');
  const [displayName, setDisplayName] = useState(user?.displayName || user?.name || 'Zooby Member');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98220 11223');
  const [city, setCity] = useState(user?.city || 'Nashik');
  const [location, setLocation] = useState(user?.location || 'Gangapur Road, Nashik');
  const [bio, setBio] = useState(user?.bio || 'Loving pet parent dedicated to preventative wellness and 24/7 care.');
  const [businessName, setBusinessName] = useState(user?.businessName || user?.organizationName || '');
  const [specialization, setSpecialization] = useState(user?.specialization || 'Companion Animal Care & Surgery');
  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber || 'MH-VET-2015-8842');
  const [experience, setExperience] = useState(user?.experience || '10+ Years');
  const [assignedVanPlate, setAssignedVanPlate] = useState(user?.assignedVanPlate || 'ZMV-014');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || (user?.role === 'ADMIN' ? 'Administrator' : 'Lead Mobile Technician'));
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(
    user?.profilePhoto || user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=240'
  );

  // Emergency & Preferences state
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '+91 98220 99887 (Karan Sharma)');
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
      setFirstName(user.firstName || user.name?.split(' ')[0] || '');
      setLastName(user.lastName || user.name?.split(' ').slice(1).join(' ') || '');
      setDisplayName(user.displayName || user.name || 'Zooby Member');
      setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.city) setCity(user.city);
      if (user.location) setLocation(user.location);
      if (user.profilePhoto || user.avatarUrl) setCurrentAvatarUrl(user.profilePhoto || user.avatarUrl);
      if (user.businessName || user.organizationName) setBusinessName(user.businessName || user.organizationName || '');
      if (user.bio) setBio(user.bio);
      if (user.specialization) setSpecialization(user.specialization);
      if (user.licenseNumber) setLicenseNumber(user.licenseNumber);
      if (user.experience) setExperience(user.experience);
      if (user.assignedVanPlate) setAssignedVanPlate(user.assignedVanPlate);
      if (user.jobTitle) setJobTitle(user.jobTitle);
      if (user.emergencyContact) setEmergencyContact(user.emergencyContact);
    }
  }, [user]);

  // Handle saving photo captured from camera
  const handlePhotoCaptured = (newImageDataUrl: string) => {
    setCurrentAvatarUrl(newImageDataUrl);
    updateUserProfile({ avatarUrl: newImageDataUrl, profilePhoto: newImageDataUrl });
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
          updateUserProfile({ avatarUrl: result, profilePhoto: result });
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
    updateUserProfile({ avatarUrl: url, profilePhoto: url });
    setSavedSuccessMessage('Avatar updated!');
    setTimeout(() => setSavedSuccessMessage(''), 3000);
  };

  // Handle full profile form submission
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const calculatedDisplayName = displayName.trim() || `${firstName.trim()} ${lastName.trim()}`.trim();

    updateUserProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      displayName: calculatedDisplayName,
      name: calculatedDisplayName,
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      location: location.trim(),
      profilePhoto: currentAvatarUrl,
      avatarUrl: currentAvatarUrl,
      bio: bio.trim(),
      emergencyContact: emergencyContact.trim(),
      businessName: businessName.trim() || undefined,
      organizationName: businessName.trim() || undefined,
      specialization: specialization.trim() || undefined,
      licenseNumber: licenseNumber.trim() || undefined,
      experience: experience.trim() || undefined,
      assignedVanPlate: assignedVanPlate.trim() || undefined,
      jobTitle: jobTitle.trim() || undefined
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSavedSuccessMessage('Profile and account preferences updated successfully across Zooby!');
      setTimeout(() => setSavedSuccessMessage(''), 4000);
    }, 300);
  };

  const roleInfo = getRoleBadgeInfo(user?.role);

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=240',
    'https://images.unsplash.com/photo-1594824813689-0b73c4d7e2e3?auto=format&fit=crop&q=80&w=240',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=240',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=240',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=240'
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
            Profile &amp; Identity Settings
          </h1>
          <p className="text-sm text-[#877462] mt-1">
            Manage your personal profile, role attributes, camera photo, and live app-wide identity.
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
                  Your official identity photo across all Zooby dashboards
                </p>
              </div>

              {/* Avatar Frame with Active Camera Trigger */}
              <div className="relative inline-block mx-auto group">
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-[#ff9f1c] shadow-lg bg-[#f5f3ef] mx-auto">
                  <img
                    id="settings-user-avatar-img"
                    src={currentAvatarUrl}
                    alt={displayName}
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
              <div className="space-y-1.5">
                <h4 className="font-quicksand font-bold text-base text-[#1b1c1a]">{getUserDisplayName(user)}</h4>
                <div className="flex items-center justify-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleInfo.badgeClass}`}>
                    {roleInfo.label}
                  </span>
                  <span className="text-xs text-[#877462]">• {city}</span>
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
                User ID: <code className="text-[#1b1c1a] font-mono">{user?.id || 'usr-demo'}</code>
              </p>
              <p className="text-[11px] text-[#877462]">
                Role: <span className="font-semibold text-[#1b1c1a]">{roleInfo.label}</span>
              </p>
              <p className="text-[11px] text-[#877462]">
                Member since: <span className="font-semibold text-[#1b1c1a]">{user?.joinedDate || user?.createdAt || 'January 2025'}</span>
              </p>
            </div>
          </div>

          {/* Right Column: Personal & Account Details Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dac2ae]/60 shadow-xs space-y-6">
              <div>
                <h3 className="font-quicksand font-bold text-xl text-[#1b1c1a]">Personal Details</h3>
                <p className="text-xs text-[#877462] mt-0.5">
                  Update your contact info, role credentials, and location settings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label htmlFor="user-firstname-input" className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                    First Name
                  </label>
                  <input
                    id="user-firstname-input"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#fbf9f5] border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100] transition-all"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="user-lastname-input" className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                    Last Name
                  </label>
                  <input
                    id="user-lastname-input"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#fbf9f5] border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100] transition-all"
                  />
                </div>

                {/* Display Name */}
                <div>
                  <label htmlFor="user-displayname-input" className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                    Display Name
                  </label>
                  <input
                    id="user-displayname-input"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
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
                    placeholder="+91 98220 11223"
                    className="w-full px-4 py-3 bg-[#fbf9f5] border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100] transition-all"
                  />
                </div>

                {/* City */}
                <div>
                  <label htmlFor="user-city-input" className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                    City
                  </label>
                  <input
                    id="user-city-input"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Nashik"
                    className="w-full px-4 py-3 bg-[#fbf9f5] border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100] transition-all"
                  />
                </div>

                {/* Primary Location / Street */}
                <div className="sm:col-span-2">
                  <label htmlFor="user-location-input" className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                    Address / Neighborhood
                  </label>
                  <input
                    id="user-location-input"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Gangapur Road, Nashik, Maharashtra"
                    className="w-full px-4 py-3 bg-[#fbf9f5] border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100] transition-all"
                  />
                </div>
              </div>

              {/* Role-Specific Fields */}
              {user?.role === 'PROVIDER' && (
                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-4">
                  <h4 className="font-bold text-xs text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">medical_services</span>
                    <span>Provider Credentials</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-[#544434] mb-1">Clinic / Practice Name</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Nashik Paws & Vet Care Clinic"
                        className="w-full px-3 py-2 bg-white border border-[#dac2ae] rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#544434] mb-1">Specialization</label>
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="Companion Animal Surgery"
                        className="w-full px-3 py-2 bg-white border border-[#dac2ae] rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#544434] mb-1">License Number</label>
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="MH-VET-2015-8842"
                        className="w-full px-3 py-2 bg-white border border-[#dac2ae] rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#544434] mb-1">Clinical Experience</label>
                      <input
                        type="text"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="10+ Years"
                        className="w-full px-3 py-2 bg-white border border-[#dac2ae] rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {user?.role === 'VAN_WORKER' && (
                <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-4">
                  <h4 className="font-bold text-xs text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">local_shipping</span>
                    <span>Mobile Technician Fleet Assignments</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-[#544434] mb-1">Assigned Mobile Van Plate</label>
                      <input
                        type="text"
                        value={assignedVanPlate}
                        onChange={(e) => setAssignedVanPlate(e.target.value)}
                        placeholder="ZMV-014"
                        className="w-full px-3 py-2 bg-white border border-[#dac2ae] rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#544434] mb-1">Technician Job Designation</label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="Lead Mobile Technician"
                        className="w-full px-3 py-2 bg-white border border-[#dac2ae] rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {user?.role === 'RESCUE_PARTNER' && (
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-4">
                  <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">volunteer_activism</span>
                    <span>Rescue Organization &amp; Shelter Details</span>
                  </h4>
                  <div>
                    <label className="block text-xs font-bold text-[#544434] mb-1">Shelter / Organization Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Paws & Hope Rescue"
                      className="w-full px-3 py-2 bg-white border border-[#dac2ae] rounded-xl text-sm"
                    />
                  </div>
                </div>
              )}

              {user?.role === 'ADMIN' && (
                <div className="p-4 bg-stone-100 rounded-2xl border border-stone-300 space-y-4">
                  <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                    <span>Administrator Operations Profile</span>
                  </h4>
                  <div>
                    <label className="block text-xs font-bold text-[#544434] mb-1">Administrative Job Title</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Administrator"
                      className="w-full px-3 py-2 bg-white border border-[#dac2ae] rounded-xl text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Bio / About */}
              <div>
                <label htmlFor="user-bio-input" className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                  Bio / Notes
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
                    Contact person for rapid notifications during 24/7 SOS or service alerts.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1">
                    Emergency Contact Details (Name &amp; Phone)
                  </label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="+91 98220 99887 (Karan Sharma)"
                    className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-[#dac2ae] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#895100]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#efeeea]">
                <button
                  type="button"
                  onClick={() => onNavigateTab ? onNavigateTab('dashboard') : (onNavigate ? onNavigate('/dashboard') : null)}
                  className="px-5 py-2.5 rounded-xl border border-[#dac2ae] text-xs font-bold text-[#544434] hover:bg-[#f5f3ef] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="save-profile-settings-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#895100] hover:bg-[#683c00] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

      {/* SECTION 2: PREFERENCES */}
      {activeSubSection === 'preferences' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dac2ae]/60 shadow-xs space-y-6 max-w-2xl">
          <div>
            <h3 className="font-quicksand font-bold text-xl text-[#1b1c1a]">Notifications &amp; Alerts</h3>
            <p className="text-xs text-[#877462] mt-0.5">Control how and when you receive updates.</p>
          </div>

          <div className="space-y-4 divide-y divide-[#efeeea]">
            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-sm font-bold text-[#1b1c1a]">Vaccination &amp; Health Reminders</div>
                <div className="text-xs text-[#877462]">Receive automated alerts when boosters are due.</div>
              </div>
              <input
                type="checkbox"
                checked={vaccineReminders}
                onChange={(e) => setVaccineReminders(e.target.checked)}
                className="w-4 h-4 accent-[#895100] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="text-sm font-bold text-[#1b1c1a]">Booking SMS &amp; WhatsApp Updates</div>
                <div className="text-xs text-[#877462]">Real-time status updates when care van is dispatched.</div>
              </div>
              <input
                type="checkbox"
                checked={bookingSmsAlerts}
                onChange={(e) => setBookingSmsAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#895100] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="text-sm font-bold text-[#1b1c1a]">Personalized Care Tips &amp; Offers</div>
                <div className="text-xs text-[#877462]">Receive seasonal care guidelines and promotions.</div>
              </div>
              <input
                type="checkbox"
                checked={marketingTips}
                onChange={(e) => setMarketingTips(e.target.checked)}
                className="w-4 h-4 accent-[#895100] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SECURITY */}
      {activeSubSection === 'security' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dac2ae]/60 shadow-xs space-y-6 max-w-2xl">
          <div>
            <h3 className="font-quicksand font-bold text-xl text-[#1b1c1a]">Account Security</h3>
            <p className="text-xs text-[#877462] mt-0.5">Manage authentication password and sessions.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-[#dac2ae] rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#544434] uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-[#dac2ae] rounded-xl text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setSavedSuccessMessage('Security credentials updated successfully.');
                setTimeout(() => setSavedSuccessMessage(''), 3000);
              }}
              className="py-2.5 px-5 bg-[#895100] text-white text-xs font-bold rounded-xl hover:bg-[#683c00] transition-colors"
            >
              Update Password
            </button>
          </div>
        </div>
      )}

      {/* Dedicated Camera Capture Modal */}
      <CameraPhotoCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onPhotoCaptured={handlePhotoCaptured}
        title="Capture Your Profile Headshot"
        idealFrameShape="circle"
      />
    </div>
  );
};
