// src/features/player/pages/LevelSelectPage.tsx
import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { registry } from '@/content/registry';
import { audioService } from '@/core/utils/audioService';
import type { Step, Way } from '@/core/engine/types';
import { patientService } from '@/core/services/patientService';
import { supabase } from '@/core/services/supabaseClient';
import { homeworkService } from '@/core/services/homeworkService';

// ─── Paleta de colores por step ───────────────────────────────────────────────
const STEP_COLORS = [
  { bg: '#FFF3E0', accent: '#FF9800', shadow: 'rgba(255,152,0,0.25)', emoji: '🧘', dark: '#E65100' },
  { bg: '#E8F5E9', accent: '#4CAF50', shadow: 'rgba(76,175,80,0.25)',  emoji: '🌱', dark: '#1B5E20' },
  { bg: '#E3F2FD', accent: '#2196F3', shadow: 'rgba(33,150,243,0.25)', emoji: '💬', dark: '#0D47A1' },
  { bg: '#F3E5F5', accent: '#9C27B0', shadow: 'rgba(156,39,176,0.25)', emoji: '⭐', dark: '#4A148C' },
];

function getStepColor(idx: number) {
  return STEP_COLORS[idx % STEP_COLORS.length];
}

// ─── Estrellas de progreso ────────────────────────────────────────────────────
function ProgressStars({ done, total }: { done: number; total: number }) {
  const stars = Math.min(3, Math.round((done / Math.max(total, 1)) * 3));
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.08, type: 'spring', stiffness: 400 }}
          style={{ fontSize: 18, opacity: i < stars ? 1 : 0.2 }}
        >
          ⭐
        </motion.span>
      ))}
    </div>
  );
}

