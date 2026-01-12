import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { authService } from '../services/auth';
import { userService } from '../services/user';
import type { User, KycStatusResponse, TransactionLimitInfo } from '../types/api';

const LOCAL_PROFILE_PICTURE_KEY = '@mbotama_local_profile_picture';

interface AuthState {
  user: User | null;
  kycStatus: KycStatusResponse | null;
  transactionLimit: TransactionLimitInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingPhone: string | null;
  pendingCountryCode: string | null;
  isNewRegistration: boolean;
  localProfilePicture: string | null;

  setUser: (user: User | null) => void;
  setPendingAuth: (phone: string, countryCode: string, isNewRegistration?: boolean) => void;
  clearPendingAuth: () => void;
  checkAuth: () => Promise<boolean>;
  fetchUserData: () => Promise<void>;
  logout: () => Promise<void>;
  setLocalProfilePicture: (uri: string | null) => Promise<void>;
  loadLocalProfilePicture: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  kycStatus: null,
  transactionLimit: null,
  isAuthenticated: false,
  isLoading: true,
  pendingPhone: null,
  pendingCountryCode: null,
  isNewRegistration: false,
  localProfilePicture: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setPendingAuth: (phone, countryCode, isNewRegistration = false) => 
    set({ pendingPhone: phone, pendingCountryCode: countryCode, isNewRegistration }),

  clearPendingAuth: () => set({ pendingPhone: null, pendingCountryCode: null, isNewRegistration: false }),

  setLocalProfilePicture: async (uri) => {
    try {
      if (uri) {
        await AsyncStorage.setItem(LOCAL_PROFILE_PICTURE_KEY, uri);
      } else {
        await AsyncStorage.removeItem(LOCAL_PROFILE_PICTURE_KEY);
      }
      set({ localProfilePicture: uri });
    } catch (error) {
      console.error('Error saving local profile picture:', error);
    }
  },

  loadLocalProfilePicture: async () => {
    try {
      const uri = await AsyncStorage.getItem(LOCAL_PROFILE_PICTURE_KEY);
      set({ localProfilePicture: uri });
    } catch (error) {
      console.error('Error loading local profile picture:', error);
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await api.getToken();
      if (token) {
        try {
          await get().fetchUserData();
          await get().loadLocalProfilePicture();
          return true;
        } catch (e: any) {
          // Si erreur 502/503/504, le serveur est down mais le token peut être valide
          const status = e?.response?.status;
          if (status === 502 || status === 503 || status === 504) {
            console.log('Serveur temporairement indisponible');
            set({ isLoading: false });
            // On garde l'état actuel, on ne déconnecte pas
            return false;
          }
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
      const [profileRes, kycRes, limitRes] = await Promise.allSettled([
        userService.getProfile(),
        userService.getKycStatus(),
        userService.getTransactionLimit(),
      ]);

      // Extraire les données des promesses résolues
      const profile = profileRes.status === 'fulfilled' ? profileRes.value.data : null;
      const kyc = kycRes.status === 'fulfilled' ? kycRes.value.data : null;
      const limit = limitRes.status === 'fulfilled' ? limitRes.value.data : null;

      if (profile) {
        set({
          user: profile,
          kycStatus: kyc,
          transactionLimit: limit,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // Si on n'a pas pu récupérer le profil, on considère que l'auth a échoué
        throw new Error('Impossible de récupérer le profil');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    await AsyncStorage.removeItem(LOCAL_PROFILE_PICTURE_KEY);
    set({
      user: null,
      kycStatus: null,
      transactionLimit: null,
      isAuthenticated: false,
      pendingPhone: null,
      pendingCountryCode: null,
      isNewRegistration: false,
      localProfilePicture: null,
    });
  },
}));
