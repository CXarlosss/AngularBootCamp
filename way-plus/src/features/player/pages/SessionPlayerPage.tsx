/**
 * ═══════════════════════════════════════════════════════════════
 * SessionPlayerPage v2 — Layout limpio, estados renderizados
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sessionService, type PlannedSession } from '@/core/services/sessionService';
import { normalizeWayText } from '@/shared/lib/way-text-utils';
import { syncEngine } from '@/core/sync/SyncEngine';
import { WayRenderer } from '@/features/content/components/WayRenderer';
import { registry } from '@/content/registry';
import { type Way } from '@/core/engine/types';
import { useTherapistStore } from '@/features/therapist/store/therapistStore';
import { HomeworkCelebration } from '@/features/player/components/HomeworkCelebration';
import { homeworkService } from '@/core/services/homeworkService';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { preloadWayImages } from '@/core/services/wayImageService';
import { globalAnalytics } from '@/core/services/globalAnalytics';
import { CelebrationOverlay } from '@/features/rewards/components/CelebrationOverlay';
import { hapticService } from '@/core/services/hapticService';

/* ─── ProgressBar inline (sin CSS externo) ─── */
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
          Reto
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-slate-900 tabular-nums">{current}</span>
          <span className="text-xs font-bold text-slate-400">/ {total}</span>
        </div>
      </div>
      <div className="flex-1">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div
            className="h-full rounded-full bg-indigo-500"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-lg">
        {pct === 100 ? '🏆' : pct > 75 ? '💎' : pct > 40 ? '⭐' : '🌱'}
      </div>
    </div>
  );
}

/* ─── Pantallas de transición ─── */
function IntroScreen({ patientName, onStart }: { patientName: string; onStart: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-6xl"
      >
        🎮
      </motion.div>
      <h1 className="text-2xl font-black text-slate-900">
        {patientName ? `¡Hola, ${patientName}!` : '¡Hola!'}
      </h1>
      <p className="text-sm text-slate-500">Estás a punto de comenzar tu sesión de hoy</p>
      <button
        onClick={onStart}
        className="rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-black text-white shadow-lg transition-all hover:bg-indigo-500 active:scale-95"
      >
        ¡Empezar!
      </button>
    </div>
  );
}

function BetweenScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-5xl"
      >
        ⭐
      </motion.div>
      <h2 className="text-xl font-black text-slate-900">¡Muy bien!</h2>
      <p className="text-sm text-slate-500">Siguiente reto...</p>
      <button
        onClick={onNext}
        className="mt-4 rounded-2xl bg-indigo-600 px-8 py-3 text-sm font-black text-white shadow-md transition-all hover:bg-indigo-500 active:scale-95"
      >
        Continuar
      </button>
    </div>
  );
}

function FinishedScreen({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-6xl"
      >
        🏆
      </motion.div>
      <h2 className="text-2xl font-black text-slate-900">¡Sesión completada!</h2>
      <p className="text-sm text-slate-500">Has terminado todos los retos de hoy</p>
      <button
        onClick={onFinish}
        className="mt-4 rounded-2xl bg-emerald-500 px-8 py-3 text-sm font-black text-white shadow-md transition-all hover:bg-emerald-400 active:scale-95"
      >
        Volver al mapa
      </button>
    </div>
  );
}

