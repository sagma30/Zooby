import React, { useState } from 'react';
import { AdoptionAnimal, AdoptionApplication, PetSpecies } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface PetParentAdoptionViewProps {
  animals?: AdoptionAnimal[];
  applications?: AdoptionApplication[];
  userApplications?: AdoptionApplication[];
  onSubmitApplication?: (app: Omit<AdoptionApplication, 'id' | 'submittedDate' | 'status'>) => void;
  onOpenSignIn?: () => void;
  onNavigate?: (path: string) => void;
}

export const PetParentAdoptionView: React.FC<PetParentAdoptionViewProps> = ({
  animals = [],
  applications,
  userApplications,
  onSubmitApplication,
  onOpenSignIn,
  onNavigate
}) => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'my-applications'>('browse');
  const [filterSpecies, setFilterSpecies] = useState<'All' | 'Dog' | 'Cat' | 'Puppy' | 'Kitten'>('All');
  const [selectedAnimal, setSelectedAnimal] = useState<AdoptionAnimal | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [appSuccess, setAppSuccess] = useState(false);

  // Application form fields
  const [formData, setFormData] = useState({
    applicantName: user?.name || '',
    applicantEmail: user?.email || '',
    applicantPhone: user?.phone || '+91 98220 11223',
    applicantAddress: user?.location || 'Gangapur Road, Nashik',
    housingType: 'Own Independent House with Fenced Garden',
    hasOtherPets: 'Yes, 1 friendly dog at home',
    experienceNotes: 'Have raised dogs for 5+ years. Experienced with routine vet visits and daily walks.'
  });

  const allApps = userApplications || applications || [];
  const myApps = userApplications
    ? userApplications
    : allApps.filter((app) => (user ? app.applicantEmail === user.email || app.applicantId === user.id : false));

  const filteredAnimals = (animals || []).filter((a) => {
    if (filterSpecies === 'All') return true;
    return a.species === filterSpecies || (filterSpecies === 'Dog' && a.species === 'Puppy') || (filterSpecies === 'Cat' && a.species === 'Kitten');
  });

  const handleStartApply = (animal: AdoptionAnimal) => {
    if (!isAuthenticated && onOpenSignIn) {
      onOpenSignIn();
      return;
    }
    setSelectedAnimal(animal);
    setIsApplying(true);
    setAppSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal) return;

    if (onSubmitApplication) {
      onSubmitApplication({
        animalId: selectedAnimal.id,
        animalName: selectedAnimal.name,
        animalPhoto: selectedAnimal.photoUrl,
        shelterId: selectedAnimal.shelterId,
        applicantId: user?.id || 'usr-guest',
        applicantName: formData.applicantName,
        applicantEmail: formData.applicantEmail,
        applicantPhone: formData.applicantPhone,
        applicantAddress: formData.applicantAddress,
        housingType: formData.housingType,
        hasOtherPets: formData.hasOtherPets,
        experienceNotes: formData.experienceNotes
      });
    }

    setAppSuccess(true);
    setTimeout(() => {
      setIsApplying(false);
      setSelectedAnimal(null);
      setActiveTab('my-applications');
      setAppSuccess(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#5a3600] to-[#895100] text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold tracking-wide uppercase mb-3">
            Adopt, Don’t Shop • Nashik Animal Rescue Network
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-quicksand tracking-tight mb-2">
            Find Your Forever Best Friend
          </h1>
          <p className="text-sm sm:text-base text-amber-100/90 leading-relaxed mb-4">
            Every pet on Zooby is health-checked, vaccinated, and cared for by verified rescue partners in Nashik. Give a rescued angel the loving family they deserve.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="bg-black/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-amber-300">verified</span>
              100% Medical & Vaccination Records
            </span>
            <span className="bg-black/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-amber-300">home_health</span>
              Ethical Shelter Screening
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-[#e6e2dd] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'browse'
                ? 'bg-[#895100] text-white shadow-xs'
                : 'bg-white text-[#544434] hover:bg-[#efeeea] border border-[#e6e2dd]'
            }`}
          >
            Available for Adoption ({(animals || []).filter((a) => a.status === 'Available').length})
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('my-applications')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'my-applications'
                  ? 'bg-[#895100] text-white shadow-xs'
                  : 'bg-white text-[#544434] hover:bg-[#efeeea] border border-[#e6e2dd]'
              }`}
            >
              <span>My Applications</span>
              {myApps.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#fbf9f5] text-[#895100] text-xs flex items-center justify-center font-bold">
                  {myApps.length}
                </span>
              )}
            </button>
          )}
        </div>

        {activeTab === 'browse' && (
          <div className="hidden sm:flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#e6e2dd] text-xs font-semibold">
            {(['All', 'Dog', 'Cat', 'Puppy', 'Kitten'] as const).map((sp) => (
              <button
                key={sp}
                onClick={() => setFilterSpecies(sp)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterSpecies === sp ? 'bg-[#895100] text-white' : 'text-[#544434] hover:bg-[#f6f4ee]'
                }`}
              >
                {sp}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab: Browse Animals */}
      {activeTab === 'browse' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnimals.map((animal) => (
            <div
              key={animal.id}
              className="bg-white rounded-2xl border border-[#e6e2dd] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                <img
                  src={animal.photoUrl}
                  alt={animal.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-xs ${
                      animal.status === 'Available'
                        ? 'bg-emerald-600 text-white'
                        : animal.status === 'Pending'
                        ? 'bg-amber-600 text-white'
                        : 'bg-stone-600 text-white'
                    }`}
                  >
                    {animal.status}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-xs">
                    {animal.gender}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 text-[#895100] shadow-xs backdrop-blur-xs">
                    {animal.age}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-xl font-bold text-[#1b1c1a] font-quicksand">{animal.name}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-amber-50 text-[#895100] rounded-md border border-amber-200/60">
                      {animal.breed}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#716153] mb-3">
                    <span className="material-symbols-outlined text-[15px] text-[#895100]">location_on</span>
                    <span>{animal.location}</span>
                    <span className="mx-1">•</span>
                    <span>{animal.shelterName}</span>
                  </div>
                  <p className="text-xs text-[#544434] line-clamp-2 leading-relaxed">{animal.description}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#f0eee9]">
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                    <span>{animal.healthStatus}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedAnimal(animal)}
                      className="flex-1 py-2.5 rounded-xl border border-[#d6cfc7] text-xs font-bold text-[#544434] hover:bg-[#f6f4ee] transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleStartApply(animal)}
                      disabled={animal.status === 'Adopted'}
                      className="flex-1 py-2.5 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] transition-colors shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">favorite</span>
                      <span>Adopt {animal.name}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: My Applications */}
      {activeTab === 'my-applications' && (
        <div className="space-y-4">
          {myApps.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-[#e6e2dd] text-center space-y-3 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-[#895100] mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">pets</span>
              </div>
              <h3 className="text-base font-bold text-[#1b1c1a]">No Adoption Applications Yet</h3>
              <p className="text-xs text-[#716153] leading-relaxed">
                You haven't submitted any adoption applications yet. Browse available animals and take the first step toward welcoming a companion home!
              </p>
              <button
                onClick={() => setActiveTab('browse')}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] transition-colors cursor-pointer"
              >
                Browse Animals for Adoption
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-[#e6e2dd] p-5 shadow-xs flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={app.animalPhoto}
                      alt={app.animalName}
                      className="w-16 h-16 rounded-xl object-cover border border-[#e6e2dd]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-[#1b1c1a]">Application for {app.animalName}</h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            app.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : app.status === 'Under Review'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : app.status === 'Declined'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#716153] mt-0.5">
                        Submitted on {app.submittedDate} • Shelter ID: {app.shelterId}
                      </p>
                      {app.partnerNotes && (
                        <div className="mt-2 text-xs bg-amber-50 text-[#895100] p-2.5 rounded-lg border border-amber-200/70">
                          <span className="font-bold">Shelter Note: </span>
                          {app.partnerNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-stone-500 self-end md:self-center">
                    <span className="font-semibold text-[#544434]">Housing: </span>
                    {app.housingType}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Animal Details Modal */}
      {selectedAnimal && !isApplying && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-fade-in border border-[#e6e2dd]">
            <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
              <img src={selectedAnimal.photoUrl} alt={selectedAnimal.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedAnimal(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold font-quicksand text-[#1b1c1a]">{selectedAnimal.name}</h3>
                  <p className="text-xs text-[#716153]">
                    {selectedAnimal.breed} • {selectedAnimal.age} • {selectedAnimal.gender}
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                  {selectedAnimal.status}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#544434] leading-relaxed">{selectedAnimal.description}</p>

              <div className="grid grid-cols-2 gap-3 bg-[#fbf9f5] p-3.5 rounded-xl border border-[#efeeea] text-xs">
                <div>
                  <span className="text-[#897361] block">Vaccinated</span>
                  <span className="font-bold text-[#1b1c1a] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
                    {selectedAnimal.vaccinated ? 'Yes, Up to date' : 'Scheduled'}
                  </span>
                </div>
                <div>
                  <span className="text-[#897361] block">Neutered / Spayed</span>
                  <span className="font-bold text-[#1b1c1a]">
                    {selectedAnimal.neutered ? 'Yes, Completed' : 'Pending maturity'}
                  </span>
                </div>
                <div>
                  <span className="text-[#897361] block">Rescue Shelter</span>
                  <span className="font-bold text-[#1b1c1a]">{selectedAnimal.shelterName}</span>
                </div>
                <div>
                  <span className="text-[#897361] block">Location</span>
                  <span className="font-bold text-[#1b1c1a]">{selectedAnimal.location}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedAnimal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#d6cfc7] text-xs font-bold text-[#544434] hover:bg-[#f6f4ee] cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => handleStartApply(selectedAnimal)}
                  className="flex-1 py-2.5 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">favorite</span>
                  <span>Apply to Adopt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adoption Application Modal */}
      {isApplying && selectedAnimal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fade-in border border-[#e6e2dd] max-h-[90vh] overflow-y-auto">
            {appSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">check</span>
                </div>
                <h3 className="text-xl font-bold text-[#1b1c1a]">Application Submitted!</h3>
                <p className="text-xs text-[#716153] max-w-sm mx-auto">
                  Thank you for applying to adopt {selectedAnimal.name}. The shelter partner ({selectedAnimal.shelterName}) has received your application and will contact you shortly for a meet-and-greet!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#efeeea]">
                  <div className="flex items-center gap-3">
                    <img src={selectedAnimal.photoUrl} alt={selectedAnimal.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <h3 className="text-base font-bold text-[#1b1c1a]">Adopt {selectedAnimal.name}</h3>
                      <p className="text-xs text-[#716153]">{selectedAnimal.shelterName}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsApplying(false)}
                    className="w-7 h-7 rounded-full bg-[#f6f4ee] text-[#544434] flex items-center justify-center hover:bg-[#efeeea] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#544434] mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.applicantName}
                      onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5] focus:outline-hidden focus:border-[#895100]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#544434] mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.applicantEmail}
                        onChange={(e) => setFormData({ ...formData, applicantEmail: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5] focus:outline-hidden focus:border-[#895100]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#544434] mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={formData.applicantPhone}
                        onChange={(e) => setFormData({ ...formData, applicantPhone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5] focus:outline-hidden focus:border-[#895100]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#544434] mb-1">Home Address in Nashik</label>
                    <input
                      type="text"
                      required
                      value={formData.applicantAddress}
                      onChange={(e) => setFormData({ ...formData, applicantAddress: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5] focus:outline-hidden focus:border-[#895100]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#544434] mb-1">Housing Type & Yard Details</label>
                    <select
                      value={formData.housingType}
                      onChange={(e) => setFormData({ ...formData, housingType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5] focus:outline-hidden focus:border-[#895100]"
                    >
                      <option value="Own Independent House with Fenced Garden">Own House with Fenced Garden</option>
                      <option value="Own Apartment / Flat (Pet-friendly society)">Own Apartment / Flat</option>
                      <option value="Rented Apartment (Landlord approval obtained)">Rented Flat (With pet NOC)</option>
                      <option value="Farmhouse / Open Property">Farmhouse / Open Yard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#544434] mb-1">Do you currently have other pets?</label>
                    <input
                      type="text"
                      value={formData.hasOtherPets}
                      onChange={(e) => setFormData({ ...formData, hasOtherPets: e.target.value })}
                      placeholder="e.g., 1 Golden Retriever, vaccinated & friendly"
                      className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5] focus:outline-hidden focus:border-[#895100]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#544434] mb-1">Experience & Daily Schedule</label>
                    <textarea
                      rows={2}
                      value={formData.experienceNotes}
                      onChange={(e) => setFormData({ ...formData, experienceNotes: e.target.value })}
                      placeholder="Share a few words on who will be home, exercise routine, and vet care commitment..."
                      className="w-full px-3 py-2 rounded-xl border border-[#d6cfc7] bg-[#fbf9f5] focus:outline-hidden focus:border-[#895100]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsApplying(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#d6cfc7] text-xs font-bold text-[#544434] hover:bg-[#f6f4ee] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#895100] text-white text-xs font-bold hover:bg-[#683c00] shadow-xs cursor-pointer"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
