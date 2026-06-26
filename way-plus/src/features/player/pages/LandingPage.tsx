import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { audioService } from '@/core/utils/audioService';

const BACKGROUND_BLOBS = (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] bg-violet-300/20 rounded-full blur-[70px] animate-blob-float" />
    <div className="absolute bottom-[-15%] left-[-10%] w-[550px] h-[550px] bg-teal-300/20 rounded-full blur-[60px] animate-blob-float" style={{ animationDelay: '2s' }} />
  </div>
);

export function LandingPage() {
  const navigate = useNavigate();

  const handleSelect = (path: string) => {
    try {
      audioService.playSFX('click');
    } catch (e) {
      console.warn('Audio play failed', e);
    }
    requestAnimationFrame(() => {
      navigate(path);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-50/30 to-teal-50/20 relative">
      {BACKGROUND_BLOBS}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 w-full max-w-3xl flex flex-col items-center gap-8 sm:gap-10"
      >
        <header className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 120, damping: 20 }}
            className="inline-flex items-center justify-center px-8 py-4 glass-card rounded-[2rem] shadow-sm mb-4"
          >
            <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
              WAY+
            </span>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Tu camino <div className="w-full" />
            <span className="text-violet-600">comienza aquí</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
            Plataforma clínica de estimulación cognitiva y funciones ejecutivas.
          </p>
        </header>

        <nav className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 w-full">
          {/* Opción NIÑO - Teal focus */}
          <button
            onClick={() => handleSelect('/')}
            className="group relative flex flex-col items-center p-8 bg-white/80 rounded-[2.5rem] btn-3d border-[3px] border-slate-200/60 hover:border-teal-200/60 transition-[transform,box-shadow,border-color] duration-150 focus-visible:ring-4 ring-violet-400/50 active:scale-[0.97]"
            aria-label="Entrar como niño a jugar"
          >
            <div className="absolute inset-0 bg-teal-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-[2.5rem]" />
            <div className="w-28 h-28 sm:w-36 sm:h-36 mb-6 relative flex items-center justify-center">
              <div className="text-6xl sm:text-7xl drop-shadow-sm z-10 relative flex items-center justify-center transform transition-transform duration-150 group-hover:-translate-y-0.5">
                🎮
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 tracking-tight z-10 relative">Soy niño</h2>
            <div className="px-6 py-2 rounded-full bg-teal-100 text-teal-700 font-bold uppercase tracking-widest text-xs md:text-sm z-10 relative">
              Entrar a jugar
            </div>
          </button>

          {/* Opción TERAPEUTA - Violet focus */}
          <button
            onClick={() => handleSelect('/auth')}
            className="group relative flex flex-col items-center p-8 bg-white/80 rounded-[2.5rem] btn-3d border-[3px] border-slate-200/60 hover:border-violet-200/60 transition-[transform,box-shadow,border-color] duration-150 focus-visible:ring-4 ring-violet-400/50 active:scale-[0.97]"
            aria-label="Entrar como terapeuta para gestionar"
          >
            <div className="absolute inset-0 bg-violet-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-[2.5rem]" />
            <div className="w-28 h-28 sm:w-36 sm:h-36 mb-6 relative flex items-center justify-center">
               <div className="text-6xl sm:text-7xl drop-shadow-sm z-10 relative flex items-center justify-center transform transition-transform duration-150 group-hover:-translate-y-0.5">
                 🩺
               </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 tracking-tight z-10 relative">Soy terapeuta</h2>
            <div className="px-6 py-2 rounded-full bg-violet-100 text-violet-700 font-bold uppercase tracking-widest text-xs md:text-sm z-10 relative">
              Gestionar clínica
            </div>
          </button>
        </nav>

        <footer className="mt-6">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
             WAY+ v2.0 • Advanced Clinical Telemetry
           </p>
        </footer>
      </motion.div>
    </div>
  );
}


