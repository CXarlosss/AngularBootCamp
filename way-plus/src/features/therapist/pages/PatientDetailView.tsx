import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTherapistStore } from '../store/therapistStore';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { ClinicalRadar } from '../components/ClinicalRadar';
import { RecommendationManager } from '../components/RecommendationManager';
import { EvolutionCharts } from '../components/EvolutionCharts';
import { TherapistNotes } from '../components/TherapistNotes';
import { ObjectivesTab } from '../components/ObjectivesTab';
import { ReportGenerator } from '../components/ReportGenerator';
import { SyncStatus } from '../components/SyncStatus';
import { SoundToggle } from '@/core/components/SoundToggle';

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

export function PatientDetailView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const patients = useTherapistStore(s => s.patients);
  const patient = patients.find(p => p.id === patientId);
  const [activeTab, setActiveTab] = useState<'overview' | 'evolution' | 'objectives' | 'notes' | 'recommendations'>('overview');

  const { totalXp = 0, streakDays = 0 } = useRewardsStore();
  const completedWays = usePlayerStore(s => s.profile.completedWays) ?? [];
  const relaxationLog = usePlayerStore(s => s.relaxationLog) ?? {};
  const roleplayLog = usePlayerStore(s => s.roleplayLog) ?? {};

  if (!patient) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ color: C.rose }}>⚠️ Paciente no encontrado</h2>
        <button onClick={() => navigate('/therapist')} style={{ marginTop: 20, cursor: 'pointer' }}>Volver al Dashboard</button>
      </div>
    );
  }

  return (
    <div key={patientId} style={{ background: C.bg, minHeight: '100dvh' }}>
      <header style={{
        background: C.white,
        borderBottom: `1px solid ${C.border}`,
        padding: '16px 20px',
        position: 'sticky', top: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <button onClick={() => navigate('/therapist')} style={{ 
          background: 'none', border: 'none', color: C.indigo, fontWeight: 800, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          ← Volver
        </button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <SoundToggle />
          <SyncStatus />
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card style={{
          background: `linear-gradient(135deg, ${C.indigo}, ${C.indigoDark})`,
          color: '#fff', border: 'none',
          display: 'flex', alignItems: 'center', gap: 16
        }}>
          <div style={{ fontSize: 52, lineHeight: 1 }}>{patient.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 20 }}>{patient.name}</div>
            <div style={{ opacity: 0.8, fontSize: 13, marginTop: 2 }}>
              {patient.age} años · {patient.diagnosis ?? 'Sin diagnóstico'} · {patient.currentLevel}
            </div>
          </div>
        </Card>

        <div style={{
          display: 'flex', gap: 20, borderBottom: `2px solid ${C.border}`,
          padding: '0 8px', marginBottom: 8
        }}>
          {[
            { id: 'overview', label: 'Resumen', icon: '📋' },
            { id: 'evolution', label: 'Evolución', icon: '📊' },
            { id: 'objectives', label: 'Objetivos', icon: '🎯' },
            { id: 'recommendations', label: 'Para Padres', icon: '💡' },
            { id: 'notes', label: 'Notas Clínicas', icon: '📝' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: 'transparent', border: 'none',
                padding: '12px 4px', cursor: 'pointer',
                fontSize: 14, fontWeight: 700, color: activeTab === tab.id ? C.indigo : C.muted,
                position: 'relative', display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  style={{
                    position: 'absolute', bottom: -2, left: 0, right: 0,
                    height: 3, background: C.indigo, borderRadius: 3
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <Kpi label="Retos completados" value={completedWays.length} color={C.indigo} bg="#E8E9FF" />
              <Kpi label="XP total" value={totalXp} color={C.amber} bg="#FEF3C7" />
              <Kpi label="Sesiones calma" value={Object.values(relaxationLog).filter((r: any) => r.completed).length} color={C.teal} bg="#CCFBF1" />
            </div>

            <Card>
              <ClinicalRadar 
                completedWays={completedWays}
                relaxationLog={relaxationLog}
                roleplayLog={roleplayLog}
                streakDays={streakDays}
                totalXp={totalXp}
                patientName={patient.name}
              />
            </Card>

            <Card>
              <SectionTitle>⚡ Acciones</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <ReportGenerator />
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'evolution' && <EvolutionCharts />}
        {activeTab === 'objectives' && <ObjectivesTab patient={patient} />}
        {activeTab === 'notes' && <TherapistNotes patientId={patient.id} />}
        {activeTab === 'recommendations' && <RecommendationManager patientId={patient.id} />}
      </main>
    </div>
  );
}
