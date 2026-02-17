import { api } from './client';
import type { PaginatedResponse, PaginationParams } from './types';

export interface Income {
  id: string;
  amount: number;
  description?: string;
  category: string;
  date: string;
  source: string;
  createdAt: string;
}

export interface IncomeStats {
  total: number;
  byCategory: Record<string, number>;
  count: number;
}

export const incomeApi = {
  getPaginated: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Income>>('/incomes', { params }),

  getAll: () => api.get<Income[]>('/incomes/all'),

  getStats: (params?: PaginationParams) => api.get<IncomeStats>('/incomes/stats', { params }),

  create: (data: {
    amount: number;
    description?: string;
    category: string;
    date?: string;
  }) => api.post<Income>('/incomes', data),

  update: (id: string, data: Partial<Income>) =>
    api.patch<Income>(`/incomes/${id}`, data),

  delete: (id: string) => api.delete(`/incomes/${id}`),

  exportCsv: (params?: PaginationParams) =>
    api.get<string>('/incomes/export/csv', {
      params,
      responseType: 'blob',
    }),
};
