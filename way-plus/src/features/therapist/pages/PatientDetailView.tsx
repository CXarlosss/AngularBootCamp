import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTherapistStore } from '../store/therapistStore';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { ClinicalRadar } from '../components/ClinicalRadar';
import { RecommendationManager } from '../components/RecommendationManager';
import { TherapistNotes } from '../components/TherapistNotes';
import { ObjectivesTab } from '../components/ObjectivesTab';
import { ReportGenerator } from '../components/ReportGenerator';
import { SessionPreparation } from '../components/SessionPreparation';
import { FamilyAccessManager } from '@/components/therapist/FamilyAccessManager';
import { SessionSummaryTab } from '../components/SessionSummaryTab';
import { PinConfig } from '../components/PinConfig';
import { SyncStatus } from '../components/SyncStatus';
import { SoundToggle } from '@/core/components/SoundToggle';
import { useConfigStore } from '@/core/stores/configStore';
import { HomeworkPlanner } from '../components/HomeworkPlanner';
import { patientService } from '@/core/services/patientService';

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

const EvolutionCharts = React.lazy(() => import('../components/EvolutionCharts').then(m => ({ default: m.EvolutionCharts })));
const PatientAnalyticsView = React.lazy(() => import('../components/PatientAnalyticsView').then(m => ({ default: m.PatientAnalyticsView })));

