import React from 'react';
import { motion } from 'framer-motion';
import { WayRenderer } from '@/features/content/components/WayRenderer';
import type { DraftWay } from '../hooks/useWayBuilder';

export const LivePreview: React.FC<{ draft: DraftWay }> = ({ draft }) => {
  const mockWay = {
    ...draft,
    id: 'preview',
  };

  const hasContent = draft.stimulus.image || draft.options.length > 0;

  return (
    <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-black flex items-center gap-3 uppercase tracking-tight">
          <span className="bg-amber-400 text-white w-8 h-8 rounded-xl flex items-center justify-center text-sm">👁️</span>
          Vista Previa Clínica
        </h3>
        <span className="bg-white/10 text-white/50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">
          Tiempo Real
        </span>
      </div>
      
      <div className="bg-slate-800 rounded-[2rem] overflow-hidden min-h-[450px] flex items-center justify-center relative border-4 border-slate-700/50 shadow-inner">
        {hasContent ? (
          <div className="w-full scale-[0.8] origin-center opacity-90 pointer-events-none">
            <WayRenderer way={mockWay as any} onComplete={() => {}} />
          </div>
        ) : (
          <div className="text-center p-12">
            <div className="text-6xl mb-6 grayscale opacity-50">🎨</div>
            <p className="text-white font-black text-xl uppercase tracking-tight">Empieza a diseñar</p>
            <p className="text-slate-400 font-bold text-sm mt-2">Configura el estímulo y las opciones<br/>para ver el resultado final.</p>
          </div>
        )}
        
        {/* Overlay indicativo de preview */}
        <div className="absolute inset-0 border-[16px] border-slate-900/10 pointer-events-none rounded-[2rem] shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]"></div>
      </div>
      
      <div className="mt-6 bg-white/5 rounded-2xl p-4 border border-white/5">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed text-center">
          Esta es la interfaz exacta que el niño verá en la aplicación.<br/>El motor adaptativo se ajustará según su progreso histórico.
        </p>
      </div>
    </div>
  );
};
