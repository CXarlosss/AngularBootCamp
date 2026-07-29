import React from 'react';
import { motion } from 'framer-motion';
import type { Sticker } from '../data/collections';
import { cn } from '@/shared/lib/utils';

interface Props {
  sticker: Sticker;
  isLocked?: boolean;
  isShiny?: boolean;
  count?: number;
  onClick?: () => void;
}

/* ─── Tailwind class constants ─── */

const CARD_BASE =
  'relative w-full overflow-hidden flex flex-col items-center p-3 rounded-[1.5rem] border-2 transition-all duration-200 forced-colors:border-2 forced-colors:border-[#1E1B4B]';

const CARD_LOCKED =
  'bg-slate-200/80 backdrop-blur-sm border-slate-300/50 cursor-default opacity-70 forced-colors:bg-white forced-colors:opacity-100';

const CARD_NORMAL =
  'bg-white/90 backdrop-blur-md border-white/40 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 cursor-pointer forced-colors:bg-white';

const CARD_SHINY =
  'bg-gradient-to-br from-white via-indigo-50/50 to-white border-transparent shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-1 active:scale-95 cursor-pointer forced-colors:bg-white forced-colors:border-2 forced-colors:border-[#1E1B4B]';

const SHINY_BORDER =
  'absolute inset-0 rounded-[1.5rem] p-[3px] pointer-events-none';

const SHINY_BORDER_ANIMATED =
  'absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-indigo-500 via-rose-500 via-amber-500 via-emerald-500 to-indigo-500 bg-[length:200%_200%] animate-[spin_4s_linear_infinite] opacity-60';

const SHINE_SWEEP =
  'absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-25deg] pointer-events-none z-10';

const ICON_CONTAINER =
  'text-[3.5rem] sm:text-[3.75rem] my-3 z-[2] transition-transform duration-200';

const ICON_LOCKED = 'grayscale opacity-20';

const ICON_SHINY = 'drop-shadow-[0_0_10px_rgba(99,102,241,0.4)] scale-110';

const RARITY_BADGE =
  'text-[10px] font-black uppercase tracking-widest mb-1 z-[2] forced-colors:text-[#1E1B4B]';

const NAME_TEXT =
  'text-sm font-black text-indigo-950 text-center leading-tight z-[2] max-w-[90px] forced-colors:text-[#1E1B4B]';

const COUNT_BADGE =
  'absolute top-2.5 right-2.5 bg-indigo-950 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm z-20 forced-colors:bg-[#1E1B4B]';

const LOCK_OVERLAY =
  'absolute inset-0 flex items-center justify-center text-4xl opacity-10 z-[5]';

export const CollectibleCard: React.FC<Props> = ({
  sticker,
  isLocked = false,
  isShiny = false,
  count = 0,
  onClick,
}) => {
  const getRarityClass = () => {
    switch (sticker.rarity) {
      case 'common':
        return 'text-slate-500';
      case 'rare':
        return 'text-blue-500';
      case 'epic':
        return 'text-violet-500';
      case 'legendary':
        return 'text-amber-500';
      default:
        return 'text-indigo-500';
    }
  };

  const cardClass = isLocked
    ? CARD_LOCKED
    : isShiny
    ? CARD_SHINY
    : CARD_NORMAL;

  return (
    <motion.div
      whileHover={isLocked ? {} : { scale: 1.03 }}
      onClick={isLocked ? undefined : onClick}
      className={cn(CARD_BASE, cardClass)}
      style={{ aspectRatio: '2.5/3.5' }}
      role={isLocked ? 'img' : 'button'}
      aria-label={
        isLocked
          ? `Cromo bloqueado: ${sticker.name}`
          : `${sticker.name}, rareza ${sticker.rarity}${
              isShiny ? ', brillante' : ''
            }${count > 1 ? `, cantidad ${count}` : ''}`
      }
      tabIndex={isLocked ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          !isLocked && onClick?.();
        }
      }}
    >
      {/* Shiny Border Effect */}
      {isShiny && !isLocked && (
        <div className={SHINY_BORDER}>
          <div className={SHINY_BORDER_ANIMATED} />
        </div>
      )}

      {/* Holographic Shine Sweep */}
      {(isShiny || sticker.rarity === 'legendary') && !isLocked && (
        <motion.div
          animate={{ x: ['-200%', '200%'] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
          className={SHINE_SWEEP}
          aria-hidden="true"
        />
      )}

      {/* Card Content */}
      <div
        className={cn(
          ICON_CONTAINER,
          isLocked && ICON_LOCKED,
          isShiny && ICON_SHINY
        )}
        aria-hidden="true"
      >
        {sticker.icon}
      </div>

      <div
        className={cn(
          RARITY_BADGE,
          getRarityClass()
        )}
      >
        {isShiny ? '✨ BRILLANTE ✨' : sticker.rarity}
      </div>

      <div className={NAME_TEXT}>{sticker.name}</div>

      {count > 1 && !isLocked && (
        <div className={COUNT_BADGE}>x{count}</div>
      )}

      {isLocked && (
        <div className={LOCK_OVERLAY} aria-hidden="true">
          🔒
        </div>
      )}
    </motion.div>
  );
};
