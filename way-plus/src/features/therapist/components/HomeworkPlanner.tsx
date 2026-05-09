import React, { useState, useEffect } from 'react';
import { patientService } from '@/core/services/patientService';
import { registry } from '@/content/registry';
import type { Way } from '@/core/engine/types';

interface Props {
  patientId: string;
}

export function HomeworkPlanner({ patientId }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Cargar tareas actuales
  useEffect(() => {
    if (patientId) {
      patientService.getHomework(patientId).then(ids => {
        setSelected(new Set(ids));
      });
    }
  }, [patientId]);

  const toggleWay = (wayId: string) => {
    const next = new Set(selected);
    if (next.has(wayId)) next.delete(wayId);
    else next.add(wayId);
    setSelected(next);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await patientService.setHomework(patientId, Array.from(selected));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert('Error guardando tareas');
    } finally {
      setSaving(false);
    }
  };

  // Agrupar ways por categoría (theme del step padre si es posible)
  const waysByCategory = React.useMemo(() => {
    const allWays = registry.getAllWays();
    return allWays.reduce((acc, way) => {
      // Intentamos inferir la categoría del ID o metadata
      const cat = (way as any).category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(way);
      return acc;
    }, {} as Record<string, Way[]>);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '10px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: '#1E1B4B' }}>🏠 Tareas para casa</h3>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
            Selecciona los ejercicios que el niño verá destacados en su pantalla principal.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px 24px',
            borderRadius: 12,
            fontWeight: 800,
            color: 'white',
            background: saved ? '#10B981' : '#4F46E5',
            border: 'none',
            cursor: saving ? 'default' : 'pointer',
            transition: 'all 0.2s',
            opacity: saving ? 0.7 : 1,
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
          }}
        >
          {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar Plan'}
        </button>
      </div>

      {Object.entries(waysByCategory).map(([category, ways]) => (
        <div key={category} style={{ background: 'white', borderRadius: 20, border: '1.5px solid #F1F2FF', padding: 20 }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: '#475569', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>{category}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {ways.map(way => (
              <label
                key={way.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 12,
                  border: `1.5px solid ${selected.has(way.id) ? '#4F46E5' : '#F1F2FF'}`,
                  background: selected.has(way.id) ? '#EEEDFE' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(way.id)}
                  onChange={() => toggleWay(way.id)}
                  style={{ width: 18, height: 18, accentColor: '#4F46E5' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1E1B4B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {way.title}
                  </p>
                  <p style={{ fontSize: 10, color: '#6B7280', margin: 0 }}>{way.id}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}

      {selected.size > 0 && (
        <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 12, padding: 16, fontSize: 13, color: '#92400E', fontWeight: 600 }}>
          🎯 {selected.size} ejercicios seleccionados. Se mostrarán con prioridad en el flujo autónomo del niño.
        </div>
      )}
    </div>
  );
}
