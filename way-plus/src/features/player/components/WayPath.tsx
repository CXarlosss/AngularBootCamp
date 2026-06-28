import React from 'react';

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
  // HF1: Solo steps con al menos un nodo completado o actual
  const visibleSteps = steps.filter(step => 
    step.nodes.some(n => n.isCompleted || n.isCurrent)
  );

  return (
    <div className="w-full flex flex-col gap-6 pb-8">
      {visibleSteps.map(step => {
        // HF1: Solo nodos completados o actual. Futuros = null (no renderizar)
        const visibleNodes = step.nodes.filter(n => n.isCompleted || n.isCurrent);
        const currentNode = visibleNodes.find(n => n.isCurrent);
        
        return (
          <div 
            key={step.step} 
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200"
          >
            {/* Cabecera del Step */}
            <div className="flex items-center justify-between gap-3 mb-4 px-1">
              <h2 className="text-sm sm:text-base font-bold text-slate-700 leading-snug line-clamp-2 flex-1">
                {step.title.toUpperCase().startsWith('STEP') 
                  ? step.title 
                  : `Paso ${step.step}: ${step.title}`}
              </h2>
              <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0">
                <span>{step.completedCount}/{step.totalWays}</span>
                {step.completedCount === step.totalWays && (
                  <span className="text-emerald-500">✓</span>
                )}
              </div>
            </div>
            
            {/* Sendero horizontal */}
            <div 
              className="flex items-center overflow-x-auto pb-6 pt-2 px-2 snap-x snap-mandatory scroll-smooth"
              style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
              {visibleNodes.map((node, i) => {
                const isLast = i === visibleNodes.length - 1;
                const isCompleted = node.isCompleted;
                const isCurrent = node.isCurrent;
                
                return (
                  <div key={node.id} className="flex items-center snap-center shrink-0">
                    {/* Nodo */}
                    <div className="flex flex-col items-center relative w-20 sm:w-24">
                      <button
                        data-testid={`way-node-${node.id}`}
                        data-state={isCurrent ? 'current' : 'completed'}
                        onPointerDown={() => isCurrent && onWayClick(node.id)}
                        aria-label={`Way ${node.wayNumber}: ${node.title}`}
                        className={`
                          relative flex items-center justify-center rounded-full border-2 transition-all duration-200 font-bold touch-manipulation select-none focus-visible:ring-2 ring-violet-400/40
                          ${isCurrent 
                            ? 'w-16 h-16 sm:w-20 sm:h-20 bg-violet-50 border-violet-400 text-violet-700 animate-node-pulse text-lg sm:text-xl shadow-[0_0_16px_rgba(139,92,246,0.2)] z-10 cursor-pointer active:scale-95' 
                            : 'w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 border-emerald-300 text-emerald-600 text-sm sm:text-base cursor-default'}
                        `}
                      >
                        {isCompleted ? (
                          <span className="animate-check-appear text-lg sm:text-xl">✓</span>
                        ) : (
                          node.wayNumber
                        )}
                      </button>
                      
                      {/* Título debajo */}
                      <span className={`
                        absolute -bottom-8 text-[10px] sm:text-xs font-semibold text-center w-24 leading-tight
                        ${isCurrent ? 'text-violet-600' : 'text-emerald-600'}
                      `}>
                        {node.title.length > 14 
                          ? node.title.substring(0, 14) + '…' 
                          : node.title}
                      </span>
                    </div>
                    
                    {/* Conector */}
                    {!isLast && (
                      <div className="w-6 sm:w-8 h-1.5 mx-1 sm:mx-2 shrink-0">
                        <div className={`
                          h-full rounded-full
                          ${isCompleted ? 'bg-emerald-300' : 'bg-slate-200'}
                        `} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
