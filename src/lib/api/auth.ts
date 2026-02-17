import { api } from './client';

export interface RefreshResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    gmailConnected: boolean;
  };
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

  getProfile: () => api.get('/auth/profile'),
};
