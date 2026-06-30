import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { audioService } from '@/core/utils/audioService';

interface PromptSet {
  title: string;
  suggestions: string[];
}

const THERAPIST_PROMPTS: Record<string, PromptSet> = {
  relaxation: {
    title: 'Relajación y calma',
    suggestions: [
      'Pregúntale a Pedro: "¿Cómo te sentiste cuando respiraste despacio?"',
      'Dile: "Cuando sientes mucho ruido, puedes usar la respiración que practicamos."',
      'Refuerza: "Hiciste muy bien al parar y calmarte."'
    ]
  },
  autonomy: {
    title: 'Autonomía y autoestima',
    suggestions: [
      'Pregúntale: "¿Qué hiciste hoy que te hizo sentir capaz?"',
      'Dile: "Elegir solo lo que quieres es una gran habilidad."',
      'Refuerza: "Confío en ti para decidir pequeñas cosas."'
    ]
  },
  assertiveness: {
    title: 'Asertividad',
    suggestions: [
      'Pregúntale: "¿Pudiste decir que no cuando no querías algo?"',
      'Dile: "Tu voz importa. Puedes pedir ayuda cuando la necesites."',
      'Refuerza: "Decir lo que sientes es de valientes."'
    ]
  },
  default: {
    title: 'Consolidar el aprendizaje',
    suggestions: [
      'Pregúntale: "¿Qué ejercicio te gustó más hoy?"',
      'Dile: "Lo que practicaste aquí lo puedes usar en casa."',
      'Refuerza: "Cada día practicas y creces un poquito más."'
    ]
  }
};

function getSessionDuration(): string {
  const start = sessionStorage.getItem('way-session-start');
  if (!start) return '15 min';
  const elapsed = Math.floor((Date.now() - parseInt(start)) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getSessionWaysCompleted(): number | null {
  const startCount = sessionStorage.getItem('way-session-start-count');
  const current = usePlayerStore.getState().profile?.completedWays?.length ?? 0;
  if (!startCount) return null;
  return Math.max(0, current - parseInt(startCount));
}

export function SessionEndPage() {
  const navigate = useNavigate();
  const profile = usePlayerStore(s => s.profile);
  const wayCoins = useRewardsStore(s => s.wayCoins);
  
  const currentLevel = profile?.currentLevel || 'default';
  const levelKey = currentLevel.includes('relax') ? 'relaxation' 
    : currentLevel.includes('assert') ? 'assertiveness' 
    : currentLevel.includes('autonom') ? 'autonomy' 
    : 'default';
  
  const prompts = THERAPIST_PROMPTS[levelKey] || THERAPIST_PROMPTS.default;
  const sessionDuration = useMemo(() => getSessionDuration(), []);
  const sessionWays = useMemo(() => getSessionWaysCompleted(), []);
  const totalWays = profile?.completedWays?.length ?? 0;

  const handleNavigate = useCallback((path: string) => {
    try { audioService.playSFX('click'); } catch (e) {}
    navigate(path);
  }, [navigate]);

  const handleLogout = useCallback(() => {
    try { audioService.playSFX('click'); } catch (e) {}
    sessionStorage.removeItem('way-active-patient');
    sessionStorage.removeItem('way-active-pin');
    sessionStorage.removeItem('way-session-start');
    sessionStorage.removeItem('way-session-start-count');
    window.location.href = '/player';
  }, []);

  return (
    <div 
      className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-6 relative"
      style={{ fontFamily: 'Verdana, sans-serif' }}
      data-testid="session-end-page"
    >
      {/* Header */}
      <header className="text-center mb-4 w-full max-w-2xl">
        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-lg mx-auto mb-2">
          🏁
        </div>
        <h1 className="text-base font-bold text-slate-800 leading-normal">
          Sesión terminada
        </h1>
        <p className="text-sm text-slate-500 leading-normal mt-0.5">
          ¡Buen trabajo, {profile?.name || 'peque'}!
        </p>
      </header>

      {/* Resumen */}
      <section 
        className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-3"
        data-testid="session-summary"
      >
        <h2 className="text-sm font-bold text-slate-700 leading-normal mb-3">
          Resumen de hoy
        </h2>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-xl bg-amber-50 border border-amber-200">
            <div className="text-lg leading-none mb-1">⭐</div>
            <div className="text-base font-bold text-amber-700 leading-none" data-testid="summary-coins">
              {wayCoins}
            </div>
            <div className="text-[10px] font-bold text-amber-600 mt-1">Monedas</div>
          </div>
          
          <div className="text-center p-2 rounded-xl bg-violet-50 border border-violet-200">
            <div className="text-lg leading-none mb-1">⏱️</div>
            <div className="text-base font-bold text-violet-700 leading-none" data-testid="summary-time">
              {sessionDuration}
            </div>
            <div className="text-[10px] font-bold text-violet-600 mt-1">Tiempo</div>
          </div>
          
          <div className="text-center p-2 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="text-lg leading-none mb-1">🎯</div>
            <div className="text-base font-bold text-emerald-700 leading-none" data-testid="summary-ways">
              {sessionWays !== null ? sessionWays : totalWays}
            </div>
            <div className="text-[10px] font-bold text-emerald-600 mt-1">
              {sessionWays !== null ? 'Hechos hoy' : 'Total'}
            </div>
          </div>
        </div>
      </section>

      {/* Guía para Maite */}
      <section 
        className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4"
        data-testid="therapist-guide"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">🗣️</span>
          <h2 className="text-sm font-bold text-slate-700 leading-normal">
            Pautas para Maite
          </h2>
        </div>
        
        <div className="mb-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 block mb-1">
            Tema: {prompts.title}
          </span>
        </div>
        
        <ul className="space-y-2">
          {prompts.suggestions.map((suggestion, idx) => (
            <li 
              key={idx} 
              className="flex items-start gap-2 text-sm text-slate-700 leading-normal"
              data-testid={`therapist-prompt-${idx}`}
            >
              <span className="text-xs mt-0.5 shrink-0">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Botones */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-3 mt-auto sm:mt-2">
        <button
          onClick={() => handleNavigate('/player/home')}
          className="flex-1 min-h-[44px] px-4 py-3 rounded-xl bg-violet-500 text-white font-bold text-sm active:scale-95 transition-transform duration-150 shadow-sm"
          data-testid="btn-back-to-map"
        >
          Volver al mapa
        </button>
        
        <button
          onClick={handleLogout}
          className="flex-1 min-h-[44px] px-4 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm active:scale-95 transition-transform duration-150 shadow-sm"
          data-testid="btn-logout"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
