import React, { useState } from 'react';
import { Pet, PetSpecies } from '../types';

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePet: (newPet: Pet) => void;
  editPet?: Pet | null;
}

const SAMPLE_AVATARS = [
  {
    label: 'Golden Retriever',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDd24ewJ-i4Pr3VfEc7UxESy2_J8KQBgWsvdAV_XYvL3hisMidta-8dXYMSna32Xhqoar3nvwcgeOCEeDnvWSKVLeKTFDeIGuqDEQmURYDhyqFSOsyOQcKQI1MYD0nSJtbH_1Pg9gFddQiVouOH-z5aT8_86OTDkHzMMFBpB7Mz1mgUw102TzJAPsQ4cVOIBKq4gva2D7ODuO9eIEl1DSeBEmnICKm4spJRe9gUH1f3vBpaUl-oB16'
  },
  {
    label: 'Persian Cat',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDARmREAm6zMpz5OuLTAr9xEsIGTXzOnLXiRFe2Td8NAXt4B1txJiP-qfwtf0rE6zYuZaOYl77W1d-098bh19_ZLvc6LtxdVNSpFqkAA21FS_12okyMzcgwxIjlGI0OLeh086CW6jctG-CdTiCD-4M6tFMHqMS3IEfU0HuLK865GcSqK__PkaAmVwUNtSw1QkrnP4Eh5QW3BiQo1D6-uHnVs2qnhI4QnQtUL1kUxF-lZwLMYg6bsJCx'
  },
  {
    label: 'Mixed Terrier',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4u8Ahmf-oID75JfyI_cB9ZIj2JQAa2ypxMfArBRaGN2OlXT1LLhsqf596dRnc3a51NJkkN8j1GpfVRxB2FrSZHuy844Lch2xnBdxvDY10vaKdM4kJLW0u6U0frBES-HR76fkGbId8ET17GOrUFyxa940JYoCSBBDBOergl7uWj8u4Y-EKrLehndZdsELFTGIP-Ph7lvMflK0s0RiU04c-wFAzjkIrCP1frGjNAgl6SRD1m3Ca-ozG'
  },
  {
    label: 'French Bulldog / Pug',
    url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=400'
  },
  {
    label: 'Tabby Cat',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400'
  }
];

