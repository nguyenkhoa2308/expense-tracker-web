"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Receipt,
  LayoutDashboard,
  Wallet,
  Settings,
  FileBarChart,
  PiggyBank,
  CalendarClock,
} from "lucide-react";
import { useSidebarStore } from "@/store";

const menuItems = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/incomes", label: "Thu nhập", icon: Wallet },
  { href: "/expenses", label: "Chi tiêu", icon: Receipt },
  { href: "/budget", label: "Ngân sách", icon: PiggyBank },
  { href: "/recurring", label: "Định kỳ", icon: CalendarClock },
  { href: "/reports", label: "Báo cáo", icon: FileBarChart },
];

const settingsItems = [{ href: "/settings", label: "Cài đặt", icon: Settings }];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed } = useSidebarStore();

  return (
    <aside
      className={`bg-white dark:bg-[#212121] text-gray-900 dark:text-white flex flex-col flex-shrink-0 border-r border-gray-200 dark:border-[#303030] overflow-hidden transition-[width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isCollapsed ? "w-[76px]" : "w-64"
      }`}
    >
      {/* Menu */}
      <nav className="flex-1 p-3 pt-6 overflow-y-auto overflow-x-hidden">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 dark:text-[#aaaaaa] hover:bg-gray-100 dark:hover:bg-[#3f3f3f] hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <item.icon size={20} className="flex-shrink-0" />
                <span className="ml-5">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8">
          <p
            className={`px-4 text-xs font-semibold text-gray-400 dark:text-[#717171] uppercase tracking-wider mb-2 whitespace-nowrap transition-opacity duration-200 ${
              isCollapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            Cài đặt
          </p>
          <div className="space-y-1">
            {settingsItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-primary-600 text-white"
                      : "text-gray-600 dark:text-[#aaaaaa] hover:bg-gray-100 dark:hover:bg-[#3f3f3f] hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  <span className="ml-5">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div
        className={`p-4 border-t border-gray-200 dark:border-[#303030] whitespace-nowrap transition-opacity duration-200 ${
          isCollapsed ? "opacity-0" : "opacity-100"
        }`}
      >
        <p className="text-xs text-gray-400 dark:text-[#717171] text-center">
          © 2025 ExpenseTracker
        </p>
      </div>
    </aside>
  );
}
