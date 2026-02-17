'use client';

import { useState } from 'react';
import { DatePicker as AntDatePicker, ConfigProvider } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

dayjs.locale('vi');

const { RangePicker } = AntDatePicker;

export interface DateRangePickerProps {
  label?: string;
  value?: [string, string]; // [dateFrom, dateTo] ISO strings
  onChange?: (dateFrom: string, dateTo: string) => void;
  placeholder?: [string, string];
  disabled?: boolean;
  className?: string;
}

export function DateRangePicker({
  label,
  value,
  onChange,
  placeholder = ['Từ ngày', 'Đến ngày'],
  disabled,
  className,
}: DateRangePickerProps) {
  const [isFocused, setIsFocused] = useState(false);

  const selectedRange: [Dayjs | null, Dayjs | null] = [
    value?.[0] ? dayjs(value[0]) : null,
    value?.[1] ? dayjs(value[1]) : null,
  ];

  const handleChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      onChange?.(dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD'));
    } else {
      onChange?.('', '');
    }
  };

  return (
    <div className={cn('w-auto', className)}>
      {label && (
        <label
          className={cn(
            'block text-sm font-semibold mb-2 transition-colors duration-200',
            isFocused ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300',
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
        <RangePicker
          value={selectedRange}
          onChange={handleChange}
          onOpenChange={(open) => setIsFocused(open)}
          format="DD/MM/YYYY"
          placeholder={placeholder}
          disabled={disabled}
          suffixIcon={<Calendar size={16} />}
          allowClear
          maxDate={dayjs()}
          placement="bottomRight"
          styles={{ popup: { root: { zIndex: 99999 } } }}
          className="ant-rangepicker-custom"
        />
      </ConfigProvider>
    </div>
  );
}
