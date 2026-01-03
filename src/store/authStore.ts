import { create } from 'zustand';
import { api } from '../services/api';
import { authService } from '../services/auth';
import { userService } from '../services/user';
import type { User, KycStatusResponse, TransactionLimitInfo } from '../types/api';

interface AuthState {
  user: User | null;
  kycStatus: KycStatusResponse | null;
  transactionLimit: TransactionLimitInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingPhone: string | null;
  pendingCountryCode: string | null;

  setUser: (user: User | null) => void;
  setPendingAuth: (phone: string, countryCode: string) => void;
  clearPendingAuth: () => void;
  checkAuth: () => Promise<boolean>;
  fetchUserData: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  kycStatus: null,
  transactionLimit: null,
  isAuthenticated: false,
  isLoading: true,
  pendingPhone: null,
  pendingCountryCode: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setPendingAuth: (phone, countryCode) => set({ pendingPhone: phone, pendingCountryCode: countryCode }),

  clearPendingAuth: () => set({ pendingPhone: null, pendingCountryCode: null }),

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await api.getToken();
      if (token) {
        try {
          await get().fetchUserData();
          return true;
        } catch (e) {
          // Token invalid or expired, clear it
          await api.clearTokens();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
    set({ isLoading: false, isAuthenticated: false });
    return false;
  },

  fetchUserData: async () => {
    try {
      const [profileRes, kycRes, limitRes] = await Promise.all([
        userService.getProfile(),
        userService.getKycStatus(),
        userService.getTransactionLimit(),
      ]);

      set({
        user: profileRes.data,
        kycStatus: kycRes.data,
        transactionLimit: limitRes.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, isAuthenticated: false });
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    set({
      user: null,
      kycStatus: null,
      transactionLimit: null,
      isAuthenticated: false,
      pendingPhone: null,
      pendingCountryCode: null,
    });
  },
}));
