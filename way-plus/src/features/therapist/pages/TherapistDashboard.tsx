import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTherapistStore } from '../store/therapistStore';
import { SoundToggle } from '@/core/components/SoundToggle';
import { SyncStatus } from '../components/SyncStatus';

const C = {
  indigo:      '#4F46E5',
  text:    '#1E1B4B',
  muted:   '#6B7280',
  border:  '#E8E9FF',
  bg:      '#F8FAFF',
  white:   '#ffffff',
};

export function TherapistDashboard() {
  const navigate = useNavigate();
  const patients = useTherapistStore(s => s.patients) ?? [];

  return (
    <div style={{ background: C.bg, minHeight: '100dvh' }}>
      <header style={{
        background: C.white,
        borderBottom: `1px solid ${C.border}`,
        padding: '16px 20px',
        position: 'sticky', top: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: C.text }}>🧠 Panel Terapéutico</div>
          <div style={{ fontSize: 12, color: C.muted }}>Selecciona un paciente para ver su evolución</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <SoundToggle />
          <SyncStatus />
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
        <h2 style={{ fontWeight: 900, color: C.text, marginBottom: 24 }}>Lista de Pacientes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {patients.map(p => (
            <motion.div
              key={p.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/therapist/patient/${p.id}`)}
              style={{
                background: C.white,
                padding: 24,
                borderRadius: 24,
                border: `1.5px solid ${C.border}`,
                boxShadow: '0 4px 12px rgba(79,70,229,.05)',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: 60, marginBottom: 12 }}>{p.avatar}</div>
              <h3 style={{ margin: 0, fontWeight: 800, color: C.text }}>{p.name}</h3>
              <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
                {p.age} años · {p.currentLevel}
              </p>
              <div style={{ 
                marginTop: 16, padding: '8px', borderRadius: 12, 
                background: '#F1F2FF', color: C.indigo, fontSize: 12, fontWeight: 700 
              }}>
                Ver expediente →
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
