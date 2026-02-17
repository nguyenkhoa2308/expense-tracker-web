import { api } from './client';

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
  createdAt: string;
}

export interface BudgetCategoryOverview {
  id: string;
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface BudgetOverview {
  month: number;
  year: number;
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  categories: BudgetCategoryOverview[];
}

export const budgetApi = {
  getByMonth: (month: number, year: number) =>
    api.get<Budget[]>('/budgets', { params: { month, year } }),

  getOverview: (month: number, year: number) =>
    api.get<BudgetOverview>('/budgets/overview', { params: { month, year } }),

  create: (data: {
    category: string;
    amount: number;
    month: number;
    year: number;
  }) => api.post<Budget>('/budgets', data),

  update: (id: string, data: Partial<{ category: string; amount: number }>) =>
    api.patch<Budget>(`/budgets/${id}`, data),

  delete: (id: string) => api.delete(`/budgets/${id}`),
};