export const AddPetModal: React.FC<AddPetModalProps> = ({
  isOpen,
  onClose,
  onSavePet,
  editPet
}) => {
  const [name, setName] = useState(editPet?.name || '');
  const [species, setSpecies] = useState<PetSpecies>(editPet?.species || 'Dog');
  const [breed, setBreed] = useState(editPet?.breed || '');
  const [age, setAge] = useState(editPet?.age || '2 Years');
  const [weight, setWeight] = useState(editPet?.weight || '10 kg');
  const [location, setLocation] = useState(editPet?.location || 'Mumbai');
  const [description, setDescription] = useState(
    editPet?.description || 'A loving and playful companion.'
  );
  const [photoUrl, setPhotoUrl] = useState(
    editPet?.photoUrl || SAMPLE_AVATARS[0].url
  );
  const [bloodGroup, setBloodGroup] = useState(editPet?.bloodGroup || 'DEA 1.1 Positive');
  const [allergies, setAllergies] = useState(editPet?.allergies || 'None Known');
  const [medications, setMedications] = useState(editPet?.currentMedications || 'None');
  const [servicePreferences, setServicePreferences] = useState<string[]>(
    editPet?.servicePreferences || ['Grooming', 'Walking']
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter pet name');
      return;
    }
    if (!breed.trim()) {
      setError('Please enter pet breed');
      return;
    }

    const petData: Pet = {
      id: editPet?.id || 'pet-' + Date.now(),
      name: name.trim(),
      species,
      breed: breed.trim(),
      age: age.trim() || '1 Year',
      weight: weight.trim() || '5 kg',
      location: location.trim() || 'Mumbai',
      description: description.trim(),
      photoUrl,
      bloodGroup: bloodGroup.trim() || 'Universal',
      allergies: allergies.trim() || 'None Known',
      currentMedications: medications.trim() || 'None',
      servicePreferences,
      vaccinationStatus: editPet?.vaccinationStatus || 'Up-to-date',
      healthStatusText: 'Healthy',
      liveLocation: editPet?.liveLocation || {
        city: location.trim() || 'Mumbai',
        state: 'MH',
        status: 'At Home',
        battery: 95,
        lastUpdated: 'Just now',
        mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzYp8mpNSCoVu-nKQCOP-deMgvF0e286h4HfSGNG87U-zX9c8mhbxpJ57wSMPVqzaF5IbDCca_Kt2_pfu5wmzw9A4Zu2qZ-M9hkEBKrMKMb8kS8LqAInLRLHVNWZX0P974XenU2kJb6GvJM28Tc9ZImwW_xVkzPy1gt-_DS77DDqZNcdZcEZ0_hS2RiM6ilnoDMBpULJxavqtl8balznoWDtQEV_9eYDAUIIOj_VEABouWlKaavn5t'
      },
      healthEvents: editPet?.healthEvents || [
        {
          id: 'evt-init-' + Date.now(),
          petId: editPet?.id || 'pet-' + Date.now(),
          eventType: 'routine_checkup',
          eventTitle: 'Initial Health Profile Created',
          date: new Date().toISOString().split('T')[0],
          administeredBy: 'Zooby Health System',
          notes: 'Pet profile added with vital records and vaccination schedule tracker.',
          reminderEnabled: false
        }
      ]
    };

    onSavePet(petData);
    onClose();
  };

  const togglePreference = (pref: string) => {
    if (servicePreferences.includes(pref)) {
      setServicePreferences(servicePreferences.filter((p) => p !== pref));
    } else {
      setServicePreferences([...servicePreferences, pref]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fbf9f5] w-full max-w-[620px] rounded-3xl shadow-2xl border border-[#e5e0d8] overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-[#fbf9f5] border-b border-[#efeeea] flex items-center justify-between">
          <h2 className="font-quicksand font-bold text-xl text-[#895100]">
            {editPet ? `Edit ${editPet.name}'s Profile` : 'Add New Pet Profile'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#544434] hover:bg-[#efeeea] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-[#ffdad6] text-[#93000a] text-xs font-semibold p-3 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Photo Selection */}
          <div>
            <label className="block text-xs font-bold text-[#00164d] mb-2">
              Select Pet Photo / Avatar
            </label>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {SAMPLE_AVATARS.map((avatar, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPhotoUrl(avatar.url)}
                  className={`relative rounded-full p-0.5 transition-all shrink-0 cursor-pointer ${
                    photoUrl === avatar.url
                      ? 'ring-3 ring-[#ff9f1c] scale-105'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={avatar.url}
                    alt={avatar.label}
                    className="w-14 h-14 rounded-full object-cover border border-[#dac2ae]"
                  />
                  {photoUrl === avatar.url && (
                    <span className="absolute bottom-0 right-0 bg-[#ff9f1c] text-[#683c00] rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Species & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#00164d] mb-1">
                Pet Species
              </label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as PetSpecies)}
                className="w-full bg-white border border-[#dac2ae] rounded-xl px-3 py-2.5 text-xs text-[#1b1c1a] focus:ring-2 focus:ring-[#895100] focus:outline-none cursor-pointer"
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Other">Other Pet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#00164d] mb-1">
                Pet Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bruno, Luna, Bella"
                className="w-full bg-white border border-[#dac2ae] rounded-xl px-3 py-2.5 text-xs text-[#1b1c1a] focus:ring-2 focus:ring-[#895100] focus:outline-none"
              />
            </div>
          </div>

          {/* Breed & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#00164d] mb-1">
                Breed
              </label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="e.g. Golden Retriever"
                className="w-full bg-white border border-[#dac2ae] rounded-xl px-3 py-2 text-xs text-[#1b1c1a] focus:ring-2 focus:ring-[#895100] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#00164d] mb-1">
                Age
              </label>
              <input
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 2 Years"
                className="w-full bg-white border border-[#dac2ae] rounded-xl px-3 py-2 text-xs text-[#1b1c1a] focus:ring-2 focus:ring-[#895100] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#00164d] mb-1">
                Weight
              </label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 12 kg"
                className="w-full bg-white border border-[#dac2ae] rounded-xl px-3 py-2 text-xs text-[#1b1c1a] focus:ring-2 focus:ring-[#895100] focus:outline-none"
              />
            </div>
          </div>

          {/* Medical Vitals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#00164d] mb-1">
                Blood Group
              </label>
              <input
                type="text"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                placeholder="e.g. Type A / DEA 1.1 Positive"
                className="w-full bg-white border border-[#dac2ae] rounded-xl px-3 py-2 text-xs text-[#1b1c1a] focus:ring-2 focus:ring-[#895100] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#00164d] mb-1">
                Allergies
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. None Known / Chicken protein"
                className="w-full bg-white border border-[#dac2ae] rounded-xl px-3 py-2 text-xs text-[#1b1c1a] focus:ring-2 focus:ring-[#895100] focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#00164d] mb-1">
              Bio &amp; Personality Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Tell care providers about their temperament, favorite toys, or walking preferences..."
              className="w-full bg-white border border-[#dac2ae] rounded-xl px-3 py-2 text-xs text-[#1b1c1a] focus:ring-2 focus:ring-[#895100] focus:outline-none resize-none"
            />
          </div>

          {/* Service Preferences */}
          <div>
            <label className="block text-xs font-bold text-[#00164d] mb-1.5">
              Service Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {['Grooming', 'Walking', 'Sitting', 'Vet Consult'].map((pref) => (
                <button
                  key={pref}
                  type="button"
                  onClick={() => togglePreference(pref)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                    servicePreferences.includes(pref)
                      ? 'bg-[#dce1ff] text-[#00164d] border border-[#a2b6fd]'
                      : 'bg-white border border-[#dac2ae] text-[#544434]'
                  }`}
                >
                  {servicePreferences.includes(pref) ? '✓ ' : '+ '}
                  {pref}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-3 border-t border-[#efeeea]">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-full border border-[#dac2ae] text-[#544434] hover:bg-[#efeeea] font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 rounded-full bg-[#ff9f1c] hover:bg-[#ff8f00] text-[#683c00] font-bold text-xs shadow-md transition-all cursor-pointer active:translate-y-0.5"
            >
              {editPet ? 'Update Profile' : 'Save Pet Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
