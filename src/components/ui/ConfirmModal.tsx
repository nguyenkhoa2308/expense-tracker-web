'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title = 'Xác nhận',
  message,
  confirmText = 'Xóa',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 animate-in fade-in duration-200"
        onClick={onCancel}
      />
      <div className="relative bg-white dark:bg-[#282828] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3f3f3f] p-6 w-full max-w-sm mx-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button ref={cancelRef} variant="secondary" size="sm" onClick={onCancel}>
            Hủy
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
