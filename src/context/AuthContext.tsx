import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, ShippingAddress } from '../types';
import { api } from '../services/api';

interface AuthResponse {
  success: boolean;
  message: string;
  isMongo?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isMongoActive: boolean;
  mongoDatabase: string | null;
  mongoStatusMessage: string;
  login: (email: string, password?: string) => Promise<AuthResponse>;
  register: (name: string, email: string, mobile: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  addAddress: (address: Omit<ShippingAddress, 'id'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<ShippingAddress>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  refreshMongoStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('velnix_user');
    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser) as UserProfile;
    } catch {
      localStorage.removeItem('velnix_user');
      return null;
    }
  });

  const [isMongoActive, setIsMongoActive] = useState<boolean>(false);
  const [mongoDatabase, setMongoDatabase] = useState<string | null>(null);
  const [mongoStatusMessage, setMongoStatusMessage] = useState<string>('Checking database...');

  // Check MongoDB connection status on startup
  const checkDb = useCallback(async () => {
    try {
      const res = await api.getAuthStatus();
      if (res.connected) {
        setIsMongoActive(true);
        setMongoDatabase(res.database || 'velnix');
        setMongoStatusMessage(res.message || 'Connected to MongoDB cluster');
      } else {
        setIsMongoActive(false);
        setMongoDatabase(null);
        setMongoStatusMessage(res.message || 'MongoDB is not connected');
      }
    } catch {
      setIsMongoActive(false);
      setMongoStatusMessage('Backend auth service active');
    }
  }, []);

  useEffect(() => {
    checkDb();
  }, [checkDb]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('velnix_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('velnix_user');
    }
  }, [user]);

  /**
   * Login using MongoDB API
   */
  const login = async (email: string, password = 'password123'): Promise<AuthResponse> => {
    try {
      const res = await api.loginUser({ email, password });
      if (res.success && res.user) {
        const loggedUser: UserProfile = {
          name: res.user.name || email.split('@')[0],
          email: res.user.email,
          mobile: res.user.mobile || '+91 98765 43210',
          role: res.user.role || 'customer',
          avatarUrl: res.user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(res.user.name || email)}&backgroundColor=381219&textColor=f5efe6`,
          addresses: res.user.addresses || [],
        };
        setUser(loggedUser);
        return {
          success: true,
          message: res.message || 'Signed in successfully',
          isMongo: res.isMongo,
        };
      }
      return {
        success: false,
        message: res.message || 'Invalid email or password',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Server connection error during login',
      };
    }
  };

  /**
   * Register using MongoDB API
   */
  const register = async (name: string, email: string, mobile: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await api.registerUser({ name, email, mobile, password });
      if (res.success && res.user) {
        const newUser: UserProfile = {
          name: res.user.name,
          email: res.user.email,
          mobile: res.user.mobile,
          role: res.user.role || 'customer',
          avatarUrl: res.user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=381219&textColor=f5efe6`,
          addresses: res.user.addresses || [],
        };
        setUser(newUser);
        return {
          success: true,
          message: res.message || 'Account registered successfully in MongoDB',
          isMongo: res.isMongo,
        };
      }
      return {
        success: false,
        message: res.message || 'Registration failed. Please try again.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Network error during registration',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('velnix_user');
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    if (!user) return;
    const nextUser = { ...user, ...updated };
    setUser(nextUser);
    try {
      await api.updateUserProfile({
        email: user.email,
        name: updated.name,
        mobile: updated.mobile,
        avatarUrl: updated.avatarUrl,
      });
    } catch (err) {
      console.warn('Failed to sync profile update to MongoDB:', err);
    }
  };

  const addAddress = async (newAddr: Omit<ShippingAddress, 'id'>) => {
    if (!user) return;
    const id = `addr-${Date.now()}`;
    const isFirst = user.addresses.length === 0;
    const addressWithId: ShippingAddress = {
      ...newAddr,
      id,
      isDefault: isFirst || newAddr.isDefault,
    };

    let updatedList = [...user.addresses];
    if (addressWithId.isDefault) {
      updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
    }
    updatedList.push(addressWithId);

    setUser({ ...user, addresses: updatedList });

    try {
      await api.saveUserAddress({
        email: user.email,
        address: newAddr,
      });
    } catch (err) {
      console.warn('Failed to sync address to MongoDB:', err);
    }
  };

  const updateAddress = (id: string, partial: Partial<ShippingAddress>) => {
    if (!user) return;
    let updatedList = user.addresses.map((a) => (a.id === id ? { ...a, ...partial } : a));
    if (partial.isDefault) {
      updatedList = updatedList.map((a) => (a.id === id ? a : { ...a, isDefault: false }));
    }
    setUser({ ...user, addresses: updatedList });
  };

  const deleteAddress = (id: string) => {
    if (!user) return;
    const updatedList = user.addresses.filter((a) => a.id !== id);
    if (updatedList.length > 0 && !updatedList.some((a) => a.isDefault)) {
      updatedList[0].isDefault = true;
    }
    setUser({ ...user, addresses: updatedList });
  };

  const setDefaultAddress = (id: string) => {
    if (!user) return;
    const updatedList = user.addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setUser({ ...user, addresses: updatedList });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isMongoActive,
        mongoDatabase,
        mongoStatusMessage,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        refreshMongoStatus: checkDb,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
