'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <label
        htmlFor={switchId}
        className={cn(
          'flex items-center justify-between cursor-pointer group',
          props.disabled && 'cursor-not-allowed opacity-60',
          className
        )}
      >
        {label && (
          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
            {label}
          </span>
        )}
        <div className="relative">
          <input
            type="checkbox"
            id={switchId}
            ref={ref}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              'switch-track w-11 h-6 rounded-full transition-all duration-200',
              'peer-checked:!bg-primary-500',
              'peer-focus:ring-4 peer-focus:ring-primary-500/20',
              'peer-disabled:opacity-60 peer-disabled:cursor-not-allowed'
            )}
          />
          <div
            className={cn(
              'switch-thumb absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all duration-200',
              'shadow-sm',
              'peer-checked:translate-x-5'
            )}
          />
        </div>
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };
