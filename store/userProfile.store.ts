import { create } from 'zustand';
import { type UserProfile } from '@/types/user';

interface UserProfileState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
}

export const useUserProfileStore = create<UserProfileState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}));
