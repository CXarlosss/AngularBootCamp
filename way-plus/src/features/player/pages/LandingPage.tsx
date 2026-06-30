import React from 'react';
import { useNavigate } from 'react-router-dom';
import { audioService } from '@/core/utils/audioService';

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:px-6 bg-slate-50 relative">
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 sm:gap-8">
        
        {/* Header */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center justify-center px-6 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-lg font-bold text-violet-600">
              WAY+
            </span>
          </div>
          
          <h1 className="text-base font-bold text-slate-800 leading-normal">
            Tu camino comienza aquí
          </h1>
          
          <p className="text-sm text-slate-500 font-medium max-w-md mx-auto leading-normal">
            Plataforma clínica de estimulación cognitiva y funciones ejecutivas.
          </p>
        </header>

        {/* Cards */}
        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {/* Opción NIÑO */}
          <button
            onClick={() => handleSelect('/')}
            className="group flex flex-col items-center p-6 bg-white rounded-2xl border-2 border-slate-200 hover:border-teal-300 transition-all duration-150 focus-visible:ring-2 ring-violet-400/40 active:scale-95 min-h-[44px]"
            aria-label="Entrar como niño a jugar"
          >
            <span className="text-lg mb-3">🎮</span>
            <h2 className="text-sm font-bold text-slate-800 mb-2">Soy niño</h2>
            <div className="px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 font-bold text-xs">
              Entrar a jugar
            </div>
          </button>

          {/* Opción TERAPEUTA */}
          <button
            onClick={() => handleSelect('/auth')}
            className="group flex flex-col items-center p-6 bg-white rounded-2xl border-2 border-slate-200 hover:border-violet-300 transition-all duration-150 focus-visible:ring-2 ring-violet-400/40 active:scale-95 min-h-[44px]"
            aria-label="Entrar como terapeuta para gestionar"
          >
            <span className="text-lg mb-3">🩺</span>
            <h2 className="text-sm font-bold text-slate-800 mb-2">Soy terapeuta</h2>
            <div className="px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 font-bold text-xs">
              Gestionar clínica
            </div>
          </button>
        </nav>

        {/* Footer */}
        <footer className="mt-2">
          <p className="text-[10px] font-bold text-slate-400">
            WAY+ v2.2
          </p>
        </footer>
      </div>
    </div>
  );
}
