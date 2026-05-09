import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sessionService, type PlannedSession } from '@/core/services/sessionService';
import { patientService } from '@/core/services/patientService';
import { registry } from '@/content/registry';
import { type Way } from '@/core/engine/types';
import { CheckCircle2, XCircle, Clock, Save, ChevronLeft } from 'lucide-react';

const C = {
  indigo:   '#4F46E5',
  indigoLt: '#EEF2FF',
  emerald:  '#10B981',
  rose:     '#EF4444',
  amber:    '#F59E0B',
  text:     '#1E1B4B',
  muted:    '#6B7280',
  border:   '#E2E8F0',
  white:    '#ffffff',
  bg:       '#F8FAFF',
};

interface Props {
  patientId: string;
  sessionId: string;
  onBack: () => void;
}

function StatCard({ icon, label, value }: {
  icon: React.ReactNode; label: string; value: string | number;
}) {
  return (
    <div style={{
      background: C.white, padding: 16, borderRadius: 20,
      border: `1.5px solid ${C.border}`, textAlign: 'center',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{value}</div>
      <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
    </div>
  );
}

export function SessionSummaryTab({ patientId, sessionId, onBack }: Props) {
  const [session, setSession] = useState<PlannedSession | null>(null);
  const [waysData, setWaysData] = useState<Record<string, Way>>({});
  const [loading, setLoading] = useState(true);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  useEffect(() => {
    async function load() {
      setLoading(true);

      const sessions = await sessionService.getSessions(patientId);
      const s = sessions.find(x => x.id === sessionId);

      if (s) {
        setSession(s);
        // Cargar observaciones previas si existen
        setClinicalNotes(s.summary?.clinical_observations ?? s.notes ?? '');

        // Cargar metadata de ways
        const patients = await patientService.getAll();
        const p = patients.find(x => x.id === patientId);
        const level = p?.currentLevel ?? 'pregamer';
        const steps = await registry.getStepsForLevel(level);

        const map: Record<string, Way> = {};
        steps.forEach(st =>
          st.ways.forEach(w => {
            if (s.way_ids.includes(w.id)) map[w.id] = w;
          })
        );
        setWaysData(map);
      }

      setLoading(false);
    }
    load();
  }, [patientId, sessionId]);

  // Guardar solo las observaciones clínicas — no toca status ni otros campos
  const handleSaveNotes = async () => {
    if (!session || isSaving) return;
    setIsSaving(true);
    setSaveStatus('idle');

    const ok = await sessionService.updateSessionNotes(session.id, patientId, clinicalNotes);
    setSaveStatus(ok ? 'saved' : 'error');
    setIsSaving(false);

    if (ok) {
      // Actualizar estado local para reflejar el cambio
      setSession(prev => prev ? {
        ...prev,
        summary: { ...prev.summary, clinical_observations: clinicalNotes }
      } : null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>
        Cargando resumen…
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>
        Sesión no encontrada.
        <br />
        <button
          onClick={onBack}
          style={{ marginTop: 16, background: 'none', border: 'none', color: C.indigo, fontWeight: 700, cursor: 'pointer' }}
        >
          ← Volver
        </button>
      </div>
    );
  }

  const total       = session.way_ids.length;
  const completed   = session.summary?.ways_completed?.length ?? 0;
  const skipped     = session.summary?.ways_skipped?.length ?? 0;
  const durationMin = Math.round((session.summary?.duration_seconds ?? 0) / 60);
  const sessionDate = new Date(session.session_date).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      {/* Cabecera */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onBack}
          style={{
            background: C.white, border: `1.5px solid ${C.border}`,
            padding: 8, borderRadius: 12, cursor: 'pointer', color: C.indigo,
            display: 'flex', alignItems: 'center',
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: C.text }}>
            Resumen de Sesión
          </h2>
          <div style={{ fontSize: 12, color: C.muted, textTransform: 'capitalize' }}>
            {sessionDate}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{
            padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
            background: session.status === 'completed' ? '#DCFCE7' : C.indigoLt,
            color: session.status === 'completed' ? '#166534' : C.indigo,
            textTransform: 'uppercase',
          }}>
            {session.status === 'completed' ? 'Completada' : session.status}
          </span>
        </div>
      </header>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <StatCard
          icon={<CheckCircle2 size={18} color={C.emerald} />}
          label="Completados"
          value={`${completed}/${total}`}
        />
        <StatCard
          icon={<XCircle size={18} color={C.rose} />}
          label="Saltados"
          value={skipped}
        />
        <StatCard
          icon={<Clock size={18} color={C.indigo} />}
          label="Duración"
          value={durationMin > 0 ? `${durationMin} min` : '—'}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Detalle de retos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Detalle de retos
          </h3>
          {session.way_ids.map((id, index) => {
            const way = waysData[id];
            const isCompleted = session.summary?.ways_completed?.includes(id);
            const isSkipped   = session.summary?.ways_skipped?.includes(id);
            const detail      = session.summary?.per_way?.[id];

            return (
              <div
                key={id}
                style={{
                  background: C.white, padding: '12px 16px', borderRadius: 16,
                  border: `1.5px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: isCompleted ? '#ECFDF5' : isSkipped ? '#FEF2F2' : '#F3F4F6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isCompleted ? C.emerald : isSkipped ? C.rose : C.muted,
                  fontWeight: 900, fontSize: 12, flexShrink: 0,
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {way?.name ?? way?.title ?? id}
                  </div>
                  <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    {way?.metadata?.skillTag ?? ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {isCompleted && (
                    <>
                      <div style={{ fontSize: 10, fontWeight: 800, color: C.emerald }}>✓ Exitoso</div>
                      {detail && (
                        <div style={{ fontSize: 9, color: C.muted }}>
                          {detail.duration_seconds}s · {detail.attempts} int.
                        </div>
                      )}
                    </>
                  )}
                  {isSkipped && (
                    <div style={{ fontSize: 10, fontWeight: 800, color: C.rose }}>Saltado</div>
                  )}
                  {!isCompleted && !isSkipped && (
                    <div style={{ fontSize: 10, color: C.muted }}>Pendiente</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Observaciones clínicas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Observaciones clínicas
          </h3>
          <div style={{
            background: C.white, padding: 20, borderRadius: 20,
            border: `1.5px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 16,
            flex: 1,
          }}>
            <textarea
              value={clinicalNotes}
              onChange={e => setClinicalNotes(e.target.value)}
              placeholder="Escribe aquí las observaciones de la sesión de hoy…"
              style={{
                flex: 1, minHeight: 200, border: 'none', outline: 'none',
                fontSize: 13, color: C.text, resize: 'none', lineHeight: 1.6,
                fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {saveStatus === 'saved' && (
                <span style={{ fontSize: 12, color: C.emerald, fontWeight: 600 }}>✓ Guardado</span>
              )}
              {saveStatus === 'error' && (
                <span style={{ fontSize: 12, color: C.rose, fontWeight: 600 }}>⚠ Error al guardar</span>
              )}
              {saveStatus === 'idle' && <span />}
              <button
                onClick={handleSaveNotes}
                disabled={isSaving}
                style={{
                  background: C.indigo, color: C.white, border: 'none',
                  padding: '10px 18px', borderRadius: 12, fontWeight: 800,
                  fontSize: 13, cursor: isSaving ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  opacity: isSaving ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(79,70,229,0.2)',
                }}
              >
                <Save size={15} />
                {isSaving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
