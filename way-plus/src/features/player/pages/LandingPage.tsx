import React from 'react';
import { useNavigate } from 'react-router-dom';
import { audioService } from '@/core/utils/audioService';
import { Button } from '@/shared/components/Button';
import { T, Emoji } from '@/shared/components/TypographyScale';

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
            <T size="lg" bold color="primary">WAY+</T>
          </div>
          
          <T size="base" bold as="h1">Tu camino comienza aquí</T>
          
          <T size="sm" color="muted" className="max-w-md mx-auto">
            Plataforma clínica de estimulación cognitiva y funciones ejecutivas.
          </T>
        </header>

        {/* Cards */}
        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {/* Opción NIÑO */}
          <Button
            variant="secondary"
            size="lg"
            onClick={() => handleSelect('/')}
            className="flex-col py-6 h-auto min-h-[160px] gap-3 border-2 hover:border-teal-300"
            aria-label="Entrar como niño a jugar"
          >
            <Emoji className="text-2xl">🎮</Emoji>
            <T size="sm" bold>Soy niño</T>
            <div className="px-4 py-1.5 rounded-full bg-teal-100">
              <T size="xs" bold color="success">Entrar a jugar</T>
            </div>
          </Button>

          {/* Opción TERAPEUTA */}
          <Button
            variant="secondary"
            size="lg"
            onClick={() => handleSelect('/auth')}
            className="flex-col py-6 h-auto min-h-[160px] gap-3 border-2 hover:border-violet-300"
            aria-label="Entrar como terapeuta para gestionar"
          >
            <Emoji className="text-2xl">🩺</Emoji>
            <T size="sm" bold>Soy terapeuta</T>
            <div className="px-4 py-1.5 rounded-full bg-violet-100">
              <T size="xs" bold color="primary">Gestionar clínica</T>
            </div>
          </Button>
        </nav>

        {/* Footer */}
        <footer className="mt-2">
          <T size="micro" color="muted" bold>WAY+ v2.2</T>
        </footer>
      </div>
    </div>
  );
}
