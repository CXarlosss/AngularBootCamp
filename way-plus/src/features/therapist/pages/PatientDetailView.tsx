import React, { useState, useMemo, useEffect } from 'react';
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
import { SessionPreparation } from '../components/SessionPreparation';
import { SessionSummaryTab } from '../components/SessionSummaryTab';
import { PinConfig } from '../components/PinConfig';
import { SyncStatus } from '../components/SyncStatus';
import { SoundToggle } from '@/core/components/SoundToggle';
import { useConfigStore } from '@/core/stores/configStore';
import { PatientAnalyticsView } from '../components/PatientAnalyticsView';
import { HomeworkPlanner } from '../components/HomeworkPlanner';

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

function SettingToggle({ label, description, active, onToggle }: { label: string, description: string, active: boolean, onToggle: () => void }) {
  return (
    <div 
      onClick={onToggle}
      style={{
        padding: 16, borderRadius: 20, border: `1.5px solid ${active ? C.indigo : C.border}`,
        background: active ? '#EEEDFE' : 'white', cursor: 'pointer', transition: 'all 0.2s',
        display: 'flex', flexDirection: 'column', gap: 4
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, color: C.text }}>{label}</span>
        <div style={{ 
          width: 36, height: 18, borderRadius: 18, background: active ? C.indigo : '#D1D5DB',
          position: 'relative', transition: 'background 0.2s'
        }}>
          <div style={{ 
            width: 12, height: 12, borderRadius: '50%', background: 'white',
            position: 'absolute', top: 3, left: active ? 21 : 3, transition: 'left 0.2s'
          }} />
        </div>
      </div>
      <span style={{ fontSize: 10, color: C.muted, fontWeight: 500, lineHeight: 1.3 }}>{description}</span>
    </div>
  );
}


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
  const [activeTab, setActiveTab] = useState<'overview' | 'evolution' | 'analytics' | 'objectives' | 'notes' | 'recommendations' | 'config' | 'summary' | 'homework'>('overview');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Sync with URL params if any
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), [window.location.search]);
  
  const selectPatient = useTherapistStore(s => s.selectPatient);
  const selectedPatientIdFromStore = useTherapistStore(s => s.selectedPatientId);

  useEffect(() => {
    if (patientId && patientId !== selectedPatientIdFromStore) {
      // Usamos una versión suave de select que no provoque redirect infinito
      useTherapistStore.setState({ selectedPatientId: patientId });
      sessionStorage.setItem('way-active-patient', patientId);
    }
  }, [patientId, selectedPatientIdFromStore]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    const sid = searchParams.get('sessionId');
    if (tab === 'summary' && sid) {
      setActiveTab('summary');
      setSelectedSessionId(sid);
    }
  }, [searchParams]);

  const { 
    accessibility, 
    performance, 
    setReduceMotion, 
    setHighAccessibility, 
    setPerformanceMode, 
    setShowTextLabels 
  } = useConfigStore();


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
          display: 'flex', 
          justifyContent: 'center', 
          width: '100%', 
          borderBottom: `2px solid ${C.border}`,
          marginBottom: 24, 
          position: 'sticky', 
          top: 70, 
          background: 'rgba(248, 250, 255, 0.95)',
          backdropFilter: 'blur(12px)', 
          zIndex: 25,
          padding: '4px 0'
        }}>
          <div style={{ display: 'flex', gap: 32, padding: '0 20px' }}>
            {[
              { id: 'overview', label: 'Resumen', icon: '📋' },
              { id: 'homework', label: 'Casa', icon: '🏠' },
              { id: 'analytics', label: 'Telemetría', icon: '📡' },
              { id: 'evolution', label: 'Evolución', icon: '📊' },
              { id: 'objectives', label: 'Objetivos', icon: '🎯' },
              { id: 'recommendations', label: 'Para Padres', icon: '💡' },
              { id: 'config', label: 'Sesión', icon: '⚙️' },
              { id: 'notes', label: 'Notas', icon: '📝' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  background: 'transparent', border: 'none',
                  padding: '16px 4px', cursor: 'pointer',
                  fontSize: 14, fontWeight: 700, color: activeTab === tab.id ? C.indigo : C.muted,
                  position: 'relative', display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.3s ease'
                }}
              >
                <span style={{ fontSize: 18 }}>{tab.icon}</span>
                <span style={{ opacity: activeTab === tab.id ? 1 : 0.7 }}>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    style={{
                      position: 'absolute', bottom: -2, left: 0, right: 0,
                      height: 3, background: C.indigo, borderRadius: '3px 3px 0 0'
                    }}
                  />
                )}
              </button>
            ))}
          </div>
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

        {activeTab === 'homework' && <HomeworkPlanner patientId={patient.id} />}
        {activeTab === 'analytics' && <PatientAnalyticsView patientId={patient.id} />}

        {activeTab === 'evolution' && <EvolutionCharts />}
        {activeTab === 'objectives' && <ObjectivesTab patient={patient} />}
        {activeTab === 'notes' && <TherapistNotes patientId={patient.id} />}
        {activeTab === 'recommendations' && <RecommendationManager patientId={patient.id} />}
        
        {activeTab === 'config' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <SectionTitle>📱 Acceso del Niño</SectionTitle>
              <PinConfig 
                patientId={patient.id}
                patientName={patient.name}
                currentPin={patient.playerPin ?? '0000'}
              />
            </Card>

            <SessionPreparation patientId={patient.id} />

            <Card>
              <SectionTitle>⚙️ Ajustes de Accesibilidad para {patient.name}</SectionTitle>
              <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>
                Estos ajustes se guardan automáticamente para este paciente y se aplicarán la próxima vez que inicie su sesión.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                <SettingToggle 
                  label="Modo TEA Alto" 
                  description="Iconos simplificados y elementos táctiles más grandes."
                  active={accessibility.highAccessibility}
                  onToggle={() => setHighAccessibility(!accessibility.highAccessibility)}
                />
                <SettingToggle 
                  label="Reducir Movimiento" 
                  description="Desactiva animaciones intensas para niños sensibles."
                  active={accessibility.reduceMotion}
                  onToggle={() => setReduceMotion(!accessibility.reduceMotion)}
                />
                <SettingToggle 
                  label="Modo Rendimiento" 
                  description="Desactiva efectos visuales para mayor velocidad."
                  active={performance.disableFilters}
                  onToggle={() => setPerformanceMode(!performance.disableFilters)}
                />
                <SettingToggle 
                  label="Etiquetas de Texto" 
                  description="Muestra u oculta los nombres bajo los pictogramas."
                  active={accessibility.showTextLabels}
                  onToggle={() => setShowTextLabels(!accessibility.showTextLabels)}
                />
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'summary' && selectedSessionId && (
          <SessionSummaryTab 
            patientId={patient.id} 
            sessionId={selectedSessionId} 
            onBack={() => setActiveTab('config')} 
          />
        )}
      </main>

    </div>
  );
}
