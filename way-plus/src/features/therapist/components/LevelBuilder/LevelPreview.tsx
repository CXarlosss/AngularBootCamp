/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ LevelPreview — Simulador de experiencia del niño
 * El terapeuta ve exactamente cómo se verá el nivel antes de publicar
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GLASS, TEXT, way } from '@/shared/lib/wayTheme';
import { useReduceMotion } from '@/core/stores/configStore';
import { hapticService } from '@/core/services/hapticService';
import type { LevelDraft } from './useLevelBuilder';

interface LevelPreviewProps {
  draft: LevelDraft;
}

export const LevelPreview: React.FC<LevelPreviewProps> = ({ draft }) => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskStatus, setTaskStatus] = useState<'idle' | 'success'>('idle');
  const reduceMotion = useReduceMotion();

  const currentTask = draft.tasks[currentTaskIndex];
  const progress = draft.tasks.length > 0 ? ((currentTaskIndex + (taskStatus === 'success' ? 1 : 0)) / draft.tasks.length) * 100 : 0;

  const handleTaskComplete = () => {
    hapticService.success();
    setTaskStatus('success');
    setTimeout(() => {
      if (currentTaskIndex < draft.tasks.length - 1) {
        setCurrentTaskIndex((prev) => prev + 1);
        setTaskStatus('idle');
      }
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-sm">
      {/* Header simulado */}
      <div className={way(GLASS.header, 'mb-4 rounded-2xl p-4')}>
        <h3 className={TEXT.title}>{draft.title || 'Sin título'}</h3>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200/60">
          <motion.div
            className="h-full rounded-full bg-indigo-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Área de juego simulada */}
      <div className="relative flex h-80 items-center justify-center rounded-3xl bg-gradient-to-b from-indigo-50 to-purple-50/50">
        <AnimatePresence mode="wait">
          {currentTask ? (
            <motion.div
              key={currentTask.id}
              className="text-center"
              initial={reduceMotion ? {} : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? {} : { opacity: 0, scale: 0.8 }}
            >
              {taskStatus === 'idle' ? (
                <>
                  <p className={way(TEXT.subtitle, 'mb-6')}>
                    {currentTask.config?.instructionText || currentTask.title}
                  </p>
                  <button
                    className={way(
                      'flex h-24 w-24 items-center justify-center rounded-full text-5xl',
                      'bg-amber-100 shadow-amber-500/30 shadow-xl transition-transform active:scale-90',
                      currentTask.type === 'tap' && 'animate-pulse'
                    )}
                    onClick={handleTaskComplete}
                  >
                    {currentTask.type === 'tap' && '⭐'}
                    {currentTask.type === 'drag' && '↔️'}
                    {currentTask.type === 'hold' && '❤️'}
                    {currentTask.type === 'trace' && '✏️'}
                    {currentTask.type === 'match' && '🔗'}
                    {currentTask.type === 'memory' && '🃏'}
                  </button>
                  <p className={way(TEXT.micro, 'mt-4 text-slate-400')}>
                    Simulación: toca para completar
                  </p>
                </>
              ) : (
                <motion.div
                  initial={reduceMotion ? {} : { scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center"
                >
                  <div className="mb-2 text-6xl">✨</div>
                  <p className={way(TEXT.subtitle, 'text-emerald-600 font-bold')}>
                    {currentTask.config?.successFeedback || '¡Lo lograste!'}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <div className="text-center">
              <div className="mb-2 text-6xl">🏆</div>
              <p className={TEXT.subtitle}>¡Nivel completado!</p>
              <p className={way(TEXT.micro, 'mt-1')}>Así lo verá el niño al terminar</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Info del terapeuta */}
      <div className={way(GLASS.card, 'mt-4 rounded-2xl p-4')}>
        <p className={way(TEXT.micro, 'text-slate-500')}>
          <strong>Tarea {currentTaskIndex + 1} de {draft.tasks.length}:</strong>{' '}
          {currentTask?.title || 'No hay tareas'}
        </p>
        <p className={way(TEXT.micro, 'mt-1 text-slate-500')}>
          Dificultad: {draft.difficulty}/10 • Categoría: {draft.category}
        </p>
      </div>
    </div>
  );
};
