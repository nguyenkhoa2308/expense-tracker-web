'use client';

import { useCountUp } from '@/hooks/useCountUp';

interface AnimatedCurrencyProps {
  value: number;
  duration?: number;
}

export function AnimatedCurrency({ value, duration = 800 }: AnimatedCurrencyProps) {
  const animated = useCountUp(value, duration);
  return (
    <>
      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(animated)}
    </>
  );
}
