"use client";

import { forwardRef, InputHTMLAttributes, ReactNode, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, label, error, hint, leftIcon, rightIcon, id, ...props },
    ref,
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = type === "password";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-semibold mb-2 transition-colors duration-200",
              isFocused ? "text-primary-600" : "text-gray-700",
              error && "text-red-600",
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200",
                isFocused ? "text-primary-500" : "text-gray-600",
                error && "text-red-500",
              )}
            >
              {leftIcon}
            </div>
          )}

          <input
            type={isPassword && showPassword ? "text" : type}
            id={inputId}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              // Base
              "relative w-full rounded-2xl border-2 bg-white px-4 py-3.5 text-sm",
              "text-gray-800 font-medium",
              "transition-all duration-200 ease-out",
              "placeholder:text-gray-400 placeholder:font-normal",
              // Border states
              "border-gray-200",
              "hover:border-gray-300",
              "focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10",
              // Disabled
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-50",
              // Icon spacing
              leftIcon && "pl-12",
              (rightIcon || isPassword) && "pr-12",
              // Error
              error && "border-red-400 focus:border-red-500",
              className,
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 z-10",
                "p-1 rounded-lg transition-all duration-200",
                "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
                "active:scale-95",
              )}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}

          {rightIcon && !isPassword && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-gray-600">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5 animate-in fade-in duration-200">
            <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full" />
            {error}
          </p>
        )}
        {hint && !error && <p className="mt-2 text-sm text-gray-400">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
