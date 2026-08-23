import React, { createContext, useContext, useState, useEffect } from 'react';
import { ServiceCategory, UserProfile, UserRole } from '../types';
import { DEMO_USERS, findUserByCredentials } from '../data/authDemoData';

interface SignupPayload {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  businessName?: string;
  serviceCategory?: ServiceCategory;
  assignedVanPlate?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  userId: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrPhone: string, password?: string) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  loginDemo: (role: UserRole) => Promise<UserProfile>;
  signup: (details: SignupPayload) => Promise<UserProfile>;
  logout: (redirectPath?: string) => void;
  updateUserProfile: (updated: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'zooby_auth_session_v4';
const REGISTERED_ACCOUNTS_KEY = 'zooby_registered_accounts';

export const AuthProvider: React.FC<{ children: React.ReactNode; onNavigate?: (path: string) => void }> = ({
  children,
  onNavigate
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth from localStorage on boot
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.role) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to parse saved auth session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save session when user changes
  const saveSession = (newUser: UserProfile | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  /**
   * Unified Login:
   * Accepts email or phone and password, automatically resolves the user record and role.
   */
  const login = async (emailOrPhone: string, _password?: string): Promise<UserProfile> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 350));

    // Automatic role detection from credentials lookup
    const resolvedUser = findUserByCredentials(emailOrPhone);

    if (!resolvedUser) {
      setIsLoading(false);
      throw new Error('User not found. Please check your credentials or register.');
    }

    saveSession(resolvedUser);
    setIsLoading(false);
    return resolvedUser;
  };

  /**
   * Google OAuth simulation
   */
  const loginWithGoogle = async (): Promise<UserProfile> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 400));

    const googleUser: UserProfile = {
      id: `usr-google-${Date.now()}`,
      name: 'Aisha Sharma',
      email: 'aisha.sharma@gmail.com',
      phone: '+91 98220 11223',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=160',
      location: 'Gangapur Road, Nashik',
      role: 'PET_PARENT',
      joinedDate: 'Today via Google'
    };

    saveSession(googleUser);
    setIsLoading(false);
    return googleUser;
  };

  const loginDemo = async (targetRole: UserRole): Promise<UserProfile> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 250));
    const demo = DEMO_USERS[targetRole].user;
    saveSession(demo);
    setIsLoading(false);
    return demo;
  };

  /**
   * Account Registration
   */
  const signup = async (details: SignupPayload): Promise<UserProfile> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 400));

    const assignedRole: UserRole = details.role || 'PET_PARENT';

    let avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=160';
    if (assignedRole === 'PROVIDER') {
      avatar = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=240';
    } else if (assignedRole === 'RESCUE_PARTNER') {
      avatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=240';
    } else if (assignedRole === 'VAN_WORKER') {
      avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=240';
    }

    const newUser: UserProfile = {
      id: `usr-${assignedRole.toLowerCase()}-${Date.now()}`,
      name: details.name,
      email: details.email,
      phone: details.phone || '+91 98220 00000',
      avatarUrl: avatar,
      location: 'Nashik, Maharashtra',
      role: assignedRole,
      businessName: details.businessName,
      serviceCategory: details.serviceCategory,
      assignedVanPlate: details.assignedVanPlate || (assignedRole === 'VAN_WORKER' ? 'MH 15 ZB 4022' : undefined),
      isVerified: assignedRole === 'PET_PARENT' || assignedRole === 'VAN_WORKER',
      joinedDate: 'Today'
    };

    // Save to persistent registered accounts
    try {
      const stored = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
      const accounts: UserProfile[] = stored ? JSON.parse(stored) : [];
      const updated = accounts.filter((a) => a.email !== newUser.email);
      updated.push(newUser);
      localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save registered account:', e);
    }

    saveSession(newUser);
    setIsLoading(false);
    return newUser;
  };

  const logout = (redirectPath?: string) => {
    saveSession(null);
    if (onNavigate && redirectPath) {
      onNavigate(redirectPath);
    } else if (onNavigate) {
      onNavigate('/');
    }
  };

  const updateUserProfile = (updated: Partial<UserProfile>) => {
    if (!user) return;
    const nextUser = { ...user, ...updated };
    saveSession(nextUser);

    // Also sync with registered accounts if present
    try {
      const stored = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
      if (stored) {
        const accounts: UserProfile[] = JSON.parse(stored);
        const updatedAccounts = accounts.map((acc) => (acc.id === nextUser.id || acc.email === nextUser.email ? nextUser : acc));
        localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(updatedAccounts));
      }
    } catch (err) {
      console.error('Failed to sync updated profile to registered accounts:', err);
    }
  };

  const value: AuthContextType = {
    user,
    userId: user?.id || null,
    role: user?.role || null,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    loginDemo,
    signup,
    logout,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


