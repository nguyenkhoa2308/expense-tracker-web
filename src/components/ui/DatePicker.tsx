'use client';

import { useState } from 'react';
import { DatePicker as AntDatePicker, ConfigProvider } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

dayjs.locale('vi');

export interface DatePickerProps {
  label?: string;
  error?: string;
  hint?: string;
  value?: string; // ISO date string (YYYY-MM-DD)
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  minDate?: string; // ISO date string (YYYY-MM-DD)
  maxDate?: string; // ISO date string (YYYY-MM-DD)
}

export function DatePicker({
  label,
  error,
  hint,
  value,
  onChange,
  placeholder = 'Chọn ngày...',
  disabled,
  className,
  id,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [isFocused, setIsFocused] = useState(false);
  const pickerId = id || label?.toLowerCase().replace(/\s/g, '-');
  const selectedDate = value ? dayjs(value) : null;

  const handleChange = (date: Dayjs | null) => {
    if (date) {
      onChange?.(date.format('YYYY-MM-DD'));
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={pickerId}
          className={cn(
            'block text-sm font-semibold mb-2 transition-colors duration-200',
            isFocused ? 'text-primary-600' : 'text-gray-700',
            error && 'text-red-600'
          )}
        >
          {label}
        </label>
      )}

      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#7c3aed',
            colorLink: '#7c3aed',
            fontFamily: 'inherit',
          },
        }}
      >
        <AntDatePicker
          id={pickerId}
          value={selectedDate}
          onChange={handleChange}
          onOpenChange={(open) => setIsFocused(open)}
          format="DD/MM/YYYY"
          placeholder={placeholder}
          disabled={disabled}
          suffixIcon={<Calendar size={18} />}
          allowClear={false}
          minDate={minDate ? dayjs(minDate) : undefined}
          maxDate={maxDate ? dayjs(maxDate) : dayjs()}
          placement="bottomRight"
          styles={{ popup: { root: { zIndex: 99999 } } }}
          className="ant-datepicker-custom"
        />
      </ConfigProvider>

      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-2 text-sm text-gray-400">{hint}</p>
      )}
    </div>
  );
}
