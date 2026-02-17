"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const buttonBase = cn(
    "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200",
    "min-w-[40px] h-10",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  );

  return (
    <div className={cn("flex items-center justify-center gap-1.5", className)}>
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={cn(
          buttonBase,
          "px-3 border-2 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300",
          "dark:border-[#3f3f3f] dark:text-[#aaaaaa] dark:hover:bg-[#303030] dark:hover:border-[#555555]",
        )}
      >
        {}
        <ChevronLeft size={16} />
      </button>

      {getPageNumbers().map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 text-gray-400 dark:text-[#666666]"
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              buttonBase,
              p === page
                ? "bg-gradient-to-b from-primary-500 to-primary-600 text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(124,58,237,0.25)]"
                : cn(
                    "text-gray-600 hover:bg-gray-100",
                    "dark:text-[#aaaaaa] dark:hover:bg-[#303030]",
                  ),
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={cn(
          buttonBase,
          "px-3 border-2 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300",
          "dark:border-[#3f3f3f] dark:text-[#aaaaaa] dark:hover:bg-[#303030] dark:hover:border-[#555555]",
        )}
      >
        {}
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
