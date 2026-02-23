'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { Wallet } from 'lucide-react';

export default function Home() {
  const { user, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [isLoading, user, router]);

  // Chưa hydrate hoặc đang check auth → hiện splash screen
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-[#181818] dark:via-[#1a1a1a] dark:to-[#181818]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-lg shadow-primary-500/30 flex items-center justify-center">
            <Wallet size={32} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Expense Tracker</h1>
        </div>
        <div className="mt-8 flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary-600 animate-bounce" />
          <div className="w-2 h-2 rounded-full bg-primary-600 animate-bounce bounce-delay-150" />
          <div className="w-2 h-2 rounded-full bg-primary-600 animate-bounce bounce-delay-300" />
        </div>
      </div>
    );
  }

  // User đã login, đang redirect
  if (user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          💰 Expense Tracker
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Quản lý chi tiêu thông minh, theo dõi tài chính cá nhân dễ dàng
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition"
          >
            Đăng ký miễn phí
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900">Thống kê chi tiết</h3>
            <p className="text-gray-600 text-sm mt-1">
              Xem tổng quan chi tiêu theo danh mục
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-2">🏷️</div>
            <h3 className="font-semibold text-gray-900">Phân loại thông minh</h3>
            <p className="text-gray-600 text-sm mt-1">
              Tự động phân loại chi tiêu theo danh mục
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-semibold text-gray-900">Bảo mật cao</h3>
            <p className="text-gray-600 text-sm mt-1">
              Dữ liệu được mã hóa và bảo vệ an toàn
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
