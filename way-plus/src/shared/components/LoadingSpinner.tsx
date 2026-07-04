import React from 'react';
import { cn } from '@/shared/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const SIZE_MAP = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
} as const;

export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)} role="status" aria-live="polite">
      <div className={cn(
        'rounded-full border-2 border-violet-200 border-t-violet-500 animate-spin',
        SIZE_MAP[size]
      )} />
      {label && (
        <span className="text-xs font-bold text-slate-400">{label}</span>
      )}
    </div>
  );
}

export function FullScreenLoader({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="min-h-[50dvh] flex flex-col items-center justify-center gap-3">
      <LoadingSpinner size="lg" />
      <span className="text-xs font-bold text-slate-400">{label}</span>
    </div>
  );
}
