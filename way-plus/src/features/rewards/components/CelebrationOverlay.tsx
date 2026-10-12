/**
 * ═══════════════════════════════════════════════════════════════
 * CelebrationOverlay v2 — Más impacto, más visible, más recompensa
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState, useRef } from 'react';
import { audioService } from '@/core/utils/audioService';
import { motion, AnimatePresence } from 'framer-motion';
import { useReduceMotion } from '@/core/stores/configStore';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { hapticService } from '@/core/services/hapticService';

interface CelebrationOverlayProps {
  show: boolean;
  type: 'happy' | 'sad' | 'step-complete' | 'annex-complete';
  coins?: number;
  onComplete?: () => void;
}

const PARTICLE_EMOJIS = ['⭐', '✨', '🎉', '🎊', '💫', '🌟', '🏆', '🎈'];

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  show,
  type,
  coins = 0,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'enter' | 'coins' | 'exit'>('enter');
  const [displayCoins, setDisplayCoins] = useState(0);
  const reduceMotion = useReduceMotion();
  const profile = usePlayerStore((s) => s.profile);
  const isFemale = profile?.gender === 'female';
  const labelCampeon = isFemale ? '¡Eres una campeona!' : '¡Eres un campeón!';
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (!show) {
      setPhase('enter');
      setDisplayCoins(0);
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      return;
    }

    if (type !== 'sad') {
      audioService.playSFX('success');
      hapticService.celebration();
    }

    const t1 = window.setTimeout(() => {
      setPhase('coins');
      if (coins > 0) {
        let current = 0;
        const step = Math.max(1, Math.ceil(coins / 15));
        const interval = window.setInterval(() => {
          current += step;
          if (current >= coins) {
            setDisplayCoins(coins);
            clearInterval(interval);
          } else {
            setDisplayCoins(current);
          }
        }, 40);
      }
    }, 600);
    timersRef.current.push(t1);

    const t2 = window.setTimeout(() => {
      setPhase('exit');
      const t3 = window.setTimeout(() => onComplete?.(), 400);
      timersRef.current.push(t3);
    }, 2800);
    timersRef.current.push(t2);

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [show, coins, onComplete, type]);

  if (!show) return null;

  const config = {
    happy: { emoji: '🏆', title: '¡Bravo!', subtitle: labelCampeon, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    sad: { emoji: '😢', title: '¡Casi!', subtitle: 'Inténtalo de nuevo', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
    'step-complete': { emoji: '👑', title: '¡Increíble!', subtitle: 'Nivel superado', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    'annex-complete': { emoji: '🧩', title: '¡Completado!', subtitle: 'Anexo completado', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  }[type];

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
      >
        {/* Partículas */}
        {!reduceMotion && type !== 'sad' && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const distance = 60 + Math.random() * 60;
              const tx = Math.cos(angle) * distance;
              const ty = Math.sin(angle) * distance - 40;
              const size = 0.8 + Math.random() * 0.8;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.3, size, 0.3],
                    x: tx,
                    y: ty,
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 1.2 + Math.random() * 0.6,
                    delay: i * 0.06,
                    ease: 'easeOut',
                  }}
                  className="absolute left-1/2 top-1/2 text-2xl"
                >
                  {PARTICLE_EMOJIS[i % PARTICLE_EMOJIS.length]}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Card principal */}
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative z-10 w-[300px] rounded-3xl border border-white/50 bg-white p-8 text-center shadow-2xl sm:w-[360px]"
        >
          {/* Emoji grande */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 ${config.border} ${config.bg} text-3xl`}
          >
            {config.emoji}
          </motion.div>

          {/* Título */}
          <h2 className={`text-xl font-black ${config.color}`}>{config.title}</h2>
          <p className="mt-1 text-sm font-bold text-slate-600">{config.subtitle}</p>

          {/* Badge */}
          {type !== 'sad' && (
            <span className="mt-3 inline-block rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Super atleta WAY+
            </span>
          )}

          {/* Monedas animadas */}
          <AnimatePresence>
            {phase === 'coins' && coins > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-5 flex items-center justify-center gap-2"
              >
                <span className="text-2xl">🪙</span>
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Medallas</p>
                  <p className="text-2xl font-black text-slate-900 tabular-nums">+{displayCoins}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CelebrationOverlay;
