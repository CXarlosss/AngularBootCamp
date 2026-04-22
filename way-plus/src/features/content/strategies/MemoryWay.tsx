import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWayEngine } from '@/core/engine/useWayEngine';

interface Card {
  id: string;
  pairId: string;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface Props {
  way: {
    id: string;
    stimulus: { text: string };
    options: Array<{ id: string; image: string; pairId: string }>;
  };
  onComplete: () => void;
}

export const MemoryWay: React.FC<Props> = ({ way, onComplete }) => {
  const { submitAnswer, state } = useWayEngine(way.id);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const duplicated = way.options.flatMap(opt => [
      { id: `${opt.id}-a`, pairId: opt.pairId, image: opt.image, isFlipped: false, isMatched: false },
      { id: `${opt.id}-b`, pairId: opt.pairId, image: opt.image, isFlipped: false, isMatched: false },
    ]);
    setCards(duplicated.sort(() => Math.random() - 0.5));
  }, [way.options]);

  const handleCardClick = useCallback((cardId: string) => {
    if (state === 'answered' || flippedCards.length === 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isMatched || card.isFlipped) return;

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isFlipped: true } : c));

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlipped;
      const first = cards.find(c => c.id === firstId)!;
      const second = cards.find(c => c.id === secondId)!;
      
      setTimeout(() => {
        if (first.pairId === second.pairId) {
          setCards(prev => {
            const updated = prev.map(c => 
              (c.id === firstId || c.id === secondId) ? { ...c, isMatched: true } : c
            );
            
            if (updated.every(c => c.isMatched)) {
              submitAnswer('correct', moves + 1);
              setTimeout(onComplete, 3500);
            }
            return updated;
          });
        } else {
          setCards(prev => prev.map(c => 
            (c.id === firstId || c.id === secondId) ? { ...c, isFlipped: false } : c
          ));
        }
        setFlippedCards([]);
      }, 1000);
    }
  }, [flippedCards, cards, state, submitAnswer, onComplete, moves]);

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto p-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{way.stimulus.text}</h2>
        <div className="mt-4 flex justify-center gap-4">
          <div className="bg-indigo-600 text-white px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest shadow-lg">
            Movimientos: {moves}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isMatched || card.isFlipped || state === 'answered'}
            className={`aspect-square rounded-3xl shadow-xl border-b-8 flex items-center justify-center relative transition-all duration-300
              ${card.isMatched ? 'bg-emerald-100 border-emerald-200' : ''}
              ${card.isFlipped ? 'bg-white border-indigo-100 rotate-y-180' : 'bg-indigo-500 border-indigo-700'}
            `}
          >
            <AnimatePresence mode="wait">
              {(card.isFlipped || card.isMatched) ? (
                <motion.img 
                  key="front"
                  initial={{ opacity: 0, rotateY: 90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  src={card.image} 
                  className="w-full h-full object-contain p-4" 
                />
              ) : (
                <motion.span 
                  key="back"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white text-5xl font-black"
                >
                  ?
                </motion.span>
              )}
            </AnimatePresence>
            
            {card.isMatched && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-4 border-white"
              >
                <span className="text-xl font-bold">✓</span>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
