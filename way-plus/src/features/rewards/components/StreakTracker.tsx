import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreak } from '../hooks/useStreak';
import type { StreakMilestone } from '../utils/streakUtils';
import { STREAK_MILESTONES, getNextMilestone, getDailyBonus } from '../utils/streakUtils';
import './StreakTracker.css';

interface Props {
  streakDays: number;
  lastBonusDate: string | null;
  onClaimBonus: (coins: number) => void;
  onMilestoneReached: (milestone: StreakMilestone) => void;
}

export const StreakTracker: React.FC<Props> = ({ 
  streakDays, 
  lastBonusDate, 
  onClaimBonus, 
  onMilestoneReached 
}) => {
  const {
    available,
    showMilestoneModal,
    activeMilestone,
    claimBonus,
    handleCloseMilestone
  } = useStreak(streakDays, lastBonusDate, onClaimBonus, onMilestoneReached);

  const nextMilestone = getNextMilestone(streakDays);
  const progress = Math.min((streakDays / nextMilestone.day) * 100, 100);

  return (
    <>
      <div className="streak-tracker-card">
        <div className="streak-flame-container">
          <div className="main-flame">🔥</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#1e293b' }}>
              Racha de {streakDays} {streakDays === 1 ? 'día' : 'días'}
            </div>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
              {streakDays === 0 
                ? '¡Empieza tu racha hoy!' 
                : '¡No dejes que la llama se apague!'}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>
            <span>Próximo Hito: {nextMilestone.title}</span>
            <span>Día {nextMilestone.day}</span>
          </div>
          <div className="streak-progress-bar">
            <div className="streak-progress-fill" style={{ width: `${progress}%` }} />
            {STREAK_MILESTONES.map(m => (
              <div 
                key={m.day} 
                className="milestone-dot" 
                style={{ left: `${(m.day / 30) * 100}%` }} 
              />
            ))}
          </div>
        </div>

        <button 
          className="bonus-button" 
          disabled={!available || streakDays === 0}
          onClick={claimBonus}
        >
          {available && streakDays > 0 ? (
            <>🎁 Reclamar Bonus (+{getDailyBonus(streakDays)} 🪙)</>
          ) : streakDays === 0 ? (
            <>Completa un reto para empezar</>
          ) : (
            <>Bonus reclamado ✅</>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showMilestoneModal && activeMilestone && (
          <div className="milestone-modal-overlay">
            <motion.div 
              initial={{ scale: 0.5, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.5, y: 100, opacity: 0 }}
              className="milestone-reward-card"
            >
              <div className="milestone-flame-icon">🔥</div>
              
              <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#ef4444' }}>
                ¡HITO ALCANZADO!
              </h2>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginTop: 4 }}>
                {activeMilestone.title} (Día {activeMilestone.day})
              </div>
              
              <p style={{ margin: '16px 0 32px', color: '#64748b', fontWeight: 600 }}>
                {activeMilestone.message}
              </p>

              <div style={{ background: '#f8fafc', borderRadius: 24, padding: 20, marginBottom: 32, textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase' }}>
                  Tus Recompensas:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>🪙</span>
                    <span style={{ fontWeight: 800 }}>+{activeMilestone.reward.coins} Monedas WAY+</span>
                  </div>
                  {activeMilestone.reward.item && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 24 }}>🎁</span>
                      <span style={{ fontWeight: 800 }}>Nuevo Accesorio</span>
                    </div>
                  )}
                  {activeMilestone.reward.stickerId && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 24 }}>📔</span>
                      <span style={{ fontWeight: 800 }}>Cromo Especial para el Álbum</span>
                    </div>
                  )}
                </div>
              </div>

              <button 
                className="bonus-button" 
                style={{ width: '100%', padding: 18, fontSize: 16 }}
                onClick={handleCloseMilestone}
              >
                ¡SEGUIR ARDIENDO! 🔥
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
