/**
 * ═══════════════════════════════════════════════════════════════
 * AdventureMap v2 — Responsive, animado, sin descuadres
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Step, Way } from '@/core/engine/types';
import { normalizeWayText } from '@/shared/lib/way-text-utils';
import { useReduceMotion } from '@/core/stores/configStore';

interface FlatWay extends Way {
  stepId: string;
  stepTitle: string;
}

interface Props {
  steps: Step[];
  completedWays: string[];
  currentLevelId: string;
}

const NODES_PER_ROW = 3;

export const AdventureMap: React.FC<Props> = ({
  steps = [],
  completedWays = [],
  currentLevelId = '',
}) => {
  const navigate = useNavigate();
  const reduceMotion = useReduceMotion();

  const allWays = useMemo<FlatWay[]>(() => {
    if (!Array.isArray(steps)) return [];
    const flat: FlatWay[] = [];
    steps.forEach((step) => {
      if (step && Array.isArray(step.ways)) {
        step.ways.forEach((way) => {
          if (way && way.id) {
            flat.push({ ...way, stepId: step.id, stepTitle: step.title });
          }
        });
      }
    });
    return flat;
  }, [steps]);

  const totalRows = Math.ceil(allWays.length / NODES_PER_ROW);

  const isUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevWay = allWays[index - 1];
    if (!prevWay?.id) return false;
    const safeCompleted = Array.isArray(completedWays) ? completedWays : [];
    return safeCompleted.includes(prevWay.id);
  };

  const isCompleted = (wayId: string) => {
    if (!wayId) return false;
    const safeCompleted = Array.isArray(completedWays) ? completedWays : [];
    return safeCompleted.includes(wayId);
  };

  if (allWays.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-slate-400">
        Cargando retos...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="relative">
        {/* Línea de conexión vertical (serpentina) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-slate-100 rounded-full" />

        {/* Nodos */}
        <div className="relative space-y-8">
          {Array.from({ length: totalRows }).map((_, rowIndex) => {
            const startIdx = rowIndex * NODES_PER_ROW;
            const rowWays = allWays.slice(startIdx, startIdx + NODES_PER_ROW);
            const isEvenRow = rowIndex % 2 === 0;

            return (
              <div
                key={rowIndex}
                className={cn(
                  'flex items-center gap-4',
                  isEvenRow ? 'flex-row' : 'flex-row-reverse'
                )}
              >
                {rowWays.map((way, colIndex) => {
                  const globalIndex = startIdx + colIndex;
                  const unlocked = isUnlocked(globalIndex);
                  const completed = isCompleted(way.id);

                  return (
                    <motion.div
                      key={way.id}
                      initial={reduceMotion ? {} : { opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: globalIndex * 0.05, duration: 0.3 }}
                      className="flex-1"
                    >
                      <button
                        onClick={() =>
                          unlocked &&
                          way.id &&
                          navigate(`/play/${currentLevelId}/${way.stepId}/${way.id}`)
                        }
                        disabled={!unlocked}
                        className={cn(
                          'mx-auto flex h-16 w-16 flex-col items-center justify-center rounded-2xl border-2 text-xl transition-all sm:h-20 sm:w-20',
                          completed
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-600 shadow-sm'
                            : unlocked
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm hover:scale-105 hover:border-indigo-300 active:scale-95'
                            : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                        )}
                      >
                        <span className="text-lg sm:text-xl">
                          {completed ? '✅' : unlocked ? '⭐' : '🔒'}
                        </span>
                      </button>
                      <p className="mt-2 text-center text-[10px] font-bold text-slate-600 line-clamp-2 sm:text-xs">
                        {normalizeWayText(way.title ?? way.stepTitle)}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* cn helper local si no está importado */
function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default AdventureMap;
