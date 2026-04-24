import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Step } from '@/core/engine/types';
import './AdventureMap.css';

interface Props {
  steps: Step[];
  completedWays: string[];
  currentLevelId: string;
}

export const AdventureMap: React.FC<Props> = ({ steps, completedWays, currentLevelId }) => {
  const navigate = useNavigate();

  // Helper to check if a step is completed or unlocked
  const isStepCompleted = (step: Step) => {
    if (!step?.ways) return false;
    return step.ways.every(w => (completedWays || []).includes(w.id));
  };

  const isStepUnlocked = (step: Step, index: number) => {
    if (index === 0) return true;
    const prevStep = steps[index - 1];
    return isStepCompleted(prevStep);
  };

  return (
    <div className="adventure-map-container">
      <div className="map-scroll-area">
        <svg className="map-path-svg" viewBox="0 0 400 1200">
          {/* Path Line */}
          <path 
            d="M 200 50 C 350 150, 50 250, 200 350 C 350 450, 50 550, 200 650 C 350 750, 50 850, 200 950" 
            fill="none" 
            stroke="#E8E9FF" 
            strokeWidth="12" 
            strokeLinecap="round"
            strokeDasharray="20 20"
          />
        </svg>

        <div className="nodes-container">
          {steps.map((step, index) => {
            const unlocked = isStepUnlocked(step, index);
            const completed = isStepCompleted(step);
            
            // Calculate position in a snake pattern
            const xPos = index % 2 === 0 ? '70%' : '10%';
            const yPos = index * 180 + 50;

            return (
              <motion.div
                key={step.id}
                className={`map-node ${unlocked ? 'unlocked' : 'locked'} ${completed ? 'completed' : ''}`}
                style={{ 
                  left: xPos, 
                  top: yPos,
                }}
                whileHover={unlocked ? { scale: 1.1 } : {}}
                whileTap={unlocked ? { scale: 0.9 } : {}}
                onClick={() => unlocked && navigate(`/play/${currentLevelId}/${step.id}`)}
              >
                <div className="node-bubble">
                  {unlocked ? (
                    <div className="node-icon">
                      {typeof step.ways?.[0]?.stimulus?.image === 'string' && step.ways[0].stimulus.image.length < 5 ? (
                        step.ways[0].stimulus.image
                      ) : '⭐'}
                    </div>
                  ) : (
                    <div className="node-icon">🔒</div>
                  )}
                  {completed && <div className="completion-badge">✅</div>}
                </div>
                <div className="node-label">
                  <span className="step-title">{step.title}</span>
                  <div className="step-progress">
                    {(step.ways || []).filter(w => (completedWays || []).includes(w.id)).length}/{(step.ways || []).length}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