/* ─── Página principal ─── */
export function SessionPlayerPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('sessionId');

  const [pageState, setPageState] = useState<'loading' | 'error' | 'intro' | 'playing' | 'between' | 'finished'>('loading');
  const [session, setSession] = useState<PlannedSession | null>(null);
  const [ways, setWays] = useState<{ way: Way; stepTitle: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [patientName, setPatientName] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [isHomework, setIsHomework] = useState(false);

  const wayStartTime = useRef<number>(Date.now());
  const completedIds = useRef<string[]>([]);
  const perWayMetrics = useRef<Record<string, any>>({});
  const sessionStartTime = useRef<number>(Date.now());
  const wayCompletedRef = useRef<boolean>(false);

  /* ─── Cargar sesión ─── */
  useEffect(() => {
    if (!patientId) {
      setPageState('error');
      return;
    }

    const patient = useTherapistStore.getState().patients.find((p) => p.id === patientId);
    if (patient) setPatientName(patient.name);

    async function load() {
      let activeSession: PlannedSession | null = null;
      if (sessionId) {
        const sessions = await sessionService.getSessions(patientId!);
        activeSession = sessions.find((s) => s.id === sessionId) ?? null;
      }
      if (!activeSession) activeSession = await sessionService.getActiveSession(patientId!);

      if (!activeSession || activeSession.way_ids.length === 0) {
        setPageState('error');
        return;
      }
      setSession(activeSession);

      const level = patient?.currentLevel ?? 'pregamer';
      const steps = await registry.getStepsForLevel(level);

      const wayMap = new Map<string, { way: Way; stepTitle: string }>();
      steps.forEach((step: any) => {
        step.ways.forEach((way: any) => {
          wayMap.set(way.id, { way, stepTitle: step.title });
        });
      });

      const orderedWays = activeSession.way_ids
        .map((id) => wayMap.get(id))
        .filter((w): w is { way: Way; stepTitle: string } => w !== undefined);

      setWays(orderedWays);
      sessionStartTime.current = Date.now();
      setPageState('intro');
    }
    load();
  }, [patientId, sessionId]);

  /* ─── Preload siguiente imagen ─── */
  useEffect(() => {
    const nextWay = ways[currentIndex + 1];
    if (nextWay) {
      preloadWayImages(nextWay.way.stepNumber || 1, nextWay.way.wayNumber || 1);
    }
  }, [currentIndex, ways]);

  /* ─── Iniciar way actual ─── */
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

  /* ─── Way completado ─── */
  const handleWayComplete = useCallback(
    (success: boolean) => {
      if (wayCompletedRef.current) return;
      wayCompletedRef.current = true;
      const currentWay = ways[currentIndex];
      if (!currentWay) return;

      const timeSpentMs = Date.now() - wayStartTime.current;
      const data = { timeSpentMs, attempts: 1, completed: success };
      completedIds.current.push(currentWay.way.id);
      perWayMetrics.current[currentWay.way.id] = data;

      globalAnalytics.trackWayCompleted(
        currentWay.way.id,
        currentWay.stepTitle,
        Math.round(timeSpentMs / 1000),
        data.attempts
      );

      syncEngine.logActivity({
        wayId: currentWay.way.id,
        action: 'way_completed',
        attempts: data.attempts,
        metadata: {
          isHomework,
          timeSpentMs: data.timeSpentMs,
          step: currentWay.stepTitle,
        },
      });

      if (success) {
        setShowCelebration(true);
        hapticService.success();
        setTimeout(() => {
          setShowCelebration(false);
          if (currentIndex >= ways.length - 1) setPageState('finished');
          else setPageState('between');
        }, 2000);
      } else {
        if (currentIndex >= ways.length - 1) setPageState('finished');
        else setPageState('between');
      }
    },
    [currentIndex, ways, isHomework]
  );

  /* ─── Siguiente way ─── */
  const handleNextWay = useCallback(() => {
    setCurrentIndex((i) => i + 1);
    setPageState('playing');
  }, []);

  /* ─── Render estados ─── */
  if (pageState === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  if (pageState === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="text-4xl">⚠️</span>
        <h2 className="text-lg font-bold text-slate-700">No hay sesión activa</h2>
        <button
          onClick={() => navigate(-1)}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-500"
        >
          Volver
        </button>
      </div>
    );
  }

  if (pageState === 'intro') {
    return <IntroScreen patientName={patientName} onStart={startCurrentWay} />;
  }

  if (pageState === 'between') {
    return <BetweenScreen onNext={handleNextWay} />;
  }

  if (pageState === 'finished') {
    return <FinishedScreen onFinish={() => navigate(`/map/${patientId}`)} />;
  }

  /* ─── Playing ─── */
  const currentItem = ways[currentIndex];
  if (!currentItem) return null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Barra de progreso */}
      <div className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 p-3 backdrop-blur-sm">
        <ProgressBar current={currentIndex + 1} total={ways.length} />
      </div>

      {/* Contenido del way */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.way.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col"
          >
            <div className="p-4 text-center">
              <h2 className="text-lg font-black text-slate-900">
                {normalizeWayText(currentItem.way.name || '')}
              </h2>
            </div>
            <WayRenderer way={currentItem.way} onComplete={handleWayComplete} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Celebración */}
      <CelebrationOverlay
        show={showCelebration}
        type="happy"
        onComplete={() => setShowCelebration(false)}
      />

      {/* Homework celebration (si existe) */}
      {isHomework && (
        <HomeworkCelebration
          show={showCelebration}
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
}

export default SessionPlayerPage;
