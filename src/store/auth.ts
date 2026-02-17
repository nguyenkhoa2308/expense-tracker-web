'use client';

import { create } from 'zustand';
import { authApi, setAccessToken } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  gmailConnected?: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  login: async (email, password) => {
    const res = await authApi.login(email, password);
    setAccessToken(res.data.access_token);

    const profile = await authApi.getProfile();
    set({ user: profile.data });
  },

  register: async (email, password, name) => {
    const res = await authApi.register(email, password, name);
    setAccessToken(res.data.access_token);

    const profile = await authApi.getProfile();
    set({ user: profile.data });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    }
    setAccessToken(null);
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      const res = await authApi.refresh();
      setAccessToken(res.data.access_token);
      set({ user: res.data.user, isLoading: false });
    } catch {
      setAccessToken(null);
      set({ user: null, isLoading: false });
    }
  },
}));
