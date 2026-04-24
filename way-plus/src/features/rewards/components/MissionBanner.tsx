import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRewardsStore } from '../store/rewardsStore';
import { MissionBoard } from './MissionBoard';
import { MISSIONS_CATALOG } from '../data/missions';

export const MissionBanner: React.FC = () => {
  const [showBoard, setShowBoard] = useState(false);
  const { missionProgress, claimedMissions } = useRewardsStore();
  
  // Count missions ready to claim
  const readyToClaimCount = MISSIONS_CATALOG.filter((m) => {
    const progress = missionProgress[m.id] || 0;
    return progress >= m.goal && !claimedMissions.includes(m.id);
  }).length;

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowBoard(true)}
        style={{
          background: 'linear-gradient(90deg, #4f46e5, #818cf8)',
          borderRadius: 20,
          padding: '12px 20px',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 20px rgba(79, 70, 229, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 24 }}>🏆</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Misiones de la Semana</div>
            <div style={{ fontSize: 11, opacity: 0.9, fontWeight: 600 }}>Toca para ver tus objetivos</div>
          </div>
        </div>

        {readyToClaimCount > 0 && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{
              background: '#f43f5e',
              color: 'white',
              fontSize: 10,
              fontWeight: 900,
              padding: '4px 8px',
              borderRadius: 10,
              boxShadow: '0 4px 10px rgba(244, 63, 94, 0.3)',
              position: 'relative',
              zIndex: 1
            }}
          >
            {readyToClaimCount} LISTO
          </motion.div>
        )}

        {/* Decorative BG element */}
        <div style={{
          position: 'absolute',
          right: -20,
          top: -10,
          fontSize: 60,
          opacity: 0.1,
          transform: 'rotate(15deg)'
        }}>✨</div>
      </motion.div>

      <AnimatePresence>
        {showBoard && <MissionBoard onClose={() => setShowBoard(false)} />}
      </AnimatePresence>
    </>
  );
};
