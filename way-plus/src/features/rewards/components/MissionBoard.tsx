import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRewardsStore } from '../store/rewardsStore';
import { MISSIONS_CATALOG } from '../data/missions';
import { rw, wayResponsive } from '@/shared/lib/wayResponsive';
import { way, wayTheme } from '@/shared/lib/wayTheme';
import { hapticService } from '@/core/services/hapticService';
import { Button } from '@/shared/components/Button';

interface Props {
  onClose: () => void;
}

export const MissionBoard: React.FC<Props> = ({ onClose }) => {
  const { 
    missionProgress, 
    claimedMissions, 
    claimMissionReward,
    checkMissionResets 
  } = useRewardsStore();

  useEffect(() => {
    checkMissionResets();
  }, [checkMissionResets]);

  const dailyMissions = MISSIONS_CATALOG.filter(m => m.type === 'daily');
  const weeklyMissions = MISSIONS_CATALOG.filter(m => m.type === 'weekly');

  const renderMission = (mission: any) => {
    const progress = missionProgress[mission.id] || 0;
    const isCompleted = progress >= mission.goal;
    const isClaimed = Array.isArray(claimedMissions) ? claimedMissions.includes(mission.id) : false;
    const progressPct = Math.min((progress / mission.goal) * 100, 100);

    const statusStyle = isClaimed ? 'opacity-75 grayscale-[20%]' : wayTheme.INTERACTIVE.hover;

    return (
      <div key={mission.id} className={way(wayTheme.GLASS.card, 'p-4 sm:p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden', statusStyle)}>
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex justify-between items-start">
            <h4 className={way(wayTheme.TEXT.title, 'text-lg sm:text-xl')}>{mission.title}</h4>
            <div className="flex gap-2 text-sm font-bold bg-black/10 dark:bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">
              <span>🪙 {mission.rewardCoins}</span>
              <span>✨ {mission.rewardXp}</span>
            </div>
          </div>
          <p className={way(wayTheme.TEXT.subtitle, 'text-sm')}>{mission.description}</p>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className={wayTheme.TEXT.micro}>Progreso</span>
            <span className={way(wayTheme.TEXT.micro, 'font-bold')}>{progress}/{mission.goal}</span>
          </div>
          <div className={wayTheme.PROGRESS.track}>
            <motion.div 
              className={wayTheme.PROGRESS.fill.indigo}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {isCompleted && !isClaimed && (
          <Button
            variant="claim"
            className="w-full mt-auto"
            onClick={() => {
              hapticService.milestone();
              claimMissionReward(mission.id);
            }}
          >
            ¡Reclamar! 🎁
          </Button>
        )}
        
        {isClaimed && (
          <div className={way(wayTheme.STATUS.completed, 'w-full py-2 text-center rounded-xl font-bold mt-auto')}>
            ¡Completado! ✅
          </div>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div 
        className={way('fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-6', wayTheme.GLASS.modalOverlay)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className={way(wayResponsive.MODALS.modalWidthLg, wayTheme.GLASS.modalContent, 'rounded-[2.5rem] p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative shadow-2xl')}
          initial={{ y: 50, scale: 0.9 }}
          animate={{ y: 0, scale: 1 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-8 sticky top-0 bg-white/40 dark:bg-black/40 backdrop-blur-xl p-4 -mx-4 -mt-4 rounded-2xl z-10 border border-white/20 shadow-sm">
            <h2 className={way(wayTheme.TEXT.title, 'text-2xl sm:text-3xl m-0 flex items-center gap-3')}>
              <span className="text-4xl">🏆</span> Panel de Misiones
            </h2>
            <Button variant="close" size="sm" onClick={onClose} aria-label="Cerrar">
              ✕
            </Button>
          </div>

          <div className="space-y-8">
            <section>
              <h3 className={way(wayTheme.TEXT.subtitle, 'text-xl font-bold mb-4 flex items-center gap-2')}>
                📅 Misiones Diarias
              </h3>
              <div className={wayResponsive.GRIDS.gridZen}>
                {dailyMissions.map(renderMission)}
              </div>
            </section>

            <section>
              <h3 className={way(wayTheme.TEXT.subtitle, 'text-xl font-bold mb-4 flex items-center gap-2')}>
                📅 Misiones Semanales
              </h3>
              <div className={wayResponsive.GRIDS.gridZen}>
                {weeklyMissions.map(renderMission)}
              </div>
            </section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
