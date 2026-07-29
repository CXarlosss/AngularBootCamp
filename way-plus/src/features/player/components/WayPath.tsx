import React from 'react';
import { motion } from 'framer-motion';
import { normalizeWayText } from '@/shared/lib/way-text-utils';
import { T } from '@/shared/components/TypographyScale';
import { cn } from '@/shared/lib/utils';

export interface WayNode {
  id: string;
  step: number;
  wayNumber: number;
  title: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
}

export interface WayStep {
  step: number;
  title: string;
  totalWays: number;
  completedCount: number;
  nodes: WayNode[];
}

export interface WayPathProps {
  steps: WayStep[];
  onWayClick: (wayId: string) => void;
}

/* ─── Tailwind class constants ─── */

const PATH_CONTAINER = 'w-full flex flex-col gap-3 pb-4';

const STEP_CARD =
  'bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg shadow-indigo-500/5 border border-white/40 forced-colors:bg-white forced-colors:border-2 forced-colors:border-[#1E1B4B]';

const STEP_HEADER = 'flex items-center justify-between gap-3 mb-3';

const STEP_TITLE = 'flex-1 min-w-0';

const STEP_COUNT =
  'text-xs font-black text-slate-500 bg-slate-50/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200/50 shadow-sm forced-colors:border-2 forced-colors:border-[#1E1B4B]';

const STEP_COUNT_COMPLETE = 'text-emerald-600';

const NODES_LIST =
  'flex items-center overflow-x-auto pt-1 px-1 pb-2 gap-1';

const NODE_CONTAINER = 'flex flex-col items-center w-16 sm:w-20 shrink-0';

const NODE_CURRENT =
  'w-14 h-14 sm:w-16 sm:h-16 min-w-[44px] min-h-[44px] rounded-full border-2 border-indigo-400 bg-indigo-50/90 backdrop-blur-sm text-indigo-700 text-lg font-black flex items-center justify-center shadow-lg shadow-indigo-500/20 hover:scale-[1.05] hover:-translate-y-0.5 active:scale-95 transition-all focus-visible:ring-4 focus-visible:ring-indigo-500/50 outline-none forced-colors:bg-white forced-colors:border-2 forced-colors:border-[#1E1B4B]';

const NODE_COMPLETED =
  'w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-full border-2 border-emerald-300 bg-emerald-50/90 backdrop-blur-sm text-emerald-600 text-sm font-black flex items-center justify-center shadow-sm forced-colors:bg-white forced-colors:border-2 forced-colors:border-[#1E1B4B]';

const NODE_LABEL_CURRENT = 'text-indigo-600 font-black';

const NODE_LABEL_COMPLETED = 'text-emerald-600 font-black';

const CONNECTOR =
  'w-3 sm:w-4 h-1 mx-1 rounded-full bg-slate-200/80 forced-colors:bg-[#1E1B4B]';

export const WayPath: React.FC<WayPathProps> = ({
  steps,
  onWayClick,
}) => {
  const visibleSteps = steps.filter((step) =>
    step.nodes.some((n) => n.isCompleted || n.isCurrent)
  );

  return (
    <div className={PATH_CONTAINER}>
      {visibleSteps.map((step) => {
        const visibleNodes = step.nodes.filter(
          (n) => n.isCompleted || n.isCurrent
        );
        const stepTitle =
          normalizeWayText(step.title) || `Paso ${step.step}`;

        return (
          <article
            key={step.step}
            className={STEP_CARD}
            data-testid={`step-card-${step.step}`}
          >
            {/* Header compacto */}
            <div className={STEP_HEADER}>
              <T
                size="sm"
                bold
                className={cn(
                  STEP_TITLE,
                  'text-slate-800 forced-colors:text-[#1E1B4B]'
                )}
              >
                {stepTitle}
              </T>
              <div
                className={cn(
                  STEP_COUNT,
                  step.completedCount === step.totalWays &&
                    STEP_COUNT_COMPLETE
                )}
              >
                {step.completedCount}/{step.totalWays}
                {step.completedCount === step.totalWays && (
                  <span className="text-emerald-500 ml-1">✓</span>
                )}
              </div>
            </div>

            {/* Sendero */}
            <ol
              aria-label={`Camino de ejercicios para ${stepTitle}`}
              className={NODES_LIST}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {visibleNodes.map((node, i) => {
                const isLast = i === visibleNodes.length - 1;
                const isCompleted = node.isCompleted;
                const isCurrent = node.isCurrent;
                const nodeLabel = node.title
                  ? node.title.length > 12
                    ? node.title.substring(0, 12) + '…'
                    : node.title
                  : `Ejercicio ${node.wayNumber}`;

                return (
                  <li key={node.id} className="flex items-center shrink-0">
                    {/* Nodo */}
                    <div className={NODE_CONTAINER}>
                      {isCurrent ? (
                        <motion.button
                          data-testid={`way-node-${node.id}`}
                          data-state="current"
                          onPointerDown={() => onWayClick(node.id)}
                          aria-label={`${nodeLabel}. Ejercicio actual, toca para empezar`}
                          aria-current="step"
                          className={NODE_CURRENT}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {node.wayNumber}
                        </motion.button>
                      ) : (
                        <div
                          data-testid={`way-node-${node.id}`}
                          data-state="completed"
                          className={NODE_COMPLETED}
                          aria-label={`${nodeLabel}. Completado`}
                        >
                          ✓
                        </div>
                      )}

                      {/* Label debajo */}
                      <T
                        size="micro"
                        className={cn(
                          'mt-1 text-center w-full px-0.5',
                          isCurrent
                            ? NODE_LABEL_CURRENT
                            : NODE_LABEL_COMPLETED
                        )}
                      >
                        {nodeLabel}
                      </T>
                    </div>

                    {/* Conector */}
                    {!isLast && <div className={CONNECTOR} />}
                  </li>
                );
              })}
            </ol>
          </article>
        );
      })}
    </div>
  );
};
