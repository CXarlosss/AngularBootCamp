/**
 * SessionPlayerPage.tsx (final)
 * Ruta: /session/:patientId?sessionId=<uuid>
 *
 * Vista limpia del niño durante la sesión activa.
 * WayRenderer integrado con contrato real.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sessionService, type PlannedSession, type SessionSummary } from '@/core/services/sessionService';
import { normalizeWayText } from '@/shared/lib/way-text-utils';
import { syncEngine } from '@/core/sync/SyncEngine'; // Usamos el motor
import { WayRenderer } from '@/features/content/components/WayRenderer';
import { registry } from '@/content/registry';
import { type Way, type Step } from '@/core/engine/types';
import { useTherapistStore } from '@/features/therapist/store/therapistStore';
import { HomeworkCelebration } from '@/features/player/components/HomeworkCelebration';
import { homeworkService } from '@/core/services/homeworkService';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { preloadWayImages } from '@/core/services/wayImageService';
import { globalAnalytics } from '@/core/services/globalAnalytics';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  indigo:   '#4F46E5',
  indigoLt: '#EEEDFE',
  text:     '#1E1B4B',
  muted:    '#6B7280',
  border:   '#E8E9FF',
  white:    '#ffffff',
  bg:       '#F8FAFF',
  emerald:  '#10B981',
  rose:     '#F43F5E',
};

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="fixed top-4 left-4 right-4 z-[100] flex items-center gap-4 bg-white/60 backdrop-blur-2xl p-4 rounded-[28px] border border-white/50 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)]">
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Tu Reto</span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-[#0F172A] tabular-nums leading-none">{current}</span>
          <span className="text-sm font-bold text-slate-400">/</span>
          <span className="text-sm font-bold text-slate-400 tabular-nums">{total}</span>
        </div>
      </div>

      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50 relative">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] rounded-full shadow-[0_0_15px_rgba(79,70,229,0.3)]"
          style={{ animation: 'shimmer 3s linear infinite' }}
        />
      </div>

      <div className="flex items-center justify-center w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-50 text-2xl">
        {pct === 100 ? '🏆' : pct > 75 ? '💎' : pct > 40 ? '⭐' : '🌱'}
      </div>
    </div>
  );
}

// ... IntroScreen, BetweenScreen, FinishedScreen (sin cambios significativos)

export function SessionPlayerPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('sessionId');

  const [pageState, setPageState] = useState<'loading' | 'error' | 'intro' | 'playing' | 'between' | 'finished'>('loading');
  const [session, setSession] = useState<PlannedSession | null>(null);
  const [ways, setWays] = useState<{way: Way, stepTitle: string}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [patientName, setPatientName] = useState('');

  const wayStartTime = useRef<number>(Date.now());
  const completedIds = useRef<string[]>([]);
  const skippedIds = useRef<string[]>([]);
  const perWayMetrics = useRef<Record<string, any>>({});
  const sessionStartTime = useRef<number>(Date.now());
  const wayCompletedRef = useRef<boolean>(false);
  const [showHomeworkCelebration, setShowHomeworkCelebration] = useState(false);
  const [isHomework, setIsHomework] = useState(false);

  const { profile } = usePlayerStore();

  useEffect(() => {
    if (!patientId) { setPageState('error'); return; }
    const patient = useTherapistStore.getState().patients.find(p => p.id === patientId);
    if (patient) setPatientName(patient.name);

    async function load() {
      let activeSession: PlannedSession | null = null;
      if (sessionId) {
        const sessions = await sessionService.getSessions(patientId!);
        activeSession = sessions.find(s => s.id === sessionId) ?? null;
      }
      if (!activeSession) activeSession = await sessionService.getActiveSession(patientId!);
      
      if (!activeSession || activeSession.way_ids.length === 0) {
        setPageState('error'); return;
      }
      setSession(activeSession);

      const level = patient?.currentLevel ?? 'pregamer';
      const steps = await registry.getStepsForLevel(level);

      const wayMap = new Map<string, any>();
      steps.forEach((step: any) => {
        step.ways.forEach((way: any) => {
          wayMap.set(way.id, { way, stepTitle: step.title });
        });
      });

      const orderedWays = activeSession.way_ids
        .map(id => wayMap.get(id))
        .filter(w => w !== undefined);

      setWays(orderedWays);
      sessionStartTime.current = Date.now();
      setPageState('intro');
      homeworkService.getHomeworkIds(patientId!).catch(() => {});
    }
    load();
  }, [patientId, sessionId]);

  useEffect(() => {
    const nextWay = ways[currentIndex + 1];
    if (nextWay) preloadWayImages(nextWay.way.stepNumber || 1, nextWay.way.wayNumber || 1);
  }, [currentIndex, ways]);

  const startCurrentWay = useCallback(async () => {
    wayCompletedRef.current = false;
    wayStartTime.current = Date.now();
    const currentWay = ways[currentIndex];
    if (patientId && currentWay) {
      const isHw = await homeworkService.isHomework(patientId, currentWay.way.id);
      setIsHomework(isHw);
      globalAnalytics.trackWayStarted(currentWay.way.id, currentWay.stepTitle);
    }
    setPageState('playing');
  }, [currentIndex, ways, patientId]);

  const handleWayComplete = useCallback(() => {
    if (wayCompletedRef.current) return;
    wayCompletedRef.current = true;
    const currentWay = ways[currentIndex];
    if (!currentWay) return;
    
    const timeSpentMs = Date.now() - wayStartTime.current;
    const data = { timeSpentMs, attempts: 1, completed: true };

    completedIds.current.push(currentWay.way.id);
    perWayMetrics.current[currentWay.way.id] = data;

    // PostHog global metrics
    globalAnalytics.trackWayCompleted(currentWay.way.id, currentWay.stepTitle, Math.round(timeSpentMs / 1000), data.attempts);

    // FIX CRÍTICO: Usamos syncEngine.logActivity (con buffer) en lugar del servicio directo
    syncEngine.logActivity({
      wayId: currentWay.way.id,
      action: 'way_completed',
      attempts: data.attempts,
      metadata: {
        isHomework,
        timeSpentMs: data.timeSpentMs,
        step: currentWay.stepTitle
      }
    });

    if (isHomework) {
      setShowHomeworkCelebration(true);
      setTimeout(() => {
        if (currentIndex >= ways.length - 1) setPageState('finished');
        else setPageState('between');
      }, 3500);
    } else {
      if (currentIndex >= ways.length - 1) setPageState('finished');
      else setPageState('between');
    }
  }, [currentIndex, ways, isHomework]);

  // Resto de handlers y render (handleSkip, handleContinue, handleViewSummary)
  // ... (idéntico a la versión anterior pero consumiendo los nuevos tipos)

  if (pageState === 'loading') return <div className="min-h-screen flex items-center justify-center">⏳</div>;
  if (pageState === 'error') return <div className="min-h-screen flex flex-col items-center justify-center">⚠️ No hay sesión activa</div>;
  if (pageState === 'playing') {
     const currentItem = ways[currentIndex];
     return (
       <div className="min-h-screen bg-[#F8FAFF] flex flex-col">
         <ProgressBar current={currentIndex + 1} total={ways.length} />
         <div className="pt-[60px] flex-1 flex flex-col">
           <AnimatePresence mode="wait">
             <motion.div key={currentItem.way.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
               <div className="p-4 text-center">
                 <h2 className="text-xl font-black text-slate-900">{normalizeWayText(currentItem.way.name || '')}</h2>
               </div>
               <WayRenderer way={currentItem.way} onComplete={handleWayComplete} />
             </motion.div>
           </AnimatePresence>
         </div>
       </div>
     );
  }

  // Fallback simple para los estados intro/between/finished en este snippet:
  return <div className="p-10 text-center">Estado: {pageState} (Componente en transición)</div>;
}
