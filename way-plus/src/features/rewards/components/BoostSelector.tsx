import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BOOSTS_CATALOG, type Boost } from '../data/boosts';
import './BoostSelector.css';

interface Props {
  ownedBoosts: Record<string, number>;
  selectedBoostId: string | null;
  onSelect: (boostId: string | null) => void;
  onStart: () => void;
}

export const BoostSelector: React.FC<Props> = ({ 
  ownedBoosts, 
  selectedBoostId, 
  onSelect, 
  onStart 
}) => {
  const availableBoosts = BOOSTS_CATALOG.filter(b => ownedBoosts[b.id] > 0);

  return (
    <div className="boost-selector-overlay">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="boost-selector-card"
      >
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#1e293b' }}>
          ¿Quieres usar una Poción? 🧪
        </h2>
        <p style={{ margin: '8px 0 24px', color: '#64748b', fontWeight: 600 }}>
          Te ayudará a superar este reto más fácil.
        </p>

        <div className="boosts-grid">
          {availableBoosts.length === 0 ? (
            <div className="no-boosts-message">
              No tienes pociones todavía. ¡Ve a la tienda a por ellas! 🏪
            </div>
          ) : (
            availableBoosts.map(boost => (
              <motion.button
                key={boost.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(selectedBoostId === boost.id ? null : boost.id)}
                className={`boost-option ${selectedBoostId === boost.id ? 'selected' : ''}`}
              >
                <div className="boost-badge">x{ownedBoosts[boost.id]}</div>
                <div className="boost-icon">{boost.icon}</div>
                <div className="boost-name">{boost.name}</div>
                <div className="boost-desc">{boost.description}</div>
              </motion.button>
            ))
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <button 
            className="start-button secondary"
            onClick={() => { onSelect(null); onStart(); }}
          >
            Sin Poción
          </button>
          <button 
            className="start-button primary"
            onClick={onStart}
          >
            {selectedBoostId ? '¡Usar y Empezar!' : '¡Empezar!'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
