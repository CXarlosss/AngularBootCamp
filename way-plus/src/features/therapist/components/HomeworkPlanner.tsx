import React, { useState, useEffect, useMemo } from 'react';
import { patientService } from '@/core/services/patientService';
import { registry } from '@/content/registry';
import { normalizeWayText } from '@/shared/lib/way-text-utils';
import type { Way } from '@/core/engine/types';
import { motion, Reorder, AnimatePresence } from 'framer-motion';

interface Props {
  patientId: string;
}

// Iconos/Emojis por step
const STEP_ICONS: Record<number, string> = {
  1: '🧘‍♂️', // Relajación
  2: '⭐', // Autonomía y Autoestima
  3: '🗣️'  // Asertividad
};

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Fácil',
  2: 'Medio',
  3: 'Difícil'
};

export function HomeworkPlanner({ patientId }: Props) {
  const [assignedWays, setAssignedWays] = useState<Way[]>([]);
  const [completedWayIds, setCompletedWayIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [patientName, setPatientName] = useState('el paciente');

  // Filtros
  const [search, setSearch] = useState('');
  const [filterStep, setFilterStep] = useState<number | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<number | 'all'>('all');

  const allWays = useMemo(() => registry.getAllWays(), []);

  // Cargar tareas actuales y datos del paciente
  useEffect(() => {
    if (patientId) {
      // Idealmente patientService tendría getProfile, pero podemos usar getAll y buscarlo
      patientService.getAll().then(patients => {
        const p = patients.find(p => p.id === patientId);
        if (p) {
          setPatientName(p.name);
          setCompletedWayIds(new Set(p.completedWays || []));
        }
      });

      patientService.getHomework(patientId).then(ids => {
        const loadedWays = ids.map(id => allWays.find(w => w.id === id)).filter(Boolean) as Way[];
        setAssignedWays(loadedWays);
      });
    }
  }, [patientId, allWays]);

  const handleAssign = (way: Way) => {
    if (!assignedWays.find(w => w.id === way.id)) {
      setAssignedWays([...assignedWays, way]);
      setSaved(false);
    }
  };

  const handleRemove = (wayId: string) => {
    setAssignedWays(assignedWays.filter(w => w.id !== wayId));
    setSaved(false);
  };

  const generateWhatsAppMessage = () => {
    const wayNames = assignedWays.map(w => `• ${normalizeWayText(w.title || w.name || '')}`).join('\n');
    const msg = `¡Hola! 👋 Soy Maite. \nEsta semana he dejado preparadas las siguientes misiones en WAY+ para ${patientName}:\n\n${wayNames}\n\n¡Mucho ánimo y a jugar! 🚀`;
    return encodeURIComponent(msg);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await patientService.setHomework(patientId, assignedWays.map(w => w.id));
      setSaved(true);
      
      // Abrir WhatsApp Web con el mensaje pre-generado
      const whatsappUrl = `https://wa.me/?text=${generateWhatsAppMessage()}`;
      window.open(whatsappUrl, '_blank');
      
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Error guardando tareas');
    } finally {
      setSaving(false);
    }
  };

  const filteredAvailableWays = useMemo(() => {
    return allWays.filter(way => {
      // No mostrar en la lista de disponibles si ya está asignado
      if (assignedWays.find(w => w.id === way.id)) return false;
      
      if (filterStep !== 'all' && way.stepNumber !== filterStep) return false;
      if (filterDifficulty !== 'all' && way.metadata?.difficulty !== filterDifficulty) return false;
      
      if (search) {
        const query = search.toLowerCase();
        const title = normalizeWayText(way.title || way.name || '').toLowerCase();
        if (!title.includes(query)) return false;
      }
      
      return true;
    });
  }, [allWays, assignedWays, filterStep, filterDifficulty, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '10px 0' }}>
      
      <div style={{ background: '#1E1B4B', color: 'white', padding: '20px', borderRadius: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>🏠 Tareas para {patientName}</h2>
          <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: 14 }}>Organiza su Camino de Hoy arrastrando los ejercicios.</p>
        </div>
        <div style={{ fontSize: 40 }}>🗓️</div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'white', padding: 16, borderRadius: 16, border: '1.5px solid #F1F2FF' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: 12, top: 10, fontSize: 16 }}>🔍</span>
          <input 
            type="text" 
            placeholder="Buscar por nombre..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: 10, border: '1px solid #E5E7EB', outline: 'none' }}
          />
        </div>
        
        <select 
          value={filterStep} 
          onChange={e => setFilterStep(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          style={{ padding: '10px', borderRadius: 10, border: '1px solid #E5E7EB', outline: 'none', background: 'white' }}
        >
          <option value="all">Todos los Steps</option>
          <option value={1}>Step 1: Relajación</option>
          <option value={2}>Step 2: Autonomía</option>
          <option value={3}>Step 3: Asertividad</option>
        </select>

        <select 
          value={filterDifficulty} 
          onChange={e => setFilterDifficulty(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          style={{ padding: '10px', borderRadius: 10, border: '1px solid #E5E7EB', outline: 'none', background: 'white' }}
        >
          <option value="all">Cualquier Dificultad</option>
          <option value={1}>Fácil</option>
          <option value={2}>Medio</option>
          <option value={3}>Difícil</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        
        {/* WAYS DISPONIBLES */}
        <div style={{ flex: 2, background: 'white', borderRadius: 20, border: '1.5px solid #F1F2FF', padding: 20, minHeight: 400 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#475569', marginBottom: 16 }}>🌟 DISPONIBLES ({filteredAvailableWays.length})</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            <AnimatePresence>
              {filteredAvailableWays.slice(0, 20).map(way => {
                const isCompleted = completedWayIds.has(way.id);
                return (
                  <motion.div
                    key={way.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      border: '1.5px solid #E5E7EB',
                      borderRadius: 16,
                      padding: 16,
                      background: isCompleted ? '#F9FAFB' : 'white',
                      position: 'relative'
                    }}
                  >
                    {isCompleted && (
                      <div style={{ position: 'absolute', top: -10, right: -10, background: '#10B981', color: 'white', padding: '4px 8px', borderRadius: 10, fontSize: 12, fontWeight: 'bold', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}>
                        ✓ Completado
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 24 }}>{STEP_ICONS[way.stepNumber || 1] || '⭐'}</span>
                      <span style={{ fontSize: 11, background: '#F1F5F9', padding: '2px 8px', borderRadius: 10, color: '#64748B', fontWeight: 600 }}>
                        {DIFFICULTY_LABELS[way.metadata?.difficulty || 1]}
                      </span>
                    </div>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#1E1B4B' }}>
                      {normalizeWayText(way.title || way.name || '')}
                    </h4>
                    <button
                      onClick={() => handleAssign(way)}
                      style={{
                        width: '100%', padding: '8px 0', background: '#EEF2FF', color: '#4F46E5',
                        border: '1px solid #C7D2FE', borderRadius: 8, fontWeight: 700, cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                    >
                      + Asignar
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {filteredAvailableWays.length > 20 && (
              <div style={{ padding: 16, textAlign: 'center', color: '#6B7280', fontSize: 13, fontWeight: 600 }}>
                Y {filteredAvailableWays.length - 20} más... Usa los filtros.
              </div>
            )}
          </div>
        </div>

        {/* MOCHILA - TAREAS ASIGNADAS */}
        <div style={{ flex: 1, background: '#F8FAFF', borderRadius: 20, border: '2px dashed #C7D2FE', padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#4F46E5', margin: 0 }}>🏠 ASIGNADAS ({assignedWays.length})</h3>
          </div>

          <div style={{ flex: 1, minHeight: 300 }}>
            {assignedWays.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', textAlign: 'center', gap: 12 }}>
                <span style={{ fontSize: 40 }}>🎒</span>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Aún no hay tareas asignadas.<br/>Asigna algunas desde el panel izquierdo.</p>
              </div>
            ) : (
              <Reorder.Group axis="y" values={assignedWays} onReorder={setAssignedWays} style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {assignedWays.map((way) => (
                  <Reorder.Item key={way.id} value={way} style={{ cursor: 'grab' }}>
                    <div style={{
                      background: 'white', border: '1.5px solid #4F46E5', borderRadius: 12, padding: 12,
                      display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 6px rgba(79, 70, 229, 0.1)'
                    }}>
                      <div style={{ cursor: 'grab', color: '#9CA3AF', padding: '0 4px' }}>↕️</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#1E1B4B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {normalizeWayText(way.title || way.name || '')}
                        </div>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>{STEP_ICONS[way.stepNumber || 1]} Step {way.stepNumber || 1}</div>
                      </div>
                      <button 
                        onClick={() => handleRemove(way.id)}
                        style={{ background: '#FEE2E2', border: 'none', color: '#EF4444', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </div>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1.5px solid #E0E7FF' }}>
            <button
              onClick={handleSave}
              disabled={saving || assignedWays.length === 0}
              style={{
                width: '100%', padding: '16px', borderRadius: 12, fontWeight: 800, color: 'white', fontSize: 15,
                background: saved ? '#10B981' : (assignedWays.length === 0 ? '#9CA3AF' : '#4F46E5'),
                border: 'none', cursor: (saving || assignedWays.length === 0) ? 'default' : 'pointer',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: (saving || assignedWays.length === 0) ? 'none' : '0 8px 16px rgba(79, 70, 229, 0.25)'
              }}
            >
              {saving ? 'Guardando...' : saved ? '¡Guardado! ✅' : (
                <>
                  <span>💾 Guardar Plan</span>
                  <span style={{ fontSize: 18 }}>📱</span>
                </>
              )}
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: '#6B7280', margin: '8px 0 0 0' }}>
              Al guardar se generará un mensaje automático para WhatsApp.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
