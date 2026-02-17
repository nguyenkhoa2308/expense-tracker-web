import { api } from './client';
import type { PaginatedResponse, PaginationParams } from './types';

export interface Expense {
  id: string;
  amount: number;
  description?: string;
  category: string;
  date: string;
  source: string;
  createdAt: string;
}

export interface ExpenseStats {
  total: number;
  byCategory: Record<string, number>;
  count: number;
}

export const expenseApi = {
  getPaginated: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Expense>>('/expenses', { params }),

  getAll: () => api.get<Expense[]>('/expenses/all'),

  getStats: (params?: PaginationParams) => api.get<ExpenseStats>('/expenses/stats', { params }),

  create: (data: {
    amount: number;
    description?: string;
    category: string;
    date?: string;
  }) => api.post<Expense>('/expenses', data),

  update: (id: string, data: Partial<Expense>) =>
    api.patch<Expense>(`/expenses/${id}`, data),

  delete: (id: string) => api.delete(`/expenses/${id}`),

  exportCsv: (params?: PaginationParams) =>
    api.get<string>('/expenses/export/csv', {
      params,
      responseType: 'blob',
    }),
};
