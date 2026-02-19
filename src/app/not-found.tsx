"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f0f0f] p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold bg-gradient-to-br from-primary-400 to-primary-600 bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Không tìm thấy trang
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Trang bạn đang tìm không tồn tại hoặc đã bị di chuyển.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            <Home size={16} />
            Về trang chủ
          </Link>
          <button
            onClick={() => history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-[#404040] text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
