import React, { useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { useWayEngine } from '@/core/engine/useWayEngine';

interface SequencingOption {
  id: string;
  image: string;
  label: string;
  order: number; 
}

interface Props {
  way: {
    id: string;
    stimulus: { image: string; text: string };
    options: SequencingOption[];
  };
  onComplete: () => void;
}

export const SequencingWay: React.FC<Props> = ({ way, onComplete }) => {
  const { submitAnswer, state } = useWayEngine(way.id);
  const [items, setItems] = useState(() => 
    [...way.options].sort(() => Math.random() - 0.5)
  );
  const [attempts, setAttempts] = useState(0);

  const checkOrder = () => {
    const isCorrect = items.every((item, index) => item.order === index);
    setAttempts(prev => prev + 1);
    
    if (isCorrect) {
      submitAnswer('correct', attempts + 1);
      setTimeout(onComplete, 3500);
    } else {
      submitAnswer('incorrect');
    }
  };

  const isLocked = state === 'answered';

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl mb-8 text-center border-4 border-indigo-50">
        {way.stimulus.image && (
          <img src={way.stimulus.image} alt="" className="w-32 h-32 object-contain mx-auto mb-6" />
        )}
        <h2 className="text-3xl font-black text-slate-800 leading-tight">{way.stimulus.text}</h2>
        <p className="text-slate-400 font-bold mt-3 uppercase tracking-widest text-sm">👆 Arrastra para ordenar</p>
      </div>

      <Reorder.Group 
        axis="y" 
        values={items} 
        onReorder={setItems}
        className="w-full space-y-4 mb-10"
      >
        <AnimatePresence>
          {items.map((item) => (
            <Reorder.Item
              key={item.id}
              value={item}
              drag={!isLocked}
              whileDrag={{ scale: 1.05, rotate: 1 }}
              className={`bg-white rounded-3xl p-5 shadow-lg border-b-8 flex items-center gap-6 cursor-grab active:cursor-grabbing transition-all
                ${isLocked ? 'border-emerald-200 opacity-90' : 'border-slate-100 hover:border-indigo-200'}
              `}
            >
              <div className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner">
                {items.indexOf(item) + 1}
              </div>
              <img src={item.image} alt="" className="w-16 h-16 object-contain" />
              <span className="text-xl font-black text-slate-700 flex-1">{item.label}</span>
              <div className="text-slate-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="5" y1="9" x2="19" y2="9" /><line x1="5" y1="15" x2="19" y2="15" />
                </svg>
              </div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={checkOrder}
        disabled={isLocked}
        className={`w-full py-6 rounded-[2rem] text-2xl font-black text-white shadow-2xl transition-all
          ${isLocked 
            ? 'bg-emerald-500 shadow-emerald-200' 
            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}
        `}
      >
        {isLocked ? '🎉 ¡LOGRADO!' : 'COMPROBAR ORDEN'}
      </motion.button>
    </div>
  );
};
