import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTherapistStore } from '../store/therapistStore';
import { SoundToggle } from '@/core/components/SoundToggle';
import { SyncStatus } from '../components/SyncStatus';
import { SecurityGate } from '@/shared/components/SecurityGate';

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
  const { selectPatient, addPatient, patients } = useTherapistStore();
  const [isAuthorized, setIsAuthorized] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newPatient, setNewPatient] = React.useState({ name: '', age: 6, avatar: '👤' });

  if (!isAuthorized) {
    return (
      <SecurityGate 
        onSuccess={() => setIsAuthorized(true)}
        onCancel={() => navigate('/')}
        title="Panel de Maite"
      />
    );
  }

  const handleAddPatient = () => {
    if (!newPatient.name) return;
    const id = `patient-${Date.now()}`;
    addPatient({
      id,
      ...newPatient,
      startDate: new Date().toISOString().split('T')[0],
      lastSession: new Date().toISOString().split('T')[0],
      currentLevel: 'pregamer',
      objectives: []
    });
    setShowAddModal(false);
    setNewPatient({ name: '', age: 6, avatar: '👤' });
    
    // Auto-select the new patient to activate their session
    selectPatient(id);
  };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 900, color: C.text, margin: 0 }}>Lista de Pacientes</h2>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{
              background: C.indigo, color: 'white', border: 'none', padding: '10px 20px',
              borderRadius: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 12px rgba(79,70,229,.2)'
            }}
          >
            <span>➕</span> Nuevo Paciente
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {patients.map(p => (
            <motion.div
              key={p.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectPatient(p.id)}
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

      {/* Modal Añadir Paciente Simple */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'white', padding: 32, borderRadius: 24, width: '100%', maxWidth: 400,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}
          >
            <h3 style={{ margin: '0 0 20px', fontWeight: 900 }}>Añadir Paciente</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 4 }}>NOMBRE</label>
                <input 
                  value={newPatient.name}
                  onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                  placeholder="Ej: Daniel"
                  style={{ width: '100%', padding: '12px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 16 }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 4 }}>EDAD</label>
                  <input 
                    type="number"
                    value={newPatient.age}
                    onChange={e => setNewPatient({ ...newPatient, age: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '12px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 16 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 4 }}>AVATAR</label>
                  <select 
                    value={newPatient.avatar}
                    onChange={e => setNewPatient({ ...newPatient, avatar: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 16 }}
                  >
                    <option value="👤">👤 Niño</option>
                    <option value="👧">👧 Niña</option>
                    <option value="🐱">🐱 Gato</option>
                    <option value="🐉">🐉 Dragón</option>
                    <option value="🦁">🦁 León</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button 
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: '#F3F4F6', color: C.muted, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddPatient}
                  style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: C.indigo, color: 'white', fontWeight: 800, cursor: 'pointer' }}
                >
                  Guardar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
