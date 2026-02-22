'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Wallet, User, LogOut, Settings } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/expenses" className="text-xl font-bold text-primary-600 flex items-center gap-2">
          <Wallet size={24} />
          Expense Tracker
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/expenses"
            className="text-sm text-gray-600 hover:text-primary-600 transition"
          >
            Chi tiêu
          </Link>
          <Link
            href="/settings"
            className="text-sm text-gray-600 hover:text-primary-600 transition flex items-center gap-1"
          >
            <Settings size={16} />
            Cài đặt
          </Link>
          <div className="flex items-center gap-2 text-gray-600 border-l pl-4">
            <User size={18} />
            <span className="text-sm">{user?.name || user?.email}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Đăng xuất"
            className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
