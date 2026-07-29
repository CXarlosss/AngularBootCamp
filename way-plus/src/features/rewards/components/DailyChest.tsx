import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDailyChest } from '../hooks/useDailyChest';
import type { DailyReward } from '../utils/dailyChestUtils';
import { rw, wayResponsive } from '@/shared/lib/wayResponsive';
import { way, wayTheme } from '@/shared/lib/wayTheme';
import { Button } from '@/shared/components/Button';

/* ─── Framer Motion variants ─── */
const shakeVariants = {
  shake: {
    x: [0, -6, 6, -6, 6, -3, 3, 0],
    rotate: [0, -3, 3, -3, 3, -1, 1, 0],
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
  idle: {
    y: [0, -6, 0],
    transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
  },
};

const sparkleVariants = {
  float: (i: number) => ({
    y: [0, -10, 0],
    opacity: [0.6, 1, 0.6],
    scale: [0.9, 1.1, 0.9],
    transition: { repeat: Infinity, duration: 2 + i * 0.5, ease: 'easeInOut', delay: i * 0.5 },
  }),
};

const glowVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
  },
};

const modalVariants = {
  hidden: { scale: 0.5, opacity: 0, y: 30 },
  visible: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 300 } },
  exit: { scale: 0.5, opacity: 0, y: 30, transition: { duration: 0.2 } },
};

const rewardIconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: { scale: 1, rotate: 0, transition: { type: 'spring', damping: 12, stiffness: 200, delay: 0.2 } },
};

const confettiColors = [
  'bg-amber-400', 'bg-indigo-400', 'bg-emerald-400', 'bg-rose-400', 'bg-violet-400',
];

interface Props {
  lastOpenedDate: string | null;
  onClaimReward: (reward: DailyReward) => void;
}

export const DailyChest: React.FC<Props> = ({ lastOpenedDate, onClaimReward }) => {
  const { available, isOpening, reward, showModal, openChest, claimReward } = useDailyChest(lastOpenedDate, onClaimReward);

  if (!available && !showModal) {
    return (
      <div
        className={way(wayResponsive.MODALS.modalWidth, wayTheme.GLASS.cardSolid, 'p-8 text-center overflow-hidden', wayTheme.A11Y.forcedColors)}
        role="status"
        aria-label="Cofre diario no disponible. Vuelve mañana."
      >
        <div className="text-4xl mb-3 opacity-50 grayscale">⌛</div>
        <div className={way(wayTheme.TEXT.title, 'text-base mb-2')}>Vuelve mañana por más premios</div>
        <p className={wayTheme.TEXT.label}>El cofre se recarga cada 24 horas</p>
      </div>
    );
  }

  const getRarityClass = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-amber-100 text-amber-700 border border-amber-200 shadow-md shadow-amber-500/20';
      case 'epic': return 'bg-violet-100 text-violet-700 border border-violet-200';
      case 'rare': return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <>
      <motion.div
        className={way(
          wayResponsive.MODALS.modalWidth, 
          'relative mx-auto rounded-3xl p-8 text-center overflow-hidden cursor-pointer select-none',
          wayTheme.A11Y.forcedColors,
          'bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white shadow-xl shadow-indigo-500/20 border border-white/20',
          !isOpening ? wayTheme.INTERACTIVE.hover : ''
        )}
        onClick={!isOpening ? openChest : undefined}
        role="button"
        tabIndex={available ? 0 : -1}
        aria-label="Cofre misterioso diario. Toca para abrir."
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            !isOpening && openChest();
          }
        }}
        whileHover={!isOpening ? { scale: 1.02 } : {}}
        whileTap={!isOpening ? { scale: 0.98 } : {}}
      >
        {available && !isOpening && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                custom={i}
                variants={sparkleVariants}
                animate="float"
                className="absolute text-2xl pointer-events-none select-none forced-colors:opacity-100"
                style={{
                  top: i === 0 ? '10%' : i === 1 ? '20%' : 'auto',
                  left: i === 0 ? '10%' : i === 1 ? 'auto' : '20%',
                  right: i === 1 ? '15%' : undefined,
                  bottom: i === 2 ? '15%' : undefined,
                }}
                aria-hidden="true"
              >
                {i === 1 ? '⭐' : '✨'}
              </motion.div>
            ))}
          </>
        )}

        <div className="relative z-10">
          <h3 className={way(wayTheme.TEXT.title, 'text-white mb-1 drop-shadow-md')}>¡Cofre Misterioso!</h3>
          <p className={way(wayTheme.TEXT.subtitle, 'text-white/90 mb-6')}>Toca para descubrir tu premio diario</p>
        </div>

        <motion.div
          className="text-6xl leading-none drop-shadow-lg select-none forced-colors:text-[#1E1B4B]"
          variants={shakeVariants}
          animate={isOpening ? 'shake' : 'idle'}
          aria-hidden="true"
        >
          {isOpening ? '📦' : '🎁'}
        </motion.div>

        <motion.div
          variants={glowVariants}
          animate={isOpening ? {} : 'pulse'}
          className={way(
            'inline-block mt-4 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-sm border',
            isOpening ? 'bg-white/10 text-white/70 border-transparent' : 'bg-white/20 text-white border-white/30',
            wayTheme.A11Y.forcedColors
          )}
        >
          {isOpening ? 'Abriendo...' : '¡ABRIR AHORA!'}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showModal && reward && (
          <motion.div
            className={way('fixed inset-0 z-[1100] flex items-center justify-center p-5', wayTheme.GLASS.modalOverlay)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={claimReward}
            role="dialog"
            aria-modal="true"
            aria-label="Premio del cofre diario"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${confettiColors[i % confettiColors.length]}`}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{
                  x: (Math.random() - 0.5) * 300,
                  y: (Math.random() - 0.5) * 300 - 100,
                  opacity: 0,
                  scale: [0, 1.5, 0],
                  rotate: Math.random() * 720,
                }}
                transition={{ duration: 1 + Math.random() * 0.5, ease: 'easeOut', delay: 0.1 }}
                style={{ left: '50%', top: '40%' }}
                aria-hidden="true"
              />
            ))}

            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={way(wayResponsive.MODALS.modalWidth, wayTheme.GLASS.modalContent, 'rounded-[2.5rem] p-8 text-center relative overflow-hidden')}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 via-transparent to-indigo-100/40 pointer-events-none" aria-hidden="true" />

              <div className={way('inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 relative z-10', getRarityClass(reward.rarity), wayTheme.A11Y.forcedColors)}>
                {reward.rarity}
              </div>

              <h2 className={way(wayTheme.TEXT.title, 'mb-1 relative z-10')}>¡Premio Encontrado!</h2>

              <motion.div
                variants={rewardIconVariants}
                initial="hidden"
                animate="visible"
                className="text-7xl mb-4 drop-shadow-lg relative z-10"
                aria-hidden="true"
              >
                {reward.icon}
              </motion.div>

              <div className={way(wayTheme.TEXT.title, 'text-xl mb-1 relative z-10')}>
                {reward.type === 'coins' ? `+${reward.amount} Medallas` : reward.name}
              </div>
              <div className={way(wayTheme.TEXT.subtitle, 'text-sm mb-8 relative z-10')}>
                {reward.type === 'coins' ? 'Añadidas a tu vitrina de logros' : '¡Nueva pieza para tu colección!'}
              </div>

              <Button
                variant="claim"
                className="w-full relative z-10"
                onClick={claimReward}
                autoFocus
              >
                ¡Genial, Gracias!
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
