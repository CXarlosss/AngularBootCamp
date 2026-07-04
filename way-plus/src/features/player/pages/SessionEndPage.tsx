import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { audioService } from '@/core/utils/audioService';
import { Button } from '@/shared/components/Button';
import { T, Emoji } from '@/shared/components/TypographyScale';

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
        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mx-auto mb-2">
          <Emoji>🏁</Emoji>
        </div>
        <T size="base" bold as="h1">Sesión terminada</T>
        <T size="sm" color="muted" className="mt-1">
          ¡Buen trabajo, {profile?.name || 'peque'}!
        </T>
      </header>

      {/* Resumen */}
      <section 
        className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-3"
        data-testid="session-summary"
      >
        <T size="sm" bold as="h2" className="mb-3">Resumen de hoy</T>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-xl bg-amber-50 border border-amber-200">
            <Emoji className="mb-1">⭐</Emoji>
            <T size="base" bold color="warning" data-testid="summary-coins">
              {wayCoins}
            </T>
            <T size="micro" bold color="warning">Monedas</T>
          </div>
          
          <div className="text-center p-2 rounded-xl bg-violet-50 border border-violet-200">
            <Emoji className="mb-1">⏱️</Emoji>
            <T size="base" bold color="primary" data-testid="summary-time">
              {sessionDuration}
            </T>
            <T size="micro" bold color="primary">Tiempo</T>
          </div>
          
          <div className="text-center p-2 rounded-xl bg-emerald-50 border border-emerald-200">
            <Emoji className="mb-1">🎯</Emoji>
            <T size="base" bold color="success" data-testid="summary-ways">
              {sessionWays !== null ? sessionWays : totalWays}
            </T>
            <T size="micro" bold color="success">
              {sessionWays !== null ? 'Hechos hoy' : 'Total'}
            </T>
          </div>
        </div>
      </section>

      {/* Guía para Maite */}
      <section 
        className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4"
        data-testid="therapist-guide"
      >
        <div className="flex items-center gap-2 mb-3">
          <Emoji>🗣️</Emoji>
          <T size="sm" bold as="h2">Pautas para Maite</T>
        </div>
        
        <div className="mb-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
          <T size="micro" bold color="muted">
            Tema: {prompts.title}
          </T>
        </div>
        
        <ul className="space-y-2">
          {prompts.suggestions.map((suggestion, idx) => (
            <li 
              key={idx} 
              className="flex items-start gap-2"
              data-testid={`therapist-prompt-${idx}`}
            >
              <T size="xs" className="mt-0.5 shrink-0">•</T>
              <T size="sm">{suggestion}</T>
            </li>
          ))}
        </ul>
      </section>

      {/* Botones */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-3 mt-auto sm:mt-2">
        <Button
          variant="primary"
          size="md"
          className="flex-1"
          onClick={() => handleNavigate('/player/home')}
          data-testid="btn-back-to-map"
        >
          Volver al mapa
        </Button>
        
        <Button
          variant="secondary"
          size="md"
          className="flex-1"
          onClick={handleLogout}
          data-testid="btn-logout"
        >
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