function SettingToggle({ label, description, active, onToggle }: { label: string, description: string, active: boolean, onToggle: () => void }) {
  return (
    <div 
      onClick={onToggle}
      className="glass-clinical cursor-pointer transition-all duration-200 flex flex-col gap-1 p-4 rounded-[20px]"
    >
      <div className="flex justify-between items-center">
        <span className="font-black text-[#1E1B4B]">{label}</span>
        <div className={`toggle-glass ${active ? 'toggle-glass--active' : ''}`}>
          <div className="toggle-glass__knob" />
        </div>
      </div>
      <span className="text-[10px] text-slate-500 font-bold leading-tight mt-1">{description}</span>
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass-clinical rounded-[20px] p-5 ${className}`}>
      {children}
    </div>
  );
}

function Kpi({ label, value, type = 'indigo', icon }: {
  label: string; value: string | number; type?: 'indigo' | 'amber' | 'teal'; icon: string;
}) {
  return (
    <div className={`kpi-glass kpi-glass--${type} flex flex-col items-center justify-center text-center`}>
      <div className="text-2xl mb-1 opacity-80">{icon}</div>
      <div className="text-2xl font-black text-slate-800 tabular-nums">{value}</div>
      <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-black text-[15px] text-[#1E1B4B] mb-3 flex items-center gap-2">
      {children}
    </div>
  );
}

export function PatientDetailView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const patients = useTherapistStore(s => s.patients);
  const patient = patients.find(p => p.id === patientId);
  const [activeTab, setActiveTab] = useState<'overview' | 'evolution' | 'analytics' | 'objectives' | 'notes' | 'recommendations' | 'config' | 'summary' | 'homework' | 'family'>('overview');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Sync with URL params if any
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), [window.location.search]);
  
  const selectPatient = useTherapistStore(s => s.selectPatient);
  const updatePatient = useTherapistStore(s => s.updatePatient);
  const selectedPatientIdFromStore = useTherapistStore(s => s.selectedPatientId);

  useEffect(() => {
    if (patientId && patientId !== selectedPatientIdFromStore) {
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

  const relaxationLog = usePlayerStore(s => s.relaxationLog) ?? {};
  const roleplayLog = usePlayerStore(s => s.roleplayLog) ?? {};

  if (!patient) {
    return (
      <div className="p-10 text-center animate-fade-up">
        <h2 className="text-rose-500 font-black text-xl mb-4">⚠️ Paciente no encontrado</h2>
        <button onClick={() => navigate('/therapist')} className="btn-clinical">Volver al Dashboard</button>
      </div>
    );
  }

  const completedWays = patient.completedWays ?? [];
  const totalXp = patient.coins ?? 0;

  return (
    <div key={patientId} className="min-h-screen bg-[#F8FAFF] relative overflow-hidden" style={{ fontFamily: 'Verdana, sans-serif' }}>
      
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-200/50 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-teal-100/50 blur-[120px]" />
      </div>

      <header className="header-clinical sticky top-0 z-50 px-5 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/therapist')} className="text-indigo-600 font-black flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span>←</span> Volver
        </button>
        <div className="flex items-center gap-3">
          <SoundToggle />
          <SyncStatus />
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-6 animate-fade-up">
        
        {/* Profile Card */}
        <div className="profile-glass p-6 text-white flex items-center gap-5">
          <div className="profile-glass__glow" />
          <div className="text-6xl drop-shadow-lg bg-white/10 p-2 rounded-2xl border border-white/20 backdrop-blur-md relative z-10">
            {patient.avatar}
          </div>
          <div className="relative z-10">
            <h1 className="font-black text-2xl drop-shadow-md">{patient.name}</h1>
            <div className="opacity-90 font-bold text-sm mt-1 bg-black/10 px-3 py-1 rounded-full inline-block backdrop-blur-md">
              {patient.age} años · {patient.gender === 'female' ? 'Niña' : 'Niño'} · {patient.diagnosis ?? 'Sin diagnóstico'} · Nivel {patient.currentLevel}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-16 z-40 -mx-4 px-4 sm:mx-0 sm:px-0 bg-[#F8FAFF]/80 backdrop-blur-md py-2 border-b border-indigo-100/50">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 items-center max-w-full">
            {[
              { id: 'overview', label: 'Resumen', icon: '📋' },
              { id: 'homework', label: 'Casa', icon: '🏠' },
              { id: 'analytics', label: 'Telemetría', icon: '📡' },
              { id: 'evolution', label: 'Evolución', icon: '📊' },
              { id: 'objectives', label: 'Objetivos', icon: '🎯' },
              { id: 'recommendations', label: 'Para Padres', icon: '💡' },
              { id: 'family', label: 'Familia', icon: '👨‍👩‍👦' },
              { id: 'config', label: 'Sesión', icon: '⚙️' },
              { id: 'notes', label: 'Notas', icon: '📝' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`tab-crystal whitespace-nowrap flex items-center gap-2 ${isActive ? 'tab-crystal--active text-indigo-700' : 'text-slate-500 hover:text-indigo-500 hover:bg-white/50'}`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="tab-crystal__indicator"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-fade-up flex flex-col gap-6 min-h-[400px]">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <Kpi icon="🏆" label="Retos" value={completedWays.length} type="indigo" />
                <Kpi icon="⭐" label="XP Total" value={totalXp} type="amber" />
                <Kpi icon="🌿" label="Calma" value={Object.values(relaxationLog).filter((r: any) => r.completed).length} type="teal" />
              </div>

              <Card>
                <ClinicalRadar 
                  completedWays={completedWays}
                  relaxationLog={relaxationLog}
                  roleplayLog={roleplayLog}
                  streakDays={0}
                  totalXp={totalXp}
                  patientName={patient.name}
                />
              </Card>

              <Card>
                <SectionTitle>⚡ Acciones Rápidas</SectionTitle>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <div className="flex-1">
                    <ReportGenerator />
                  </div>
                  <button 
                    onClick={() => navigate(`/therapist/patient/${patientId}/annexes`)}
                    className="btn-clinical flex-1 text-indigo-600 flex justify-center items-center gap-2"
                  >
                    📋 Ver Anexos Semanales
                  </button>
                </div>
              </Card>
            </>
          )}

          {activeTab === 'homework' && <HomeworkPlanner patientId={patient.id} />}
          {activeTab === 'analytics' && (
            <React.Suspense fallback={<div className="p-10 text-center font-bold text-slate-400">Cargando telemetría...</div>}>
              <PatientAnalyticsView patientId={patient.id} />
            </React.Suspense>
          )}
          {activeTab === 'evolution' && (
            <React.Suspense fallback={<div className="p-10 text-center font-bold text-slate-400">Cargando gráficos de evolución...</div>}>
              <EvolutionCharts />
            </React.Suspense>
          )}
          {activeTab === 'objectives' && <ObjectivesTab patient={patient} />}
          {activeTab === 'notes' && <TherapistNotes patientId={patient.id} />}
          {activeTab === 'recommendations' && <RecommendationManager patientId={patient.id} />}
          
          {activeTab === 'family' && (
            <Card>
              <FamilyAccessManager patientId={patient.id} patientName={patient.name} />
            </Card>
          )}
          
          {activeTab === 'config' && (
            <div className="flex flex-col gap-6">
              <Card>
                <SectionTitle>👤 Datos del Paciente</SectionTitle>
                <div className="mt-4">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 block">Género</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'male', label: '👦 Niño' },
                      { value: 'female', label: '👧 Niña' }
                    ].map(({ value, label }) => {
                      const isActive = patient.gender === value;
                      return (
                        <button
                          key={value}
                          onClick={async () => {
                            await patientService.update(patient.id, { gender: value as 'male' | 'female' });
                            updatePatient(patient.id, { gender: value as 'male' | 'female' });
                          }}
                          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                            isActive 
                              ? 'bg-indigo-50 border-2 border-indigo-500 text-indigo-700 shadow-sm' 
                              : 'bg-white border-2 border-slate-100 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>

              <Card>
                <SectionTitle>📱 Acceso del Niño (PIN)</SectionTitle>
                <PinConfig 
                  patientId={patient.id}
                  patientName={patient.name}
                  currentPin={patient.playerPin ?? '0000'}
                />
              </Card>

              <SessionPreparation patientId={patient.id} />

              <Card>
                <SectionTitle>⚙️ Ajustes de Accesibilidad</SectionTitle>
                <p className="text-slate-500 text-xs font-bold mb-5">
                  Estos ajustes se guardan automáticamente para {patient.name} y se aplicarán en su próxima sesión.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    description="Desactiva efectos visuales para mayor velocidad de carga."
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
        </div>
      </main>

    </div>
  );
}
