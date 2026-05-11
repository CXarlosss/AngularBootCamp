/**
 * SessionPlayerPage.tsx (final)
 * Ruta: /session/:patientId?sessionId=<uuid>
 *
 * Vista limpia del niño durante la sesión activa.
 * WayRenderer integrado con contrato real: onComplete() sin argumentos.
 * El tracking de intentos/XP lo hace WayRenderer internamente via playerStore.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sessionService, type PlannedSession, type SessionSummary } from '@/core/services/sessionService';
import { normalizeWayText } from '@/shared/lib/way-text-utils';
import { syncService } from '@/core/services/syncService';
// ... rest of imports
import { WayRenderer } from '@/features/content/components/WayRenderer';
import { registry } from '@/content/registry';
import { type Way, type Step } from '@/core/engine/types';
import { useTherapistStore } from '@/features/therapist/store/therapistStore';
import { useConfigStore } from '@/core/stores/configStore';
import { HomeworkCelebration } from '@/features/player/components/HomeworkCelebration';
import { homeworkService } from '@/core/services/homeworkService';
import { usePlayerStore } from '@/features/player/store/playerStore';

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

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface WayWithMeta {
  way: Way;
  stepTitle: string;
}

type PageState = 'loading' | 'error' | 'intro' | 'playing' | 'between' | 'finished';

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

function IntroScreen({ patientName, totalWays, onStart }: {
  patientName: string; totalWays: number; onStart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-12 overflow-hidden relative"
      style={{ background: 'radial-gradient(circle at 50% 50%, #F8FAFF 0%, #DDE4FF 100%)' }}
    >
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="relative"
      >
        <div className="absolute inset-0 bg-indigo-400 blur-[80px] opacity-20 rounded-full" />
        <span className="text-[120px] relative drop-shadow-2xl">🎮</span>
      </motion.div>

      <div className="space-y-4">
        <h1 className="text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
          ¡HOLA,<br/>{patientName.toUpperCase()}!
        </h1>
        <p className="text-xl text-indigo-600 font-bold max-w-xs mx-auto">
          Hoy tienes <span className="bg-indigo-100 px-3 py-1 rounded-xl text-indigo-700">{totalWays} retos</span> increíbles por completar.
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="w-full max-w-sm py-6 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white text-2xl font-black rounded-[32px] shadow-[0_20px_40px_rgba(79,70,229,0.3)] border-b-[8px] border-indigo-900 active:border-b-0 transition-all"
      >
        ¡VAMOS! 🚀
      </motion.button>
    </motion.div>
  );
}

function BetweenScreen({ nextWayName, currentIndex, total, onContinue, onSkip }: {
  nextWayName: string; currentIndex: number; total: number;
  onContinue: () => void; onSkip: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-10"
      style={{ background: 'radial-gradient(circle at 50% 50%, #F0FDF4 0%, #E0F2FE 100%)' }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-32 h-32 bg-white rounded-[40px] shadow-2xl flex items-center justify-center text-6xl border-8 border-emerald-100"
      >
        🌟
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">¡Genial!</h2>
        <p className="text-emerald-600 font-black text-lg">RETO COMPLETADO</p>
      </div>

      <div className="w-full max-w-xs bg-white/60 backdrop-blur-lg rounded-[32px] p-8 border border-white shadow-xl">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Siguiente aventura</span>
        <h3 className="text-2xl font-black text-indigo-950 leading-tight">{nextWayName}</h3>
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i < currentIndex ? 'bg-emerald-400' : (i === currentIndex ? 'bg-indigo-400 w-4' : 'bg-slate-200')} transition-all`} />
          ))}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="w-full max-w-sm py-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-2xl font-black rounded-[32px] shadow-[0_20px_40px_rgba(16,185,129,0.3)] border-b-[8px] border-emerald-800 active:border-b-0 transition-all"
      >
        SIGUIENTE →
      </motion.button>

      <button onClick={onSkip} className="opacity-10 text-[10px] font-bold hover:opacity-100 transition-opacity">Saltar</button>
    </motion.div>
  );
}

function FinishedScreen({ completedCount, totalCount, onViewSummary }: {
  completedCount: number; totalCount: number; onViewSummary: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-10"
      style={{ background: 'radial-gradient(circle at 50% 50%, #FFFBEB 0%, #FEF3C7 100%)' }}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, repeat: 3 }}
        className="text-9xl drop-shadow-2xl"
      >
        🏆
      </motion.div>

      <div className="space-y-4">
        <h1 className="text-5xl font-black text-amber-950 tracking-tighter">¡LO LOGRASTE!</h1>
        <p className="text-xl font-bold text-amber-700">
          Has completado <span className="bg-white px-3 py-1 rounded-xl shadow-sm">{completedCount} / {totalCount}</span> retos hoy.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onViewSummary}
          className="w-full py-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white text-2xl font-black rounded-[32px] shadow-[0_20px_40px_rgba(245,158,11,0.3)] border-b-[8px] border-amber-800 active:border-b-0 transition-all"
        >
          VER MI PREMIO 💎
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export function SessionPlayerPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('sessionId');

  const [pageState, setPageState] = useState<PageState>('loading');
  const [session, setSession] = useState<PlannedSession | null>(null);
  const [ways, setWays] = useState<WayWithMeta[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [patientName, setPatientName] = useState('');

  // Tracking de tiempos por way
  const wayStartTime = useRef<number>(Date.now());
  const completedIds = useRef<string[]>([]);
  const skippedIds = useRef<string[]>([]);
  const perWayMetrics = useRef<Record<string, any>>({});
  const sessionStartTime = useRef<number>(Date.now());
  const wayCompletedRef = useRef<boolean>(false);
  const [showHomeworkCelebration, setShowHomeworkCelebration] = useState(false);
  const [isHomework, setIsHomework] = useState(false);

  // Perfil del niño para la celebración
  const { profile } = usePlayerStore();

  // ── Carga inicial ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!patientId) { setPageState('error'); return; }

    // Nombre del paciente desde TherapistStore
    const patient = useTherapistStore.getState().patients.find(p => p.id === patientId);
    if (patient) setPatientName(patient.name);

    async function load() {
      // Obtener sesión activa
      let activeSession: PlannedSession | null = null;

      if (sessionId) {
        const sessions = await sessionService.getSessions(patientId!);
        activeSession = sessions.find(s => s.id === sessionId) ?? null;
      }
      if (!activeSession) {
        activeSession = await sessionService.getActiveSession(patientId!);
      }
      if (!activeSession || activeSession.way_ids.length === 0) {
        setPageState('error');
        return;
      }
      setSession(activeSession);

      // Cargar ways desde registry
      // Intentamos cargar todos los steps disponibles para el nivel del paciente
      const level = patient?.currentLevel ?? 'pregamer';
      const steps: Step[] = await registry.getStepsForLevel(level);

      const wayMap = new Map<string, WayWithMeta>();
      steps.forEach((step: Step) => {
        step.ways.forEach((way: Way) => {
          wayMap.set(way.id, { way, stepTitle: step.title });
        });
      });

      const orderedWays = activeSession.way_ids
        .map(id => wayMap.get(id))
        .filter((w): w is WayWithMeta => w !== undefined);

      if (orderedWays.length === 0) {
        setPageState('error');
        return;
      }

      setWays(orderedWays);
      sessionStartTime.current = Date.now();
      setPageState('intro');

      // Pre-cargar homework IDs para evitar latencia en la celebración
      homeworkService.getHomeworkIds(patientId!).catch(() => {});
    }

    load();
  }, [patientId, sessionId]);

  // ── Iniciar way actual ────────────────────────────────────────────────
  const startCurrentWay = useCallback(async () => {
    wayCompletedRef.current = false;
    wayStartTime.current = Date.now();
    
    // Verificar si el siguiente way es homework
    const currentWay = ways[currentIndex];
    if (patientId && currentWay) {
      const isHw = await homeworkService.isHomework(patientId, currentWay.way.id);
      setIsHomework(isHw);
    }

    setPageState('playing');
  }, [currentIndex, ways, patientId]);

  // ── Way completado ──────────────────────────────────────────────────
  const handleWayComplete = useCallback(() => {
    if (wayCompletedRef.current) return;
    wayCompletedRef.current = true;

    const currentWay = ways[currentIndex];
    if (!currentWay) return;
    
    const timeSpentMs = Date.now() - wayStartTime.current;
    const data = { timeSpentMs, attempts: 1, completed: true };

    completedIds.current.push(currentWay.way.id);
    perWayMetrics.current[currentWay.way.id] = data;

    // Persistir intento individual con flag de refuerzo
    syncService.logActivity({
      patientId: patientId || '',
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
      // La transición ocurre tras la celebración (3.5s)
      setTimeout(() => {
        if (currentIndex >= ways.length - 1) {
          setPageState('finished');
        } else {
          setPageState('between');
        }
      }, 3500);
    } else {
      if (currentIndex >= ways.length - 1) {
        setPageState('finished');
      } else {
        setPageState('between');
      }
    }
  }, [currentIndex, ways, patientId, isHomework]);

  // ── Saltar way ────────────────────────────────────────────────────────
  const handleSkip = useCallback(() => {
    if (!ways[currentIndex]) return;
    skippedIds.current.push(ways[currentIndex].way.id);

    const next = currentIndex + 1;
    if (next >= ways.length) {
      setPageState('finished');
    } else {
      setCurrentIndex(next);
      startCurrentWay();
    }
  }, [currentIndex, ways, startCurrentWay]);

  // ── Continuar al siguiente way ────────────────────────────────────────
  const handleContinue = useCallback(() => {
    setCurrentIndex(prev => prev + 1);
    startCurrentWay();
  }, [startCurrentWay]);

  // ── Completar sesión → guardar resumen → navegar al Módulo 3 ─────────
  const handleViewSummary = useCallback(async () => {
    if (!session || !patientId) return;

    const summary: SessionSummary = {
      ways_completed: completedIds.current,
      ways_skipped: skippedIds.current,
      duration_seconds: Math.round((Date.now() - sessionStartTime.current) / 1000),
      per_way: perWayMetrics.current,
    };

    await sessionService.completeSession(session.id, patientId, summary);

    // Navegar al resumen post-sesión (Módulo 3 ya disponible)
    navigate(`/therapist/patient/${patientId}?tab=summary&sessionId=${session.id}`);
  }, [session, patientId, navigate]);

  // ── Render ────────────────────────────────────────────────────────────

  if (pageState === 'loading') {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: C.bg,
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ fontSize: 40 }}
        >
          ⏳
        </motion.div>
      </div>
    );
  }

  if (pageState === 'error') {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: C.bg, gap: 16, textAlign: 'center', padding: 32,
      }}>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <h2 style={{ color: C.rose, margin: 0 }}>No hay sesión activa</h2>
        <p style={{ color: C.muted }}>Vuelve al panel y prepara la sesión primero.</p>
        <button
          onClick={() => navigate(`/therapist/patient/${patientId}`)}
          style={{
            background: C.indigo, color: C.white, border: 'none',
            padding: '12px 24px', borderRadius: 12,
            fontWeight: 800, cursor: 'pointer', fontSize: 14,
          }}
        >
          ← Volver al panel
        </button>
      </div>
    );
  }

  if (pageState === 'intro') {
    return (
      <IntroScreen
        patientName={patientName}
        totalWays={ways.length}
        onStart={startCurrentWay}
      />
    );
  }

  if (pageState === 'finished') {
    return (
      <FinishedScreen
        completedCount={completedIds.current.length}
        totalCount={ways.length}
        onViewSummary={handleViewSummary}
      />
    );
  }

  const currentItem = ways[currentIndex];
  const nextItem = ways[currentIndex + 1];

  if (pageState === 'between') {
    // Si es el último, no debería llegar aquí, pero por seguridad:
    if (!nextItem) {
      setPageState('finished');
      return null;
    }
    return (
      <>
        <ProgressBar current={currentIndex + 1} total={ways.length} />
        <div style={{ paddingTop: 60 }}>
          <BetweenScreen
            nextWayName={normalizeWayText(nextItem.way.name ?? nextItem.way.title ?? 'Siguiente reto')}
            currentIndex={currentIndex + 1}
            total={ways.length}
            onContinue={handleContinue}
            onSkip={handleSkip}
          />
        </div>
      </>
    );
  }

  // Estado 'playing' — WayRenderer real
  return (
    <div style={{
      minHeight: '100dvh', background: C.bg,
      display: 'flex', flexDirection: 'column',
    }}>
      <ProgressBar current={currentIndex + 1} total={ways.length} />

      <div style={{ paddingTop: 60, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.way.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {/* Cabecera del reto — visible para el niño */}
            <div style={{ padding: '16px 20px 0', textAlign: 'center' }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: C.muted,
                textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
              }}>
                {currentItem.stepTitle}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: 0 }}>
                {normalizeWayText(currentItem.way.name ?? currentItem.way.title ?? '')}
              </h2>
            </div>

            {/* WayRenderer real */}
            <WayRenderer
              way={currentItem.way}
              onComplete={handleWayComplete}
              activeBoostId={null}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Botón de salida de emergencia — discreto, para Maite */}
      <div style={{
        position: 'fixed', bottom: 12, left: 12, zIndex: 200,
      }}>
        <button
          onClick={() => navigate(`/therapist/patient/${patientId}`)}
          style={{
            background: 'rgba(255,255,255,0.7)', border: `1px solid ${C.border}`,
            borderRadius: 10, padding: '6px 10px',
            fontSize: 10, color: C.muted, fontWeight: 600,
            cursor: 'pointer', backdropFilter: 'blur(4px)',
          }}
        >
          ✕ Salir
        </button>
      </div>

      <HomeworkCelebration
        show={showHomeworkCelebration}
        playerName={profile?.name || patientName || ''}
        playerAvatar={profile?.avatar || '🌟'}
        onComplete={() => setShowHomeworkCelebration(false)}
      />
    </div>
  );
}
