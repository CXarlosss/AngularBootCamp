import React from 'react';
import { motion } from 'framer-motion';
import { useWayImage } from '@/core/services/wayImageService';
import { audioService } from '@/core/utils/audioService';

interface Props {
  way: {
    id: string;
    stepNumber?: number;
    wayNumber?: number;
    stimulus: { image?: string; text?: string };
    theme?: string;
  };
  onComplete: () => void;
}

/**
 * RoleplayWay - "Pechakucha" style for role reversal.
 * High visual impact, minimal text, focuses on the action of role swapping.
 */
export const RoleplayWay: React.FC<Props> = ({ way, onComplete }) => {
  const { src: situationImg, loaded: imgLoaded } = useWayImage(
    way.stepNumber || 1,
    way.wayNumber || 1,
    way.theme || 'default'
  );

  const handleComplete = () => {
    audioService.playSFX('success');
    onComplete();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 gap-8">
      {/* Pechakucha-style Immersive Scene */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full aspect-[4/3] rounded-[3rem] overflow-hidden bg-slate-100 border-[12px] border-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] relative"
      >
        {imgLoaded ? (
          <img src={situationImg} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">🎭</span>
          </div>
        )}
        
        {/* Overlay Label */}
        <div className="absolute inset-x-0 bottom-0 bg-indigo-600/90 backdrop-blur-md py-6 text-center">
          <h2 className="text-white text-3xl font-black uppercase tracking-[0.2em] leading-tight" style={{ fontFamily: 'Verdana, sans-serif' }}>
            Cambio de Papel
          </h2>
        </div>
      </motion.div>

      {/* Instruction Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-[2.5rem] p-8 shadow-xl border-b-[8px] border-slate-100 text-center w-full"
      >
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-4" style={{ fontFamily: 'Verdana, sans-serif' }}>
          Misión: Cambio de Papel
        </p>
        <h3 className="text-2xl font-black text-slate-800 leading-tight mb-8" style={{ fontFamily: 'Verdana, sans-serif' }}>
          {way.stimulus.text || 'Tú haces de profe/papá y ellos hacen de ti.'}
        </h3>

        <motion.button
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleComplete}
          className="w-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white py-6 rounded-[2rem] text-2xl font-black shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] border-b-[8px] border-indigo-900 active:border-b-0 transition-all uppercase tracking-widest"
          style={{ fontFamily: 'Verdana, sans-serif' }}
        >
          ¡HECHO! ➔
        </motion.button>
      </motion.div>

      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest opacity-60" style={{ fontFamily: 'Verdana, sans-serif' }}>
        Toca el botón cuando termines el ejercicio
      </p>
    </div>
  );
};
