import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTherapistStore } from '../store/therapistStore';
import { registry } from '@/content/registry';
import type { Step, Way } from '@/core/engine/types';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { syncService } from '@/core/services/syncService';
import { sessionService, type PlannedSession } from '@/core/services/sessionService';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';


const C = {
  indigo: '#4F46E5',
  indigoLight: '#EEF2FF',
  indigoMuted: '#818CF8',
  text: '#1E1B4B',
  muted: '#6B7280',
  border: '#E2E8F0',
  white: '#ffffff',
  bg: '#F8FAFF',
  emerald: '#10B981',
  rose: '#EF4444',
  amber: '#F59E0B',
  glass: 'rgba(255, 255, 255, 0.8)'
};

interface Props {
  patientId: string;
}

export function SessionPreparation({ patientId }: Props) {
  const navigate = useNavigate();
  const patient = useTherapistStore(s => s.patients.find(p => p.id === patientId));
  
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');
  const [availableSteps, setAvailableSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sessionMessage, setSessionMessage] = useState('');
  const [history, setHistory] = useState<PlannedSession[]>([]);
  const [isLaunching, setIsLaunching] = useState(false);
  const [currentQueue, setCurrentQueue] = useState<string[]>([]);

  // Categories extraction
  const categories = ['all', ...new Set(availableSteps.flatMap(s => s.theme))];

  useEffect(() => {
    async function load() {
      if (!patient) return;
      setLoading(true);
      const steps = await registry.getStepsForLevel(patient.currentLevel);
      setAvailableSteps(steps);
      
      // Load history
      const sessions = await sessionService.getSessions(patientId);
      setHistory(sessions);
      
      setLoading(false);
    }
    load();
  }, [patient?.currentLevel, patientId]);

  if (!patient) return null;

  const queuedWays = currentQueue.map(wayId => {
    for (const step of availableSteps) {
      const way = step.ways.find(w => w.id === wayId);
      if (way) return { way, stepTitle: step.title, theme: step.theme };
    }
    return null;
  }).filter(Boolean) as { way: Way, stepTitle: string, theme: string }[];

  const activeSession = history.find(s => s.status === 'active');

  const handleLaunch = async () => {
    if (queuedWays.length === 0) return;
    setIsLaunching(true);
    try {
      // 1. Crear el draft
      const draft = await sessionService.createSession(patientId, currentQueue, sessionMessage || undefined);
      
      if (draft) {
        // 2. Activar la sesión (pasa de draft -> active)
        const activeSession = await sessionService.activateSession(draft.id, patientId);
        
        if (activeSession) {
          alert('¡Sesión lanzada con éxito! El paciente ya puede verla en su mapa.');
          setHistory([activeSession, ...history]);
          setCurrentQueue([]);
        } else {
          throw new Error('Could not activate session');
        }
      }
    } catch (e) {
      console.error('[SessionPreparation] Launch error:', e);
      alert('Error al lanzar la sesión');
    } finally {
      setIsLaunching(false);
    }
  };

  const filteredSteps = availableSteps.filter(s => selectedCategory === 'all' || s.theme === selectedCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Tabs */}
      <div style={{ display: 'flex', gap: 8, background: '#F1F3FF', padding: 4, borderRadius: 16, width: 'fit-content' }}>
        <TabButton active={activeTab === 'available'} onClick={() => setActiveTab('available')}>🎯 Preparar</TabButton>
        <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')}>📊 Historial</TabButton>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'available' ? (
          <motion.div 
            key="available" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            <div style={{ 
              background: C.white, 
              borderRadius: 32, 
              padding: 32, 
              border: `1px solid ${C.border}`, 
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.03)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32 }}>
                {/* Left: Selection */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontWeight: 900, color: C.text, fontSize: 18 }}>Retos Disponibles</h3>
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      style={{ padding: '6px 12px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 12, fontWeight: 600, color: C.indigo }}
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 550, overflowY: 'auto', paddingRight: 16 }}>
                    {loading ? (
                      <div style={{ padding: 60, textAlign: 'center', color: C.muted }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} style={{ fontSize: 32, marginBottom: 12 }}>🌀</motion.div>
                        <div style={{ fontWeight: 600 }}>Cargando retos terapéuticos...</div>
                      </div>
                    ) : (
                      filteredSteps.map(step => (
                        <div key={step.id} style={{ background: '#F9FAFB', borderRadius: 24, padding: 16, border: `1px solid ${C.border}` }}>
                          <div style={{ fontSize: 12, fontWeight: 900, color: C.indigo, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{step.title}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {step.ways.map(way => {
                              const isQueued = currentQueue.includes(way.id);
                              return (
                                  <motion.div 
                                    key={way.id}
                                    whileHover={!isQueued ? { scale: 1.02, x: 4 } : {}}
                                    whileTap={!isQueued ? { scale: 0.98 } : {}}
                                    onClick={() => !isQueued && setCurrentQueue(prev => [...prev, way.id])}
                                    style={{
                                      padding: '14px 18px', borderRadius: 16, 
                                      border: `1.5px solid ${isQueued ? 'transparent' : C.white}`,
                                      background: isQueued ? C.indigoLight : C.white, 
                                      cursor: isQueued ? 'default' : 'pointer',
                                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                      boxShadow: isQueued ? 'none' : '0 4px 10px rgba(0,0,0,0.02)',
                                      opacity: isQueued ? 0.5 : 1, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                  >
                                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{way.name}</div>
                                    {!isQueued && <div style={{ width: 24, height: 24, borderRadius: 8, background: '#F0F2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.indigo, fontWeight: 900 }}>+</div>}
                                  </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right: Queue & Config */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: C.text }}>Cola de la Sesión</div>
                    {queuedWays.length > 0 && (
                      <button onClick={() => setCurrentQueue([])} style={{ background: 'none', border: 'none', color: C.rose, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Vaciar</button>
                    )}
                  </div>

                  <div style={{ flex: 1, background: C.bg, borderRadius: 24, padding: 16, border: `2px dashed ${C.border}`, minHeight: 150 }}>
                    {queuedWays.length === 0 ? (
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: 12, textAlign: 'center', gap: 8 }}>
                        <span style={{ fontSize: 24 }}>📥</span>
                        <div>Arrastra o pulsa "+" para añadir retos a la sesión.</div>
                      </div>
                    ) : (
                      <Reorder.Group axis="y" values={queuedWays} onReorder={(newOrder) => setCurrentQueue(newOrder.map(i => i.way.id))} style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {queuedWays.map(item => (
                          <Reorder.Item 
                            key={item.way.id} value={item}
                            style={{
                              background: 'white', padding: '14px 16px', borderRadius: 18,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: `1px solid ${C.border}`,
                              display: 'flex', alignItems: 'center', gap: 12, cursor: 'grab'
                            }}
                          >
                            <div style={{ color: '#D1D5DB' }}>☰</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{item.way.name}</div>
                              <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.3 }}>{item.theme}</div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setCurrentQueue(prev => prev.filter(id => id !== item.way.id)); }} style={{ background: '#FEE2E2', border: 'none', color: C.rose, width: 24, height: 24, borderRadius: 8, cursor: 'pointer', fontWeight: 900, fontSize: 14 }}>×</button>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    )}
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ fontWeight: 800, fontSize: 12, color: C.muted, marginBottom: 8 }}>Mensaje para el niño (opcional)</div>
                    <textarea 
                      value={sessionMessage}
                      onChange={(e) => setSessionMessage(e.target.value)}
                      placeholder="Ej: ¡Hola Marcos! Hoy vamos a trabajar el reconocimiento de emociones. ¡Tú puedes!"
                      style={{ width: '100%', borderRadius: 16, border: `1.5px solid ${C.border}`, padding: 12, fontSize: 12, minHeight: 80, outline: 'none', resize: 'none', color: C.text }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {queuedWays.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                style={{ 
                  padding: '24px 32px', 
                  background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #8B5CF6 100%)', 
                  borderRadius: 28, color: 'white',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  boxShadow: '0 20px 40px rgba(79, 70, 229, 0.3)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>Sesión preparada para {patient.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>{queuedWays.length} retos seleccionados • Aprox. {queuedWays.length * 2} mins</div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button 
                    onClick={handleLaunch}
                    disabled={isLaunching}
                    style={{ 
                      background: 'white', color: C.indigo, border: 'none', padding: '12px 24px', 
                      borderRadius: 14, fontWeight: 900, fontSize: 14, cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}
                  >
                    {isLaunching ? 'Lanzando...' : '🚀 Lanzar Sesión'}
                  </button>
                </div>
              </motion.div>
            )}

            {activeSession && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ 
                  padding: '24px 32px', 
                  background: 'white',
                  borderRadius: 28, color: C.text,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  border: `2px solid ${C.indigoLight}`
                }}
              >
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16, color: C.indigo }}>Sesión en curso</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Lanzada hoy a las {new Date(activeSession.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <button 
                  onClick={() => navigate(`/session/${patientId}?sessionId=${activeSession.id}`)}
                  style={{ 
                    background: C.indigo, color: 'white', border: 'none', padding: '12px 24px', 
                    borderRadius: 14, fontWeight: 900, fontSize: 14, cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)'
                  }}
                >
                  💻 Lanzar Modo Kiosko
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="history" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <div style={{ background: C.white, borderRadius: 24, padding: 24, border: `1.5px solid ${C.border}` }}>
              <h3 style={{ margin: '0 0 20px 0', fontWeight: 900, color: C.text }}>Sesiones Anteriores</h3>
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>Aún no hay sesiones registradas.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {history.map(session => (
                    <div key={session.id} style={{ padding: 16, borderRadius: 20, border: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: C.text }}>{new Date(session.created_at).toLocaleDateString()} - {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{session.way_ids.length} retos • Estado: <span style={{ color: session.status === 'completed' ? C.emerald : C.amber, fontWeight: 700 }}>{session.status.toUpperCase()}</span></div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                         {session.summary && session.summary.ways_completed && (
                           <div style={{ textAlign: 'right', marginRight: 12 }}>
                              <div style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>PROGRESO</div>
                              <div style={{ fontSize: 14, fontWeight: 900, color: C.emerald }}>{session.summary.ways_completed.length}/{session.way_ids.length}</div>
                           </div>
                         )}
                         <button 
                           onClick={() => navigate(`/therapist/patient/${patientId}?tab=summary&sessionId=${session.id}`)}
                           style={{ background: '#F3F4F6', border: 'none', padding: '8px 12px', borderRadius: 10, fontSize: 11, fontWeight: 700, color: C.text, cursor: 'pointer' }}
                         >
                           Ver detalles
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      style={{
        padding: '8px 20px', borderRadius: 12, border: 'none',
        background: active ? 'white' : 'transparent',
        color: active ? C.indigo : C.muted,
        fontWeight: 800, fontSize: 13, cursor: 'pointer',
        boxShadow: active ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
        transition: 'all 0.2s'
      }}
    >
      {children}
    </button>
  );
}
