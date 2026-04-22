import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/features/player/store/playerStore';

/* ─── helpers ────────────────────────────────────────────────────── */
const today = () => new Date().toISOString().split('T')[0];

const C = {
  indigo:  '#4F46E5',
  teal:    '#14B8A6',
  amber:   '#F59E0B',
  orange:  '#F97316',
  violet:  '#7C3AED',
  text:    '#1E1B4B',
  muted:   '#6B7280',
  border:  '#E8E9FF',
  white:   '#ffffff',
  bg:      '#F4F5FF',
};

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function WeekDots({ filled }: { filled: boolean[] }) {
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {filled.map((done, i) => (
        <div key={i} style={{
          width: 26, height: 26, borderRadius: '50%',
          background: done ? C.teal : '#E8E9FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700,
          color: done ? '#fff' : C.muted,
        }}>
          {done ? '✓' : DAYS[i]}
        </div>
      ))}
    </div>
  );
}

/* ─── Annex Card ─────────────────────────────────────────────────── */
function AnnexCard({
  icon, title, subtitle, color, bg, borderColor,
  completedToday, weekDots, streak, onTap, locked,
}: {
  icon: string; title: string; subtitle: string;
  color: string; bg: string; borderColor: string;
  completedToday: boolean; weekDots: boolean[];
  streak: number; onTap: () => void; locked?: boolean;
}) {
  return (
    <motion.button
      whileHover={!locked ? { y: -3 } : {}}
      whileTap={!locked ? { scale: 0.97 } : {}}
      onClick={!locked ? onTap : undefined}
      style={{
        width: '100%', textAlign: 'left', cursor: locked ? 'not-allowed' : 'pointer',
        background: C.white,
        border: `2px solid ${completedToday ? color : borderColor}`,
        borderRadius: 22,
        padding: 18,
        boxShadow: completedToday
          ? `0 4px 20px ${color}25`
          : '0 2px 12px rgba(79,70,229,.06)',
        opacity: locked ? 0.5 : 1,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Decorative blob */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: bg, opacity: 0.6, pointerEvents: 'none',
      }} />

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ textAlign: 'right' }}>
          {completedToday ? (
            <span style={{
              background: color, color: '#fff',
              borderRadius: 10, padding: '4px 10px',
              fontSize: 11, fontWeight: 700,
            }}>✅ HOY</span>
          ) : (
            <span style={{
              background: bg, color,
              borderRadius: 10, padding: '4px 10px',
              fontSize: 11, fontWeight: 700,
            }}>PENDIENTE</span>
          )}
          {streak > 1 && (
            <div style={{ fontSize: 12, color: C.amber, fontWeight: 700, marginTop: 4 }}>
              🔥 {streak} días
            </div>
          )}
        </div>
      </div>

      {/* Text */}
      <div style={{ fontWeight: 800, fontSize: 17, color: C.text, marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
        {subtitle}
      </div>

      {/* Week dots */}
      <WeekDots filled={weekDots} />
    </motion.button>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export function AnnexesHubPage() {
  const navigate = useNavigate();
  const relaxationLog = usePlayerStore(s => s.relaxationLog) ?? {};
  const roleplayLog   = usePlayerStore(s => s.roleplayLog)   ?? {};
  const weeklyCheck   = usePlayerStore(s => s.weeklyCheck)   ?? {};

  const t = today();

  // Build 7-day vectors
  const last7 = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    }), []);

  const relaxDots    = last7.map(d => !!relaxationLog[d]?.completed);
  const roleplayDots = last7.map(d => !!(roleplayLog[d]?.length > 0));
  const checkDots    = last7.map(d =>
    Object.entries(weeklyCheck).filter(([k, v]) => k.endsWith(d) && v).length >= 3
  );

  const relaxStreak = [...relaxDots].reverse().findIndex(v => !v);
  const roleplayStreak = [...roleplayDots].reverse().findIndex(v => !v);

  // Global progress this week
  const totalChecks = relaxDots.filter(Boolean).length
    + roleplayDots.filter(Boolean).length
    + checkDots.filter(Boolean).length;
  const maxChecks = 21; // 7 days × 3 annexes
  const weekPct = Math.round((totalChecks / maxChecks) * 100);

  return (
    <div style={{ background: C.bg, minHeight: '100dvh', paddingBottom: 80 }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg,#3730A3,#4F46E5)',
        padding: '20px 16px 20px',
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
             <div style={{ fontWeight: 800, fontSize: 22, color: '#fff' }}>
              📋 Mis Anexos
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              style={{
                background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 12,
                width: 40, height: 40, color: '#fff', fontSize: 20, cursor: 'pointer'
              }}
            >
              🏠
            </motion.button>
          </div>
          <div style={{ color: '#A5B4FC', fontSize: 13, marginBottom: 16 }}>
            Practica cada día para convertirte en Maestro WAY+
          </div>

          {/* Weekly progress bar */}
          <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 10, height: 8, overflow: 'hidden', marginBottom: 6 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${weekPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ height: '100%', background: C.teal, borderRadius: 10 }}
            />
          </div>
          <div style={{ color: '#A5B4FC', fontSize: 12 }}>
            {totalChecks}/{maxChecks} actividades esta semana · {weekPct}%
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 14px' }}>

        {/* ── Section label ────────────────────────────────────── */}
        <div style={{
          fontSize: 11, fontWeight: 700, color: C.muted,
          textTransform: 'uppercase', letterSpacing: '0.7px',
          marginBottom: 14,
        }}>
          Actividades diarias
        </div>

        {/* ── Cards ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Relajación */}
          <AnnexCard
            icon="🧘"
            title="Relajación"
            subtitle="5 minutos de práctica · Calma tu mente"
            color={C.teal}
            bg="#CCFBF1"
            borderColor="#99F6E4"
            completedToday={!!relaxationLog[t]?.completed}
            weekDots={relaxDots}
            streak={relaxStreak === -1 ? 7 : relaxStreak}
            onTap={() => navigate('/annexes/relaxation')}
          />

          {/* Autocomprobación */}
          <AnnexCard
            icon="📊"
            title="Autocomprobación"
            subtitle="Revisa tus WAYs de la semana"
            color={C.violet}
            bg="#EDE9FE"
            borderColor="#C4B5FD"
            completedToday={checkDots[6]}
            weekDots={checkDots}
            streak={0}
            onTap={() => navigate('/annexes/self-check')}
          />

          {/* Role Playing */}
          <AnnexCard
            icon="🎭"
            title="Role Playing"
            subtitle="Practica con mamá, papá o tu terapeuta"
            color={C.orange}
            bg="#FFEDD5"
            borderColor="#FED7AA"
            completedToday={!!(roleplayLog[t]?.length > 0)}
            weekDots={roleplayDots}
            streak={roleplayStreak === -1 ? 7 : roleplayStreak}
            onTap={() => navigate('/annexes/role-play')}
          />

        </div>

        {/* ── Weekly summary ────────────────────────────────────── */}
        <div style={{
          marginTop: 24,
          background: C.white,
          border: `1.5px solid ${C.border}`,
          borderRadius: 20, padding: 18,
          boxShadow: '0 2px 12px rgba(79,70,229,.06)',
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 16 }}>
            🗓️ Resumen semanal
          </div>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 90, fontSize: 11, color: C.muted }} />
            {DAYS.map(d => (
              <div key={d} style={{
                flex: 1, textAlign: 'center',
                fontSize: 11, fontWeight: 700, color: C.muted,
              }}>{d}</div>
            ))}
          </div>

          {[
            { label: '🧘 Relax', dots: relaxDots, color: C.teal },
            { label: '📊 Auto',  dots: checkDots,    color: C.violet },
            { label: '🎭 Role',  dots: roleplayDots, color: C.orange },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
            }}>
              <div style={{ width: 90, fontSize: 11, fontWeight: 600, color: C.muted, flexShrink: 0 }}>
                {row.label}
              </div>
              {row.dots.map((done, i) => (
                <div key={i} style={{
                  flex: 1, height: 28, borderRadius: 8,
                  background: done ? row.color : '#F1F2FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14,
                }}>
                  {done ? '✓' : ''}
                </div>
              ))}
            </div>
          ))}

          {/* Stars earned */}
          <div style={{
            marginTop: 14,
            background: totalChecks >= 15 ? '#FEF3C7' : '#F8FAFF',
            borderRadius: 14, padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 24 }}>
              {totalChecks >= 18 ? '🏆' : totalChecks >= 12 ? '⭐' : '💪'}
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>
                {totalChecks >= 18 ? '¡Semana perfecta!' :
                 totalChecks >= 12 ? '¡Muy bien esta semana!' :
                 '¡Sigue practicando!'}
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                {totalChecks} de {maxChecks} actividades completadas
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
