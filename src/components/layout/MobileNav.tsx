'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  PiggyBank,
  FileBarChart,
  CalendarClock,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/incomes', label: 'Thu nhập', icon: Wallet },
  { href: '/expenses', label: 'Chi tiêu', icon: Receipt },
  { href: '/budget', label: 'Ngân sách', icon: PiggyBank },
  { href: '/recurring', label: 'Định kỳ', icon: CalendarClock },
  { href: '/reports', label: 'Báo cáo', icon: FileBarChart },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#212121] border-t border-gray-200 dark:border-[#303030] safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-0 ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-400 dark:text-[#717171]'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] leading-tight truncate ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
