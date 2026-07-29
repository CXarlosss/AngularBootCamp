/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ Avatar — Componente base nativo
 * Avatar con glassmorphism, badges de estado y tamaños adaptativos
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  A11Y,
  way,
} from '@/shared/lib/wayTheme';
import { SIZE } from '@/shared/lib/wayResponsive';

// ───────────────────────────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────────────────────────
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

export interface AvatarProps {
  src?: string;
  alt: string;
  fallback?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  border?: boolean;
  borderColor?: string;
  className?: string;
  onClick?: () => void;
}

// ───────────────────────────────────────────────────────────────
// CONFIG
// ───────────────────────────────────────────────────────────────
const SIZE_MAP: Record<AvatarSize, string> = {
  xs:   'h-6 w-6 text-[10px]',
  sm:   'h-8 w-8 text-xs',
  md:   'h-10 w-10 text-sm',
  lg:   'h-12 w-12 text-base',
  xl:   'h-16 w-16 text-lg',
  hero: SIZE.avatarHero, // w-16 h-16 sm:w-20 sm:h-20
};

const STATUS_CONFIG: Record<AvatarStatus, { color: string; label: string }> = {
  online:  { color: 'bg-emerald-500', label: 'En línea' },
  offline: { color: 'bg-slate-400', label: 'Desconectado' },
  away:    { color: 'bg-amber-400', label: 'Ausente' },
  busy:    { color: 'bg-rose-500', label: 'Ocupado' },
};

// ───────────────────────────────────────────────────────────────
// COMPONENT
// ───────────────────────────────────────────────────────────────
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'md',
  status,
  border = false,
  borderColor = 'border-white',
  className,
  onClick,
}) => {
  const [hasError, setHasError] = React.useState(false);
  const showFallback = !src || hasError;
  const initials = fallback || alt.slice(0, 2).toUpperCase();

  return (
    <div
      className={way(
        'relative inline-flex shrink-0',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <motion.div
        className={way(
          'relative flex items-center justify-center overflow-hidden rounded-full',
          'bg-gradient-to-br from-indigo-100 to-violet-100',
          'text-indigo-700 font-bold',
          SIZE_MAP[size],
          border && `border-2 ${borderColor} shadow-md`,
          'forced-colors:border-2 forced-colors:border-[#1E1B4B]'
        )}
        whileTap={onClick ? { scale: 0.92 } : undefined}
      >
        {showFallback ? (
          <span className="select-none">{initials}</span>
        ) : (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            onError={() => setHasError(true)}
            loading="lazy"
          />
        )}
      </motion.div>

      {/* Status indicator */}
      {status && (
        <span
          className={way(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
            STATUS_CONFIG[status].color,
            size === 'xs' || size === 'sm' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'
          )}
          aria-label={STATUS_CONFIG[status].label}
          role="status"
        />
      )}
    </div>
  );
};

// ───────────────────────────────────────────────────────────────
// AVATAR GROUP
// ───────────────────────────────────────────────────────────────
export interface AvatarGroupProps {
  avatars: Array<Omit<AvatarProps, 'size'>>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'md',
  className,
}) => {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={way('flex items-center -space-x-2', className)}>
      {visible.map((avatar, index) => (
        <div
          key={index}
          className="relative z-[1] ring-2 ring-white rounded-full"
          style={{ zIndex: visible.length - index }}
        >
          <Avatar {...avatar} size={size} border />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={way(
            'relative z-0 flex items-center justify-center rounded-full',
            'bg-slate-200 text-slate-600 font-bold text-xs',
            'ring-2 ring-white',
            SIZE_MAP[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default Avatar;
