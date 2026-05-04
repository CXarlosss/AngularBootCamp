// src/features/player/components/AdventureMap.tsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Step, Way } from '@/core/engine/types';
import './AdventureMap.css';

interface FlatWay extends Way {
  stepId: string;
  stepTitle: string;
}

interface Props {
  steps: Step[];
  completedWays: string[];
  currentLevelId: string;
}

const NODES_PER_ROW = 3;
const H_GAP = 110;
const V_GAP = 110;
const START_X = 80;
const START_Y = 80;
const SVG_WIDTH = 400;

function generateNodes(total: number) {
  return Array.from({ length: total }, (_, i) => {
    const row = Math.floor(i / NODES_PER_ROW);
    const col = i % NODES_PER_ROW;
    const isEvenRow = row % 2 === 0;
    return {
      x: isEvenRow
        ? START_X + col * H_GAP
        : START_X + (NODES_PER_ROW - 1 - col) * H_GAP,
      y: START_Y + row * V_GAP,
    };
  });
}

function generateConnectorPath(nodes: { x: number; y: number }[]): string {
  if (!nodes || nodes.length < 2) return '';
  return nodes
    .slice(0, -1)
    .map((node, i) => {
      const next = nodes[i + 1];
      if (!node || !next) return '';
      const mx = (node.x + next.x) / 2;
      const my = (node.y + next.y) / 2;
      return `M ${node.x} ${node.y} Q ${mx} ${node.y} ${mx} ${my} Q ${mx} ${next.y} ${next.x} ${next.y}`;
    })
    .join(' ');
}

export const AdventureMap: React.FC<Props> = ({
  steps = [],
  completedWays = [],
  currentLevelId = '',
}) => {
  const navigate = useNavigate();

  const allWays = useMemo<FlatWay[]>(() => {
    if (!Array.isArray(steps)) return [];
    const flat: FlatWay[] = [];
    steps.forEach(step => {
      if (step && Array.isArray(step.ways)) {
        step.ways.forEach(way => {
          if (way && way.id) {
            flat.push({
              ...way,
              stepId: step.id,
              stepTitle: step.title,
            });
          }
        });
      }
    });
    return flat;
  }, [steps]);

  const nodes = useMemo(() => generateNodes(allWays.length), [allWays.length]);

  const svgHeight = START_Y
    + Math.ceil(allWays.length / NODES_PER_ROW) * V_GAP
    + 80;

  const connectorPath = useMemo(() => generateConnectorPath(nodes), [nodes]);

  const isUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevWay = allWays[index - 1];
    if (!prevWay?.id) return false;
    const safeCompleted = Array.isArray(completedWays) ? completedWays : [];
    return safeCompleted.includes(prevWay.id);
  };

  const isCompleted = (wayId: string) => {
    if (!wayId) return false;
    const safeCompleted = Array.isArray(completedWays) ? completedWays : [];
    return safeCompleted.includes(wayId);
  };

  if (allWays.length === 0) {
    return <div className="adventure-map-empty">Cargando retos...</div>;
  }

  return (
    <div className="adventure-map-container">
      <div className="map-scroll-area">
        <svg
          className="map-path-svg"
          viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`}
          style={{ height: svgHeight }}
        >
          {connectorPath && (
            <path
              d={connectorPath}
              fill="none"
              stroke="#E8E9FF"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="20 20"
            />
          )}
          {nodes.map((pos, i) => {
            const way = allWays[i];
            if (!way || !way.id) return null;
            const unlocked = isUnlocked(i);
            const completed = isCompleted(way.id);
            return (
              <circle
                key={`path-node-${way.id}-${i}`}
                cx={pos.x}
                cy={pos.y}
                r={completed ? 22 : unlocked ? 20 : 16}
                fill={completed ? '#1D9E75' : unlocked ? '#7F77DD' : '#D3D1C7'}
                stroke={completed ? '#085041' : unlocked ? '#534AB7' : '#B4B2A9'}
                strokeWidth="2"
              />
            );
          })}
        </svg>

        <div className="nodes-container" style={{ height: svgHeight }}>
          {allWays.map((way, index) => {
            if (!way || !way.id) return null;
            const pos = nodes[index];
            const unlocked = isUnlocked(index);
            const completed = isCompleted(way.id);

            return (
              <motion.div
                key={`node-${way.id}-${index}`}
                className={`map-node ${unlocked ? 'unlocked' : 'locked'} ${completed ? 'completed' : ''}`}
                style={{
                  left: pos.x,
                  top: pos.y,
                  transform: 'translate(-50%, -50%)',
                  position: 'absolute',
                }}
                whileHover={unlocked ? { scale: 1.1 } : {}}
                whileTap={unlocked ? { scale: 0.9 } : {}}
                onClick={() =>
                  unlocked && way.id &&
                  navigate(`/play/${currentLevelId}/${way.stepId}/${way.id}`)
                }
              >
                <div className="node-bubble">
                  <div className="node-icon">
                    {completed ? '✅' : unlocked ? '⭐' : '🔒'}
                  </div>
                </div>
                <div className="node-label">
                  <span className="step-title">{way.title ?? way.stepTitle}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
