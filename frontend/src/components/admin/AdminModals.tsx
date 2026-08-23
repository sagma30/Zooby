import React, { useState } from 'react';
import { AdminUser, ProviderVerification } from '../../types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<AdminUser>) => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Mumbai');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'Active' | 'New' | 'Suspended'>('Active');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onSave({
      name,
      email,
      phone: phone || '+91 98000 00000',
      location,
      primaryAddress: address || `${location}, India`,
      status,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=240`,
      joinedDate: 'Today',
      paymentMethod: { brand: 'Visa', last4: '1234', expiry: '12/28' },
      pets: [],
      recentBookings: [],
      activityTimeline: [
        {
          id: `tl-${Date.now()}`,
          title: 'Account Created by Admin',
          description: 'Added manually through Zooby Admin Portal.',
          timestamp: 'Just now',
          type: 'profile'
        }
      ]
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#efeeea] space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#f4ebd9] text-[#895100] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">person_add</span>
            </div>
            <div>
              <h3 className="font-quicksand font-bold text-xl text-[#1b1c1a]">Add New User</h3>
              <p className="text-xs text-[#877462]">Create a new pet parent account.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#f5f2ec] text-[#877462] cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-[#544434] mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full p-2.5 bg-[#faf8f5] border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:border-[#ff9f1c]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#544434] mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@example.com"
                className="w-full p-2.5 bg-[#faf8f5] border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:border-[#ff9f1c]"
              />
            </div>
            <div>
              <label className="block text-[#544434] mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 bg-[#faf8f5] border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:border-[#ff9f1c]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#544434] mb-1">City / Region</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Mumbai"
                className="w-full p-2.5 bg-[#faf8f5] border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:border-[#ff9f1c]"
              />
            </div>
            <div>
              <label className="block text-[#544434] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 bg-[#faf8f5] border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:border-[#ff9f1c]"
              >
                <option value="Active">Active</option>
                <option value="New">New</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#544434] mb-1">Primary Street Address</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 501, Green Heights, Andheri West, Mumbai 400053"
              className="w-full p-2.5 bg-[#faf8f5] border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:border-[#ff9f1c]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#efeeea]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#d8d1c7] text-[#544434] hover:bg-[#f5f2ec] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#895100] hover:bg-[#683c00] text-white font-bold transition-all shadow-xs cursor-pointer"
            >
              Save User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onSave: (updated: AdminUser) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave
}) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [address, setAddress] = useState(user?.primaryAddress || '');
  const [status, setStatus] = useState<'Active' | 'New' | 'Suspended'>(user?.status || 'Active');

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
      setLocation(user.location);
      setAddress(user.primaryAddress);
      setStatus(user.status);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...user,
      name,
      email,
      phone,
      location,
      primaryAddress: address,
      status
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#efeeea] space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#e0edff] text-[#2563eb] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">edit</span>
            </div>
            <div>
              <h3 className="font-quicksand font-bold text-xl text-[#1b1c1a]">Edit Account</h3>
              <p className="text-xs text-[#877462]">#{user.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#f5f2ec] text-[#877462] cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-[#544434] mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-[#faf8f5] border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:border-[#ff9f1c]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#544434] mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-[#faf8f5] border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:border-[#ff9f1c]"
              />
            </div>
            <div>
              <label className="block text-[#544434] mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-[#faf8f5] border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:border-[#ff9f1c]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#544434] mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 bg-[#faf8f5] border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:border-[#ff9f1c]"
              />
            </div>
            <div>
              <label className="block text-[#544434] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 bg-[#faf8f5] border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:border-[#ff9f1c]"
              >
                <option value="Active">Active</option>
                <option value="New">New</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#544434] mb-1">Primary Address</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 bg-[#faf8f5] border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:border-[#ff9f1c]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#efeeea]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#d8d1c7] text-[#544434] hover:bg-[#f5f2ec] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold transition-all shadow-xs cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AdminMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onSend: (message: string) => void;
}

export const AdminMessageModal: React.FC<AdminMessageModalProps> = ({
  isOpen,
  onClose,
  user,
  onSend
}) => {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('Important notice regarding your Zooby account');
  const [sent, setSent] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setMessage('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#efeeea] space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#f4ebd9] text-[#895100] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">chat_bubble</span>
            </div>
            <div>
              <h3 className="font-quicksand font-bold text-xl text-[#1b1c1a]">
                Message {user.name}
              </h3>
              <p className="text-xs text-[#877462]">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#f5f2ec] text-[#877462] cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {sent ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#dcfce7] text-[#15803d] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">check</span>
            </div>
            <h4 className="font-bold text-[#1b1c1a]">Message Sent Successfully</h4>
            <p className="text-xs text-[#877462]">Dispatched to {user.email} and push notification.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[#544434] mb-1">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2.5 bg-[#faf8f5] border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:border-[#ff9f1c]"
              />
            </div>

            <div>
              <label className="block text-[#544434] mb-1">Message Content</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your official administrative message or notice here..."
                className="w-full p-2.5 bg-[#faf8f5] border border-[#d8d1c7] rounded-xl text-sm text-[#1b1c1a] focus:outline-none focus:border-[#ff9f1c]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#efeeea]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#d8d1c7] text-[#544434] hover:bg-[#f5f2ec] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#895100] hover:bg-[#683c00] text-white font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Send Message</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

interface VerificationReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ProviderVerification | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const VerificationReviewModal: React.FC<VerificationReviewModalProps> = ({
  isOpen,
  onClose,
  item,
  onApprove,
  onReject
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#efeeea] space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full ${item.avatarBg} font-bold flex items-center justify-center text-sm shadow-xs`}
            >
              {item.initials}
            </div>
            <div>
              <h3 className="font-quicksand font-bold text-xl text-[#1b1c1a]">{item.name}</h3>
              <p className="text-xs text-[#877462]">{item.service} Provider</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#f5f2ec] text-[#877462] cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#efeeea] space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-[#877462]">Verification ID:</span>
            <span className="font-mono font-bold text-[#1b1c1a]">{item.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#877462]">Identity Proof:</span>
            <span className="font-bold text-[#15803d] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Aadhaar / Govt ID Verified
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#877462]">Certifications:</span>
            <span className="font-bold text-[#1b1c1a]">Pet First Aid &amp; Background Check</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#877462]">Status:</span>
            <span className="font-bold px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e]">
              {item.status}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => {
              onReject(item.id);
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl border border-[#fee2e2] text-[#b91c1c] hover:bg-[#fff5f5] font-bold text-xs cursor-pointer"
          >
            Reject
          </button>
          <button
            onClick={() => {
              onApprove(item.id);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            Approve Provider
          </button>
        </div>
      </div>
    </div>
  );
};