// ─── Tarjeta de step ──────────────────────────────────────────────────────────
function StepCard({
  step, idx, doneCount, totalCount, onClick
}: {
  step: Step; idx: number; doneCount: number; totalCount: number; onClick: () => void;
}) {
  const color = getStepColor(idx);
  const pct = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
  const isCompleted = pct === 100 && totalCount > 0;
  const [pressed, setPressed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1, type: 'spring', stiffness: 260, damping: 22 }}
      onClick={() => { setPressed(true); setTimeout(onClick, 120); }}
      style={{
        background: color.bg,
        borderRadius: 28,
        padding: '20px 20px 16px',
        cursor: 'pointer',
        boxShadow: pressed
          ? `0 2px 8px ${color.shadow}`
          : `0 8px 24px ${color.shadow}, 0 2px 4px rgba(0,0,0,0.04)`,
        transform: pressed ? 'scale(0.97) translateY(2px)' : 'scale(1)',
        transition: 'transform 0.12s, box-shadow 0.12s',
        position: 'relative',
        overflow: 'hidden',
        border: isCompleted ? `3px solid ${color.accent}` : '3px solid transparent',
      }}
    >
      {/* Completado badge */}
      {isCompleted && (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          style={{
            position: 'absolute', top: 12, right: 14,
            background: color.accent, color: 'white',
            borderRadius: 20, padding: '2px 10px',
            fontSize: 11, fontWeight: 900,
          }}
        >
          ✓ ¡Completado!
        </motion.div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Icono grande */}
        <motion.div
          whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
          transition={{ duration: 0.4 }}
          style={{
            width: 72, height: 72, borderRadius: 22,
            background: 'white',
            boxShadow: `0 4px 12px ${color.shadow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, flexShrink: 0,
          }}
        >
          {color.emoji}
        </motion.div>

        {/* Contenido */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 18, fontWeight: 900, color: color.dark,
            lineHeight: 1.2, marginBottom: 6,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {step.title}
          </div>

          {/* Barra de progreso grande */}
          <div style={{
            height: 12, background: 'rgba(0,0,0,0.08)',
            borderRadius: 8, overflow: 'hidden', marginBottom: 8,
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.1 + 0.3 }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${color.accent}, ${color.dark})`,
                borderRadius: 8,
              }}
            />
          </div>

          {/* Estrellas + contador */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <ProgressStars done={doneCount} total={totalCount} />
            <span style={{ fontSize: 12, fontWeight: 700, color: color.dark, opacity: 0.7 }}>
              {doneCount}/{totalCount} retos
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export const LevelSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = usePlayerStore();
  const currentLevel = profile?.currentLevel || 'pregamer';
  const wayCoins = useRewardsStore(s => s.wayCoins);
  const [ways, setWays] = useState<Way[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [homeworkIds, setHomeworkIds] = useState<Set<string>>(new Set());
  const [initialHomeworkIds, setInitialHomeworkIds] = useState<Set<string>>(new Set());

  const completedWays = useMemo(() => {
    return Array.isArray(profile?.completedWays) ? profile.completedWays : [];
  }, [profile?.completedWays]);

  const handleLogout = () => {
    sessionStorage.removeItem('way-active-patient');
    // Limpiar también el hydration cache por si acaso
    Object.keys(sessionStorage)
      .filter(k => k.startsWith('way-hydration-cache'))
      .forEach(k => sessionStorage.removeItem(k));
    window.location.href = '/player';
  };

  useEffect(() => {
    const patientId = sessionStorage.getItem('way-active-patient');
    if (!profile?.currentLevel) return;
    
    setLoading(true);
    
    // 1. Cargar Steps
    registry.getStepsForLevel(profile.currentLevel)
      .then(res => setSteps(Array.isArray(res) ? res : []))
      .catch(err => console.error('[WAY+] Error loading steps:', err))
      .finally(() => setLoading(false));

    // 2. Cargar Homework
    if (patientId) {
      patientService.getHomework(patientId).then(ids => {
        const idSet = new Set(ids);
        setHomeworkIds(idSet);
        setInitialHomeworkIds(idSet);
      });

      // 3. Suscripción Realtime (Actualiza homeworkIds vivo, pero no la lista inicial)
      const channel = supabase
        ?.channel(`patient-hw-${patientId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'patients',
          filter: `id=eq.${patientId}`
        }, (payload) => {
          setHomeworkIds(new Set(payload.new.homework_way_ids || []));
          homeworkService.clearCache();
        })
        .subscribe();

      return () => { supabase?.removeChannel(channel!); };
    }
  }, [profile?.currentLevel]);

  // Mostrar confeti si hay progreso significativo
  useEffect(() => {
    if (completedWays.length > 0 && completedWays.length % 5 === 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [completedWays.length]);

  const handleLevelClick = (stepId: string) => {
    audioService.playSFX('click');
    navigate(`/play/${profile?.currentLevel}/${stepId}`);
  };

  const totalWays = steps.reduce((acc, s) => acc + (s.ways?.length ?? 0), 0);
  const totalDone = completedWays.length;
  const globalPct = totalWays > 0 ? Math.round((totalDone / totalWays) * 100) : 0;

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #FFFBF0 0%, #F0F4FF 100%)',
      paddingBottom: 120,
      position: 'relative'
    }}>

      {/* Botón de salida discreto */}
      <button
        onClick={handleLogout}
        style={{
          position: 'absolute', top: 16, right: 16,
          width: 44, height: 44, borderRadius: 12,
          background: 'rgba(0,0,0,0.05)', border: 'none',
          color: '#9CA3AF', fontSize: 10, fontWeight: 800,
          cursor: 'pointer', zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        SALIR
      </button>

      {/* ── Header con avatar del niño ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: '32px 24px 20px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}
      >
        {/* Avatar */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{
            width: 80, height: 80, borderRadius: 28,
            background: 'white',
            boxShadow: '0 8px 24px rgba(79,70,229,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 44,
          }}
        >
          {profile?.avatar && /\p{Emoji}/u.test(profile.avatar) ? profile.avatar : '🌟'}
        </motion.div>

        {/* Saludo */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#1E1B4B' }}>
            {profile?.name ? `¡Hola, ${profile.name}!` : '¡Hola!'}
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 600, marginTop: 2 }}>
            ¿Qué aprendemos hoy?
          </div>
        </div>

        {/* Progreso global */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'white',
            borderRadius: 20,
            padding: '12px 20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', gap: 16,
            width: '100%', maxWidth: 320,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>
              TU PROGRESO TOTAL
            </div>
            <div style={{
              height: 10, background: '#F3F4F6',
              borderRadius: 8, overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${globalPct}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
                  borderRadius: 8,
                }}
              />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#4F46E5' }}>{globalPct}%</div>
          </div>
        </motion.div>

        {/* Monedas */}
        <motion.div
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            borderRadius: 16, padding: '8px 16px',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
          }}
        >
          <span style={{ fontSize: 20 }}>🪙</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: 'white' }}>
            {wayCoins ?? 0} medallas
          </span>
        </motion.div>
      </motion.div>

      {/* ── Banner sesión de Maite ─────────────────────────────────────── */}
      {profile?.sessionQueue && profile.sessionQueue.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/play/session')}
          style={{
            margin: '0 20px 16px',
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            borderRadius: 28,
            boxShadow: '0 12px 32px rgba(79,70,229,0.4)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 16,
          }}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ fontSize: 36 }}
          >
            ✨
          </motion.div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'white' }}>
              ¡Sesión de Hoy!
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
              {profile.sessionQueue.length} retos preparados para ti
            </div>
          </div>
          <div style={{
            background: 'white', color: '#4F46E5',
            borderRadius: 14, padding: '8px 16px',
            fontSize: 13, fontWeight: 900,
          }}>
            ¡Empezar! →
          </div>
        </motion.div>
      )}

      {/* ── Tu camino de hoy (Prioridad y Accesibilidad) ─────────────────── */}
      {initialHomeworkIds.size > 0 && (
        <div style={{ padding: '0 20px', marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>🏠</span>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#1E1B4B', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Tu camino de hoy
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {steps.flatMap(s => s.ways || []).filter(w => initialHomeworkIds.has(w.id)).map(way => {
              const isDone = completedWays.includes(way.id);
              return (
                <motion.div
                  key={way.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    const stepOfWay = steps.find(s => s.ways.some(w => w.id === way.id));
                    if (stepOfWay) handleLevelClick(stepOfWay.id);
                  }}
                  style={{
                    background: isDone ? '#F1F2FF' : 'white',
                    borderRadius: 32,
                    height: 140,
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    boxShadow: isDone ? 'none' : '0 12px 24px rgba(245,158,11,0.15)',
                    border: isDone ? '2.5px solid #E8E9FF' : '3px solid #F59E0B',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {!isDone && (
                    <div style={{ 
                      position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none',
                      backgroundImage: 'linear-gradient(45deg, #F59E0B 25%, transparent 25%, transparent 50%, #F59E0B 50%, #F59E0B 75%, transparent 75%, transparent)',
                      backgroundSize: '20px 20px'
                    }} />
                  )}

                  <div style={{ fontSize: 64, filter: isDone ? 'grayscale(1) opacity(0.5)' : 'none' }}>
                    {way.id.includes('relaxation') ? '🧘' : way.id.includes('assertiveness') ? '🗣️' : '✨'}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: isDone ? '#6B7280' : '#1E1B4B', lineHeight: 1.1 }}>
                      {way.title}
                    </div>
                    <div style={{ fontSize: 13, color: isDone ? '#9CA3AF' : '#F59E0B', fontWeight: 800, marginTop: 4 }}>
                      {isDone ? '✓ ¡LOGRADO!' : 'EJERCICIO ESPECIAL'}
                    </div>
                  </div>

                  {!isDone && (
                    <motion.div 
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      style={{ fontSize: 24, color: '#F59E0B' }}
                    >
                      ▶
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Lista de steps ─────────────────────────────────────────────── */}
      <div style={{
        padding: '0 20px',
        display: 'flex', flexDirection: 'column', gap: 14,
        maxWidth: 420, margin: '0 auto',
      }}>
        {loading ? (
          // Skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{
              height: 120, borderRadius: 28,
              background: 'rgba(255,255,255,0.6)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))
        ) : steps.map((step, idx) => {
          if (!step) return null;
          const ways = Array.isArray(step.ways) ? step.ways : [];
          const doneCount = ways.filter(w => w?.id && completedWays.includes(w.id)).length;

          return (
            <StepCard
              key={step.id}
              step={step}
              idx={idx}
              doneCount={doneCount}
              totalCount={ways.length}
              onClick={() => handleLevelClick(step.id)}
            />
          );
        })}

        {steps.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center', padding: '40px 24px',
              background: 'white', borderRadius: 28,
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1E1B4B' }}>
              ¡Mapa en construcción!
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Confeti celebration ────────────────────────────────────────── */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, pointerEvents: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 999,
            }}
          >
            {['🎉', '⭐', '🌟', '🎊', '✨'].map((emoji, i) => (
              <motion.div
                key={i}
                initial={{ y: 0, x: (i - 2) * 60, opacity: 1, scale: 0 }}
                animate={{ y: -300, opacity: 0, scale: 1.5 }}
                transition={{ duration: 1.5, delay: i * 0.1 }}
                style={{ position: 'absolute', fontSize: 40 }}
              >
                {emoji}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
