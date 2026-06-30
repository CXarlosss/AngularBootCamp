import React from 'react';
import { normalizeWayText } from '@/shared/lib/way-text-utils';

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

export const WayPath: React.FC<WayPathProps> = ({ steps, onWayClick }) => {
  const visibleSteps = steps.filter(step => 
    step.nodes.some(n => n.isCompleted || n.isCurrent)
  );

  return (
    <div className="w-full flex flex-col gap-3 pb-4">
      {visibleSteps.map(step => {
        const visibleNodes = step.nodes.filter(n => n.isCompleted || n.isCurrent);
        const stepTitle = normalizeWayText(step.title) || `Paso ${step.step}`;
        
        return (
          <article 
            data-testid={`step-card-${step.step}`}
            key={step.step} 
            className="bg-white rounded-xl p-3 shadow-sm border border-slate-200"
          >
            {/* Header compacto */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <h2 className="text-sm font-bold text-slate-700 leading-normal flex-1 min-w-0">
                {stepTitle}
              </h2>
              <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full shrink-0">
                {step.completedCount}/{step.totalWays}
                {step.completedCount === step.totalWays && (
                  <span className="text-emerald-500 ml-1">✓</span>
                )}
              </div>
            </div>
            
            {/* Sendero */}
            <nav 
              className="flex items-center overflow-x-auto pt-1 px-1 pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {visibleNodes.map((node, i) => {
                const isLast = i === visibleNodes.length - 1;
                const isCompleted = node.isCompleted;
                const isCurrent = node.isCurrent;
                const nodeLabel = node.title 
                  ? (node.title.length > 12 ? node.title.substring(0, 12) + '…' : node.title)
                  : `Ejercicio ${node.wayNumber}`;
                
                return (
                  <div key={node.id} className="flex items-center shrink-0">
                    {/* Nodo */}
                    <div className="flex flex-col items-center w-16 sm:w-20">
                      {isCurrent ? (
                        <button
                          data-testid={`way-node-${node.id}`}
                          data-state="current"
                          onPointerDown={() => onWayClick(node.id)}
                          aria-label={`${nodeLabel}. Ejercicio actual, toca para empezar`}
                          aria-current="step"
                          className="w-14 h-14 sm:w-16 sm:h-16 min-w-[44px] min-h-[44px] rounded-full border-2 border-violet-400 bg-violet-50 text-violet-700 text-lg font-bold flex items-center justify-center transition-all duration-150 active:scale-95 focus-visible:ring-2 ring-violet-400/40 ring-2 ring-violet-300"
                        >
                          {node.wayNumber}
                        </button>
                      ) : (
                        <div
                          data-testid={`way-node-${node.id}`}
                          data-state="completed"
                          className="w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-full border-2 border-emerald-300 bg-emerald-50 text-emerald-600 text-sm font-bold flex items-center justify-center pointer-events-none"
                          aria-label={`${nodeLabel}. Completado`}
                        >
                          ✓
                        </div>
                      )}
                      
                      {/* Label debajo */}
                      <span 
                        className={`mt-1 text-[10px] font-semibold text-center w-full leading-normal px-0.5 ${isCurrent ? 'text-violet-600' : 'text-emerald-600'}`}
                      >
                        {nodeLabel}
                      </span>
                    </div>
                    
                    {/* Conector */}
                    {!isLast && (
                      <div className="w-3 sm:w-4 h-1 mx-1 rounded-full bg-slate-200" />
                    )}
                  </div>
                );
              })}
            </nav>
          </article>
        );
      })}
    </div>
  );
};
