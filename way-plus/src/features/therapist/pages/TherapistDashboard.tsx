import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { useTherapistStore } from '../store/therapistStore';
import { ReportGenerator } from '../components/ReportGenerator';
import { SyncStatus } from '../components/SyncStatus';

/* ─── colour tokens ──────────────────────────────────────────────── */
const C = {
  indigo:      '#4F46E5',
  indigoDark:  '#3730A3',
  teal:        '#14B8A6',
  amber:       '#F59E0B',
  rose:    '#F43F5E',
  emerald: '#10B981',
  text:    '#1E1B4B',
  muted:   '#6B7280',
  border:  '#E8E9FF',
  bg:      '#F8FAFF',
  white:   '#ffffff',
};

/* ─── small atoms ────────────────────────────────────────────────── */
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.white,
      borderRadius: 20,
      border: `1.5px solid ${C.border}`,
      boxShadow: '0 2px 12px rgba(79,70,229,.06)',
      padding: 20,
      ...style,
    }}>
      {children}
    </div>
  );
}

function Kpi({ label, value, color = C.indigo, bg = '#E8E9FF' }: {
  label: string; value: string | number; color?: string; bg?: string;
}) {
  return (
    <div style={{
      background: bg, borderRadius: 14,
      padding: '12px 14px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 14,
    }}>
      {children}
    </div>
  );
}

