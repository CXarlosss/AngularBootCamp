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
import { syncService } from '@/core/services/syncService';
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
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: C.white, borderBottom: `1px solid ${C.border}`,
      padding: '12px 20px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: C.indigo, whiteSpace: 'nowrap' }}>
        {current} / {total}
      </div>
      <div style={{ flex: 1, height: 8, background: C.border, borderRadius: 8, overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ height: '100%', background: C.indigo, borderRadius: 8 }}
        />
      </div>
      <div style={{ fontSize: 20 }}>
        {pct === 100 ? '🎉' : pct > 60 ? '⭐⭐⭐' : pct > 30 ? '⭐⭐' : '⭐'}
      </div>
    </div>
  );
}

function IntroScreen({ patientName, totalWays, onStart }: {
  patientName: string; totalWays: number; onStart: () => void;
}) {
  const { reduceMotion } = useConfigStore(s => s.accessibility);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: C.bg, padding: 32, textAlign: 'center', gap: 24,
      }}
    >
      <motion.div
        animate={reduceMotion ? {} : { y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        style={{ fontSize: 80 }}
      >
        🎮
      </motion.div>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, margin: 0 }}>
        {patientName ? `¡Hola, ${patientName}!` : '¡Hola, Aventurero!'}
      </h1>
      <p style={{ color: C.muted, fontSize: 16, margin: 0 }}>
        Hoy tenemos <strong style={{ color: C.indigo }}>{totalWays} reto{totalWays !== 1 ? 's' : ''}</strong> preparados para ti.
      </p>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onStart}
        style={{
          background: C.indigo, color: C.white, border: 'none',
          padding: '18px 40px', borderRadius: 20,
          fontWeight: 900, fontSize: 18, cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
        }}
      >
        ¡Empezar! 🚀
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
      style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(160deg, #F8FAFF 0%, ${C.indigoLt} 100%)`,
        padding: 32, textAlign: 'center', gap: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ fontSize: 64 }}
      >
        ⭐
      </motion.div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: 0 }}>
        ¡Reto completado!
      </h2>
      <div style={{
        background: C.white, borderRadius: 20, padding: '16px 24px',
        border: `1.5px solid ${C.border}`,
      }}>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Siguiente reto</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{nextWayName}</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
          {currentIndex + 1} de {total}
        </div>
      </div>

      {/* Botón grande — Maite controla el ritmo */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onContinue}
        style={{
          background: C.indigo, color: C.white, border: 'none',
          padding: '18px 48px', borderRadius: 20,
          fontWeight: 900, fontSize: 18, cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
        }}
      >
        Continuar →
      </motion.button>

      {/* Saltar — muy discreto, solo para el terapeuta */}
      <div style={{ position: 'fixed', bottom: 10, right: 10, opacity: 0.2 }}>
        <button
          onClick={onSkip}
          style={{
            background: 'none', border: 'none', color: C.muted,
            fontSize: 10, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Saltar
        </button>
      </div>
    </motion.div>
  );
}

function FinishedScreen({ completedCount, totalCount, onViewSummary }: {
  completedCount: number; totalCount: number; onViewSummary: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(160deg, #F0FDF4, ${C.indigoLt})`,
        padding: 32, textAlign: 'center', gap: 24,
      }}
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 1, delay: 0.3 }}
        style={{ fontSize: 80 }}
      >
        🏆
      </motion.div>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: C.text, margin: 0 }}>
        ¡Sesión completada!
      </h1>
      <p style={{ color: C.muted, fontSize: 16 }}>
        Has completado{' '}
        <strong style={{ color: C.emerald }}>{completedCount}</strong>{' '}
        de <strong>{totalCount}</strong> retos.
      </p>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onViewSummary}
        style={{
          background: C.indigo, color: C.white, border: 'none',
          padding: '16px 36px', borderRadius: 18,
          fontWeight: 900, fontSize: 16, cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(79,70,229,0.3)',
        }}
      >
        Ver resumen →
      </motion.button>
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
            nextWayName={nextItem.way.name ?? nextItem.way.title ?? 'Siguiente reto'}
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
                {currentItem.way.name ?? currentItem.way.title ?? ''}
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
