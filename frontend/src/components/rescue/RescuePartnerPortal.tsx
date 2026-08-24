import React, { useState } from 'react';
import { AdoptionAnimal, AdoptionApplication, UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getDynamicGreeting, getUserDisplayName, getPersonalizedEmptyState } from '../../utils/identity';
import { ZoobyLogo } from '../common/ZoobyLogo';

interface RescuePartnerPortalProps {
  user?: UserProfile;
  currentTab?: string;
  animals: AdoptionAnimal[];
  applications: AdoptionApplication[];
  onAddAnimal?: (animal: Omit<AdoptionAnimal, 'id' | 'postedDate'>) => void;
  onUpdateAnimals?: React.Dispatch<React.SetStateAction<AdoptionAnimal[]>>;
  onUpdateAnimalStatus?: (animalId: string, status: 'Available' | 'Pending' | 'Adopted') => void;
  onUpdateApplicationStatus?: (appId: string, status: 'Submitted' | 'Under Review' | 'Approved' | 'Declined', note?: string) => void;
  onUpdateApplications?: React.Dispatch<React.SetStateAction<AdoptionApplication[]>>;
  onNavigate: (path: string) => void;
}

export const RescuePartnerPortal: React.FC<RescuePartnerPortalProps> = ({
  user: propUser,
  currentTab = 'dashboard',
  animals = [],
  applications = [],
  onAddAnimal,
  onUpdateAnimals,
  onUpdateAnimalStatus,
  onUpdateApplicationStatus,
  onUpdateApplications,
  onNavigate
}) => {
  const { user: authUser, logout } = useAuth();
  const activeUser = authUser || propUser || {
    id: 'usr-rescue-neha',
    name: 'Neha Patil',
    displayName: 'Neha Patil',
    firstName: 'Neha',
    lastName: 'Patil',
    email: 'neha@pawsandhope.org',
    phone: '+91 98222 77889',
    role: 'RESCUE_PARTNER' as const,
    location: 'Indira Nagar, Nashik',
    city: 'Nashik',
    businessName: 'Paws & Hope Rescue',
    organizationName: 'Paws & Hope Rescue',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=240'
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'animals' | 'applications' | 'settings'>(
    (currentTab as any) || 'dashboard'
  );
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AdoptionApplication | null>(null);
  const [partnerNoteInput, setPartnerNoteInput] = useState('');

  // Form for new rescue animal
  const [newAnimal, setNewAnimal] = useState({
    name: '',
    species: 'Dog' as 'Dog' | 'Cat' | 'Puppy' | 'Kitten',
    breed: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female',
    location: 'Indira Nagar, Nashik',
    description: '',
    photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
    shelterName: activeUser.businessName || 'Nashik Strays & Animal Welfare Trust',
    shelterId: 'shelter-nashik-01',
    vaccinated: true,
    neutered: false,
    healthStatus: 'Dewormed, 1st vaccination complete.',
    status: 'Available' as 'Available' | 'Pending' | 'Adopted'
  });

  const safeAnimals = animals || [];
  const safeApplications = applications || [];
  const availableCount = safeAnimals.filter((a) => a.status === 'Available').length;
  const pendingApps = safeApplications.filter((a) => a.status === 'Submitted' || a.status === 'Under Review').length;
  const adoptedCount = safeAnimals.filter((a) => a.status === 'Adopted').length;

  const handleCreateAnimal = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddAnimal) {
      onAddAnimal(newAnimal);
    } else if (onUpdateAnimals) {
      const created: AdoptionAnimal = {
        ...newAnimal,
        id: 'animal-' + Date.now(),
        postedDate: 'Just now'
      };
      onUpdateAnimals((prev) => [created, ...prev]);
    }
    setIsAddAnimalOpen(false);
    setNewAnimal({
      name: '',
      species: 'Dog',
      breed: '',
      age: '',
      gender: 'Male',
      location: 'Indira Nagar, Nashik',
      description: '',
      photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
      shelterName: activeUser.businessName || 'Nashik Strays & Animal Welfare Trust',
      shelterId: 'shelter-nashik-01',
      vaccinated: true,
      neutered: false,
      healthStatus: 'Dewormed, 1st vaccination complete.',
      status: 'Available'
    });
  };

  const handleUpdateAnimalStatus = (animalId: string, status: 'Available' | 'Pending' | 'Adopted') => {
    if (onUpdateAnimalStatus) {
      onUpdateAnimalStatus(animalId, status);
    } else if (onUpdateAnimals) {
      onUpdateAnimals((prev) =>
        prev.map((an) => (an.id === animalId ? { ...an, status } : an))
      );
    }
  };

  const handleReviewApp = (app: AdoptionApplication, newStatus: 'Approved' | 'Declined' | 'Under Review') => {
    if (onUpdateApplicationStatus) {
      onUpdateApplicationStatus(app.id, newStatus, partnerNoteInput);
    } else if (onUpdateApplications) {
      onUpdateApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: newStatus, partnerNotes: partnerNoteInput } : a))
      );
    }

    if (newStatus === 'Approved') {
      handleUpdateAnimalStatus(app.animalId, 'Adopted');
    }
    setSelectedApp(null);
    setPartnerNoteInput('');
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1b1c1a] font-jakarta">
      {/* Rescue Partner Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e6e2dd] px-4 md:px-8 py-3 flex items-center justify-between shadow-xs">
        <ZoobyLogo
          size="sm"
          subtitle={activeUser.businessName || 'Paws & Hope Rescue'}
          badgeText="Rescue Partner"
          badgeColor="emerald"
          clickable={true}
          onClick={() => setActiveTab('dashboard')}
        />

        {/* Center Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#f6f4ee] p-1 rounded-xl border border-[#e6e2dd] text-xs font-bold text-[#544434]">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-white text-[#895100] shadow-xs' : 'hover:text-[#895100]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('animals')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'animals' ? 'bg-white text-[#895100] shadow-xs' : 'hover:text-[#895100]'
            }`}
          >
            <span>Rescue Animals</span>
            <span className="px-1.5 py-0.2 bg-amber-100 text-[#895100] rounded-full text-[10px]">
              {animals.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'applications' ? 'bg-white text-[#895100] shadow-xs' : 'hover:text-[#895100]'
            }`}
          >
            <span>Adoption Applications</span>
            {pendingApps > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px]">
                {pendingApps}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'settings' ? 'bg-white text-[#895100] shadow-xs' : 'hover:text-[#895100]'
            }`}
          >
            Shelter Profile
          </button>
        </nav>

        {/* User profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <img src={activeUser.avatarUrl} alt={activeUser.name} className="w-9 h-9 rounded-full object-cover border border-[#d6cfc7]" />
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-[#1b1c1a]">{activeUser.name}</p>
              <p className="text-[11px] text-[#716153]">Verified Coordinator</p>
            </div>
          </div>
          <button
            onClick={() => logout('/')}
            className="p-2 text-[#716153] hover:text-[#ba1a1a] hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="Log Out"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Mobile Submenu */}
        <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-2 text-xs font-bold text-[#544434]">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-[#895100] text-white' : 'bg-white border border-[#e6e2dd]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('animals')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'animals' ? 'bg-[#895100] text-white' : 'bg-white border border-[#e6e2dd]'
            }`}
          >
            Animals ({animals.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'applications' ? 'bg-[#895100] text-white' : 'bg-white border border-[#e6e2dd]'
            }`}
          >
            Applications ({pendingApps})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'settings' ? 'bg-[#895100] text-white' : 'bg-white border border-[#e6e2dd]'
            }`}
          >
            Profile
          </button>
        </div>

        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Personalized Welcome Header */}
            <div className="bg-gradient-to-r from-[#2c402e] via-[#1e3020] to-[#122013] text-white rounded-3xl p-6 md:p-8 border border-emerald-900/60 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{activeUser.businessName || activeUser.organizationName || 'Paws & Hope Rescue'} • Verified Shelter Partner</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold font-quicksand text-white">
                  {getDynamicGreeting(activeUser)}
                </h2>
                <p className="text-xs md:text-sm text-emerald-100/80 mt-1 max-w-xl">
                  Manage animal intakes, coordinate screening with applicants, and facilitate transparent adoptions.
                </p>
              </div>

              <button
                onClick={() => setIsAddAnimalOpen(true)}
                className="py-3 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                <span>+ List New Rescue Animal</span>
              </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#e6e2dd] shadow-xs">
                <div className="flex items-center justify-between text-[#895100] mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#716153]">Available Animals</span>
                  <span className="material-symbols-outlined text-[22px]">pets</span>
                </div>
                <div className="text-2xl font-bold font-quicksand text-[#1b1c1a]">{availableCount}</div>
                <p className="text-xs text-emerald-700 mt-1 font-medium">Ready for loving homes</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e6e2dd] shadow-xs">
                <div className="flex items-center justify-between text-amber-600 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#716153]">Pending Applications</span>
                  <span className="material-symbols-outlined text-[22px]">assignment</span>
                </div>
                <div className="text-2xl font-bold font-quicksand text-[#1b1c1a]">{pendingApps}</div>
                <p className="text-xs text-amber-700 mt-1 font-medium">Require background screening</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e6e2dd] shadow-xs">
                <div className="flex items-center justify-between text-emerald-600 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#716153]">Successful Adoptions</span>
                  <span className="material-symbols-outlined text-[22px]">verified</span>
                </div>
                <div className="text-2xl font-bold font-quicksand text-[#1b1c1a]">{adoptedCount}</div>
                <p className="text-xs text-emerald-700 mt-1 font-medium">In Nashik this season</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e6e2dd] shadow-xs">
                <div className="flex items-center justify-between text-purple-600 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#716153]">Emergency Rescues</span>
                  <span className="material-symbols-outlined text-[22px]">emergency</span>
                </div>
                <div className="text-2xl font-bold font-quicksand text-[#1b1c1a]">12 Active</div>
                <p className="text-xs text-purple-700 mt-1 font-medium">In medical rehabilitation</p>
              </div>
            </div>

            {/* Quick Actions & Recent Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Action Queue */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e6e2dd] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#1b1c1a]">Pending Adoption Applications</h3>
                    <p className="text-xs text-[#716153]">Review applicant home details, veterinary history, and experience</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="text-xs font-bold text-[#895100] hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                {applications.length === 0 ? (
                  <p className="text-xs text-[#716153] py-6 text-center">No applications waiting for review.</p>
                ) : (
                  <div className="divide-y divide-[#efeeea]">
                    {applications.slice(0, 4).map((app) => (
                      <div key={app.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img src={app.animalPhoto} alt={app.animalName} className="w-12 h-12 rounded-xl object-cover" />
                          <div>
                            <h4 className="text-sm font-bold text-[#1b1c1a]">
                              {app.applicantName} for <span className="text-[#895100]">{app.animalName}</span>
                            </h4>
                            <p className="text-xs text-[#716153]">
                              {app.applicantPhone} • {app.housingType}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              app.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.status === 'Under Review'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {app.status}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setPartnerNoteInput(app.partnerNotes || '');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#f6f4ee] hover:bg-[#efeeea] text-xs font-bold text-[#544434] transition-colors cursor-pointer"
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Col: Quick Animal Management */}
              <div className="bg-white rounded-2xl border border-[#e6e2dd] p-6 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-[#1b1c1a]">Shelter Actions</h3>
                <button
                  onClick={() => setIsAddAnimalOpen(true)}
                  className="w-full py-3 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>List New Rescue Animal</span>
                </button>

                <div className="p-4 rounded-xl bg-[#fbf9f5] border border-[#efeeea] space-y-2 text-xs">
                  <div className="font-bold text-[#544434] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#895100]">health_and_safety</span>
                    <span>Zooby Vet Partner Integration</span>
                  </div>
                  <p className="text-[#716153] leading-relaxed">
                    All listed animals receive free vaccination passports and microchipping via the Zooby Mobile Vet Van network.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Animals Management */}
        {activeTab === 'animals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-quicksand text-[#1b1c1a]">Rescue Animals in Care</h2>
                <p className="text-xs text-[#716153]">Manage public adoption listings, medical statuses, and adoption flags</p>
              </div>
              <button
                onClick={() => setIsAddAnimalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Rescue Listing</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {animals.map((animal) => (
                <div key={animal.id} className="bg-white rounded-2xl border border-[#e6e2dd] overflow-hidden shadow-xs">
                  <div className="relative aspect-[4/3] bg-stone-100">
                    <img src={animal.photoUrl} alt={animal.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-xs">
                        {animal.species}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/90 text-[#895100] backdrop-blur-xs">
                        {animal.gender}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-[#1b1c1a]">{animal.name}</h4>
                        <p className="text-xs text-[#716153]">{animal.breed} • {animal.age}</p>
                      </div>
                      <select
                        value={animal.status}
                        onChange={(e) => handleUpdateAnimalStatus(animal.id, e.target.value as any)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer ${
                          animal.status === 'Available'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : animal.status === 'Pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-stone-100 text-stone-700 border-stone-300'
                        }`}
                      >
                        <option value="Available">Available</option>
                        <option value="Pending">Pending</option>
                        <option value="Adopted">Adopted</option>
                      </select>
                    </div>

                    <p className="text-xs text-[#544434] line-clamp-2 leading-relaxed">{animal.description}</p>

                    <div className="pt-2 border-t border-[#efeeea] text-xs text-[#716153] flex items-center justify-between">
                      <span>Medical: {animal.vaccinated ? 'Vaccinated' : 'Unvaccinated'}</span>
                      <span>{animal.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Applications Review */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold font-quicksand text-[#1b1c1a]">Adoption Applications</h2>
              <p className="text-xs text-[#716153]">Full applicant questionnaires and status progression</p>
            </div>

            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="bg-white rounded-2xl border border-[#e6e2dd] p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#efeeea]">
                    <div className="flex items-center gap-3.5">
                      <img src={app.animalPhoto} alt={app.animalName} className="w-14 h-14 rounded-xl object-cover" />
                      <div>
                        <h3 className="text-base font-bold text-[#1b1c1a]">
                          {app.applicantName} <span className="text-[#716153] font-normal">applying for</span>{' '}
                          <span className="text-[#895100]">{app.animalName}</span>
                        </h3>
                        <p className="text-xs text-[#716153]">
                          {app.applicantEmail} • {app.applicantPhone} • Submitted {app.submittedDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleReviewApp(app, 'Approved')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        Approve Adoption
                      </button>
                      <button
                        onClick={() => handleReviewApp(app, 'Declined')}
                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-[#ba1a1a] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-[#fbf9f5] p-3 rounded-xl border border-[#efeeea]">
                      <span className="text-[#897361] block font-medium">Home & Yard</span>
                      <p className="font-bold text-[#1b1c1a] mt-0.5">{app.housingType}</p>
                      <p className="text-[#716153] mt-0.5">{app.applicantAddress}</p>
                    </div>

                    <div className="bg-[#fbf9f5] p-3 rounded-xl border border-[#efeeea]">
                      <span className="text-[#897361] block font-medium">Current Pets</span>
                      <p className="font-bold text-[#1b1c1a] mt-0.5">{app.hasOtherPets || 'None'}</p>
                    </div>

                    <div className="bg-[#fbf9f5] p-3 rounded-xl border border-[#efeeea]">
                      <span className="text-[#897361] block font-medium">Experience & Routine</span>
                      <p className="font-bold text-[#1b1c1a] mt-0.5">{app.experienceNotes || 'No notes provided'}</p>
                    </div>
                  </div>

                  {app.partnerNotes && (
                    <div className="text-xs bg-amber-50 text-[#895100] p-3 rounded-xl border border-amber-200/70">
                      <span className="font-bold">Shelter Verification Note: </span>
                      {app.partnerNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Shelter Profile */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white rounded-2xl border border-[#e6e2dd] p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#1b1c1a]">Rescue Organization Profile</h3>
              <p className="text-xs text-[#716153]">Verified credentials and contact details in Nashik</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#544434] mb-1">Organization / Shelter Name</label>
                <input
                  type="text"
                  disabled
                  value={activeUser.businessName || 'Nashik Strays & Animal Welfare Trust'}
                  className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5] text-[#544434]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#544434] mb-1">Coordinator Name</label>
                  <input
                    type="text"
                    disabled
                    value={activeUser.name || 'Coordinator'}
                    className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5] text-[#544434]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#544434] mb-1">Helpline Phone</label>
                  <input
                    type="text"
                    disabled
                    value={activeUser.phone || '+91 98222 77889'}
                    className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5] text-[#544434]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#544434] mb-1">Shelter Address / Facility</label>
                <input
                  type="text"
                  disabled
                  value={activeUser.location || 'Indira Nagar, Nashik, Maharashtra'}
                  className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5] text-[#544434]"
                />
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Zooby Certified Rescue Partner</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Your shelter is verified to list animals, perform home checks, and collaborate with the Zooby Mobile Van for sterilization and rescue transport.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Animal Modal */}
      {isAddAnimalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fade-in border border-[#e6e2dd] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#efeeea] mb-4">
              <h3 className="text-base font-bold text-[#1b1c1a]">List New Rescue Animal</h3>
              <button
                onClick={() => setIsAddAnimalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#f6f4ee] text-[#544434] flex items-center justify-center hover:bg-[#efeeea] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateAnimal} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#544434] mb-1">Animal Name</label>
                  <input
                    type="text"
                    required
                    value={newAnimal.name}
                    onChange={(e) => setNewAnimal({ ...newAnimal, name: e.target.value })}
                    placeholder="e.g. Milo"
                    className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#544434] mb-1">Category</label>
                  <select
                    value={newAnimal.species}
                    onChange={(e) => setNewAnimal({ ...newAnimal, species: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5]"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Puppy">Puppy</option>
                    <option value="Kitten">Kitten</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#544434] mb-1">Breed</label>
                  <input
                    type="text"
                    required
                    value={newAnimal.breed}
                    onChange={(e) => setNewAnimal({ ...newAnimal, breed: e.target.value })}
                    placeholder="e.g. Indie Mix"
                    className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#544434] mb-1">Age</label>
                  <input
                    type="text"
                    required
                    value={newAnimal.age}
                    onChange={(e) => setNewAnimal({ ...newAnimal, age: e.target.value })}
                    placeholder="e.g. 5 Months"
                    className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#544434] mb-1">Gender</label>
                  <select
                    value={newAnimal.gender}
                    onChange={(e) => setNewAnimal({ ...newAnimal, gender: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#544434] mb-1">Photo URL</label>
                <input
                  type="url"
                  required
                  value={newAnimal.photoUrl}
                  onChange={(e) => setNewAnimal({ ...newAnimal, photoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#544434] mb-1">Bio / Temperament</label>
                <textarea
                  rows={2}
                  required
                  value={newAnimal.description}
                  onChange={(e) => setNewAnimal({ ...newAnimal, description: e.target.value })}
                  placeholder="Personality, rescue story, how they get along with people and other animals..."
                  className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAnimal.vaccinated}
                    onChange={(e) => setNewAnimal({ ...newAnimal, vaccinated: e.target.checked })}
                    className="rounded text-[#895100]"
                  />
                  <span className="font-bold text-[#544434]">Vaccinated</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAnimal.neutered}
                    onChange={(e) => setNewAnimal({ ...newAnimal, neutered: e.target.checked })}
                    className="rounded text-[#895100]"
                  />
                  <span className="font-bold text-[#544434]">Neutered / Spayed</span>
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddAnimalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#d6cfc7] text-xs font-bold text-[#544434] hover:bg-[#f6f4ee] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] shadow-xs cursor-pointer"
                >
                  Save Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Application Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fade-in border border-[#e6e2dd] space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#efeeea]">
              <h3 className="text-base font-bold text-[#1b1c1a]">Screen Application</h3>
              <button
                onClick={() => setSelectedApp(null)}
                className="w-7 h-7 rounded-full bg-[#f6f4ee] text-[#544434] flex items-center justify-center hover:bg-[#efeeea] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div>
              <p className="font-bold text-[#1b1c1a]">{selectedApp.applicantName} for {selectedApp.animalName}</p>
              <p className="text-[#716153] mt-0.5">{selectedApp.applicantPhone} • {selectedApp.applicantEmail}</p>
              <p className="text-[#544434] mt-2 bg-[#fbf9f5] p-3 rounded-xl border border-[#efeeea]">
                {selectedApp.housingType} — {selectedApp.applicantAddress}
              </p>
            </div>

            <div>
              <label className="block font-bold text-[#544434] mb-1">Partner Assessment Note</label>
              <textarea
                rows={3}
                value={partnerNoteInput}
                onChange={(e) => setPartnerNoteInput(e.target.value)}
                placeholder="Add background check notes or schedule home visit date..."
                className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5] focus:outline-hidden focus:border-[#895100]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleReviewApp(selectedApp, 'Under Review')}
                className="flex-1 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 font-bold hover:bg-amber-100 cursor-pointer"
              >
                Mark Under Review
              </button>
              <button
                onClick={() => handleReviewApp(selectedApp, 'Approved')}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs cursor-pointer"
              >
                Approve Adoption
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
