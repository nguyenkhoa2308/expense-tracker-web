'use client';

import { ExpenseStats } from '@/lib/api';
import { CATEGORIES } from './ExpenseForm';

interface ExpenseStatsCardProps {
  stats: ExpenseStats | null;
}

export function ExpenseStatsCard({ stats }: ExpenseStatsCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find((c) => c.value === value)?.label || value;
  };

  if (!stats) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  const sortedCategories = Object.entries(stats.byCategory).sort(([, a], [, b]) => b - a);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 text-white">
        <p className="text-primary-100 text-sm">Tổng chi tiêu</p>
        <p className="text-2xl font-bold mt-1">{formatCurrency(stats.total)}</p>
        <p className="text-primary-200 text-sm mt-2">{stats.count} giao dịch</p>
      </div>

      {/* Top Category */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
        <p className="text-orange-100 text-sm">Chi nhiều nhất</p>
        {sortedCategories.length > 0 ? (
          <>
            <p className="text-2xl font-bold mt-1">
              {getCategoryLabel(sortedCategories[0][0])}
            </p>
            <p className="text-orange-200 text-sm mt-2">
              {formatCurrency(sortedCategories[0][1])}
            </p>
          </>
        ) : (
          <p className="text-xl mt-1">-</p>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600 text-sm mb-3">Theo danh mục</p>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {sortedCategories.map(([category, amount]) => (
            <div key={category} className="flex justify-between text-sm">
              <span>{getCategoryLabel(category)}</span>
              <span className="font-medium">{formatCurrency(amount)}</span>
            </div>
          ))}
          {sortedCategories.length === 0 && (
            <p className="text-gray-400 text-sm">Chưa có dữ liệu</p>
          )}
        </div>
      </div>
    </div>
  );
}
