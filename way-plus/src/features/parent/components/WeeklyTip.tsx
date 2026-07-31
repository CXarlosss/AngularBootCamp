/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ WeeklyTip — Tarjeta de consejo reutilizable
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GLASS, way } from '@/shared/lib/wayTheme';
import { hapticService } from '@/core/services/hapticService';

interface WeeklyTipProps {
  icon: string;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const WeeklyTip: React.FC<WeeklyTipProps> = ({ icon, title, body, actionLabel, onAction }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className={way(GLASS.card, 'rounded-2xl overflow-hidden')}
      layout
    >
      <button
        className="flex w-full items-start gap-3 p-4 text-left"
        onClick={() => {
          hapticService.click();
          setExpanded(!expanded);
        }}
        aria-expanded={expanded}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl">
          {icon}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-900">{title}</p>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <p className={way('mt-2 text-sm text-slate-600 leading-relaxed')}>{body}</p>
                {actionLabel && onAction && (
                  <button
                    className={way(
                      'mt-2 text-sm font-semibold text-indigo-600 underline underline-offset-2',
                      'focus-visible:ring-2 focus-visible:ring-indigo-500/50'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction();
                    }}
                  >
                    {actionLabel}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span className="text-slate-400" aria-hidden="true">
          {expanded ? '▲' : '▼'}
        </span>
      </button>
    </motion.div>
  );
};
