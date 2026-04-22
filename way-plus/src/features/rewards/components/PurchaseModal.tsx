import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRewardsStore } from '../store/rewardsStore';
import type { ShopItem } from '../data/shopCatalog';

interface PurchaseModalProps {
  item: ShopItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ item, isOpen, onClose, onConfirm }) => {
  const { wayCoins } = useRewardsStore();
  const [status, setStatus] = useState<'confirm' | 'success' | 'error'>('confirm');
  
  if (!item) return null;

  const canAfford = wayCoins >= item.price;
  
  const handlePurchase = () => {
    if (!canAfford) {
      setStatus('error');
      return;
    }
    onConfirm();
    setStatus('success');
    setTimeout(() => {
      setStatus('confirm');
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50, rotate: -5 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[3.5rem] p-12 max-w-sm w-full shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] text-center border-8 border-white"
          >
            {status === 'confirm' && (
              <>
                <div className="relative mb-8">
                  <div className="text-9xl filter drop-shadow-xl">{item.icon}</div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-4 -right-4 bg-amber-400 text-white rounded-full p-4 shadow-xl border-4 border-white font-black"
                  >
                    NUEVO
                  </motion.div>
                </div>
                
                <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">{item.name}</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-8">¿Lo quieres comprar?</p>
                
                <div className="flex items-center justify-center gap-3 bg-amber-50 rounded-[2rem] px-8 py-5 mb-10 border-4 border-amber-100">
                  <span className="text-4xl">🪙</span>
                  <span className="text-4xl font-black text-amber-600">{item.price}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="py-5 rounded-3xl bg-slate-100 text-slate-500 font-black text-xl border-b-4 border-slate-200"
                  >
                    NO
                  </motion.button>
                  <motion.button
                    whileTap={canAfford ? { scale: 0.95 } : {}}
                    onClick={handlePurchase}
                    disabled={!canAfford}
                    className={`py-5 rounded-3xl font-black text-xl text-white border-b-4
                      ${canAfford 
                        ? 'bg-emerald-500 border-emerald-600 shadow-xl shadow-emerald-100' 
                        : 'bg-slate-200 border-slate-300 cursor-not-allowed text-slate-400'
                      }
                    `}
                  >
                    {canAfford ? '¡SÍ!' : 'FALTAN'}
                  </motion.button>
                </div>
              </>
            )}
            
            {status === 'success' && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="space-y-6">
                <div className="text-9xl animate-bounce">🎁</div>
                <h2 className="text-4xl font-black text-emerald-600 tracking-tighter">¡YA ES TUYO!</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest">Lo hemos guardado en tu mochila</p>
              </motion.div>
            )}
            
            {status === 'error' && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="space-y-6">
                <div className="text-9xl">💡</div>
                <h2 className="text-3xl font-black text-rose-500 tracking-tighter">¡NECESITAS MONEDAS!</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest">Sigue superando retos para ganar más</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