/* ─── Annex heatmap (7 days) ─────────────────────────────────────── */
function AnnexHeatmap() {
  const relaxationLog = usePlayerStore(s => s.relaxationLog) ?? {};
  const roleplayLog   = usePlayerStore(s => s.roleplayLog)   ?? {};
  const weeklyCheck   = usePlayerStore(s => s.weeklyCheck)   ?? {};

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
  }, []);

  const DAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const rows = [
    {
      label: '🧘 Relajación',
      color: C.teal,
      check: (date: string) => !!relaxationLog[date]?.completed,
    },
    {
      label: '🎭 Roleplay',
      color: '#F97316',
      check: (date: string) => !!(roleplayLog[date] && roleplayLog[date].length > 0),
    },
    {
      label: '📊 Autocomp.',
      color: '#7C3AED',
      check: (date: string) => {
        const hits = Object.entries(weeklyCheck).filter(([k]) => k.endsWith(date) && weeklyCheck[k]);
        return hits.length >= 3;
      },
    },
  ];

  return (
    <Card>
      <SectionTitle>📋 Adherencia (7 días)</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map(row => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 90, fontSize: 11, fontWeight: 600, color: C.muted, flexShrink: 0 }}>
              {row.label}
            </div>
            <div style={{ display: 'flex', gap: 6, flex: 1, justifyContent: 'space-between' }}>
              {days.map((date, i) => {
                const done = row.check(date);
                return (
                   <div
                    key={date}
                    title={date}
                    style={{
                      width: 28, height: 28,
                      borderRadius: 8,
                      background: done ? row.color : '#F1F2FF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: done ? '#fff' : '#C7D2FE',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {done ? '✓' : DAYS_SHORT[i]}
                  </div>
                );
              })}
            </div>
            <div style={{ width: 28, textAlign: 'right', fontSize: 11, fontWeight: 700, color: C.muted }}>
              {days.filter(d => row.check(d)).length}/7
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─── Alerts ─────────────────────────────────────────────────────── */
function AlertPanel() {
  const relaxationLog = usePlayerStore(s => s.relaxationLog) ?? {};
  const roleplayLog   = usePlayerStore(s => s.roleplayLog)   ?? {};
  const completedWays = usePlayerStore(s => s.profile.completedWays) ?? [];
  const streakDays    = useRewardsStore(s => s.streakDays)   ?? 0;

  const today = new Date().toISOString().split('T')[0];

  const alerts = useMemo(() => {
    const list = [];
    const isLateEnough = new Date().getHours() >= 10;
    
    if (!relaxationLog[today]?.completed && isLateEnough)
      list.push({ id: 'relax', icon: '🧘', title: 'Relajación pendiente', msg: 'El niño no ha practicado hoy.', color: '#FEF3C7', border: '#F59E0B', tc: '#92400E' });
    if (completedWays.length > 5)
      list.push({ id: 'prog', icon: '🚀', title: 'Progreso acelerado', msg: `${completedWays.length} retos completados. Subir dificultad.`, color: '#ECFDF5', border: '#10B981', tc: '#065F46' });
    const weekRoleplays = Object.keys(roleplayLog).filter(d => {
      const diff = (Date.now() - new Date(d).getTime()) / 86400000;
      return diff <= 7;
    }).length;
    if (weekRoleplays < 2)
      list.push({ id: 'roleplay', icon: '🎭', title: 'Baja generalización', msg: 'Poca práctica de roleplay en casa.', color: '#FEF3C7', border: '#F59E0B', tc: '#92400E' });
    return list;
  }, [relaxationLog, roleplayLog, completedWays, streakDays, today]);

  return (
    <Card>
      <SectionTitle>🔔 Alertas Clínicas</SectionTitle>
      {alerts.length === 0 ? (
        <div style={{ textAlign: 'center', color: C.muted, fontSize: 13, padding: '12px 0' }}>
          ✨ Sin alertas activas
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {alerts.map(a => (
            <div key={a.id} style={{
              background: a.color, border: `1.5px solid ${a.border}`,
              borderRadius: 14, padding: '12px 14px',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 20 }}>{a.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: a.tc }}>{a.title}</div>
                <div style={{ fontSize: 12, color: a.tc, opacity: 0.8, marginTop: 2 }}>{a.msg}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ─── Kiosk config ───────────────────────────────────────────────── */
function KioskPanel() {
  const [pin, setPin] = React.useState('');
  const [saved, setSaved] = React.useState(false);

  const save = () => {
    if (pin.length !== 4) return;
    try {
      const store = JSON.parse(localStorage.getItem('way-kiosk-config') || '{}');
      store.state = { ...(store.state || {}), pin };
      localStorage.setItem('way-kiosk-config', JSON.stringify(store));
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setPin('');
  };

  return (
    <Card>
      <SectionTitle>🔒 Modo Kiosko</SectionTitle>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.5 }}>
        Bloquea la tablet para que el niño no pueda salir de la app.
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="Nuevo PIN (4 dígitos)"
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 12,
            border: `2px solid ${C.border}`, fontSize: 16,
            textAlign: 'center', letterSpacing: '0.4em',
          }}
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={save}
          disabled={pin.length !== 4}
          style={{
            background: pin.length === 4 ? C.indigo : '#D1D5DB',
            color: '#fff', border: 'none', borderRadius: 12,
            padding: '10px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}
        >
          Guardar
        </motion.button>
      </div>
      {saved && (
        <div style={{ color: C.emerald, fontWeight: 700, fontSize: 13 }}>✅ PIN guardado</div>
      )}
    </Card>
  );
}

/* ─── Main page ──────────────────────────────────────────────────── */
export function TherapistDashboard() {
  const navigate = useNavigate();
  const patients          = useTherapistStore(s => s.patients)          ?? [];
  const selectedId        = useTherapistStore(s => s.selectedPatientId);
  const selectPatient     = useTherapistStore(s => s.selectPatient);
  const completedWays     = usePlayerStore(s => s.profile.completedWays) ?? [];
  const relaxationLog     = usePlayerStore(s => s.relaxationLog)        ?? {};
  const { totalXp = 0, streakDays = 0 } = useRewardsStore();

  const patient = patients.find(p => p.id === selectedId) ?? patients[0];

  return (
    <div style={{ background: C.bg, minHeight: '100dvh', padding: '0 0 32px' }}>
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div style={{
        background: C.white,
        borderBottom: `1px solid ${C.border}`,
        padding: '16px 20px',
        position: 'sticky', top: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 10,
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: C.text }}>🧠 Dashboard WAY+</div>
          <div style={{ fontSize: 12, color: C.muted }}>
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <SyncStatus />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            style={{
              background: C.indigo, color: '#fff', border: 'none',
              borderRadius: 12, padding: '8px 16px',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >
            👦 Ir a la app del niño
          </motion.button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Patient selector ───────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {patients.map(p => (
            <motion.button
              key={p.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectPatient(p.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 18px', borderRadius: 16,
                border: `2px solid ${p.id === (selectedId ?? patients[0]?.id) ? C.indigo : C.border}`,
                background: p.id === (selectedId ?? patients[0]?.id) ? '#E8E9FF' : C.white,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                fontWeight: 700, fontSize: 14, color: C.text,
              }}
            >
              <span style={{ fontSize: 24 }}>{p.avatar}</span>
              <div style={{ textAlign: 'left' }}>
                <div>{p.name}</div>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>{p.age} años · {p.currentLevel}</div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* ── Patient card + KPIs ────────────────────────────────── */}
        {patient && (
          <Card style={{
            background: `linear-gradient(135deg, ${C.indigo}, ${C.indigoDark ?? '#3730A3'})`,
            color: '#fff', border: 'none',
            display: 'flex', alignItems: 'center', gap: 16,
            flexWrap: 'wrap',
          }}>
            <div style={{ fontSize: 52, lineHeight: 1 }}>{patient.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 20 }}>{patient.name}</div>
              <div style={{ opacity: 0.8, fontSize: 13, marginTop: 2 }}>
                {patient.age} años · {patient.diagnosis ?? 'Sin diagnóstico'} · {patient.currentLevel}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,255,255,.2)', borderRadius: 10, padding: '3px 10px', fontSize: 12 }}>
                  🔥 {streakDays} días
                </span>
                <span style={{ background: 'rgba(16,185,129,.3)', borderRadius: 10, padding: '3px 10px', fontSize: 12 }}>
                  {completedWays.length} retos completados
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* ── KPIs row ───────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <Kpi label="Retos completados" value={completedWays.length} color={C.indigo} bg="#E8E9FF" />
          <Kpi label="XP total" value={totalXp} color={C.amber} bg="#FEF3C7" />
          <Kpi
            label="Sesiones relajación"
            value={Object.values(relaxationLog).filter((r: any) => r.completed).length}
            color={C.teal}
            bg="#CCFBF1"
          />
        </div>

        {/* ── Two-column layout (stacks on mobile) ──────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}>
          <AnnexHeatmap />
          <AlertPanel />
        </div>

        {/* ── Actions ────────────────────────────────────────────── */}
        <Card>
          <SectionTitle>⚡ Acciones</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <ReportGenerator />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/editor')}
              style={{
                background: '#E8E9FF', color: C.indigo, border: `1.5px solid ${C.border}`,
                borderRadius: 14, padding: '13px 18px',
                fontWeight: 700, fontSize: 14, cursor: 'pointer', textAlign: 'left',
              }}
            >
              ✏️ Crear nuevo WAY (Editor Visual)
            </motion.button>
          </div>
        </Card>

        <KioskPanel />

      </div>
    </div>
  );
}
