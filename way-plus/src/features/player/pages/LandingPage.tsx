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
      {/* Elementos decorativos de fondo con animate-blob */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-400/30 rounded-full blur-[120px] animate-blob mix-blend-multiply" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-400/30 rounded-full blur-[150px] animate-blob-delayed mix-blend-multiply" />
      <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-sky-300/20 rounded-full blur-[100px] animate-blob-slow mix-blend-multiply" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-4xl flex flex-col items-center gap-12"
      >
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-block p-4 glass-card rounded-3xl mb-6 glow-soft"
          >
            <div className="text-4xl font-black text-indigo-600 tracking-tight">WAY+</div>
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
          <button
            onClick={() => handleSelect('/')}
            className="group relative flex flex-col items-center p-10 bg-white rounded-[40px] btn-3d border-2 border-indigo-50 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-48 h-48 mb-8 relative flex items-center justify-center">
              <div 
                className="text-8xl drop-shadow-2xl z-10 relative flex items-center justify-center h-full transform transition-transform group-hover:scale-110 group-hover:-translate-y-2 duration-300"
              >
                🎮
              </div>
              <div className="absolute inset-0 bg-indigo-500/10 blur-[30px] rounded-full scale-75 group-hover:bg-indigo-500/20 transition-colors" />
            </div>
            <h2 className="text-3xl font-black text-[#1E1B4B] mb-2 uppercase tracking-wide">Soy niño</h2>
            <p className="text-indigo-500 font-bold uppercase tracking-widest text-sm">Entrar a jugar</p>
          </button>

          {/* Opción TERAPEUTA */}
          <button
            onClick={() => handleSelect('/auth')}
            className="group relative flex flex-col items-center p-10 bg-white rounded-[40px] btn-3d border-2 border-purple-50 hover:border-purple-200 hover:bg-purple-50/50 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-48 h-48 mb-8 relative flex items-center justify-center">
               <div className="text-8xl drop-shadow-2xl z-10 relative flex items-center justify-center h-full transform transition-transform group-hover:scale-110 group-hover:-translate-y-2 duration-300">
                 🩺
               </div>
               <div className="absolute inset-0 bg-purple-500/10 blur-[30px] rounded-full scale-75 group-hover:bg-purple-500/20 transition-colors" />
            </div>
            <h2 className="text-3xl font-black text-[#1E1B4B] mb-2 uppercase tracking-wide">Soy terapeuta</h2>
            <p className="text-purple-500 font-bold uppercase tracking-widest text-sm">Gestionar clínica</p>
          </button>
        </div>

        <div className="mt-8">
           <p className="text-xs font-bold text-indigo-300 uppercase tracking-[0.3em] glow-soft">WAY+ v2.0 • Advanced Clinical Telemetry</p>
        </div>
      </motion.div>
    </div>
  );
}

