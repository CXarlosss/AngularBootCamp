/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ InteractiveTutorial — Tutorial gamificado
 * El niño APRENDE HACIENDO: tocar, arrastrar, soltar
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { GLASS, BTN, TEXT, way } from '@/shared/lib/wayTheme';
import { hapticService } from '@/core/services/hapticService';
import { useReduceMotion } from '@/core/stores/configStore';
import { Button } from '@/shared/components/Button';

interface TutorialStep {
  id: string;
  title: string;
  instruction: string;
  action: 'tap' | 'drag' | 'hold';
  targetEmoji: string;
  feedback: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'tap',
    title: 'Toca para avanzar',
    instruction: 'Toca la estrella para recogerla',
    action: 'tap',
    targetEmoji: '⭐',
    feedback: '¡Brillante! Así se recogen recompensas.',
  },
  {
    id: 'drag',
    title: 'Arrastra para mover',
    instruction: 'Arrastra el personaje hasta la puerta',
    action: 'drag',
    targetEmoji: '🚪',
    feedback: '¡Perfecto! En los niveles moverás cosas así.',
  },
  {
    id: 'hold',
    title: 'Mantén presionado',
    instruction: 'Mantén presionado el corazón para cargar energía',
    action: 'hold',
    targetEmoji: '❤️',
    feedback: '¡Energía al máximo! Así se activan poderes especiales.',
  },
];

interface InteractiveTutorialProps {
  characterEmoji: string;
  onComplete: () => void;
  onSkip: () => void;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  characterEmoji,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const reduceMotion = useReduceMotion();

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  const handleSuccess = useCallback(() => {
    hapticService.success();
    setShowFeedback(true);
    setCompleted((prev) => new Set(prev).add(step.id));

    setTimeout(() => {
      setShowFeedback(false);
      if (isLastStep) {
        hapticService.celebration();
        onComplete();
      } else {
        setCurrentStep((prev) => prev + 1);
        setDragPosition({ x: 0, y: 0 });
        setHoldProgress(0);
      }
    }, 1500);
  }, [step.id, isLastStep, onComplete]);

  // ─── TAP STEP ───
  const handleTap = () => {
    if (step.action !== 'tap' || completed.has(step.id)) return;
    handleSuccess();
  };

  // ─── DRAG STEP ───
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (step.action !== 'drag') return;
    // Si arrastró más de 100px hacia la derecha = éxito
    if (info.offset.x > 100) {
      handleSuccess();
    } else {
      hapticService.error();
      setDragPosition({ x: 0, y: 0 });
    }
  };

  // ─── HOLD STEP ───
  const handleHoldStart = () => {
    if (step.action !== 'hold') return;
    setIsHolding(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsHolding(false);
        handleSuccess();
      }
    }, 100);
    // Guardar interval ID para limpiar
    (window as unknown as Record<string, unknown>).__holdInterval = interval;
  };

  const handleHoldEnd = () => {
    setIsHolding(false);
    setHoldProgress(0);
    const interval = (window as unknown as Record<string, unknown>).__holdInterval as ReturnType<typeof setInterval>;
    if (interval) clearInterval(interval);
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-6">
      {/* Header */}
      <motion.div
        className="mb-6 text-center"
        initial={reduceMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="mb-3 text-4xl" aria-hidden="true">
          {characterEmoji}
        </div>
        <h2 className={TEXT.title}>{step.title}</h2>
        <p className={way(TEXT.subtitle, 'mt-1')}>{step.instruction}</p>
      </motion.div>

      {/* Progress dots */}
      <div className="mb-8 flex gap-2">
        {TUTORIAL_STEPS.map((s, i) => (
          <div
            key={s.id}
            className={way(
              'h-2.5 w-2.5 rounded-full transition-colors',
              i === currentStep ? 'bg-indigo-500' : completed.has(s.id) ? 'bg-emerald-400' : 'bg-slate-300'
            )}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Interactive Area */}
      <div className="relative flex h-64 w-full max-w-sm items-center justify-center rounded-3xl bg-gradient-to-b from-indigo-50 to-purple-50/50">
        <AnimatePresence mode="wait">
          {step.action === 'tap' && (
            <motion.button
              key="tap-target"
              className={way(
                'flex h-24 w-24 items-center justify-center rounded-full text-5xl',
                'bg-amber-100 shadow-amber-500/30 shadow-xl',
                'transition-transform active:scale-90',
                'focus-visible:ring-4 focus-visible:ring-amber-500/50'
              )}
              onClick={handleTap}
              initial={reduceMotion ? {} : { scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={reduceMotion ? {} : { scale: 1.1 }}
              aria-label="Estrella. Tócala para recogerla."
            >
              {step.targetEmoji}
            </motion.button>
          )}

          {step.action === 'drag' && (
            <div key="drag-target" className="relative w-full h-full flex items-center justify-center">
              <div className="absolute right-8 top-1/2 -translate-y-1/2 text-5xl opacity-30" aria-hidden="true">
                {step.targetEmoji}
              </div>
              <motion.div
                className={way(
                  'flex h-20 w-20 cursor-grab items-center justify-center rounded-2xl text-4xl',
                  'bg-indigo-100 shadow-indigo-500/20 shadow-lg active:cursor-grabbing'
                )}
                drag="x"
                dragConstraints={{ left: 0, right: 150 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                animate={{ x: dragPosition.x }}
                aria-label="Personaje. Arrástralo hasta la puerta de la derecha."
                role="button"
              >
                {characterEmoji}
              </motion.div>
              <p className="absolute bottom-4 text-xs text-slate-400">← Arrastra hacia la puerta →</p>
            </div>
          )}

          {step.action === 'hold' && (
            <motion.button
              key="hold-target"
              className={way(
                'relative flex h-28 w-28 items-center justify-center rounded-full text-5xl',
                'bg-rose-100 shadow-rose-500/20 shadow-xl',
                'overflow-hidden'
              )}
              onPointerDown={handleHoldStart}
              onPointerUp={handleHoldEnd}
              onPointerLeave={handleHoldEnd}
              aria-label="Corazón. Mantén presionado para cargar energía."
            >
              {/* Fill progress */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-rose-400/30"
                animate={{ height: `${holdProgress}%` }}
                transition={{ duration: 0.1 }}
                aria-hidden="true"
              />
              <span className="relative z-10">{step.targetEmoji}</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Feedback overlay */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              className={way(
                'absolute inset-0 flex items-center justify-center rounded-3xl',
                'bg-white/90 backdrop-blur-sm'
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-center"
                initial={reduceMotion ? {} : { scale: 0.5 }}
                animate={{ scale: 1 }}
              >
                <div className="mb-2 text-5xl" aria-hidden="true">✨</div>
                <p className={way(TEXT.subtitle, 'font-bold text-emerald-600')}>{step.feedback}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip / Continue */}
      <div className="mt-8 flex w-full max-w-sm gap-3">
        <Button variant="ghost" size="sm" onClick={onSkip} className="flex-1">
          Saltar tutorial
        </Button>
        {isLastStep && completed.has(step.id) && (
          <Button variant="claim" size="lg" onClick={onComplete} className="flex-[2]">
            ¡Empezar aventura! 🚀
          </Button>
        )}
      </div>
    </div>
  );
};
