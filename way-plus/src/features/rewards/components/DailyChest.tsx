import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDailyChest } from '../hooks/useDailyChest';
import type { DailyReward } from '../utils/dailyChestUtils';
import './DailyChest.css';

interface Props {
  lastOpenedDate: string | null;
  onClaimReward: (reward: DailyReward) => void;
}

export const DailyChest: React.FC<Props> = ({ lastOpenedDate, onClaimReward }) => {
  const {
    available,
    isOpening,
    reward,
    showModal,
    openChest,
    claimReward
  } = useDailyChest(lastOpenedDate, onClaimReward);

  if (!available && !showModal) {
    return (
      <div className="daily-chest-container" style={{ background: '#f8fafc', border: '2px solid #e2e8f0', boxShadow: 'none' }}>
        <div style={{ fontSize: 32, opacity: 0.5 }}>⌛</div>
        <div style={{ color: '#64748b', fontWeight: 700 }}>Vuelve mañana por más premios</div>
      </div>
    );
  }

  return (
    <>
      <div className="daily-chest-container">
        {/* Decorative Sparkles */}
        <div className="daily-chest-sparkle" style={{ top: '10%', left: '10%' }}>✨</div>
        <div className="daily-chest-sparkle" style={{ top: '20%', right: '15%', animationDelay: '0.5s' }}>⭐</div>
        <div className="daily-chest-sparkle" style={{ bottom: '15%', left: '20%', animationDelay: '1s' }}>✨</div>

        <div style={{ zIndex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>¡COFRE MISTERIOSO!</h3>
          <p style={{ margin: '4px 0 16px', fontSize: 14, opacity: 0.9 }}>Toca para descubrir tu premio diario</p>
        </div>

        <div 
          className={`chest-visual ${isOpening ? 'opening' : ''}`}
          onClick={openChest}
        >
          {isOpening ? '📦' : '🎁'}
        </div>

        <motion.div
          animate={isOpening ? { opacity: 0 } : { scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ 
            marginTop: 8, padding: '8px 24px', background: 'rgba(255,255,255,0.2)', 
            borderRadius: 20, fontSize: 12, fontWeight: 900, textTransform: 'uppercase' 
          }}
        >
          {isOpening ? 'Abriendo...' : '¡ABRIR AHORA!'}
        </motion.div>
      </div>

      <AnimatePresence>
        {showModal && reward && (
          <div className="reward-modal-overlay">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="reward-card"
            >
              <div className={`reward-rarity-badge rarity-${reward.rarity}`}>
                {reward.rarity}
              </div>
              
              <h2 style={{ margin: 0, color: '#1e293b', fontSize: 24, fontWeight: 900 }}>
                ¡PREMIO ENCONTRADO!
              </h2>

              <div className="reward-icon-container">
                {reward.icon}
              </div>

              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#4f46e5' }}>
                  {reward.type === 'coins' ? `+${reward.amount} Monedas` : reward.name}
                </div>
                <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
                  {reward.type === 'coins' ? 'WAY+ Coins añadidas a tu monedero' : '¡Nueva pieza para tu colección!'}
                </div>
              </div>

              <button className="claim-button" onClick={claimReward}>
                ¡GENIAL, GRACIAS!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
