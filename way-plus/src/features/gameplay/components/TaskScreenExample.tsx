// Dentro de tu componente de juego (ej. InteractiveCard o TaskScreen):
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdaptiveDifficulty } from '@/shared/hooks/useAdaptiveDifficulty';

export function TaskScreenExample({ task, levelConfig }: any) {
  const {
    currentParams,
    lastAdaptation,
    startMonitoring,
    stopMonitoring,
    recordError,
    recordSuccess,
    recordHelp,
  } = useAdaptiveDifficulty({
    timeLimitSeconds: task?.config?.timeLimitSeconds || 30,
    attemptsAllowed: task?.config?.attemptsAllowed || 3,
  });

  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring]);

  const handleWrongAnswer = () => {
    recordError();
    // El AI detectará esto automáticamente en el próximo ciclo de 3s
  };

  const handleCorrectAnswer = () => {
    recordSuccess();
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <h2 className="text-xl mb-4">Ejemplo de Integración IA</h2>
      {/* Si la IA adaptó, mostrar mensaje sutil */}
      <AnimatePresence>
        {lastAdaptation?.message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 rounded-xl bg-indigo-50 p-3 text-center text-sm text-indigo-700"
          >
            {lastAdaptation.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-4">
        {/* Los targets usan currentParams.targetSize */}
        <button
          className="rounded-full bg-emerald-100 border border-emerald-300"
          style={{
            padding: currentParams.targetSize === 'large' ? '2rem' : currentParams.targetSize === 'small' ? '0.5rem' : '1rem',
          }}
          onClick={handleCorrectAnswer}
        >
          ⭐ Correcto
        </button>

        <button
          className="rounded-full bg-rose-100 border border-rose-300 p-4"
          onClick={handleWrongAnswer}
        >
          ❌ Error
        </button>
      </div>
    </div>
  );
}
