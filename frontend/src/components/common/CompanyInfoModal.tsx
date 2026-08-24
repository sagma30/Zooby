import React, { useState, useEffect } from 'react';
import { ZoobyLogo } from './ZoobyLogo';

export type InfoModalTab = 'about' | 'contact' | 'careers' | 'help' | 'terms' | 'privacy' | 'trust';

interface CompanyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: InfoModalTab;
  onOpenSOS?: () => void;
  onOpenBooking?: (cat: string) => void;
  onNavigate?: (path: string) => void;
}

export const CompanyInfoModal: React.FC<CompanyInfoModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'about',
  onOpenSOS,
  onOpenBooking,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<InfoModalTab>(initialTab);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [careerSubmitted, setCareerSubmitted] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const navTabs: Array<{ id: InfoModalTab; label: string; icon: string }> = [
    { id: 'about', label: 'About Zooby', icon: 'info' },
    { id: 'contact', label: 'Contact Us', icon: 'support_agent' },
    { id: 'careers', label: 'Careers', icon: 'work' },
    { id: 'help', label: 'Help Center & FAQs', icon: 'help_outline' },
    { id: 'trust', label: 'Trust & Safety', icon: 'verified_user' },
    { id: 'terms', label: 'Terms of Service', icon: 'gavel' },
    { id: 'privacy', label: 'Privacy Policy', icon: 'lock' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in font-jakarta">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#ebdcc4] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="bg-[#fbf9f5] px-6 py-4 border-b border-[#ebdcc4] flex items-center justify-between shrink-0">
          <ZoobyLogo
            size="xs"
            subtitle="Pet-First Ecosystem"
          />

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#544434] hover:bg-[#efeeea] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Sub-Header Tabs */}
        <div className="bg-[#f6f4ee] px-4 py-2 border-b border-[#e6e2dd] flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#895100] text-white shadow-xs'
                  : 'text-[#544434] hover:bg-[#efeeea]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#1b1c1a] text-xs flex-grow leading-relaxed">
          {/* ============================================================ */}
          {/* 1. ABOUT TAB                                                 */}
          {/* ============================================================ */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ffeed9] text-[#895100]">
                  Company Overview
                </span>
                <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                  Reimagining Pet Health & Doorstep Care
                </h3>
                <p className="text-[#544434] text-sm leading-relaxed">
                  Zooby was created to solve the stress of fragmented pet care. Founded in Nashik, Maharashtra, we bridge the gap between licensed veterinary medicine, climate-controlled mobile grooming salons, verified pet walking, and ethical shelter adoption networks.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#efeeea] space-y-1">
                  <span className="material-symbols-outlined text-[24px] text-[#895100]">local_shipping</span>
                  <h4 className="font-bold text-sm text-[#1b1c1a]">Doorstep Van Fleet</h4>
                  <p className="text-[#716153]">Custom-built mobile units equipped with warm hydrobaths and digital diagnostic suites.</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#efeeea] space-y-1">
                  <span className="material-symbols-outlined text-[24px] text-emerald-600">verified</span>
                  <h4 className="font-bold text-sm text-[#1b1c1a]">100% Vetted Doctors</h4>
                  <p className="text-[#716153]">Every practicing veterinarian holds valid BVSc & AH degrees with State Veterinary Council registrations.</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#efeeea] space-y-1">
                  <span className="material-symbols-outlined text-[24px] text-rose-500">favorite</span>
                  <h4 className="font-bold text-sm text-[#1b1c1a]">Rescue Integration</h4>
                  <p className="text-[#716153]">Every booking directly funds emergency medical subsidies for homeless rescue animals across India.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-[#895100] space-y-1">
                <h4 className="font-bold text-sm">Headquartered in Nashik, Expanding Across Maharashtra & India</h4>
                <p className="text-stone-700">Operating active mobile hubs in Gangapur Road, College Road, Indira Nagar, Mahatma Nagar, and Mumbai/Pune partner zones.</p>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 2. CONTACT US TAB                                            */}
          {/* ============================================================ */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ffeed9] text-[#895100]">
                  Get In Touch
                </span>
                <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                  We're Here for You & Your Pet 24/7
                </h3>
                <p className="text-[#544434] text-sm leading-relaxed">
                  Have a question about a van appointment, clinic booking, or partner registration? Reach out to our dedicated Nashik pet concierge team.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Emergency Contact */}
                <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                    <span className="material-symbols-outlined text-[20px]">emergency</span>
                    <span>24/7 Rapid Emergency Dispatch</span>
                  </div>
                  <p className="text-stone-700">Immediate mobile ambulance and veterinary triage line for acute trauma, poisoning, or seizures.</p>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenSOS) onOpenSOS();
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">phone_in_talk</span>
                    <span>Trigger Rapid SOS Network</span>
                  </button>
                </div>

                {/* General Support */}
                <div className="p-5 rounded-2xl bg-[#fbf9f5] border border-[#efeeea] space-y-3">
                  <div className="flex items-center gap-2 text-[#895100] font-bold text-sm">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                    <span>Customer Care & Booking Support</span>
                  </div>
                  <p className="text-[#544434]">Assistance with rescheduled appointments, refunds, vaccine passports, and diet consults.</p>
                  <div className="flex items-center gap-2">
                    <a
                      href="mailto:support@zooby.care"
                      className="flex-1 py-2 rounded-xl bg-[#895100] text-white font-bold text-xs text-center hover:bg-[#683c00] transition-colors"
                    >
                      support@zooby.care
                    </a>
                    <button
                      onClick={() => handleCopy('support@zooby.care', 'email')}
                      className="px-3 py-2 rounded-xl border border-[#dac2ae] hover:bg-[#efeeea] text-[#544434] font-bold cursor-pointer"
                    >
                      {copiedText === 'email' ? 'Copied ✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Office Details */}
              <div className="p-4 rounded-2xl bg-[#f6f4ee] border border-[#e6e2dd] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h4 className="font-bold text-[#1b1c1a] text-sm">Nashik Central Operations Hub</h4>
                  <p className="text-[#716153] mt-0.5">Plot 42, Serene Meadows, Gangapur Road, Nashik, Maharashtra 422013</p>
                  <p className="text-[11px] text-[#877462] mt-0.5">Hours: Monday – Sunday • 7:00 AM – 10:00 PM (Emergency Desk 24/7)</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://www.instagram.com/zooby.petcare?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 text-[#544434] hover:text-[#1b1c1a] transition-colors group cursor-pointer"
                    title="Follow @zooby.petcare on Instagram"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-[#544434] group-hover:text-[#1b1c1a] group-hover:underline">
                      @zooby.petcare
                    </span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 3. CAREERS TAB                                               */}
          {/* ============================================================ */}
          {activeTab === 'careers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ffeed9] text-[#895100]">
                  Join the Fleet
                </span>
                <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                  Build the Future of Compassionate Pet Care
                </h3>
                <p className="text-[#544434] text-sm leading-relaxed">
                  We are looking for dedicated veterinarians, animal groomers, dog behaviorists, and logistics coordinators passionate about raising animal welfare standards in Nashik and beyond.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: 'Lead Mobile Grooming Specialist',
                    type: 'Full Time • Nashik Hub',
                    pay: '₹28,000 – ₹42,000 / mo + Incentives',
                    desc: 'Operate custom climate-controlled grooming vans, perform breed styling, de-matting, and hydrobaths with gentle force-free care.'
                  },
                  {
                    title: 'BVSc Clinical Veterinary Associate',
                    type: 'Full / Part Time • Nashik & Mumbai',
                    pay: '₹50,000 – ₹85,000 / mo',
                    desc: 'Conduct doorstep preventative examinations, core vaccinations, microchipping, and tele-triage consultations.'
                  },
                  {
                    title: 'Emergency Rapid Van Dispatcher',
                    type: 'Rotational Shift • 24/7 Telemetry Desk',
                    pay: '₹22,000 – ₹32,000 / mo',
                    desc: 'Coordinate live GPS mobile ambulance dispatches, triage distress calls, and assign nearest technicians.'
                  }
                ].map((job, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#efeeea] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#1b1c1a]">{job.title}</h4>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-[#895100] text-[10px] font-bold">{job.type}</span>
                      </div>
                      <p className="text-[#544434]">{job.desc}</p>
                      <p className="text-emerald-700 font-bold">{job.pay}</p>
                    </div>

                    <button
                      onClick={() => setCareerSubmitted(job.title)}
                      className="px-4 py-2 rounded-xl bg-[#895100] hover:bg-[#683c00] text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
                    >
                      {careerSubmitted === job.title ? 'Applied ✓' : 'Apply Now'}
                    </button>
                  </div>
                ))}
              </div>

              {careerSubmitted && (
                <div className="p-4 rounded-xl bg-[#c2edca] text-[#1e4a2b] font-bold text-xs border border-[#91d5a1] animate-in fade-in">
                  Thank you! Your application for "{careerSubmitted}" has been received. Our HR team will reach out within 48 hours.
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 4. HELP CENTER & FAQS TAB                                    */}
          {/* ============================================================ */}
          {activeTab === 'help' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ffeed9] text-[#895100]">
                  Support Knowledge Base
                </span>
                <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                  Frequently Asked Questions
                </h3>
                <p className="text-[#544434] text-sm leading-relaxed">
                  Everything you need to know about booking doorstep mobile vans, vaccination records, and billing.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    q: 'How does the Zooby Mobile Grooming Van operate at my house?',
                    a: 'Our custom van arrives outside your gate or building compound. We connect to our own onboard freshwater tank and silent generator. Your pet steps inside the air-conditioned salon parked right outside, receives a luxury hydrobath and styling, and is returned to your doorstep in under 60 minutes.'
                  },
                  {
                    q: 'Are all Zooby veterinarians registered and licensed?',
                    a: 'Yes, 100%. Every consulting doctor holds a Bachelor of Veterinary Science (BVSc) degree registered with the Maharashtra State Veterinary Council. Medical records, prescription slips, and vaccination certificates are digitally generated and saved to your pet profile.'
                  },
                  {
                    q: 'What is the cancellation and refund policy?',
                    a: 'You can reschedule or cancel any appointment free of charge up to 2 hours before the scheduled time slot. Pre-paid amounts are refunded 100% to your original payment method within 24–48 hours.'
                  },
                  {
                    q: 'How does the 24/7 Rapid SOS Emergency response work?',
                    a: 'When you tap Rapid SOS in the app, our central telemetry desk immediately identifies your GPS coordinates and dispatches the nearest active mobile van equipped with oxygen and basic life support, while connecting you on tele-call with an emergency vet.'
                  }
                ].map((faq, i) => (
                  <div key={i} className="rounded-2xl border border-[#efeeea] overflow-hidden bg-[#fbf9f5]">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full p-4 text-left font-bold text-sm text-[#1b1c1a] flex items-center justify-between cursor-pointer hover:bg-[#f6f4ee] transition-colors"
                    >
                      <span>{faq.q}</span>
                      <span className="material-symbols-outlined text-[#895100]">
                        {expandedFaq === i ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {expandedFaq === i && (
                      <div className="p-4 pt-0 text-[#544434] text-xs leading-relaxed border-t border-[#efeeea]/60 bg-white">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 5. TRUST & SAFETY GUARANTEE                                 */}
          {/* ============================================================ */}
          {activeTab === 'trust' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ffeed9] text-[#895100]">
                  Our Safety Charter
                </span>
                <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                  Trust & Safety: The Zooby Standard
                </h3>
                <p className="text-[#544434] text-sm leading-relaxed">
                  Your pet's physical and emotional safety is our highest priority. We maintain zero-tolerance policies for harsh handling and unverified credentials.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#efeeea] space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <span className="material-symbols-outlined text-[20px]">badge</span>
                    <span>100% Background-Checked Staff</span>
                  </div>
                  <p className="text-[#544434]">All drivers, groomers, and dog walkers undergo government ID authentication and animal handling behavioral assessments.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#efeeea] space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <span className="material-symbols-outlined text-[20px]">sanitizer</span>
                    <span>Hospital-Grade UV-C Sterilization</span>
                  </div>
                  <p className="text-[#544434]">Van grooming tables, shears, blades, and tubs are sterilized with medical-grade disinfectant and UV-C light between every pet.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#efeeea] space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <span className="material-symbols-outlined text-[20px]">block</span>
                    <span>Strict Zero-Sedation Force-Free Policy</span>
                  </div>
                  <p className="text-[#544434]">We never administer chemical sedatives for grooming. Gentle touch, organic lavender calming sprays, and low-stress desensitization only.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#efeeea] space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <span className="material-symbols-outlined text-[20px]">near_me</span>
                    <span>Live GPS Telemetry & Speed Monitoring</span>
                  </div>
                  <p className="text-[#544434]">All van and walking routes are tracked live with speed monitoring to ensure safe transit throughout Nashik neighborhoods.</p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 6. TERMS OF SERVICE TAB                                      */}
          {/* ============================================================ */}
          {activeTab === 'terms' && (
            <div className="space-y-4 animate-fade-in text-[#544434]">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ffeed9] text-[#895100]">
                  Legal Agreement
                </span>
                <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                  Terms of Service
                </h3>
                <p className="text-[11px] text-[#877462]">Last Updated: August 2026 • Governed by the Laws of India (Jurisdiction: Nashik, MH)</p>
              </div>

              <div className="space-y-3 text-xs leading-relaxed max-h-[300px] overflow-y-auto p-4 bg-[#fbf9f5] rounded-2xl border border-[#efeeea]">
                <h4 className="font-bold text-[#1b1c1a]">1. Platform Agreement</h4>
                <p>By accessing or utilizing the Zooby application, mobile van services, veterinary consultation network, or adoption features, you agree to be bound by these platform terms.</p>

                <h4 className="font-bold text-[#1b1c1a]">2. Veterinary & Medical Services</h4>
                <p>Medical treatments, vaccinations, and prescriptions are administered solely by registered veterinary professionals. Pet parents must disclose known allergies, past behavioral aggression, or underlying cardiac conditions before service commences.</p>

                <h4 className="font-bold text-[#1b1c1a]">3. Escrow & Secure Digital Payments</h4>
                <p>All digital payments are processed through RBI-compliant, PCI-DSS Level 1 payment gateways. Service providers receive payouts upon confirmed customer completion.</p>

                <h4 className="font-bold text-[#1b1c1a]">4. Cancellation & Rescheduling</h4>
                <p>Bookings may be modified or cancelled without penalty up to two (2) hours prior to the scheduled mobile van arrival time. Full refunds are credited back to the original source instrument.</p>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 7. PRIVACY POLICY TAB                                        */}
          {/* ============================================================ */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fade-in text-[#544434]">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ffeed9] text-[#895100]">
                  Data Confidentiality
                </span>
                <h3 className="font-quicksand font-bold text-2xl text-[#1b1c1a]">
                  Privacy Policy & Data Security
                </h3>
                <p className="text-[11px] text-[#877462]">Compliant with Digital Personal Data Protection (DPDP) Act 2023</p>
              </div>

              <div className="space-y-3 text-xs leading-relaxed max-h-[300px] overflow-y-auto p-4 bg-[#fbf9f5] rounded-2xl border border-[#efeeea]">
                <h4 className="font-bold text-[#1b1c1a]">1. Information We Collect</h4>
                <p>We collect essential account details (name, mobile number, neighborhood location) and pet medical health records (vaccines, weight, allergies) necessary to provide safe veterinary and van grooming services.</p>

                <h4 className="font-bold text-[#1b1c1a]">2. Telemetry & Location Data</h4>
                <p>GPS tracking data is used strictly during active mobile van visits and dog walking sessions to provide accurate ETAs and route verification. Location tracking ceases when the session concludes.</p>

                <h4 className="font-bold text-[#1b1c1a]">3. Zero Third-Party Data Sale</h4>
                <p>Zooby does not sell or rent user or pet medical data to third-party marketing companies. Your pet's medical passport remains encrypted and accessible only by you and your authorized treating veterinarians.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Sticky Close Bar */}
        <div className="p-4 bg-[#fbf9f5] border-t border-[#ebdcc4] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#895100] hover:bg-[#683c00] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
