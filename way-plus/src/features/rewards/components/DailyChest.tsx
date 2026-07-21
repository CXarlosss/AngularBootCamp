// src/features/rewards/components/DailyChest.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDailyChest } from '../hooks/useDailyChest';
import type { DailyReward } from '../utils/dailyChestUtils';
import { rw } from '@/shared/lib/wayResponsive';

/* ─── Tailwind class constants for readability ─── */

/* Container states */
const CHEST_CONTAINER_BASE =
  rw('modalWidth', 'relative mx-auto rounded-3xl p-8 text-center overflow-hidden cursor-pointer select-none forced-colors:border-2 forced-colors:border-[#1E1B4B]');

const CHEST_CONTAINER_AVAILABLE =
  'bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white shadow-xl shadow-indigo-500/20 border border-white/20';

const CHEST_CONTAINER_WAITING =
  'bg-white/80 backdrop-blur-md text-slate-500 border-2 border-slate-200 shadow-none';

/* Sparkles */
const SPARKLE_BASE =
  'absolute text-2xl pointer-events-none select-none forced-colors:opacity-100';

/* Title & subtitle */
const CHEST_TITLE =
  'text-xl font-black uppercase tracking-tight drop-shadow-md mb-1 forced-colors:text-[#1E1B4B]';

const CHEST_SUBTITLE =
  'text-sm font-bold opacity-90 mb-6 forced-colors:text-slate-600';

const WAITING_TITLE =
  'text-base font-black text-slate-500 mb-2 forced-colors:text-[#1E1B4B]';

/* Chest emoji */
const CHEST_EMOJI =
  'text-6xl leading-none drop-shadow-lg select-none forced-colors:text-[#1E1B4B]';

/* CTA badge */
const CTA_BADGE =
  'inline-block mt-4 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-sm border border-white/30 forced-colors:border-2 forced-colors:border-[#1E1B4B]';

const CTA_BADGE_AVAILABLE =
  'bg-white/20 text-white forced-colors:bg-white forced-colors:text-[#1E1B4B]';

const CTA_BADGE_OPENING =
  'bg-white/10 text-white/70 forced-colors:bg-white forced-colors:text-slate-500';

/* Modal */
const MODAL_OVERLAY =
  'fixed inset-0 z-[1100] bg-indigo-950/60 backdrop-blur-sm flex items-center justify-center p-5';

const MODAL_CARD =
  rw('modalWidth', 'bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-8 text-center shadow-2xl border-4 border-white/80 relative overflow-hidden forced-colors:bg-white forced-colors:border-4 forced-colors:border-[#1E1B4B]');

const MODAL_GLOW =
  'absolute inset-0 bg-gradient-to-br from-amber-100/40 via-transparent to-indigo-100/40 pointer-events-none';

const MODAL_TITLE =
  'text-2xl font-black text-indigo-950 mb-1 relative z-10 forced-colors:text-[#1E1B4B]';

const RARITY_BADGE_BASE =
  'inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 relative z-10 forced-colors:border-2 forced-colors:border-[#1E1B4B]';

const RARITY_COMMON = 'bg-slate-100 text-slate-700 border border-slate-200';
const RARITY_RARE = 'bg-indigo-50 text-indigo-700 border border-indigo-200';
const RARITY_EPIC = 'bg-violet-100 text-violet-700 border border-violet-200';
const RARITY_LEGENDARY =
  'bg-amber-100 text-amber-700 border border-amber-200 shadow-md shadow-amber-500/20';

const REWARD_ICON =
  'text-7xl mb-4 drop-shadow-lg relative z-10';

const REWARD_NAME =
  'text-xl font-black text-indigo-950 mb-1 relative z-10 forced-colors:text-[#1E1B4B]';

const REWARD_DESC =
  'text-sm text-slate-600 font-bold mb-8 relative z-10 forced-colors:text-slate-700';

const BTN_CLAIM =
  'w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-base shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all duration-200 focus-visible:ring-4 focus-visible:ring-indigo-500/50 outline-none relative z-10 forced-colors:bg-[#1E1B4B] forced-colors:border-2 forced-colors:border-[#1E1B4B]';

/* ─── Framer Motion variants ─── */

const shakeVariants = {
  shake: {
    x: [0, -6, 6, -6, 6, -3, 3, 0],
    rotate: [0, -3, 3, -3, 3, -1, 1, 0],
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
  idle: {
    y: [0, -6, 0],
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: 'easeInOut',
    },
  },
};

const sparkleVariants = {
  float: (i: number) => ({
    y: [0, -10, 0],
    opacity: [0.6, 1, 0.6],
    scale: [0.9, 1.1, 0.9],
    transition: {
      repeat: Infinity,
      duration: 2 + i * 0.5,
      ease: 'easeInOut',
      delay: i * 0.5,
    },
  }),
};

const glowVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'easeInOut',
    },
  },
};

