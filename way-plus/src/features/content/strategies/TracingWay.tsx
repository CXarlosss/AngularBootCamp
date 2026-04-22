import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWayEngine } from '@/core/engine/useWayEngine';

interface TracingWayProps {
  way: {
    id: string;
    stimulus: { image: string; text: string };
    options: Array<{
      id: string;
      image: string;
      label: string;
      isCorrect: boolean;
      position: { x: number; y: number }; 
    }>;
    startPoint: { x: number; y: number };
  };
  onComplete: () => void;
}

export const TracingWay: React.FC<TracingWayProps> = ({ way, onComplete }) => {
  const { submitAnswer, state } = useWayEngine(way.id);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const getRelativePos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (state === 'answered') return;
    const pos = getRelativePos(e);
    const dist = Math.hypot(pos.x - way.startPoint.x, pos.y - way.startPoint.y);
    if (dist < 15) {
      setIsDrawing(true);
      setPath([pos]);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getRelativePos(e);
    setPath(prev => [...prev, pos]);
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const lastPoint = path[path.length - 1];
    if (!lastPoint) return;
    
    const correctOption = way.options.find(o => o.isCorrect)!;
    const dist = Math.hypot(lastPoint.x - correctOption.position.x, lastPoint.y - correctOption.position.y);
    
    const isCorrect = dist < 15;
    setResult(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      submitAnswer('correct');
      setTimeout(onComplete, 3500);
    } else {
      setTimeout(() => {
        setPath([]);
        setResult(null);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{way.stimulus.text}</h2>
        <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-sm">✍️ Traza el camino correcto</p>
      </div>

      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] bg-white rounded-[3rem] shadow-2xl border-4 border-indigo-50 overflow-hidden touch-none select-none cursor-crosshair"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <polyline
            points={path.map(p => `${p.x}%,${p.y}%`).join(' ')}
            fill="none"
            stroke="#6366f1"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-lg"
          />
          {path.length > 0 && (
            <circle cx={`${path[path.length - 1].x}%`} cy={`${path[path.length - 1].y}%`} r="10" fill="#6366f1" />
          )}
        </svg>

        <motion.div
          animate={isDrawing ? { scale: 1.2 } : { scale: 1 }}
          className="absolute w-16 h-16 -ml-8 -mt-8 bg-amber-400 rounded-full flex items-center justify-center shadow-xl border-4 border-white z-10"
          style={{ left: `${way.startPoint.x}%`, top: `${way.startPoint.y}%` }}
        >
          <span className="text-2xl animate-pulse">✋</span>
        </motion.div>

        {way.options.map((opt) => (
          <motion.div
            key={opt.id}
            className={`absolute w-24 h-24 -ml-12 -mt-12 rounded-[2rem] flex flex-col items-center justify-center shadow-xl border-4 bg-white transition-all
              ${state === 'answered' && opt.isCorrect ? 'border-emerald-400 scale-110' : 'border-slate-50'}
            `}
            style={{ left: `${opt.position.x}%`, top: `${opt.position.y}%` }}
            animate={state === 'answered' && !opt.isCorrect ? { opacity: 0.3, scale: 0.9 } : {}}
          >
            <img src={opt.image} alt="" className="w-14 h-14 object-contain" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mt-1">{opt.label}</span>
          </motion.div>
        ))}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50"
            >
              <div className={`rounded-[2.5rem] p-10 shadow-2xl text-center bg-white border-b-8 ${result === 'correct' ? 'border-emerald-500' : 'border-rose-500'}`}>
                <div className="text-7xl mb-4">{result === 'correct' ? '😃' : '😢'}</div>
                <div className="text-3xl font-black text-slate-800 uppercase tracking-tight">
                  {result === 'correct' ? '¡GENIAL!' : '¡CASI!'}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
