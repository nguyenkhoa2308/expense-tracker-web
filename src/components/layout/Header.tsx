"use client";

import { useRouter } from "next/navigation";
import { useAuthStore, useThemeStore, useSidebarStore } from "@/store";
import { Monitor, Sun, User, LogOut, ChevronDown, Moon } from "lucide-react";
import { SidebarToggleIcon } from "@/components/icons";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export function Header() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme, initTheme } = useThemeStore();
  const { isCollapsed, toggle: toggleSidebar } = useSidebarStore();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const themeOptions = [
    { value: "auto" as const, label: "Tự động", icon: Monitor },
    { value: "light" as const, label: "Sáng", icon: Sun },
    { value: "dark" as const, label: "Tối", icon: Moon },
  ];

  return (
    <header className="h-16 bg-white dark:bg-[#212121] border-b border-gray-200 dark:border-[#303030] flex items-center justify-between px-3">
      {/* Left side: Toggle + Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="px-4 py-3 text-gray-500 dark:text-[#aaaaaa] hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#3f3f3f] rounded-lg transition"
          title={isCollapsed ? "Mở sidebar" : "Thu gọn sidebar"}
        >
          <SidebarToggleIcon size={20} collapsed={isCollapsed} />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="Logo" width={36} height={36} />
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ExpenseTracker
          </span>
        </Link>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Theme Switcher */}
        <div className="relative flex items-center bg-gray-100 dark:bg-[#303030] rounded-full p-1">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white dark:bg-[#555555] text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-[#aaaaaa] hover:text-gray-700 dark:hover:text-white"
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{option.label}</span>
              </button>
            );
          })}
        </div>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-[#3f3f3f] rounded-lg transition"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#282828] rounded-lg shadow-lg border border-gray-200 dark:border-[#3f3f3f] py-1 z-50">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
