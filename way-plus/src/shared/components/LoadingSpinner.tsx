/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ LoadingSpinner — Componente base nativo
 * Full-screen loader, inline spinner, skeletons
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  GLASS,
  DECORATIVE,
  A11Y,
  way,
} from '@/shared/lib/wayTheme';

// ───────────────────────────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────────────────────────
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export interface FullScreenLoaderProps {
  message?: string;
  subMessage?: string;
  showOrbs?: boolean;
}

export interface SkeletonProps {
  className?: string;
  count?: number;
  circle?: boolean;
}

// ───────────────────────────────────────────────────────────────
// SIZE MAP
// ───────────────────────────────────────────────────────────────
const SPINNER_SIZES: Record<SpinnerSize, string> = {
  xs: 'h-4 w-4 border-2',
  sm: 'h-6 w-6 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-[3px]',
  xl: 'h-16 w-16 border-4',
};

// ───────────────────────────────────────────────────────────────
// INLINE SPINNER
// ───────────────────────────────────────────────────────────────
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'border-indigo-600',
  className,
  ariaLabel = 'Cargando',
}) => {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={way('inline-flex items-center justify-center', className)}
    >
      <div
        className={way(
          'animate-spin rounded-full',
          'border-t-transparent',
          SPINNER_SIZES[size],
          color,
          'forced-colors:border-[CanvasText]'
        )}
        aria-hidden="true"
      />
      <span className={A11Y.srOnly}>{ariaLabel}</span>
    </div>
  );
};

// ───────────────────────────────────────────────────────────────
// FULL SCREEN LOADER
// ───────────────────────────────────────────────────────────────
export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  message = 'Cargando...',
  subMessage,
  showOrbs = true,
}) => {
  return (
    <div
      className={way(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center',
        'bg-white/90 backdrop-blur-lg'
      )}
      role="alert"
      aria-live="polite"
      aria-busy="true"
    >
      {showOrbs && (
        <>
          <div className={DECORATIVE.orb('indigo', 'top-right')} aria-hidden="true" />
          <div className={DECORATIVE.orb('violet', 'bottom-left')} aria-hidden="true" />
        </>
      )}

      <motion.div
        className={way(
          GLASS.card,
          'relative flex flex-col items-center rounded-3xl p-8 sm:p-12',
          'max-w-sm mx-4'
        )}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated rings */}
        <div className="relative flex items-center justify-center">
          <motion.div
            className="absolute h-20 w-20 rounded-full border-2 border-indigo-200/50"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute h-14 w-14 rounded-full border-2 border-indigo-300/50"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 0.3 }}
          />
          <LoadingSpinner size="lg" />
        </div>

        <motion.p
          className="mt-6 text-lg font-semibold text-slate-800"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>

        {subMessage && (
          <motion.p
            className="mt-2 text-sm text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {subMessage}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────────
// SKELETON LOADER
// ───────────────────────────────────────────────────────────────
export const Skeleton: React.FC<SkeletonProps> = ({
  className = 'h-4 w-full',
  count = 1,
  circle = false,
}) => {
  return (
    <div className="space-y-2 w-full" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={way(
            'bg-slate-200/60',
            circle ? 'rounded-full' : 'rounded-xl',
            'animate-pulse',
            className
          )}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
        />
      ))}
    </div>
  );
};

// ───────────────────────────────────────────────────────────────
// SKELETON CARD
// ───────────────────────────────────────────────────────────────
export const SkeletonCard: React.FC = () => {
  return (
    <div className={way(GLASS.card, 'rounded-3xl p-5 space-y-4')} aria-hidden="true">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12" circle />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
};

export default LoadingSpinner;
