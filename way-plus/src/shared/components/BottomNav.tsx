/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ BottomNav — Navegación inferior nativa
 * Glassmorphism, indicador animado, badges, haptics
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GLASS,
  A11Y,
  way,
} from '@/shared/lib/wayTheme';
import { SAFE } from '@/shared/lib/wayResponsive';
import { hapticService } from '@/core/services/hapticService';

// ───────────────────────────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────────────────────────
export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  badge?: number | string;
  badgeColor?: string;
  disabled?: boolean;
}

export interface BottomNavProps {
  items: NavItem[];
  activeId: string;
  onChange: (id: string) => void;
  showLabels?: boolean;
  className?: string;
}

// ───────────────────────────────────────────────────────────────
// COMPONENT
// ───────────────────────────────────────────────────────────────
export const BottomNav: React.FC<BottomNavProps> = ({
  items,
  activeId,
  onChange,
  showLabels = true,
  className,
}) => {
  const activeIndex = items.findIndex((item) => item.id === activeId);

  return (
    <nav
      className={way(
        GLASS.bottomNav,
        'fixed bottom-0 left-0 right-0 z-50',
        SAFE.safeBottom,
        className
      )}
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {items.map((item, index) => {
          const isActive = item.id === activeId;
          const isDisabled = item.disabled;

          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              onClick={() => {
                if (isDisabled) {
                  hapticService.error();
                  return;
                }
                hapticService.click();
                onChange(item.id);
              }}
              className={way(
                'relative flex flex-col items-center justify-center',
                'min-h-[44px] min-w-[44px] flex-1 rounded-2xl',
                'transition-colors duration-200',
                isActive
                  ? 'text-indigo-600'
                  : 'text-slate-400 hover:text-slate-600',
                isDisabled && 'opacity-40 cursor-not-allowed',
                'focus-visible:ring-4 focus-visible:ring-indigo-500/50 focus-visible:outline-none',
                'forced-colors:border-2 forced-colors:border-[#1E1B4B]'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 rounded-2xl bg-indigo-50/80"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              {/* Icon */}
              <div className="relative z-10">
                <span className="flex h-6 w-6 items-center justify-center">
                  {isActive && item.activeIcon ? item.activeIcon : item.icon}
                </span>

                {/* Badge */}
                {item.badge !== undefined && (
                  <span
                    className={way(
                      'absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center',
                      'rounded-full px-1 text-[10px] font-bold text-white',
                      item.badgeColor || 'bg-rose-500'
                    )}
                    aria-label={`${item.badge} notificaciones`}
                  >
                    {typeof item.badge === 'number' && item.badge > 99
                      ? '99+'
                      : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              {showLabels && (
                <span
                  className={way(
                    'relative z-10 mt-1 text-[10px] font-semibold',
                    isActive ? 'text-indigo-600' : 'text-slate-400'
                  )}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
