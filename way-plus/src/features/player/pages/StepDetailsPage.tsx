import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { registry } from '@/content/registry';
import type { Step } from '@/core/engine/types';
import { rw, wayResponsive } from '@/shared/lib/wayResponsive';
import { way, wayTheme } from '@/shared/lib/wayTheme';
import { Button } from '@/shared/components/Button';
import { InteractiveCard } from '@/shared/components/InteractiveCard';

/**
 * Centered StepDetailsPage refactored with WAY+ tokens
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
        <p className={way(wayTheme.TEXT.label, 'text-indigo-600 animate-pulse')}>Cargando retos...</p>
      </div>
    );
  }

  if (!step) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 text-center">
        <div className="text-6xl mb-6">😕</div>
        <h2 className={way(wayTheme.TEXT.title, 'mb-2')}>¡Ups! No encontramos el módulo</h2>
        <p className={way(wayTheme.TEXT.subtitle, 'mb-8')}>Parece que este camino aún no ha sido mapeado.</p>
        <Button 
          variant="primary" 
          size="lg"
          onClick={() => navigate('/')}
        >
          Volver al Mapa
        </Button>
      </div>
    );
  }

  const doneCount = Array.from(completedWays).filter(id => step.ways.some(w => w.id === id)).length;
  const totalCount = step.ways.length;
  const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] pb-32 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className={wayTheme.DECORATIVE.orb('bg-white', 'top-[-10%] left-[-10%]')} />
      <div className={wayTheme.DECORATIVE.orb('bg-[#764ba2]', 'bottom-[20%] right-[-10%]')} />

      {/* Header with Glassmorphism */}
      <div className={rw('safeTop', 'px-6 pb-6 pt-8 text-center relative z-10')}>
        <header className={way(wayTheme.GLASS.header, 'rounded-[32px] p-6 relative overflow-hidden border-0 bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.15)]')}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          
          <div className="absolute left-5 top-5 z-20">
            <Button
              variant="icon"
              size="sm"
              onClick={() => navigate('/')}
              className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
              aria-label="Volver al mapa"
            >
              ←
            </Button>
          </div>
          
          <div className="inline-block bg-white/25 text-white text-[10px] font-black px-3 py-1.5 rounded-full tracking-wider uppercase mb-3 border border-white/30 shadow-sm mt-1 relative z-20">
            {step.theme || 'MÓDULO'}
          </div>
          
          <h1 className={way(wayTheme.TEXT.title, 'text-white mb-2 uppercase drop-shadow-md relative z-20')}>
            {step.title}
          </h1>
          <p className="text-white/80 font-bold text-[11px] uppercase tracking-widest relative z-20">
            Elige un camino
          </p>
        </header>
      </div>

      {/* Ways List with Depth and States */}
      <div className={way(wayResponsive.CONTAINERS.maxWidthMobile, 'px-6 mt-2 relative z-10 space-y-4')} role="list" aria-label="Lista de caminos del módulo">
        {(() => {
          let foundCurrent = false;
          return step.ways.map((wayItem, idx) => {
            const isCompleted = completedWays.has(wayItem.id);
            let isCurrent = false;
            let isLocked = false;
            if (!isCompleted && !foundCurrent) {
              isCurrent = true;
              foundCurrent = true;
            } else if (!isCompleted && foundCurrent) {
              isLocked = true;
            }
            
            const status = isCompleted ? 'completed' : isCurrent ? 'current' : 'locked';
            const badgeText = isCompleted ? 'Completado' : isCurrent ? 'Jugar ahora' : 'Bloqueado';

            return (
              <div key={wayItem.id} role="listitem">
                <InteractiveCard
                  title={`WAY ${idx + 1}`}
                  description={wayItem.name || badgeText}
                  status={status}
                  badge={badgeText}
                  onAction={() => {
                    if (step.theme === 'relaxation' && idx === 5) {
                      navigate(`/annexes/relaxation?wayId=${wayItem.id}`);
                    } else {
                      navigate(`/play/${profile?.currentLevel}/${step.id}/${wayItem.id}`);
                    }
                  }}
                  actionLabel={isCurrent ? "Jugar" : undefined}
                />
              </div>
            );
          });
        })()}
      </div>
      
      {/* Bottom Navigation with Glow Progress */}
      <div className={rw("safeBottom", wayTheme.GLASS.bottomNav, "fixed bottom-0 left-0 right-0 p-6 pb-10 z-50")}>
        <div className="max-w-xl mx-auto space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className={way(wayTheme.TEXT.label, 'text-white/70 drop-shadow-sm')}>PROGRESO DEL MÓDULO</span>
            <span className="text-sm font-black text-white drop-shadow-sm">{doneCount} / {totalCount}</span>
          </div>
          <div className={wayTheme.PROGRESS.track}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "circOut" }}
              className={wayTheme.PROGRESS.fill.emerald}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
