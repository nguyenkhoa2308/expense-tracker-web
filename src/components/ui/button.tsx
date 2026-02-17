'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      leftIcon,
      rightIcon,
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'relative inline-flex items-center justify-center gap-2.5 font-semibold rounded-2xl',
      'transition-all duration-200 ease-out',
      'active:scale-[0.98]',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100'
    );

    const variants = {
      primary: cn(
        'bg-gradient-to-b from-primary-500 to-primary-600 text-white',
        'shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(124,58,237,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]',
        'hover:from-primary-600 hover:to-primary-700',
        'hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_20px_rgba(124,58,237,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2'
      ),
      secondary: cn(
        'bg-gradient-to-b from-gray-100 to-gray-200 text-gray-700',
        'shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]',
        'hover:from-gray-200 hover:to-gray-300',
        'focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:ring-offset-2',
        'dark:from-[#303030] dark:to-[#3a3a3a] dark:text-[#e0e0e0]',
        'dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]',
        'dark:hover:from-[#3a3a3a] dark:hover:to-[#444444]',
      ),
      outline: cn(
        'border-2 border-gray-200 bg-white text-gray-700',
        'shadow-sm',
        'hover:border-gray-300 hover:bg-gray-50',
        'focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:ring-offset-2',
        'dark:border-[#3f3f3f] dark:bg-[#212121] dark:text-[#e0e0e0]',
        'dark:hover:border-[#555555] dark:hover:bg-[#303030]',
      ),
      ghost: cn(
        'text-gray-600 bg-transparent',
        'hover:bg-gray-100 hover:text-gray-900',
        'focus:outline-none focus:ring-2 focus:ring-gray-500/30',
        'dark:text-[#aaaaaa] dark:hover:bg-[#303030] dark:hover:text-[#f1f1f1]',
      ),
      danger: cn(
        'bg-gradient-to-b from-red-500 to-red-600 text-white',
        'shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(239,68,68,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]',
        'hover:from-red-600 hover:to-red-700',
        'hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_20px_rgba(239,68,68,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]',
        'focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2'
      ),
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-5 py-3 text-sm',
      lg: 'px-7 py-3.5 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Đang xử lý...</span>
          </>
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
