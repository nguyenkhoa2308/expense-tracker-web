"use client";

import { useToastStore } from "@/store";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

const icons = {
  success: <CheckCircle size={20} className="text-emerald-400" />,
  error: <XCircle size={20} className="text-red-400" />,
  info: <Info size={20} className="text-blue-400" />,
};

const bgColors = {
  success: "bg-gray-900 dark:bg-[#303030] border-emerald-500/30",
  error: "bg-gray-900 dark:bg-[#303030] border-red-500/30",
  info: "bg-gray-900 dark:bg-[#303030] border-blue-500/30",
};

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-[60] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl animate-in slide-in-from-top-2 fade-in duration-300 min-w-[300px] max-w-[420px] ${bgColors[toast.type]}`}
        >
          {icons[toast.type]}
          <p className="flex-1 text-sm font-medium text-white">
            {toast.message}
          </p>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            className="p-0.5 text-gray-400 hover:text-white transition"
          >
            {}
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
