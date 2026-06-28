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
  return (
    <div className="w-full flex flex-col gap-12 pb-12">
      {steps.map(step => (
        <div key={step.step} className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-6 sm:p-8 shadow-sm border-[3px] border-slate-200/60 transition-shadow hover:shadow-md">
          {/* Cabecera del Step */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 px-2">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 leading-snug text-center px-4 max-w-3xl mx-auto">
              {step.title.toUpperCase().startsWith('STEP') ? step.title : `STEP ${step.step}: ${step.title}`}
            </h2>
            <div className="text-sm font-bold text-slate-500 bg-slate-100 px-6 py-2 rounded-full self-start sm:self-auto flex items-center gap-2 shadow-inner">
              <span>{step.completedCount}/{step.totalWays}</span>
              {step.completedCount === step.totalWays && <span className="text-emerald-500 text-lg drop-shadow-sm">✓</span>}
            </div>
          </div>
          
          {/* Scroll horizontal del sendero */}
          <div className="flex items-center overflow-x-auto pb-12 pt-8 px-4 snap-x snap-mandatory scroll-smooth hide-scrollbar" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {step.nodes.filter(n => !n.isLocked).map((node, i, visibleNodes) => {
              const isLast = i === visibleNodes.length - 1;
              const nextNode = isLast ? null : visibleNodes[i + 1];
              
              const isCompleted = node.isCompleted;
              const isCurrent = node.isCurrent;
              const isLocked = node.isLocked;
              
              return (
                <div key={node.id} className="flex items-center snap-center shrink-0 group relative">
                  {/* Nodo */}
                  <div className="flex flex-col items-center relative z-10 w-28 sm:w-32">
                    <button
                      data-testid={`way-node-${node.id}`}
                      data-state={isCurrent ? 'current' : 'completed'}
                      disabled={isLocked}
                      onPointerDown={() => !isLocked && onWayClick(node.id)}
                      aria-label={`Way ${node.wayNumber}: ${node.title}`}
                      className={`
                        relative flex items-center justify-center rounded-full border-[4px] transition-all duration-300 font-black touch-manipulation select-none shrink-0 focus-visible:ring-4 ring-violet-400/50
                        ${isCurrent ? 'w-24 h-24 sm:w-28 sm:h-28 bg-violet-50 border-violet-500 text-violet-700 animate-node-pulse text-3xl sm:text-4xl shadow-[0_0_20px_rgba(139,92,246,0.3)] z-20' : 'w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl'}
                        ${isCompleted ? 'bg-emerald-50 border-emerald-400 text-emerald-600' : ''}
                        ${!isCompleted && !isCurrent && !isLocked ? 'bg-white border-slate-300 text-slate-400 hover:border-slate-400 hover:bg-slate-50 cursor-pointer active:scale-95' : ''}
                        ${isLocked ? 'bg-slate-50 border-slate-200 text-slate-300 opacity-60 cursor-not-allowed' : ''}
                      `}
                    >
                      {isCompleted ? (
                        <span className="animate-check-appear text-3xl sm:text-4xl drop-shadow-sm">✓</span>
                      ) : isLocked ? (
                        <span className="text-xl sm:text-2xl opacity-80">🔒</span>
                      ) : (
                        node.wayNumber
                      )}
                    </button>
                    
                    {/* Título corto */}
                    <span className={`absolute -bottom-10 sm:-bottom-12 text-xs sm:text-sm font-bold text-center w-40 leading-tight transition-colors duration-300
                      ${isCurrent ? 'text-violet-700' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}
                      ${!isLocked && !isCompleted && !isCurrent ? 'group-hover:text-slate-600' : ''}
                    `}>
                      {node.title.length > 20 ? node.title.substring(0, 20) + '...' : node.title}
                    </span>
                  </div>
                  
                  {/* Conector */}
                  {!isLast && (
                    <div className="w-12 sm:w-16 h-2 relative -mx-4 sm:-mx-6 z-0 shrink-0">
                      <div className={`absolute inset-0 top-1/2 -translate-y-1/2 h-2 rounded-full overflow-hidden transition-colors duration-500
                        ${isCompleted && nextNode?.isCompleted ? 'bg-emerald-400' : 
                          isCompleted && nextNode?.isCurrent ? 'bg-gradient-to-r from-emerald-400 to-violet-400' : 
                          'bg-slate-200'}`} 
                      >
                         {/* Animated progress overlay if current is next */}
                         {isCompleted && nextNode?.isCurrent && (
                           <div className="absolute inset-0 bg-white/30 animate-pulse" />
                         )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
