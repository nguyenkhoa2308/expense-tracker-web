'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { expenseApi } from '@/lib/api';
import { Input, Select, Button, SelectOption, DatePicker, CurrencyInput } from '@/components/ui';

const CATEGORIES: SelectOption[] = [
  { value: 'food', label: 'Ăn uống', emoji: '🍔' },
  { value: 'transport', label: 'Di chuyển', emoji: '🚗' },
  { value: 'shopping', label: 'Mua sắm', emoji: '🛒' },
  { value: 'entertainment', label: 'Giải trí', emoji: '🎮' },
  { value: 'bills', label: 'Hóa đơn', emoji: '📄' },
  { value: 'health', label: 'Sức khỏe', emoji: '💊' },
  { value: 'education', label: 'Học tập', emoji: '📚' },
  { value: 'other', label: 'Khác', emoji: '📦' },
];

interface ExpenseFormProps {
  onSuccess: () => void;
}

export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setLoading(true);
    try {
      await expenseApi.create({
        amount: Number(amount),
        category,
        description: description || undefined,
        date,
      });
      setAmount('');
      setDescription('');
      onSuccess();
    } catch (error) {
      console.error('Failed to create expense:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-5">Thêm chi tiêu mới</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <CurrencyInput
          label="Số tiền"
          value={amount}
          onChange={setAmount}
          required
          placeholder="0"
        />

        <Select
          label="Danh mục"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={CATEGORIES}
        />

        <Input
          label="Mô tả"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ăn trưa văn phòng"
        />

        <DatePicker
          label="Ngày"
          value={date}
          onChange={(value) => setDate(value)}
        />
      </div>

      <Button
        type="submit"
        disabled={!amount}
        loading={loading}
        leftIcon={<Plus size={18} />}
        className="mt-5"
      >
        {loading ? 'Đang thêm...' : 'Thêm chi tiêu'}
      </Button>
    </form>
  );
}

export { CATEGORIES };
