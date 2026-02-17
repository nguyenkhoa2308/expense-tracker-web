import { api } from './client';

export interface PeriodStats {
  total: number;
  byCategory: Record<string, number>;
  count: number;
}

export interface AllSummary {
  current: { expense: PeriodStats; income: PeriodStats; balance: number };
  previous: { expense: PeriodStats; income: PeriodStats; balance: number };
  change: number;
}

export interface TypeSummary {
  current: PeriodStats;
  previous: PeriodStats;
  change: number;
}

export interface SummaryFilters {
  month?: number;
  year?: number;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  category?: string;
}

export const statsApi = {
  getSummary: (params?: SummaryFilters & { type?: 'all' | 'expense' | 'income' }) =>
    api.get<AllSummary | TypeSummary>('/stats/summary', { params }),

  getAllSummary: (params?: SummaryFilters) =>
    api.get<AllSummary>('/stats/summary', { params: { ...params, type: 'all' } }),

  getExpenseSummary: (params?: SummaryFilters) =>
    api.get<TypeSummary>('/stats/summary', { params: { ...params, type: 'expense' } }),

  getIncomeSummary: (params?: SummaryFilters) =>
    api.get<TypeSummary>('/stats/summary', { params: { ...params, type: 'income' } }),
};
