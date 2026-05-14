import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { audioService } from '@/core/utils/audioService';

export function LandingPage() {
  const navigate = useNavigate();

  const handleSelect = (path: string) => {
    audioService.playSFX('click');
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#F8FAFF] to-[#E8EDFF] overflow-hidden relative">
      {/* Elementos decorativos de fondo */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-400 rounded-full blur-[120px]"
      />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-400 rounded-full blur-[150px]"
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-4xl flex flex-col items-center gap-12"
      >
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-block p-4 bg-white rounded-3xl shadow-xl mb-6 border border-indigo-50"
          >
            <div className="text-4xl font-black text-indigo-600">WAY+</div>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-[#1E1B4B] tracking-tight leading-none">
            TU CAMINO <span className="text-indigo-600">COMIENZA AQUÍ</span>
          </h1>
          <p className="text-lg text-indigo-900/60 font-medium max-w-lg mx-auto">
            Plataforma clínica para el entrenamiento de funciones ejecutivas. Elige cómo quieres entrar hoy:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
          {/* Opción NIÑO */}
          <motion.button
            whileHover={{ scale: 1.05, y: -8 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect('/')}
            className="group relative flex flex-col items-center p-10 bg-white rounded-[40px] shadow-[0_30px_60px_-15px_rgba(79,70,229,0.15)] border-2 border-transparent hover:border-indigo-200 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-48 h-48 mb-8 relative">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-8xl drop-shadow-2xl z-10 relative flex items-center justify-center h-full"
              >
                🎮
              </motion.div>
              <div className="absolute inset-0 bg-indigo-500/20 blur-[40px] rounded-full scale-75" />
            </div>
            <h2 className="text-3xl font-black text-[#1E1B4B] mb-2 uppercase tracking-wide">Soy niño</h2>
            <p className="text-indigo-500 font-bold uppercase tracking-widest text-sm">Entrar a jugar</p>
          </motion.button>

          {/* Opción TERAPEUTA */}
          <motion.button
            whileHover={{ scale: 1.05, y: -8 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect('/auth')}
            className="group relative flex flex-col items-center p-10 bg-white rounded-[40px] shadow-[0_30px_60px_-15px_rgba(79,70,229,0.15)] border-2 border-transparent hover:border-purple-200 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-48 h-48 mb-8 flex items-center justify-center relative">
               <div className="text-8xl group-hover:scale-110 transition-transform duration-500 z-10">🩺</div>
               <div className="absolute inset-0 bg-purple-500/20 blur-[40px] rounded-full scale-75" />
            </div>
            <h2 className="text-3xl font-black text-[#1E1B4B] mb-2 uppercase tracking-wide">Soy terapeuta</h2>
            <p className="text-purple-500 font-bold uppercase tracking-widest text-sm">Gestionar clínica</p>
          </motion.button>
        </div>

        <div className="mt-8">
           <p className="text-xs font-bold text-indigo-300 uppercase tracking-[0.3em]">WAY+ v2.0 • Advanced Clinical Telemetry</p>
        </div>
      </motion.div>
    </div>
  );
}
