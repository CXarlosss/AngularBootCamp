// src/features/player/pages/LevelSelectPage.tsx
import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../store/playerStore';
import { registry } from '@/content/registry';
import { audioService } from '@/core/utils/audioService';
import type { Step } from '@/core/engine/types';

/**
 * Premium LevelSelectPage
 * Fully styled with Tailwind 4 and Framer Motion.
 */
export function LevelSelectPage() {
  const navigate = useNavigate();
  const { profile } = usePlayerStore();
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);

  // Safe access to completedWays
  const completedWays = useMemo(() => {
    return Array.isArray(profile?.completedWays) ? profile.completedWays : [];
  }, [profile?.completedWays]);

  useEffect(() => {
    if (!profile?.currentLevel) return;
    setLoading(true);
    
    // Load steps with a slight artificial delay for a smooth transition
    registry.getStepsForLevel(profile.currentLevel)
      .then(res => {
        setSteps(Array.isArray(res) ? res : []);
      })
      .catch(err => {
        console.error('[WAY+] Error loading steps:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [profile?.currentLevel]);

  const handleLevelClick = (stepId: string) => {
    audioService.playSFX('click');
    navigate(`/play/${profile?.currentLevel}/${stepId}`);
  };


  return (
    <div className="min-h-screen bg-[#F0F4FF] pb-32">
      {/* Compact Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-8 px-6 pb-6 text-center"
      >
        <div className="flex justify-between items-center max-w-sm mx-auto mb-6">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border-2 border-slate-100 shadow-sm">
             <span className="text-lg">🧠</span>
             <span className="text-[10px] font-black text-slate-400 tracking-widest">WAY+</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border-2 border-slate-100 shadow-sm">
             <span className="text-indigo-600 font-black">🪙</span>
             <span className="text-sm font-black text-indigo-950">{profile?.coins || 0}</span>
          </div>
        </div>
        <h1 className="text-2xl font-black text-indigo-950 uppercase tracking-tight">Tus Retos</h1>
        <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">Camino al aprendizaje</p>
      </motion.div>

      {/* Tighter Grid */}
      <div className="px-6 space-y-3 max-w-sm mx-auto">
        <AnimatePresence mode="popLayout">
          {loading ? (
            // Skeleton State
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-white rounded-[28px] border-b-4 border-slate-100 p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-16 bg-slate-100 rounded-full" />
                    <div className="h-4 w-3/4 bg-slate-100 rounded-lg" />
                    <div className="h-2 w-full bg-slate-50 rounded-full mt-2" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            steps.map((step, idx) => {
              if (!step) return null;
            
            const ways = Array.isArray(step.ways) ? step.ways : [];
            const doneCount = ways.filter(w => w && w.id && completedWays.includes(w.id)).length;
            const progressPercent = ways.length > 0 ? (doneCount / ways.length) * 100 : 0;
            const isCompleted = progressPercent === 100 && ways.length > 0;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLevelClick(step.id)}
                onMouseEnter={() => audioService.playSFX('hover')}
                className={`
                  relative overflow-hidden cursor-pointer
                  bg-white rounded-[28px] border-b-4 border-slate-200 
                  p-4 transition-all duration-200
                  ${isCompleted ? 'border-emerald-200 shadow-emerald-100/50' : 'hover:border-indigo-300 hover:shadow-lg'}
                `}
              >
                <div className="relative flex items-center gap-4">
                  {/* Compact Icon */}
                  <div className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center text-3xl
                    shadow-sm border-2 border-white/50
                    ${isCompleted ? 'bg-emerald-50' : 'bg-indigo-50'}
                  `}>
                    {getThemeEmoji(step.theme)}
                  </div>

                  <div className="flex-1 text-left">
                    <div className={`
                      text-[9px] font-black px-2 py-0.5 rounded-full inline-block mb-1
                      ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}
                    `}>
                      {step.theme || 'MÓDULO'}
                    </div>
                    <h3 className="text-sm font-black text-indigo-950 leading-tight uppercase line-clamp-1">{step.title}</h3>
                    
                    {/* Tiny Progress Bar */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="progress-track flex-1" style={{ height: 8 }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          className="progress-fill"
                          style={{ 
                            background: isCompleted ? 'linear-gradient(90deg, #10B981, #34D399)' : undefined 
                          }}
                        />
                      </div>
                      <span className={`text-[10px] font-black ${isCompleted ? 'text-emerald-600' : 'text-indigo-400'}`}>
                        {Math.round(progressPercent)}%
                      </span>
                    </div>
                  </div>

                  {isCompleted ? (
                    <div className="text-emerald-500 text-xl font-bold">✓</div>
                  ) : (
                    <div className="text-slate-300 text-xs font-black">→</div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
        </AnimatePresence>

        {steps.length === 0 && !loading && (
          <div className="text-center py-8 px-6 bg-white/50 rounded-3xl border border-white shadow-sm">
            <p className="text-indigo-950 font-black text-sm">¡Mapa en construcción!</p>
          </div>
        )}
      </div>
      
      {/* Footer Decoration */}
      <div className="mt-12 text-center opacity-30 select-none pointer-events-none">
        <span className="text-4xl font-black text-indigo-900 tracking-tighter italic">WAY+</span>
      </div>
    </div>
  );
}

function getThemeEmoji(theme?: string) {
  switch (theme?.toLowerCase()) {
    case 'relaxation': return '🧘';
    case 'autonomy': return '🧗';
    case 'self-esteem': return '💖';
    case 'assertiveness': return '🗣️';
    case 'executive': return '🧠';
    default: return '🌟';
  }
}
