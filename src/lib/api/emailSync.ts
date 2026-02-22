import { api } from './client';

export const emailSyncApi = {
  getGmailAuthUrl: () =>
    api.get<{ url: string }>('/email-sync/gmail/connect'),

  disconnectGmail: () => api.post('/email-sync/gmail/disconnect'),

  manualSync: () => api.post<{ synced: number }>('/email-sync/sync'),
};
