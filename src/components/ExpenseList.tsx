'use client';

import { Trash2 } from 'lucide-react';
import { Expense, expenseApi } from '@/lib/api';
import { CATEGORIES } from './ExpenseForm';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: () => void;
}

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa chi tiêu này?')) return;

    try {
      await expenseApi.delete(id);
      onDelete();
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find((c) => c.value === value)?.label || value;
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
        Chưa có chi tiêu nào. Hãy thêm chi tiêu đầu tiên!
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ngày</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Danh mục</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Mô tả</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Số tiền</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Xóa</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(expense.date)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {getCategoryLabel(expense.category)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {expense.description || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                  -{formatCurrency(expense.amount)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:!text-red-500 hover:bg-red-100/80 dark:hover:bg-red-500/20 hover:scale-110 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
