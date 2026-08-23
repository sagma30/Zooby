import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminDashboardView } from './AdminDashboardView';
import { AdminUsersListView } from './AdminUsersListView';
import { AdminUserDetailView } from './AdminUserDetailView';
import {
  AddUserModal,
  EditUserModal,
  AdminMessageModal,
  VerificationReviewModal
} from './AdminModals';
import { AdminPaymentsView } from './AdminPaymentsView';
import { INITIAL_ADMIN_USERS } from '../../data/adminMockData';
import { AdminUser, ProviderVerification, PaymentRecord } from '../../types';

interface AdminPortalProps {
  initialTab?: string;
  payments?: PaymentRecord[];
  onUpdatePayment?: (payment: PaymentRecord) => void;
  onExitAdmin: () => void;
  onNavigate?: (path: string) => void;
  onSignOut?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  initialTab = 'dashboard',
  payments = [],
  onUpdatePayment,
  onExitAdmin,
  onNavigate,
  onSignOut
}) => {
  const [currentTab, setCurrentTab] = useState<string>(initialTab); // defaults to dashboard or users
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(INITIAL_ADMIN_USERS[0]); // default to Aditi Sharma for detail view inspection
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AdminUser | null>(null);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [userToMessage, setUserToMessage] = useState<AdminUser | null>(null);
  const [verificationToReview, setVerificationToReview] = useState<ProviderVerification | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSelectUser = (user: AdminUser) => {
    setSelectedUser(user);
    setCurrentTab('user-detail');
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'Suspended' ? 'Active' : 'Suspended';
          showToast(`User ${u.name} is now ${nextStatus}`);
          return {
            ...u,
            status: nextStatus,
            activityTimeline: [
              {
                id: `tl-${Date.now()}`,
                title: `Account Status Changed to ${nextStatus}`,
                description: `Admin updated account status to ${nextStatus}.`,
                timestamp: 'Just now',
                type: 'system'
              },
              ...u.activityTimeline
            ]
          };
        }
        return u;
      })
    );

    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser((prev) =>
        prev
          ? {
              ...prev,
              status: prev.status === 'Suspended' ? 'Active' : 'Suspended'
            }
          : null
      );
    }
  };

  const handleSaveNewUser = (newUserPartial: Partial<AdminUser>) => {
    const id = `USR-${Math.floor(1000 + Math.random() * 9000)}-${newUserPartial.name?.[0]?.toUpperCase() || 'N'}`;
    const completeUser: AdminUser = {
      id,
      name: newUserPartial.name || 'New User',
      email: newUserPartial.email || 'user@example.com',
      phone: newUserPartial.phone || '+91 98000 00000',
      role: newUserPartial.role || 'PET_PARENT',
      avatarUrl: newUserPartial.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=240',
      location: newUserPartial.location || 'Nashik',
      primaryAddress: newUserPartial.primaryAddress || 'Nashik, Maharashtra',
      joinedDate: 'Just now',
      status: newUserPartial.status || 'Active',
      paymentMethod: newUserPartial.paymentMethod || { brand: 'Visa', last4: '1234', expiry: '12/28' },
      pets: [],
      recentBookings: [],
      activityTimeline: newUserPartial.activityTimeline || []
    };

    setUsers([completeUser, ...users]);
    showToast(`Added user ${completeUser.name} (#${completeUser.id})`);
  };

  const handleSaveEditedUser = (updated: AdminUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (selectedUser?.id === updated.id) {
      setSelectedUser(updated);
    }
    showToast(`Updated user ${updated.name}`);
  };

  const handleSendMessage = (text: string) => {
    if (userToMessage) {
      showToast(`Administrative message dispatched to ${userToMessage.name}`);
    }
  };

  const handleApproveProvider = (id: string) => {
    showToast(`Provider verification #${id} approved successfully!`);
  };

  const handleRejectProvider = (id: string) => {
    showToast(`Provider verification #${id} rejected.`);
  };

  // Determine Title for Top Bar
  const getHeaderTitle = () => {
    if (currentTab === 'dashboard') return 'Zooby Dashboard';
    if (currentTab === 'users' || currentTab === 'user-detail') return 'Zooby Portal';
    if (currentTab === 'pets') return 'Pet Registry';
    if (currentTab === 'providers') return 'Verified Providers';
    if (currentTab === 'bookings') return 'Platform Bookings';
    if (currentTab === 'analytics') return 'Analytics & Insights';
    if (currentTab === 'settings') return 'Admin Settings';
    return 'Zooby Portal';
  };

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    if (onNavigate) {
      onNavigate(`/admin/${tab}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] flex text-[#1b1c1a] font-jakarta selection:bg-[#ffdcbc]">
      {/* Desktop Sticky Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          onExitAdmin={onExitAdmin}
          onSignOut={onSignOut}
          onVerifyProvidersClick={() => handleSelectTab('providers')}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-[#fbf9f5] h-full shadow-2xl z-10 flex flex-col">
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#f3eee7]"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <AdminSidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                handleSelectTab(tab);
                setIsMobileMenuOpen(false);
              }}
              onExitAdmin={onExitAdmin}
              onSignOut={onSignOut}
              onVerifyProvidersClick={() => {
                handleSelectTab('providers');
                setIsMobileMenuOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <AdminHeader
          title={getHeaderTitle()}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder={
            currentTab === 'dashboard'
              ? 'Search...'
              : 'Search users, pets, bookings...'
          }
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onExitAdmin={onExitAdmin}
        />

        {/* Tab Switcher Body */}
        <main className="flex-grow pb-16">
          {currentTab === 'dashboard' && (
            <AdminDashboardView
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenVerificationReview={(v) => setVerificationToReview(v)}
            />
          )}

          {currentTab === 'users' && (
            <AdminUsersListView
              users={users}
              onSelectUser={handleSelectUser}
              onOpenAddUser={() => setIsAddUserOpen(true)}
              onToggleUserStatus={handleToggleUserStatus}
            />
          )}

          {currentTab === 'user-detail' && selectedUser && (
            <AdminUserDetailView
              user={selectedUser}
              onBack={() => setCurrentTab('users')}
              onEditUser={(u) => {
                setUserToEdit(u);
                setIsEditUserOpen(true);
              }}
              onSendMessage={(u) => {
                setUserToMessage(u);
                setIsMessageOpen(true);
              }}
              onToggleSuspend={handleToggleUserStatus}
            />
          )}

          {/* Additional Admin Sections (Pets, Providers, Bookings, Analytics, etc.) */}
          {['pets', 'providers', 'bookings', 'payments', 'insurance', 'reviews', 'complaints', 'analytics', 'settings'].includes(
            currentTab
          ) && (
            <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-quicksand font-bold text-2xl text-[#1b1c1a] capitalize">
                    {currentTab} Management
                  </h2>
                  <p className="text-xs text-[#877462]">
                    Super Administrator dashboard controls for platform {currentTab}.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('users')}
                  className="py-2 px-4 rounded-xl bg-[#f4ebd9] text-[#895100] text-xs font-bold hover:bg-[#ebdcc4] transition-colors cursor-pointer"
                >
                  Go to Users Overview
                </button>
              </div>

              {currentTab === 'providers' && (
                <div className="bg-white rounded-2xl p-6 border border-[#efeeea] shadow-2xs space-y-4">
                  <h3 className="font-bold text-base text-[#1b1c1a]">Pending Provider Approvals</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-[#fee2e2] bg-[#fff5f5] flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[#1b1c1a]">Jane Doe</h4>
                        <p className="text-xs text-[#877462]">Dog Walking • Background Check Pending</p>
                      </div>
                      <button
                        onClick={() =>
                          setVerificationToReview({
                            id: 'v-1',
                            name: 'Jane Doe',
                            initials: 'JD',
                            service: 'Dog Walking',
                            status: 'Pending',
                            avatarBg: 'bg-[#d2f4d3] text-[#1c6422]'
                          })
                        }
                        className="py-1 px-3 bg-[#f59e0b] text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Review
                      </button>
                    </div>

                    <div className="p-4 rounded-xl border border-[#fee2e2] bg-[#fff5f5] flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[#1b1c1a]">Mark Smith</h4>
                        <p className="text-xs text-[#877462]">Grooming • Certification Review</p>
                      </div>
                      <button
                        onClick={() =>
                          setVerificationToReview({
                            id: 'v-2',
                            name: 'Mark Smith',
                            initials: 'MS',
                            service: 'Grooming',
                            status: 'Reviewing',
                            avatarBg: 'bg-[#e2dcfe] text-[#4b35b6]'
                          })
                        }
                        className="py-1 px-3 bg-[#f59e0b] text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'pets' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {users
                    .flatMap((u) => u.pets || [])
                    .filter(Boolean)
                    .map((pet) => (
                      <div
                        key={pet.id}
                        className="bg-white rounded-2xl p-4 border border-[#efeeea] flex items-center gap-3 shadow-2xs"
                      >
                        <img
                          src={pet.avatarUrl}
                          alt={pet?.name || 'Pet'}
                          className="w-12 h-12 rounded-full object-cover border"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-[#1b1c1a]">{pet?.name || 'Pet'}</h4>
                          <p className="text-xs text-[#877462]">
                            {pet.breed} • {pet.age}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {currentTab === 'payments' && (
                <AdminPaymentsView
                  payments={payments}
                  onUpdatePayment={onUpdatePayment}
                />
              )}

              {['bookings', 'insurance', 'reviews', 'complaints', 'analytics', 'settings'].includes(
                currentTab
              ) && (
                <div className="bg-white rounded-2xl p-8 border border-[#efeeea] text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#f4ebd9] text-[#895100] flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-3xl">insights</span>
                  </div>
                  <h3 className="font-bold text-lg text-[#1b1c1a] capitalize">
                    {currentTab} Hub
                  </h3>
                  <p className="text-xs text-[#877462] max-w-md mx-auto">
                    Real-time telemetry and auditing for {currentTab} is actively aggregated and synchronized with Zooby microservices.
                  </p>
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className="mt-2 py-2 px-5 rounded-full bg-[#895100] text-white font-bold text-xs shadow-2xs hover:bg-[#683c00] cursor-pointer"
                  >
                    Return to Main Dashboard
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1b1c1a] text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-[18px] text-[#22c55e]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onSave={handleSaveNewUser}
      />

      <EditUserModal
        isOpen={isEditUserOpen}
        onClose={() => {
          setIsEditUserOpen(false);
          setUserToEdit(null);
        }}
        user={userToEdit}
        onSave={handleSaveEditedUser}
      />

      <AdminMessageModal
        isOpen={isMessageOpen}
        onClose={() => {
          setIsMessageOpen(false);
          setUserToMessage(null);
        }}
        user={userToMessage}
        onSend={handleSendMessage}
      />

      <VerificationReviewModal
        isOpen={!!verificationToReview}
        onClose={() => setVerificationToReview(null)}
        item={verificationToReview}
        onApprove={handleApproveProvider}
        onReject={handleRejectProvider}
      />
    </div>
  );
};
