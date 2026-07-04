import React from 'react';
import { cn } from '@/shared/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'warning';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANT_MAP: Record<ButtonVariant, string> = {
  primary: 'bg-violet-500 text-white hover:bg-violet-600 border-transparent',
  secondary: 'bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600 border-transparent',
  danger: 'bg-rose-500 text-white hover:bg-rose-600 border-transparent',
  warning: 'bg-amber-400 text-amber-900 hover:bg-amber-500 border-transparent',
};

const SIZE_MAP: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs min-h-[36px] rounded-lg',
  md: 'px-4 py-2 text-sm min-h-[44px] rounded-xl',
  lg: 'px-6 py-3 text-base min-h-[48px] rounded-xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    leftIcon,
    rightIcon,
    className,
    children,
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || isLoading;
    
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'font-bold',
          'active:scale-95 transition-transform duration-150',
          'focus-visible:ring-2 focus-visible:ring-violet-400/40',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          VARIANT_MAP[variant],
          SIZE_MAP[size],
          isLoading && 'relative text-transparent',
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          </span>
        )}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
