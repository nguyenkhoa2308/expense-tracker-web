'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Expense } from '@/lib/api';
import { format, subDays, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ExpenseBarChartProps {
  expenses: Expense[];
}

export function ExpenseBarChart({ expenses }: ExpenseBarChartProps) {
  // Group expenses by day for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 6 - i));
    return {
      date,
      dateStr: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE', { locale: vi }),
      total: 0,
    };
  });

  expenses.forEach((expense) => {
    const expenseDate = format(new Date(expense.date), 'yyyy-MM-dd');
    const day = last7Days.find((d) => d.dateStr === expenseDate);
    if (day) {
      day.total += Number(expense.amount);
    }
  });

  const chartData = last7Days.map((d) => ({
    name: d.label,
    value: d.total,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
        <YAxis
          stroke="#6B7280"
          fontSize={12}
          tickFormatter={(value) =>
            value >= 1000000
              ? `${(value / 1000000).toFixed(1)}M`
              : value >= 1000
                ? `${(value / 1000).toFixed(0)}K`
                : value.toString()
          }
        />
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(value)
          }
          labelStyle={{ color: '#374151' }}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
          }}
        />
        <Bar dataKey="value" fill="#7C3AED" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
