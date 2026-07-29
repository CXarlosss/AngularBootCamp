/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ CelebrationOverlay — Overlay de celebración gamificada
 * Partículas, confeti, glassmorphism, accesibilidad completa
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GLASS,
  BTN,
  TEXT,
  DECORATIVE,
  A11Y,
  way,
} from '@/shared/lib/wayTheme';
import { hapticService } from '@/core/services/hapticService';
import { Button } from './Button';

// ───────────────────────────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────────────────────────
export interface CelebrationOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  reward?: {
    type: string;
    amount: number;
    icon?: string;
  };
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  autoClose?: boolean;
  autoCloseDelay?: number;
}

// ───────────────────────────────────────────────────────────────
// PARTICLE CONFIG
// ───────────────────────────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  shape: 'circle' | 'square' | 'star';
  delay: number;
  duration: number;
}

const COLORS = [
  '#6366F1', // indigo
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EC4899', // pink
  '#8B5CF6', // violet
  '#14B8A6', // teal
  '#F43F5E', // rose
];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    rotation: Math.random() * 360,
    scale: 0.5 + Math.random() * 1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: ['circle', 'square', 'star'][Math.floor(Math.random() * 3)] as Particle['shape'],
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1,
  }));
}

// ───────────────────────────────────────────────────────────────
// PARTICLE COMPONENT
// ───────────────────────────────────────────────────────────────
const ParticleItem: React.FC<{ particle: Particle }> = ({ particle }) => {
  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-sm',
    star: '',
  };

  return (
    <motion.div
      className={way('absolute pointer-events-none', shapeClasses[particle.shape])}
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: particle.scale * 12,
        height: particle.scale * 12,
        backgroundColor: particle.color,
      }}
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, particle.scale, particle.scale * 0.5, 0],
        rotate: [0, particle.rotation, particle.rotation + 180],
        y: [0, -50 - Math.random() * 100, -30],
      }}
      transition={{
        duration: particle.duration,
        delay: particle.delay,
        ease: 'easeOut',
      }}
    />
  );
};

// ───────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ───────────────────────────────────────────────────────────────
export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  isVisible,
  onClose,
  title = '¡Felicidades!',
  message = 'Has completado el desafío con éxito.',
  reward,
  primaryAction,
  secondaryAction,
  autoClose = false,
  autoCloseDelay = 5000,
}) => {
  const particles = React.useMemo(() => generateParticles(30), [isVisible]);

  // Haptic on show
  useEffect(() => {
    if (isVisible) {
      hapticService.celebration();
    }
  }, [isVisible]);

  // Auto close
  useEffect(() => {
    if (!isVisible || !autoClose) return;
    const timer = setTimeout(onClose, autoCloseDelay);
    return () => clearTimeout(timer);
  }, [isVisible, autoClose, autoCloseDelay, onClose]);

  // Escape to close
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={way(
            'fixed inset-0 z-[100] flex items-center justify-center',
            'bg-slate-900/40 backdrop-blur-sm'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="celebration-title"
          aria-describedby="celebration-desc"
        >
          {/* Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <ParticleItem key={p.id} particle={p} />
            ))}
          </div>

          {/* Card */}
          <motion.div
            className={way(
              GLASS.modalContent,
              'relative mx-4 max-w-sm w-full p-6 sm:p-8 text-center',
              'overflow-hidden'
            )}
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
          >
            {/* Decorative orb */}
            <div className={DECORATIVE.orb('amber', 'top-right')} aria-hidden="true" />

            {/* Trophy / Icon */}
            <motion.div
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-4xl border-4 border-amber-200 shadow-lg"
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {reward?.icon || '🏆'}
            </motion.div>

            {/* Title */}
            <motion.h2
              id="celebration-title"
              className={TEXT.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h2>

            {/* Message */}
            <motion.p
              id="celebration-desc"
              className={way(TEXT.micro, 'mt-2')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {message}
            </motion.p>

            {/* Reward */}
            {reward && (
              <motion.div
                className={way(
                  'mt-5 inline-flex items-center gap-2 rounded-full',
                  'bg-amber-50 px-5 py-2.5 text-amber-800 font-bold',
                  'border border-amber-200 shadow-sm'
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                <span className="text-xl" role="img" aria-hidden="true">
                  {reward.icon || '⭐'}
                </span>
                +{reward.amount} {reward.type}
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              className="mt-6 space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {primaryAction && (
                <Button
                  variant="claim"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    hapticService.success();
                    primaryAction.onClick();
                  }}
                >
                  {primaryAction.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    hapticService.click();
                    secondaryAction.onClick();
                  }}
                >
                  {secondaryAction.label}
                </Button>
              )}
              {!primaryAction && !secondaryAction && (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    hapticService.click();
                    onClose();
                  }}
                >
                  Continuar
                </Button>
              )}
            </motion.div>

            {/* Auto-close hint */}
            {autoClose && (
              <motion.p
                className={way(TEXT.micro, 'mt-4 text-slate-400')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Se cerrará automáticamente en unos segundos
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CelebrationOverlay;
