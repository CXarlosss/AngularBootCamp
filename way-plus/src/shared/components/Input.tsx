/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ Input — Componente base nativo
 * Texto, email, password, textarea, con glassmorphism y a11y
 * ═══════════════════════════════════════════════════════════════
 */

import React, { forwardRef } from 'react';
import {
  GLASS,
  A11Y,
  way,
} from '@/shared/lib/wayTheme';

// ───────────────────────────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────────────────────────
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isTextarea?: boolean;
}

// ───────────────────────────────────────────────────────────────
// SIZE MAP
// ───────────────────────────────────────────────────────────────
const SIZE_CLASSES: Record<InputSize, string> = {
  sm: 'px-3 py-2 text-sm min-h-[36px] rounded-xl',
  md: 'px-4 py-3 text-base min-h-[44px] rounded-2xl',
  lg: 'px-5 py-4 text-lg min-h-[52px] rounded-2xl',
};

// ───────────────────────────────────────────────────────────────
// COMPONENT
// ───────────────────────────────────────────────────────────────
export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      leftIcon,
      rightIcon,
      isTextarea = false,
      className,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const hasError = !!error;

    const inputClasses = way(
      'w-full bg-white/80 backdrop-blur-sm',
      'border transition-all duration-200',
      'text-slate-800 placeholder:text-slate-400',
      'outline-none',
      SIZE_CLASSES[size],
      leftIcon && 'pl-11',
      rightIcon && 'pr-11',
      hasError
        ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20'
        : 'border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20',
      disabled && 'opacity-50 cursor-not-allowed bg-slate-100',
      'focus-visible:ring-4 focus-visible:ring-indigo-500/50 focus-visible:outline-none',
      'forced-colors:border-2 forced-colors:border-[#1E1B4B]',
      className
    );

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {isTextarea ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={inputId}
              className={way(inputClasses, 'resize-y min-h-[100px]')}
              disabled={disabled}
              aria-invalid={hasError}
              aria-describedby={
                hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
              }
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              id={inputId}
              className={inputClasses}
              disabled={disabled}
              aria-invalid={hasError}
              aria-describedby={
                hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
              }
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          )}

          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Helper / Error text */}
        {(helperText || error) && (
          <p
            id={hasError ? `${inputId}-error` : `${inputId}-helper`}
            className={way(
              'mt-1.5 text-xs',
              hasError ? 'font-medium text-rose-600' : 'text-slate-500'
            )}
            role={hasError ? 'alert' : undefined}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
