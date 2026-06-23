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
        <div key={step.step} className="bg-white rounded-[40px] p-8 shadow-sm border-4 border-gray-100">
          {/* Cabecera del Step */}
          <div className="flex justify-between items-center mb-8 px-2">
            <h2 className="text-3xl font-black text-[#1E1B4B] uppercase tracking-wide">
              {step.title.toUpperCase().startsWith('STEP') ? step.title : `STEP ${step.step}: ${step.title}`}
            </h2>
            <div className="text-xl font-bold text-gray-500 bg-gray-100 px-6 py-2 rounded-full">
              {step.completedCount}/{step.totalWays} {step.completedCount === step.totalWays && '✓'}
            </div>
          </div>
          
          {/* Scroll horizontal del sendero */}
          <div className="flex items-center overflow-x-auto pb-12 pt-6 px-4 snap-x snap-mandatory scroll-smooth hide-scrollbar" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {step.nodes.map((node, i) => {
              const isLast = i === step.nodes.length - 1;
              const nextNode = isLast ? null : step.nodes[i + 1];
              
              return (
                <div key={node.id} className="flex items-center snap-center shrink-0">
                  {/* Nodo */}
                  <div className="flex flex-col items-center relative z-10 w-28">
                    <button
                      disabled={node.isLocked}
                      onPointerDown={() => !node.isLocked && onWayClick(node.id)}
                      aria-label={`Way ${node.wayNumber}: ${node.title}`}
                      className={`
                        flex items-center justify-center rounded-full border-4 transition-all duration-300 font-black touch-manipulation select-none shrink-0
                        ${node.isCurrent ? 'w-24 h-24 bg-blue-500 border-blue-600 text-white animate-way-pulse text-4xl shadow-xl' : 'w-20 h-20 text-3xl'}
                        ${node.isCompleted ? 'bg-green-400 border-green-500 text-white' : ''}
                        ${!node.isCompleted && !node.isCurrent && !node.isLocked ? 'bg-white border-gray-300 text-gray-400' : ''}
                        ${node.isLocked ? 'bg-slate-100 border-slate-200 text-slate-300 opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                      `}
                    >
                      {node.isCompleted ? '✓' : node.isLocked ? '🔒' : node.wayNumber}
                    </button>
                    
                    {/* Título corto */}
                    <span className={`absolute -bottom-10 text-sm font-bold text-center w-36 leading-tight
                      ${node.isCurrent ? 'text-blue-600' : node.isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                      {node.title.length > 18 ? node.title.substring(0, 18) + '...' : node.title}
                    </span>
                  </div>
                  
                  {/* Conector */}
                  {!isLast && (
                    <div className="w-16 h-2 relative -mx-4 z-0 shrink-0">
                      <div className={`absolute inset-0 top-1/2 -translate-y-1/2 h-2 
                        ${node.isCompleted && nextNode?.isCompleted ? 'bg-green-400' : 
                          node.isCompleted && nextNode?.isCurrent ? 'bg-gradient-to-r from-green-400 to-blue-500' : 
                          'border-t-4 border-dotted border-gray-300'}`} />
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
