import React from 'react';
import { cn } from '@/shared/lib/utils';

export const TYPOGRAPHY_SCALE = {
  micro: 'text-[10px]',
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
} as const;

export type TypographySize = keyof typeof TYPOGRAPHY_SCALE;

interface TProps extends React.HTMLAttributes<HTMLElement> {
  size: TypographySize;
  children: React.ReactNode;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div' | 'label';
  className?: string;
  bold?: boolean;
  color?: 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'danger' | 'white';
}

const COLOR_MAP = {
  default: 'text-slate-800',
  muted: 'text-slate-500',
  primary: 'text-violet-600',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-rose-600',
  white: 'text-white',
} as const;

export function T({ 
  size, 
  children, 
  as: Component = 'span', 
  className,
  bold = false,
  color = 'default',
  ...props
}: TProps) {
  return (
    <Component
      className={cn(
        TYPOGRAPHY_SCALE[size],
        COLOR_MAP[color],
        bold && 'font-bold',
        'leading-normal',
        'tracking-normal',
        className
      )}
      style={{ fontFamily: 'Verdana, sans-serif' }}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Emoji({ children, className, ...props }: { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLElement>) {
  return (
    <span className={cn('text-lg leading-none', className)} aria-hidden="true" {...props}>
      {children}
    </span>
  );
}
