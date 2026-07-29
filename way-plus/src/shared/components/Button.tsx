import React, { forwardRef } from 'react';
import { way, wayTheme } from '../lib/wayTheme';
import { hapticService } from '../../core/services/hapticService';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof wayTheme.BTN;
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  noHaptic?: boolean;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', leftIcon, rightIcon, noHaptic, isLoading, onClick, disabled, children, ...props }, ref) => {
    
    const sizeClasses = {
      sm: 'text-sm min-h-[36px] px-3',
      md: 'text-base min-h-[44px] px-6',
      lg: 'text-lg min-h-[52px] px-8',
    };

    const isIconOnly = variant === 'icon' || variant === 'close';
    const finalSizeClasses = isIconOnly 
      ? size === 'sm' ? 'min-h-[36px] min-w-[36px]' : size === 'md' ? 'min-h-[44px] min-w-[44px]' : 'min-h-[52px] min-w-[52px]'
      : sizeClasses[size];

    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!disabled && !isLoading && !noHaptic) {
        hapticService.click();
      }
      props.onPointerDown?.(e);
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading || disabled) return;
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        className={way(
          'inline-flex items-center justify-center gap-2 transition-all duration-200 ease-in-out',
          wayTheme.INTERACTIVE.focus,
          (disabled || isLoading) ? wayTheme.INTERACTIVE.disabled : wayTheme.INTERACTIVE.hover,
          wayTheme.BTN[variant],
          finalSizeClasses,
          className
        )}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-disabled={disabled}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
