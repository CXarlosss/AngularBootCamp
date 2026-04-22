import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKioskStore } from '../store/kioskStore';

export const ExitPinModal: React.FC = () => {
  const { showExitModal, cancelExit, validatePin, unlock } = useKioskStore();
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (input.length >= 4) return;
    const newInput = input + digit;
    setInput(newInput);
    setError(false);
    
    if (newInput.length === 4) {
      if (validatePin(newInput)) {
        unlock();
        setInput('');
      } else {
        setError(true);
        setTimeout(() => setInput(''), 500);
      }
    }
  };

  const handleBackspace = () => {
    setInput(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <AnimatePresence>
      {showExitModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 font-outfit"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl border-4 border-white"
          >
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🔐</div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Modo Seguro
              </h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">
                Introduce el PIN del terapeuta
              </p>
            </div>

            {/* Display de PIN */}
            <div className="flex justify-center gap-3 mb-10">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                  className={`w-14 h-14 rounded-2xl border-4 flex items-center justify-center text-2xl font-black transition-all
                    ${error ? 'border-rose-200 bg-rose-50 text-rose-500' : 
                      input.length > i ? 'border-indigo-200 bg-indigo-50 text-indigo-600' : 'border-slate-50 bg-slate-50 text-slate-300'}
                  `}
                >
                  {input.length > i ? '●' : '○'}
                </motion.div>
              ))}
            </div>

            {/* Teclado numérico */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05, backgroundColor: '#f8fafc' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (key === 'C') setInput('');
                    else if (key === '⌫') handleBackspace();
                    else handleDigit(key);
                  }}
                  className={`aspect-square rounded-2xl text-xl font-black shadow-sm border-2 border-slate-50 transition-all
                    ${key === 'C' ? 'text-rose-500 hover:border-rose-100' : 
                      key === '⌫' ? 'text-amber-500 hover:border-amber-100' : 
                      'text-slate-700 hover:border-indigo-100'}
                  `}
                >
                  {key}
                </motion.button>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={cancelExit}
              className="w-full py-4 rounded-2xl bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
            >
              Cancelar
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
