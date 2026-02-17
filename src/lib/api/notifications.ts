import { api } from './client';

export type NotificationType = 'BUDGET_WARNING' | 'SYNC_COMPLETE' | 'SYSTEM';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  getAll: () => api.get<Notification[]>('/notifications'),

  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),

  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),

  markAllAsRead: () => api.patch('/notifications/read-all'),

  delete: (id: string) => api.delete(`/notifications/${id}`),
};
