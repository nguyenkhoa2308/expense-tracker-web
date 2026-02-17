import { api } from './client';

export interface RecurringTransaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  description?: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringData {
  type: 'expense' | 'income';
  amount: number;
  description?: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDate: string;
}

export const recurringApi = {
  getAll: () => api.get<RecurringTransaction[]>('/recurring'),

  getOne: (id: string) => api.get<RecurringTransaction>(`/recurring/${id}`),

  create: (data: CreateRecurringData) =>
    api.post<RecurringTransaction>('/recurring', data),

  update: (id: string, data: Partial<CreateRecurringData>) =>
    api.patch<RecurringTransaction>(`/recurring/${id}`, data),

  toggle: (id: string) =>
    api.patch<RecurringTransaction>(`/recurring/${id}/toggle`),

  delete: (id: string) => api.delete(`/recurring/${id}`),
};
