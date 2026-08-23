import React from 'react';
import { AdminUser } from '../../types';

interface AdminUserDetailViewProps {
  user: AdminUser;
  onBack: () => void;
  onEditUser: (user: AdminUser) => void;
  onSendMessage: (user: AdminUser) => void;
  onToggleSuspend: (userId: string) => void;
}

export const AdminUserDetailView: React.FC<AdminUserDetailViewProps> = ({
  user,
  onBack,
  onEditUser,
  onSendMessage,
  onToggleSuspend
}) => {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-jakarta">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#895100] hover:text-[#683c00] transition-colors cursor-pointer group"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          <span>Back to Users</span>
        </button>
      </div>

      {/* User Hero Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#efeeea] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Avatar with Verified Checkmark */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-3 border-white shadow-md">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#15803d] text-white flex items-center justify-center ring-2 ring-white shadow-xs">
              <span className="material-symbols-outlined text-[15px] font-bold">check</span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-quicksand font-bold text-2xl md:text-3xl text-[#1b1c1a] tracking-tight">
                {user.name}
              </h2>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                  user.status === 'Active'
                    ? 'bg-[#dcfce7] text-[#15803d]'
                    : user.status === 'New'
                    ? 'bg-[#ede9fe] text-[#7c3aed]'
                    : 'bg-[#fee2e2] text-[#b91c1c]'
                }`}
              >
                {user.status}
              </span>
            </div>

            <p className="text-xs md:text-sm font-semibold text-[#877462]">
              User ID: <span className="font-mono text-[#544434]">#{user.id}</span>
            </p>

            <p className="text-xs text-[#877462] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">calendar_today</span>
              <span>Joined {user.joinedDate}</span>
            </p>
          </div>
        </div>

        {/* Hero Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onEditUser(user)}
            className="py-2.5 px-4 rounded-full border border-[#27477d] text-[#27477d] hover:bg-[#eaf1ff] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            <span>Edit Account</span>
          </button>

          <button
            onClick={() => onSendMessage(user)}
            className="py-2.5 px-4 rounded-full border border-[#27477d] text-[#27477d] hover:bg-[#eaf1ff] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
            <span>Message</span>
          </button>

          <button
            onClick={() => onToggleSuspend(user.id)}
            className={`py-2.5 px-4 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              user.status === 'Suspended'
                ? 'border-[#15803d] text-[#15803d] hover:bg-[#dcfce7]/60'
                : 'border-[#b91c1c] text-[#b91c1c] hover:bg-[#fee2e2]/60'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {user.status === 'Suspended' ? 'check_circle' : 'block'}
            </span>
            <span>{user.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact Info & Pets */}
        <div className="space-y-6">
          {/* Contact Info Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#efeeea] shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-[#895100]">
              <span className="material-symbols-outlined text-xl">contact_page</span>
              <h3 className="font-bold text-base text-[#1b1c1a]">Contact Info</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-[#877462] font-semibold block mb-0.5">Email Address</span>
                <span className="font-bold text-sm text-[#1b1c1a] break-all">{user.email}</span>
              </div>

              <div>
                <span className="text-[#877462] font-semibold block mb-0.5">Phone Number</span>
                <span className="font-bold text-sm text-[#1b1c1a]">{user.phone}</span>
              </div>

              <div>
                <span className="text-[#877462] font-semibold block mb-0.5">Primary Address</span>
                <span className="font-medium text-xs text-[#544434] leading-relaxed block">
                  {user.primaryAddress}
                </span>
              </div>

              <div>
                <span className="text-[#877462] font-semibold block mb-1">Payment Method</span>
                <div className="p-3 rounded-xl bg-[#faf8f5] border border-[#efeeea] flex items-center gap-3">
                  <div className="w-8 h-6 rounded bg-[#2563eb] text-white flex items-center justify-center text-[10px] font-bold">
                    {user.paymentMethod.brand}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#1b1c1a]">
                      {user.paymentMethod.brand} ending in {user.paymentMethod.last4}
                    </div>
                    <div className="text-[10px] text-[#877462]">
                      Expires {user.paymentMethod.expiry}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pets Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#efeeea] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#895100]">
                <span className="material-symbols-outlined text-xl filled-icon">pets</span>
                <h3 className="font-bold text-base text-[#1b1c1a]">Pets</h3>
              </div>
              <span className="w-6 h-6 rounded-full bg-[#f4ebd9] text-[#895100] text-xs font-bold flex items-center justify-center">
                {(user.pets || []).length}
              </span>
            </div>

            <div className="space-y-3">
              {(user.pets || []).length === 0 ? (
                <div className="text-center py-4 text-xs text-[#877462]">
                  No pets registered to this profile yet.
                </div>
              ) : (
                (user.pets || []).map((pet) => (
                  <div
                    key={pet.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#faf8f5] transition-colors border border-transparent hover:border-[#efeeea]"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-[#efeeea] shrink-0">
                      <img
                        src={pet.avatarUrl}
                        alt={pet?.name || 'Pet'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1b1c1a]">{pet?.name || 'Pet'}</h4>
                      <p className="text-xs text-[#877462]">
                        {pet.breed} • {pet.age}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Bookings & Activity Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Bookings Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#efeeea] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#895100]">
                <span className="material-symbols-outlined text-xl">calendar_month</span>
                <h3 className="font-bold text-base text-[#1b1c1a]">Recent Bookings</h3>
              </div>
              <span className="text-xs font-bold text-[#895100] hover:underline cursor-pointer">
                View All
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[#877462] border-b border-[#efeeea]">
                    <th className="pb-3 font-bold">Service</th>
                    <th className="pb-3 font-bold">Provider</th>
                    <th className="pb-3 font-bold">Date</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f2ec]">
                  {user.recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-[#877462]">
                        No recent booking transactions found.
                      </td>
                    </tr>
                  ) : (
                    user.recentBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-[#faf8f5] transition-colors">
                        <td className="py-3.5 font-bold text-[#1b1c1a]">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#fef3c7] text-[#b45309] flex items-center justify-center text-[13px] shrink-0">
                              <span className="material-symbols-outlined text-[14px]">
                                {b.service.toLowerCase().includes('walk')
                                  ? 'directions_walk'
                                  : b.service.toLowerCase().includes('vet')
                                  ? 'medical_services'
                                  : 'content_cut'}
                              </span>
                            </span>
                            <span>{b.service}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-[#544434] font-medium">{b.provider}</td>
                        <td className="py-3.5 text-[#877462]">{b.date}</td>
                        <td className="py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              b.status === 'Completed'
                                ? 'bg-[#dcfce7] text-[#15803d]'
                                : b.status === 'Confirmed'
                                ? 'bg-[#e0edff] text-[#2563eb]'
                                : b.status === 'Cancelled'
                                ? 'bg-[#fee2e2] text-[#b91c1c]'
                                : 'bg-[#fef3c7] text-[#92400e]'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 font-bold text-right text-[#1b1c1a]">
                          ₹{b.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Timeline Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#efeeea] shadow-2xs space-y-5">
            <div className="flex items-center gap-2 text-[#895100]">
              <span className="material-symbols-outlined text-xl">history</span>
              <h3 className="font-bold text-base text-[#1b1c1a]">Activity Timeline</h3>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e8e2d8]">
              {user.activityTimeline.map((item) => (
                <div key={item.id} className="relative group">
                  {/* Icon Node */}
                  <div
                    className={`absolute -left-[30px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${
                      item.type === 'login'
                        ? 'bg-[#ffedd5] text-[#c2410c]'
                        : item.type === 'profile'
                        ? 'bg-[#dcfce7] text-[#15803d]'
                        : item.type === 'pet'
                        ? 'bg-[#ede9fe] text-[#7c3aed]'
                        : 'bg-[#fee2e2] text-[#b91c1c]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {item.type === 'login'
                        ? 'login'
                        : item.type === 'profile'
                        ? 'edit_note'
                        : item.type === 'pet'
                        ? 'pets'
                        : 'warning'}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#efeeea] space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-[#1b1c1a]">{item.title}</h4>
                      <span className="text-[10px] font-semibold text-[#877462]">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-[#544434] leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
