'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store';

export function ThemeInit() {
  const initTheme = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return null;
}
