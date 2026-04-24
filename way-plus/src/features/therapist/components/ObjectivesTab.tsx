import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTherapistStore, Patient } from '../store/therapistStore';
import { ObjectiveCard } from './ObjectiveCard';
import { AddObjectiveModal } from './AddObjectiveModal';

interface ObjectivesTabProps {
  patient: Patient;
}

export function ObjectivesTab({ patient }: ObjectivesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const updateObjective = useTherapistStore(s => s.updateObjective);
  const addObjective = useTherapistStore(s => s.addObjective);
  const deleteObjective = useTherapistStore(s => s.deleteObjective);

  const activeObjectives = patient.objectives.filter(o => o.status !== 'achieved');
  const completedObjectives = patient.objectives.filter(o => o.status === 'achieved');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1E1B4B' }}>🎯 Objetivos Terapéuticos</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Define y haz seguimiento de metas personalizadas para {patient.name}.</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          style={{
            background: '#4F46E5',
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(79,70,229,0.2)'
          }}
        >
          <span>+</span> Nuevo Objetivo
        </motion.button>
      </div>

      {activeObjectives.length === 0 && completedObjectives.length === 0 ? (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          background: '#fff',
          borderRadius: 24,
          border: '1.5px dashed #E8E9FF'
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
          <div style={{ fontWeight: 700, color: '#1E1B4B', fontSize: 15 }}>No hay objetivos activos</div>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 20px' }}>
            Empieza definiendo metas específicas para el tratamiento.
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            style={{
              background: '#E8E9FF',
              color: '#4F46E5',
              border: 'none',
              borderRadius: 12,
              padding: '8px 16px',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            Añadir mi primer objetivo
          </motion.button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {activeObjectives.map(obj => (
            <ObjectiveCard
              key={obj.id}
              objective={obj}
              onUpdate={(val) => updateObjective(patient.id, obj.id, val)}
              onDelete={() => deleteObjective(patient.id, obj.id)}
            />
          ))}
          {completedObjectives.map(obj => (
            <ObjectiveCard
              key={obj.id}
              objective={obj}
              onUpdate={(val) => updateObjective(patient.id, obj.id, val)}
              onDelete={() => deleteObjective(patient.id, obj.id)}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <AddObjectiveModal
          onClose={() => setIsModalOpen(false)}
          onAdd={(obj) => addObjective(patient.id, obj)}
        />
      )}
    </div>
  );
}
