import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { way, wayTheme } from '../lib/wayTheme';
import { hapticService } from '../../core/services/hapticService';
import { Button } from './Button';

export interface InteractiveCardProps {
  title: string;
  description: string;
  imageUrl?: string;
  status: 'completed' | 'current' | 'locked' | 'warning' | 'error';
  progress?: number;
  progressColor?: 'indigo' | 'emerald' | 'amber' | 'violet';
  badge?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  title,
  description,
  imageUrl,
  status,
  progress,
  progressColor = 'indigo',
  badge,
  actionLabel,
  onAction,
}) => {
  const isLocked = status === 'locked';

  const handlePointerDown = () => {
    if (isLocked) {
      hapticService.error();
    } else {
      hapticService.click();
    }
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocked) {
      hapticService.error();
      return;
    }
    hapticService.success();
    onAction?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isLocked) {
        handleAction(e as any);
      }
    }
  };

  return (
    <motion.div
      className={way(
        'relative overflow-hidden rounded-2xl p-4 sm:p-6 transition-all duration-300',
        wayTheme.GLASS.card,
        isLocked ? 'opacity-75 grayscale-[20%]' : wayTheme.INTERACTIVE.hover
      )}
      role="button"
      tabIndex={isLocked ? -1 : 0}
      aria-disabled={isLocked}
      aria-label={`${title}. ${description}. Estado: ${status}`}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      onClick={() => { if (!isLocked && onAction) handleAction({ stopPropagation: () => {} } as any); }}
      whileHover={!isLocked ? { scale: 1.02, y: -4 } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
    >
      {/* Decorative Orb */}
      <div className={wayTheme.DECORATIVE.orb('bg-indigo-500/20', '-top-20 -right-20')} />

      <div className="relative z-10 flex gap-4 sm:gap-6 items-start">
        {imageUrl && (
          <div className="relative shrink-0">
            <img 
              src={imageUrl} 
              alt="" 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-zinc-800"
            />
            {isLocked && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-8 h-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {badge && (
              <span className={way('px-2.5 py-0.5 rounded-full text-xs font-bold', wayTheme.STATUS[status])}>
                {badge}
              </span>
            )}
          </div>
          
          <h3 className={way(wayTheme.TEXT.title, 'text-xl sm:text-2xl mb-1 truncate')}>
            {title}
          </h3>
          
          <p className={way(wayTheme.TEXT.subtitle, 'text-sm sm:text-base line-clamp-2 mb-4')}>
            {description}
          </p>

          {progress !== undefined && !isLocked && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className={wayTheme.TEXT.micro}>Progreso</span>
                <span className={way(wayTheme.TEXT.micro, 'font-bold')}>{progress}%</span>
              </div>
              <div className={wayTheme.PROGRESS.track}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={wayTheme.PROGRESS.fill[progressColor]}
                />
              </div>
            </div>
          )}

          {actionLabel && (
            <div className="mt-2">
              <Button 
                variant={status === 'completed' ? 'secondary' : 'primary'} 
                size="sm"
                disabled={isLocked}
                onClick={handleAction}
              >
                {actionLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