const modalVariants = {
  hidden: { scale: 0.5, opacity: 0, y: 30 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { type: 'spring', damping: 20, stiffness: 300 },
  },
  exit: { scale: 0.5, opacity: 0, y: 30, transition: { duration: 0.2 } },
};

const rewardIconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', damping: 12, stiffness: 200, delay: 0.2 },
  },
};

const confettiColors = [
  'bg-amber-400',
  'bg-indigo-400',
  'bg-emerald-400',
  'bg-rose-400',
  'bg-violet-400',
];

/* ─── Component ─── */

interface Props {
  lastOpenedDate: string | null;
  onClaimReward: (reward: DailyReward) => void;
}

export const DailyChest: React.FC<Props> = ({
  lastOpenedDate,
  onClaimReward,
}) => {
  const {
    available,
    isOpening,
    reward,
    showModal,
    openChest,
    claimReward,
  } = useDailyChest(lastOpenedDate, onClaimReward);

  /* ─── Waiting state ─── */
  if (!available && !showModal) {
    return (
      <div
        className={`${CHEST_CONTAINER_BASE} ${CHEST_CONTAINER_WAITING}`}
        role="status"
        aria-label="Cofre diario no disponible. Vuelve mañana."
      >
        <div className="text-4xl mb-3 opacity-50 grayscale">⌛</div>
        <div className={WAITING_TITLE}>
          Vuelve mañana por más premios
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
          El cofre se recarga cada 24 horas
        </p>
      </div>
    );
  }

  /* ─── Rarity badge class ─── */
  const getRarityClass = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return RARITY_LEGENDARY;
      case 'epic':
        return RARITY_EPIC;
      case 'rare':
        return RARITY_RARE;
      default:
        return RARITY_COMMON;
    }
  };

  return (
    <>
      {/* ─── Chest container ─── */}
      <motion.div
        className={`${CHEST_CONTAINER_BASE} ${CHEST_CONTAINER_AVAILABLE}`}
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
        {/* Decorative sparkles */}
        {available && !isOpening && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                custom={i}
                variants={sparkleVariants}
                animate="float"
                className={SPARKLE_BASE}
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
          <h3 className={CHEST_TITLE}>¡Cofre Misterioso!</h3>
          <p className={CHEST_SUBTITLE}>
            Toca para descubrir tu premio diario
          </p>
        </div>

        {/* Chest emoji with animation */}
        <motion.div
          className={CHEST_EMOJI}
          variants={shakeVariants}
          animate={isOpening ? 'shake' : 'idle'}
          aria-hidden="true"
        >
          {isOpening ? '📦' : '🎁'}
        </motion.div>

        {/* CTA badge */}
        <motion.div
          variants={glowVariants}
          animate={isOpening ? {} : 'pulse'}
          className={`${CTA_BADGE} ${
            isOpening ? CTA_BADGE_OPENING : CTA_BADGE_AVAILABLE
          }`}
        >
          {isOpening ? 'Abriendo...' : '¡ABRIR AHORA!'}
        </motion.div>
      </motion.div>

      {/* ─── Reward modal ─── */}
      <AnimatePresence>
        {showModal && reward && (
          <motion.div
            className={MODAL_OVERLAY}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={claimReward}
            role="dialog"
            aria-modal="true"
            aria-label="Premio del cofre diario"
          >
            {/* Confetti particles */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${
                  confettiColors[i % confettiColors.length]
                }`}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 0,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 300,
                  y: (Math.random() - 0.5) * 300 - 100,
                  opacity: 0,
                  scale: [0, 1.5, 0],
                  rotate: Math.random() * 720,
                }}
                transition={{
                  duration: 1 + Math.random() * 0.5,
                  ease: 'easeOut',
                  delay: 0.1,
                }}
                style={{
                  left: '50%',
                  top: '40%',
                }}
                aria-hidden="true"
              />
            ))}

            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={MODAL_CARD}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={MODAL_GLOW} aria-hidden="true" />

              {/* Rarity badge */}
              <div className={`${RARITY_BADGE_BASE} ${getRarityClass(reward.rarity)}`}>
                {reward.rarity}
              </div>

              <h2 className={MODAL_TITLE}>¡Premio Encontrado!</h2>

              {/* Reward icon with spring animation */}
              <motion.div
                variants={rewardIconVariants}
                initial="hidden"
                animate="visible"
                className={REWARD_ICON}
                aria-hidden="true"
              >
                {reward.icon}
              </motion.div>

              <div className={REWARD_NAME}>
                {reward.type === 'coins'
                  ? `+${reward.amount} Medallas`
                  : reward.name}
              </div>
              <div className={REWARD_DESC}>
                {reward.type === 'coins'
                  ? 'Añadidas a tu vitrina de logros'
                  : '¡Nueva pieza para tu colección!'}
              </div>

              <button
                className={BTN_CLAIM}
                onClick={claimReward}
                autoFocus
              >
                ¡Genial, Gracias!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
