import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@mbotamapay_onboarding_completed';

interface OnboardingState {
  hasSeenOnboarding: boolean;
  isLoading: boolean;
  checkOnboardingStatus: () => Promise<boolean>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasSeenOnboarding: false,
  isLoading: true,

  checkOnboardingStatus: async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      const hasCompleted = value === 'true';
      set({ hasSeenOnboarding: hasCompleted, isLoading: false });
      return hasCompleted;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      set({ isLoading: false });
      return false;
    }
  },

  completeOnboarding: async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      set({ hasSeenOnboarding: true });
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  },

  resetOnboarding: async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      set({ hasSeenOnboarding: false });
    } catch (error) {
      console.error('Error resetting onboarding status:', error);
    }
  },
}));
