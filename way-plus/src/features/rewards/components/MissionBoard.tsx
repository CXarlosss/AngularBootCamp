import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRewardsStore } from '../store/rewardsStore';
import { MISSIONS_CATALOG } from '../data/missions';
import './MissionBoard.css';

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
    const isClaimed = claimedMissions.includes(mission.id);
    const progressPct = Math.min((progress / mission.goal) * 100, 100);

    return (
      <div key={mission.id} className={`mission-card ${isClaimed ? 'claimed' : ''}`}>
        <div className="mission-info">
          <div className="mission-text">
            <h4>{mission.title}</h4>
            <p>{mission.description}</p>
          </div>
          <div className="mission-rewards">
            <span>🪙 {mission.rewardCoins}</span>
            <span>✨ {mission.rewardXp}</span>
          </div>
        </div>
        
        <div className="mission-progress-bar">
          <div className="progress-track">
            <motion.div 
              className="progress-fill" 
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="progress-text">{progress}/{mission.goal}</span>
        </div>

        {isCompleted && !isClaimed && (
          <motion.button
            className="claim-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => claimMissionReward(mission.id)}
          >
            ¡Reclamar! 🎁
          </motion.button>
        )}
        
        {isClaimed && <div className="claimed-badge">¡Completado! ✅</div>}
      </div>
    );
  };

  return (
    <motion.div 
      className="mission-board-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="mission-board-content"
        initial={{ y: 50, scale: 0.9 }}
        animate={{ y: 0, scale: 1 }}
      >
        <div className="mission-board-header">
          <h2>🏆 Panel de Misiones</h2>
          <button onClick={onClose} className="close-board">✕</button>
        </div>

        <div className="mission-sections">
          <section>
            <h3>📅 Misiones Diarias</h3>
            <div className="mission-list">
              {dailyMissions.map(renderMission)}
            </div>
          </section>

          <section>
            <h3>📅 Misiones Semanales</h3>
            <div className="mission-list">
              {weeklyMissions.map(renderMission)}
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
};
