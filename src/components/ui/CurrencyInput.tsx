'use client';

import { forwardRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface CurrencyInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  compact?: boolean;
}

const QUICK_AMOUNTS = [
  { label: '+10k', value: 10000 },
  { label: '+50k', value: 50000 },
  { label: '+100k', value: 100000 },
  { label: '+500k', value: 500000 },
  { label: '+1M', value: 1000000 },
];

const formatNumber = (value: string): string => {
  const num = value.replace(/\D/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('vi-VN');
};

const parseNumber = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Chuyển số thành chữ tiếng Việt
const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const UNITS = ['', 'nghìn', 'triệu', 'tỷ'];

// Đọc nhóm 3 chữ số
const readThreeDigits = (num: number, showZeroHundred: boolean = false): string => {
  if (num === 0) return showZeroHundred ? 'không trăm' : '';

  const hundreds = Math.floor(num / 100);
  const tens = Math.floor((num % 100) / 10);
  const units = num % 10;

  const parts: string[] = [];

  // Hàng trăm
  if (hundreds > 0) {
    parts.push(`${DIGITS[hundreds]} trăm`);
  } else if (showZeroHundred && (tens > 0 || units > 0)) {
    parts.push('không trăm');
  }

  // Hàng chục
  if (tens === 0 && units > 0 && (hundreds > 0 || showZeroHundred)) {
    // 0 ở hàng chục, đơn vị != 0: dùng "lẻ"
    parts.push('lẻ');
  } else if (tens === 1) {
    // 1 ở hàng chục: "mười"
    parts.push('mười');
  } else if (tens > 1) {
    parts.push(`${DIGITS[tens]} mươi`);
  }

  // Hàng đơn vị
  if (units === 1 && tens >= 2) {
    // 1 ở đơn vị khi chục >= 2: "mốt"
    parts.push('mốt');
  } else if (units === 5 && tens >= 1) {
    // 5 ở đơn vị khi chục >= 1: "lăm"
    parts.push('lăm');
  } else if (units > 0 && !(units === 1 && tens >= 2) && !(units === 5 && tens >= 1)) {
    parts.push(DIGITS[units]);
  }

  return parts.join(' ');
};

// Chuyển số thành chữ đầy đủ
const numberToVietnameseWords = (num: number): string => {
  if (num === 0) return 'Không đồng';
  if (num < 0) return `Âm ${numberToVietnameseWords(-num)}`;

  // Chia thành các nhóm 3 chữ số từ phải sang trái
  const groups: number[] = [];
  let temp = num;
  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  const parts: string[] = [];

  for (let i = groups.length - 1; i >= 0; i--) {
    const group = groups[i];

    if (group > 0) {
      const groupText = readThreeDigits(group, i < groups.length - 1 && group < 100);
      if (groupText) {
        parts.push(groupText + (UNITS[i] ? ` ${UNITS[i]}` : ''));
      }
    }
  }

  // Viết hoa chữ đầu, thêm "đồng" cuối
  const result = parts.join(' ').trim();
  return result.charAt(0).toUpperCase() + result.slice(1) + ' đồng';
};

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ label, value, onChange, error, required, placeholder = '0', className, compact }, ref) => {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      setDisplayValue(formatNumber(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = parseNumber(e.target.value);
      onChange(raw);
      setDisplayValue(formatNumber(raw));
    };

    const handleQuickAdd = (amount: number) => {
      const current = Number(parseNumber(value)) || 0;
      const newValue = (current + amount).toString();
      onChange(newValue);
      setDisplayValue(formatNumber(newValue));
    };

    const handleClear = () => {
      onChange('');
      setDisplayValue('');
    };

    const numericValue = Number(parseNumber(value)) || 0;

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label
            className={cn(
              'block text-sm font-semibold mb-2 transition-colors duration-200',
              isFocused ? 'text-primary-600' : 'text-gray-700',
              error && 'text-red-600'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input with formatted display */}
        <div className="relative">
          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            required={required}
            className={cn(
              'w-full rounded-2xl border-2 bg-white tabular-nums',
              'transition-all duration-200 ease-out',
              'placeholder:text-gray-400 placeholder:font-normal',
              'border-gray-200',
              'hover:border-gray-300',
              'focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10',
              'dark:bg-[#212121] dark:border-[#303030] dark:text-[#f1f1f1] dark:placeholder:text-[#717171]',
              'dark:hover:border-[#404040]',
              'dark:focus:border-primary-500 dark:focus:ring-primary-500/15',
              compact
                ? 'pl-3 pr-12 py-3 text-sm font-medium text-gray-700'
                : 'pl-4 pr-16 py-3.5 text-lg font-semibold text-gray-800',
              error && 'border-red-400 focus:border-red-500'
            )}
          />
          <span className={cn(
            'absolute top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium',
            compact ? 'right-3 text-xs' : 'right-4 text-base'
          )}>
            VNĐ
          </span>
        </div>

        {/* Preview in Vietnamese words */}
        {!compact && numericValue > 0 && (
          <p className="mt-1.5 text-sm text-primary-600 font-medium italic">
            {numberToVietnameseWords(numericValue)}
          </p>
        )}

        {/* Quick amount buttons */}
        {!compact && (
          <div className="flex flex-wrap gap-2 mt-3">
            {QUICK_AMOUNTS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleQuickAdd(item.value)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-xl',
                  'bg-gray-100 text-gray-700',
                  'hover:bg-primary-100 hover:text-primary-700',
                  'active:scale-95 transition-all duration-150'
                )}
              >
                {item.label}
              </button>
            ))}
            {numericValue > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-xl',
                  'bg-red-50 text-red-600',
                  'hover:bg-red-100',
                  'active:scale-95 transition-all duration-150'
                )}
              >
                Xóa
              </button>
            )}
          </div>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
