'use client';

import { useEffect, useState } from 'react';
import { Button } from './Button';
import { CurrencyInput } from './CurrencyInput';
import { Select, type SelectOption } from './Select';
import { Input } from './Input';
import { DatePicker } from './DatePicker';
import { Loader2 } from 'lucide-react';

interface EditTransactionModalProps {
  open: boolean;
  title: string;
  transaction: {
    id: string;
    amount: number;
    description?: string;
    category: string;
    date: string;
  } | null;
  categories: SelectOption[];
  onSave: (id: string, data: { amount?: number; description?: string; category?: string; date?: string }) => Promise<void>;
  onCancel: () => void;
}

export function EditTransactionModal({
  open,
  title,
  transaction,
  categories,
  onSave,
  onCancel,
}: EditTransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (transaction) {
      setAmount(String(transaction.amount));
      setCategory(transaction.category);
      setDescription(transaction.description || '');
      setDate(transaction.date ? transaction.date.split('T')[0] : '');
    }
  }, [transaction]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open || !transaction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;

    setSaving(true);
    try {
      await onSave(transaction.id, {
        amount: numAmount,
        description: description || undefined,
        category,
        date,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 animate-in fade-in duration-200"
        onClick={onCancel}
      />
      <div className="relative bg-white dark:bg-[#282828] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3f3f3f] p-6 w-full max-w-lg mx-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
          {title}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <CurrencyInput
            label="Số tiền"
            value={amount}
            onChange={setAmount}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Danh mục"
              options={categories}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <DatePicker
              label="Ngày"
              value={date}
              onChange={setDate}
            />
          </div>

          <Input
            label="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nhập mô tả..."
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={saving}>
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={saving || !Number(amount)}>
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-1.5" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
