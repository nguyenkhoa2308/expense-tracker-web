"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  emoji?: string;
}

export interface SelectProps {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  leftIcon?: ReactNode;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Select({
  label,
  error,
  hint,
  options,
  placeholder = "Chọn...",
  leftIcon,
  value,
  onChange,
  disabled,
  className,
  id,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectId = id || label?.toLowerCase().replace(/\s/g, "-");

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsFocused(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange?.({ target: { value: optionValue } });
    setIsOpen(false);
    setIsFocused(false);
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
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
        {/* Select trigger */}
        <button
          type="button"
          id={selectId}
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen);
              setIsFocused(true);
            }
          }}
          className={cn(
            // Base
            "relative w-full rounded-2xl border-2 px-4 py-3.5 text-left",
            "text-gray-800 font-medium",
            "transition-all duration-200 ease-out",
            "bg-white",
            // Border states
            "border-gray-200",
            "hover:border-gray-300",
            // Focus/Open
            isFocused &&
              "border-primary-500 shadow-[0_0_0_3px_rgba(124,58,237,0.15)]",
            // Disabled
            "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-50",
            // Icon spacing
            leftIcon && "pl-12",
            // Error
            error && "border-red-400",
            error && isFocused && "shadow-[0_0_0_3px_rgba(239,68,68,0.15)]",
            className,
          )}
        >
          {leftIcon && (
            <div
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                isFocused ? "text-primary-500" : "text-gray-400",
                error && "text-red-400",
              )}
            >
              {leftIcon}
            </div>
          )}

          <span
            className={cn(
              "block truncate pr-8",
              !selectedOption && "text-gray-400 font-normal",
            )}
          >
            {selectedOption ? (
              <>
                {selectedOption.emoji && (
                  <span className="mr-2">{selectedOption.emoji}</span>
                )}
                {selectedOption.label}
              </>
            ) : (
              placeholder
            )}
          </span>

          <ChevronDown
            size={18}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-200",
              isFocused ? "text-primary-500" : "text-gray-400",
              isOpen && "rotate-180",
            )}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            className={cn(
              "absolute z-50 w-full mt-2 py-2 rounded-2xl",
              "bg-white border border-gray-200",
              "shadow-xl shadow-gray-200/50",
              "animate-in fade-in slide-in-from-top-2 duration-200",
              "max-h-64 overflow-auto",
            )}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full px-4 py-3 text-sm text-gray-500 text-left flex items-center gap-3",
                    "transition-all duration-150",
                    "hover:bg-primary-50",
                    isSelected && "bg-primary-50 text-primary-600 font-medium",
                  )}
                >
                  {option.emoji && (
                    <span className="text-lg w-6 text-center">
                      {option.emoji}
                    </span>
                  )}
                  <span className="flex-1">{option.label}</span>
                  {isSelected && (
                    <Check size={16} className="text-primary-600" />
                  )}
                </button>
              );
            })}
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
}
