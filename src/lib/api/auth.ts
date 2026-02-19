import { api } from './client';

export interface RefreshResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    salary: number | null;
    onboarded: boolean;
    gmailConnected: boolean;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  salary: number | null;
  onboarded: boolean;
  gmailConnected: boolean;
  createdAt: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string }>('/auth/login', { email, password }),

  register: (email: string, password: string, name?: string) =>
    api.post<{ access_token: string }>('/auth/register', {
      email,
      password,
      name,
    }),

  refresh: () => api.post<RefreshResponse>('/auth/refresh'),

  logout: () => api.post('/auth/logout'),

  getProfile: () => api.get<UserProfile>('/auth/profile'),

  updateProfile: (data: { name?: string; salary?: number }) =>
    api.patch<UserProfile>('/auth/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<{ message: string }>('/auth/change-password', { currentPassword, newPassword }),

  completeOnboarding: (data: { name?: string; salary?: number; budgets?: { category: string; amount: number }[] }) =>
    api.post<UserProfile>('/auth/onboarding', data),
};
