import React, { useState } from 'react';
import { AdminUser } from '../../types';

interface AdminUsersListViewProps {
  users?: AdminUser[];
  onSelectUser: (user: AdminUser) => void;
  onOpenAddUser: () => void;
  onToggleUserStatus: (userId: string) => void;
}

export const AdminUsersListView: React.FC<AdminUsersListViewProps> = ({
  users = [],
  onSelectUser,
  onOpenAddUser,
  onToggleUserStatus
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'suspended' | 'new'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter users based on tab & search query
  const safeUsers = users || [];
  const filteredUsers = safeUsers.filter((u) => {
    const matchesFilter =
      filterTab === 'all'
        ? true
        : filterTab === 'active'
        ? u.status === 'Active'
        : filterTab === 'suspended'
        ? u.status === 'Suspended'
        : u.status === 'New';

    const matchesSearch =
      searchQuery === '' ||
      (u?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u?.phone || '').includes(searchQuery) ||
      (u?.location || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalUsersCount = 12450;
  const activeUsersCount = 11200;
  const newUsersCount = 850;
  const suspendedUsersCount = 42;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-jakarta">
      {/* Header with Title & Add User Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-quicksand font-bold text-2xl md:text-3xl text-[#1b1c1a] tracking-tight">
            User Management
          </h2>
          <p className="text-sm text-[#705e4f] mt-1">
            Manage pet parents, view profiles, and handle account statuses.
          </p>
        </div>

        <button
          onClick={onOpenAddUser}
          className="self-start sm:self-auto py-2.5 px-5 rounded-full bg-[#895100] hover:bg-[#683c00] text-white font-bold text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add User</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: TOTAL USERS */}
        <div className="bg-white rounded-2xl p-5 border border-[#efeeea] shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#e0edff] text-[#2563eb] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">group</span>
            </div>
            <span className="text-xs font-bold text-[#877462] uppercase tracking-wider">
              TOTAL USERS
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#1b1c1a] tracking-tight">
            {totalUsersCount.toLocaleString()}
          </div>
        </div>

        {/* Metric 2: ACTIVE USERS */}
        <div className="bg-white rounded-2xl p-5 border border-[#efeeea] shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#dcfce7] text-[#15803d] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">person_check</span>
            </div>
            <span className="text-xs font-bold text-[#877462] uppercase tracking-wider">
              ACTIVE USERS
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1b1c1a] tracking-tight">
              {activeUsersCount.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-[#15803d]">(90%)</span>
          </div>
        </div>

        {/* Metric 3: NEW THIS MONTH */}
        <div className="bg-white rounded-2xl p-5 border border-[#efeeea] shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ffedd5] text-[#c2410c] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </div>
            <span className="text-xs font-bold text-[#877462] uppercase tracking-wider">
              NEW THIS MONTH
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#1b1c1a] tracking-tight">
            {newUsersCount}
          </div>
        </div>

        {/* Metric 4: SUSPENDED */}
        <div className="bg-white rounded-2xl p-5 border border-[#efeeea] shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#fee2e2] text-[#b91c1c] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">block</span>
            </div>
            <span className="text-xs font-bold text-[#877462] uppercase tracking-wider">
              SUSPENDED
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#1b1c1a] tracking-tight">
            {suspendedUsersCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'all'
                ? 'bg-[#f59e0b] text-white shadow-2xs'
                : 'bg-white text-[#544434] border border-[#d8d1c7] hover:bg-[#f5f2ec]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterTab('active')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'active'
                ? 'bg-[#f59e0b] text-white shadow-2xs'
                : 'bg-white text-[#544434] border border-[#d8d1c7] hover:bg-[#f5f2ec]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterTab('suspended')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'suspended'
                ? 'bg-[#f59e0b] text-white shadow-2xs'
                : 'bg-white text-[#544434] border border-[#d8d1c7] hover:bg-[#f5f2ec]'
            }`}
          >
            Suspended
          </button>
          <button
            onClick={() => setFilterTab('new')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'new'
                ? 'bg-[#f59e0b] text-white shadow-2xs'
                : 'bg-white text-[#544434] border border-[#d8d1c7] hover:bg-[#f5f2ec]'
            }`}
          >
            New Users
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#877462]">
            <span className="material-symbols-outlined text-[19px]">search</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, phone..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#d8d1c7] rounded-xl text-xs md:text-sm text-[#1b1c1a] placeholder-[#877462] focus:outline-none focus:border-[#ff9f1c] focus:ring-2 focus:ring-[#ff9f1c]/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#877462]"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#efeeea] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#faf8f5] text-[#877462] border-b border-[#efeeea]">
                <th className="py-3.5 px-6 font-bold uppercase tracking-wider">USER</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider">CONTACT INFO</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider">PETS</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider">LOCATION</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider">JOINED DATE</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider">STATUS</th>
                <th className="py-3.5 px-6 font-bold uppercase tracking-wider text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f2ec]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#877462]">
                    <div className="w-12 h-12 rounded-full bg-[#f5f2ec] text-[#877462] flex items-center justify-center mx-auto mb-2">
                      <span className="material-symbols-outlined text-2xl">search_off</span>
                    </div>
                    <p className="font-bold text-sm text-[#1b1c1a]">No users found</p>
                    <p className="text-xs mt-0.5">Try searching with a different keyword or filter.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => onSelectUser(user)}
                    className="hover:bg-[#fbf9f5] transition-colors cursor-pointer group"
                  >
                    {/* User */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-[#e5dfd5] shrink-0">
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[#1b1c1a] group-hover:text-[#895100] transition-colors">
                            {user.name}
                          </div>
                          <div className="text-[11px] text-[#877462] font-mono">#{user.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-4 px-4">
                      <div className="font-medium text-[#1b1c1a]">{user.email}</div>
                      <div className="text-[11px] text-[#877462] mt-0.5">{user.phone}</div>
                    </td>

                    {/* Pets */}
                    <td className="py-4 px-4">
                      {user.pets && user.pets.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 overflow-hidden">
                            {user.pets.map((p) => (
                              <img
                                key={p.id}
                                src={p.avatarUrl}
                                alt={p?.name || 'Pet'}
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                              />
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-[#544434]">
                            {user.pets.length} ({user.pets.map((p) => p?.name || 'Pet').join(', ')})
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[#877462] italic">
                          <span className="material-symbols-outlined text-[14px]">info</span>
                          <span>0 (No pets added)</span>
                        </div>
                      )}
                    </td>

                    {/* Location */}
                    <td className="py-4 px-4 font-semibold text-[#1b1c1a]">{user.location}</td>

                    {/* Joined Date */}
                    <td className="py-4 px-4 text-[#705e4f]">{user.joinedDate}</td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          user.status === 'Active'
                            ? 'bg-[#dcfce7] text-[#15803d]'
                            : user.status === 'New'
                            ? 'bg-[#ede9fe] text-[#7c3aed]'
                            : 'bg-[#fee2e2] text-[#b91c1c]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'Active'
                              ? 'bg-[#15803d]'
                              : user.status === 'New'
                              ? 'bg-[#7c3aed]'
                              : 'bg-[#b91c1c]'
                          }`}
                        />
                        {user.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div
                        className="flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onSelectUser(user)}
                          className="p-1.5 rounded-lg text-[#877462] hover:text-[#895100] hover:bg-[#f5f2ec] transition-colors cursor-pointer"
                          title="View Profile"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            visibility
                          </span>
                        </button>

                        <button
                          onClick={() => onToggleUserStatus(user.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            user.status === 'Suspended'
                              ? 'text-[#15803d] hover:bg-[#dcfce7]'
                              : 'text-[#b91c1c] hover:bg-[#fee2e2]'
                          }`}
                          title={user.status === 'Suspended' ? 'Activate Account' : 'Suspend Account'}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {user.status === 'Suspended' ? 'check_circle' : 'block'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 sm:px-6 border-t border-[#efeeea] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#877462]">
          <div>
            Showing <span className="font-bold text-[#1b1c1a]">1–{filteredUsers.length}</span> of{' '}
            <span className="font-bold text-[#1b1c1a]">{totalUsersCount.toLocaleString()}</span> users
          </div>

          <div className="flex items-center gap-1 self-center sm:self-auto">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg border border-[#e5dfd5] flex items-center justify-center hover:bg-[#f5f2ec] disabled:opacity-40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>

            <button className="w-8 h-8 rounded-lg bg-[#895100] text-white font-bold flex items-center justify-center">
              1
            </button>
            <button className="w-8 h-8 rounded-lg hover:bg-[#f5f2ec] font-semibold flex items-center justify-center">
              2
            </button>
            <button className="w-8 h-8 rounded-lg hover:bg-[#f5f2ec] font-semibold flex items-center justify-center">
              3
            </button>
            <span className="px-1 text-[#877462]">...</span>
            <button className="w-9 h-8 rounded-lg hover:bg-[#f5f2ec] font-semibold flex items-center justify-center">
              1245
            </button>

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="w-8 h-8 rounded-lg border border-[#e5dfd5] flex items-center justify-center hover:bg-[#f5f2ec] cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
