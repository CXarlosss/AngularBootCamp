// src/features/player/pages/StepDetailsPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { registry } from '@/content/registry';
import type { Step } from '@/core/engine/types';
import { rw } from '@/shared/lib/wayResponsive';

/**
 * Centered StepDetailsPage
 */
export function StepDetailsPage() {
  const { stepId } = useParams<{ stepId: string }>();
  const navigate = useNavigate();
  const { profile } = usePlayerStore();
  const [step, setStep] = useState<Step | null>(null);
  const [loading, setLoading] = useState(true);

  const { unlockSticker } = useRewardsStore();

  useEffect(() => {
    if (!stepId) return;
    setLoading(true);
    registry.getStepByIdAsync(stepId).then(res => {
      setStep(res);
      setLoading(false);
    });
  }, [stepId]);

  const completedWays = useMemo(() => new Set(profile?.completedWays || []), [profile?.completedWays]);
  
  useEffect(() => {
    if (step && !loading) {
      const stepWays = step.ways.map(w => w.id);
      const doneInStep = stepWays.filter(id => completedWays.has(id));
      
      if (doneInStep.length === stepWays.length && stepWays.length > 0) {
        const themeCards: Record<string, string> = {
          relaxation: 'card-001',
          autonomy: 'card-004',
          assertiveness: 'card-003',
          'self-esteem': 'card-002'
        };
        const cardId = themeCards[step.theme] || 'card-006';
        unlockSticker(cardId);
      }
    }
  }, [completedWays, step, loading, unlockSticker]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#DDE0FF]">
        <div className="spinner mb-4"></div>
        <p className="font-bold text-indigo-600 animate-pulse uppercase tracking-widest text-sm">Cargando retos...</p>
      </div>
    );
  }

  if (!step) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 text-center">
        <div className="text-6xl mb-6">😕</div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">¡Ups! No encontramos el módulo</h2>
        <p className="text-slate-500 mb-8 font-medium">Parece que este camino aún no ha sido mapeado.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-indigo-600 text-white font-black px-8 py-4 rounded-3xl shadow-xl shadow-indigo-200"
        >
          Volver al Mapa
        </button>
      </div>
    );
  }

  const doneCount = Array.from(completedWays).filter(id => step.ways.some(w => w.id === id)).length;
  const totalCount = step.ways.length;
  const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] pb-32 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-80 h-80 bg-[#764ba2]/50 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Glassmorphism */}
      <div className="pt-8 px-6 pb-6 text-center relative z-10">
        <header className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[32px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.15)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="absolute left-5 top-5 w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center border border-white/30 text-white font-bold transition-all shadow-sm z-20"
          >
            ←
          </motion.button>
          
          <div className="inline-block bg-white/25 text-white text-[10px] font-black px-3 py-1.5 rounded-full tracking-wider uppercase mb-3 border border-white/30 shadow-sm mt-1 relative z-20">
            {step.theme || 'MÓDULO'}
          </div>
          
          <h1 className="text-2xl font-black text-white leading-tight mb-2 uppercase drop-shadow-md relative z-20">
            {step.title}
          </h1>
          <p className="text-white/80 font-bold text-[11px] uppercase tracking-widest relative z-20">
            Elige un camino
          </p>
        </header>
      </div>

      {/* Ways List with Depth and States */}
      <ol className="px-6 space-y-4 max-w-sm mx-auto mt-2 relative z-10" aria-label="Lista de caminos del módulo">
        {(() => {
          let foundCurrent = false;
          return step.ways.map((way, idx) => {
            const isCompleted = completedWays.has(way.id);
            let isCurrent = false;
            let isLocked = false;
            if (!isCompleted && !foundCurrent) {
              isCurrent = true;
              foundCurrent = true;
            } else if (!isCompleted && foundCurrent) {
              isLocked = true;
            }
            
            return (
              <li key={way.id} className="block">
                <motion.button
                  disabled={isLocked}
                  aria-label={`WAY ${idx + 1}: ${way.name || ''}. ${isCompleted ? 'Completado' : isCurrent ? 'Actual, Jugar ahora' : 'Bloqueado'}`}
                  aria-current={isCurrent ? 'step' : undefined}
                  whileHover={!isLocked ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!isLocked ? { scale: 0.98 } : {}}
                  onClick={() => {
                    if (isLocked) return;
                    if (step.theme === 'relaxation' && idx === 5) {
                      navigate(`/annexes/relaxation?wayId=${way.id}`);
                    } else {
                      navigate(`/play/${profile?.currentLevel}/${step.id}/${way.id}`);
                    }
                  }}
                  className={`
                    w-full text-left relative flex items-center gap-4 p-5 rounded-[28px] transition-all duration-300 outline-none
                    ${isCompleted 
                      ? 'bg-emerald-50 shadow-[0_4px_16px_rgba(16,185,129,0.2)] border border-emerald-200 focus-visible:ring-4 focus-visible:ring-emerald-400' 
                      : isCurrent 
                      ? 'bg-white shadow-[0_12px_32px_rgba(0,0,0,0.25)] border-2 border-indigo-400 ring-4 ring-white/30 focus-visible:ring-indigo-500 transform scale-[1.02]' 
                      : 'bg-white/10 backdrop-blur-md border border-white/20 shadow-none opacity-75 cursor-not-allowed'
                    }
                  `}
                >
                <div className={`
                  w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner
                  ${isCompleted 
                    ? 'bg-emerald-400 text-white shadow-sm' 
                    : isCurrent 
                    ? 'bg-indigo-100 text-indigo-700 shadow-sm border border-indigo-200' 
                    : 'bg-white/10 text-white/50 border border-white/10'
                  }
                `} aria-hidden="true">
                  {isCompleted ? '✓' : isLocked ? '🔒' : idx + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-black uppercase tracking-tight truncate
                    ${isCompleted ? 'text-emerald-950' : isCurrent ? 'text-indigo-950' : 'text-white/80'}
                  `}>
                    WAY {idx + 1}
                  </div>
                  <div className={`text-[10px] font-bold tracking-wider uppercase truncate mt-0.5
                    ${isCompleted ? 'text-emerald-700' : isCurrent ? 'text-indigo-500' : 'text-white/50'}
                  `}>
                    {way.name || (isCompleted ? 'Completado' : isCurrent ? 'Jugar ahora' : 'Bloqueado')}
                  </div>
                </div>

                {isCurrent && (
                  <motion.div 
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    aria-hidden="true" 
                    className="w-12 h-12 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-[0_4px_16px_rgba(79,70,229,0.6)] border-2 border-indigo-300"
                  >
                    <svg className="w-6 h-6 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                )}
                </motion.button>
              </li>
            );
          });
        })()}
      </ol>
      
      {/* Bottom Navigation with Glow Progress */}
      <div className={rw("safeBottom", "fixed bottom-0 left-0 right-0 bg-[#764ba2]/80 backdrop-blur-2xl border-t border-white/20 p-6 pb-10 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.2]")}>
        <div className="max-w-xl mx-auto space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-white/70 tracking-widest uppercase drop-shadow-sm">PROGRESO DEL MÓDULO</span>
            <span className="text-sm font-black text-white drop-shadow-sm">{doneCount} / {totalCount}</span>
          </div>
          <div className="h-4 bg-black/20 rounded-full overflow-hidden border border-white/10 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "circOut" }}
              className="h-full bg-emerald-400 rounded-full shadow-[0_0_16px_rgba(52,211,153,0.8)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30 animate-pulse" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
