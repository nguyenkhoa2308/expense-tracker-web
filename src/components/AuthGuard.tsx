'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Wallet } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-[#181818] dark:via-[#1a1a1a] dark:to-[#181818]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-lg shadow-primary-500/30 flex items-center justify-center">
            <Wallet size={32} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Smart Expense Tracker</h1>
        </div>
        <div className="mt-8 flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary-600 animate-bounce" />
          <div className="w-2 h-2 rounded-full bg-primary-600 animate-bounce bounce-delay-150" />
          <div className="w-2 h-2 rounded-full bg-primary-600 animate-bounce bounce-delay-300" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
