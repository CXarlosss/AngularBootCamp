// src/features/player/pages/StepDetailsPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { registry } from '@/content/registry';
import type { Step } from '@/core/engine/types';

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
    <div className="min-h-screen bg-[#F8FAFF] pb-32">
      {/* Compact Header */}
      <header className="pt-8 px-6 pb-6 text-center">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border-2 border-slate-100 shadow-sm mb-4 mx-auto text-indigo-600 font-bold"
        >
          ←
        </motion.button>
        <div className="inline-block bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded-full tracking-wider uppercase mb-2">
          {step.theme || 'MÓDULO'}
        </div>
        <h1 className="text-xl font-black text-indigo-950 leading-tight mb-1 uppercase line-clamp-2">{step.title}</h1>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Elige un camino</p>
      </header>

      {/* Compact Ways List */}
      <div className="px-6 space-y-3 max-w-sm mx-auto">
        {step.ways.map((way, idx) => {
          const isCompleted = completedWays.has(way.id);
          
          return (
            <motion.div
              key={way.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/play/${profile?.currentLevel}/${step.id}/${way.id}`)}
              className={`
                relative flex items-center gap-4 p-4 rounded-[24px] cursor-pointer transition-all duration-300
                ${isCompleted ? 'bg-emerald-50 border-2 border-emerald-100' : 'bg-white shadow-md border-2 border-transparent'}
              `}
            >
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shadow-sm
                ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-indigo-50 text-indigo-600'}
              `}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              
              <div className="flex-1">
                <div className="text-sm font-black text-indigo-950 uppercase tracking-tight">
                  WAY {idx + 1}
                </div>
                <div className="text-[9px] font-black text-slate-400 tracking-wider uppercase">
                  {way.name || 'Jugar ahora'}
                </div>
              </div>

              {isCompleted && (
                 <div className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-2 py-1 rounded-full uppercase">
                   OK
                 </div>
              )}
            </motion.div>
          );
        })}
      </div>
      
      {/* Centered Progress Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 p-6 pb-10 z-50">
        <div className="max-w-xl mx-auto space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">PROGRESO DEL MÓDULO</span>
            <span className="text-sm font-black text-indigo-600">{doneCount} / {totalCount}</span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden border-2 border-white shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "circOut" }}
              className="h-full bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
