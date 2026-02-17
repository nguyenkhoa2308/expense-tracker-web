"use client";

import { useState, useEffect, useRef } from "react";
import { useNotificationStore } from "@/store";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Bell, CheckCheck, Trash2, X } from "lucide-react";
import { ConfirmModal } from "@/components/ui";
import type { NotificationType } from "@/lib/api";

const typeIcons: Record<NotificationType, string> = {
  BUDGET_WARNING: "\u26a0\ufe0f",
  SYNC_COMPLETE: "\u2705",
  SYSTEM: "\u2139\ufe0f",
};

const typeBg: Record<NotificationType, string> = {
  BUDGET_WARNING: "bg-yellow-100 dark:bg-yellow-900/20",
  SYNC_COMPLETE: "bg-green-100 dark:bg-green-900/20",
  SYSTEM: "bg-blue-100 dark:bg-blue-900/20",
};

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Fetch when opened
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 dark:text-[#aaaaaa] hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#3f3f3f] rounded-lg transition"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-[#282828] rounded-xl shadow-2xl border border-gray-200 dark:border-[#3f3f3f] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#3f3f3f]">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Thông báo{unreadCount > 0 && ` (${unreadCount})`}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <CheckCheck size={14} />
                  Đọc hết
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {}
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[32rem] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-[#303030] rounded-full flex items-center justify-center mb-3">
                  <Bell size={28} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Chưa có thông báo nào
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-[#3f3f3f]">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`group px-4 py-3 cursor-pointer transition-colors ${
                      n.isRead
                        ? "hover:bg-gray-50 dark:hover:bg-[#303030]"
                        : "bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    }`}
                    onClick={() => !n.isRead && markAsRead(n.id)}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${typeBg[n.type]}`}
                      >
                        {typeIcons[n.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {formatDistanceToNow(new Date(n.createdAt), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(n.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 dark:text-gray-500 hover:!text-red-500 hover:bg-red-100/80 dark:hover:bg-red-500/20 hover:scale-110 rounded-lg transition-all"
                            title="Xóa"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        open={deleteId !== null}
        title="Xóa thông báo"
        message="Bạn có chắc muốn xóa thông báo này?"
        onConfirm={() => {
          if (deleteId) deleteNotification(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
