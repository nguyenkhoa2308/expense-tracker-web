'use client';

import { create } from 'zustand';
import { notificationApi, Notification } from '@/lib/api';
import { getAccessToken } from '@/lib/api/client';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  connectSSE: () => void;
  disconnectSSE: () => void;
}

let eventSource: EventSource | null = null;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await notificationApi.getAll();
      set({
        notifications: res.data,
        unreadCount: res.data.filter((n) => !n.isRead).length,
      });
    } catch {
      // ignore
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      set({ unreadCount: res.data.count });
    } catch {
      // ignore
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationApi.markAsRead(id);
      set((s) => ({
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
        unreadCount: Math.max(0, s.unreadCount - 1),
      }));
    } catch {
      // ignore
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead();
      set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {
      // ignore
    }
  },

  deleteNotification: async (id) => {
    try {
      await notificationApi.delete(id);
      set((s) => {
        const target = s.notifications.find((n) => n.id === id);
        return {
          notifications: s.notifications.filter((n) => n.id !== id),
          unreadCount:
            target && !target.isRead
              ? Math.max(0, s.unreadCount - 1)
              : s.unreadCount,
        };
      });
    } catch {
      // ignore
    }
  },

  connectSSE: () => {
    if (eventSource) return;

    const token = getAccessToken();
    if (!token) return;

    // Fetch initial unread count
    get().fetchUnreadCount();

    eventSource = new EventSource(`/api/notifications/stream?token=${token}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Ignore heartbeat messages
        if (data.type === 'heartbeat') return;
        const notification: Notification = data;
        set((s) => ({
          notifications: [notification, ...s.notifications],
          unreadCount: s.unreadCount + 1,
        }));
      } catch {
        // ignore parse errors
      }
    };

    eventSource.onerror = () => {
      // EventSource tự reconnect, nhưng nếu token hết hạn thì close
      // Browser sẽ retry tự động với cùng URL
    };
  },

  disconnectSSE: () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  },
}));
