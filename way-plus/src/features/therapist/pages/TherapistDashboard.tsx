import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTherapistStore } from '../store/therapistStore';
import { SoundToggle } from '@/core/components/SoundToggle';
import { SyncStatus } from '../components/SyncStatus';
import { SecurityGate } from '@/shared/components/SecurityGate';
import { patientService } from '@/core/services/patientService';
import { seedClinicalData } from '@/core/utils/seedData';
import { flushOfflineAnnexes } from '@/services/clinicalAnnexService';


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
  const { selectPatient, addPatient, patients, loadPatients } = useTherapistStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', age: 6, avatar: '👤' });
  
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthorized) {
      loadPatients();
      flushOfflineAnnexes().catch(console.error);
    }
  }, [isAuthorized, loadPatients]);

  if (!isAuthorized) {
    return (
      <SecurityGate 
        onSuccess={() => setIsAuthorized(true)}
        onCancel={() => navigate('/')}
        title="Panel de Maite"
      />
    );
  }

  const handleAddPatient = async () => {
    if (!newPatient.name || isCreating) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const created = await patientService.create({
        name: newPatient.name,
        age: newPatient.age,
        avatar: newPatient.avatar,
      });

      if (!created) throw new Error('No se pudo crear el paciente');

      // Añadir al store con el UUID real de Supabase
      addPatient({
        ...created,
        startDate: new Date().toISOString().split('T')[0],
        lastSession: new Date().toISOString().split('T')[0],
        objectives: [],
        sessionQueue: [],
      });

      setShowAddModal(false);
      setNewPatient({ name: '', age: 6, avatar: '👤' });

      // Navegar al paciente con su UUID real
      selectPatient(created.id);

    } catch (e) {
      console.error('[Dashboard] Error creating patient:', e);
      setCreateError('No se pudo guardar el paciente. Inténtalo de nuevo.');
    } finally {
      setIsCreating(false);
    }
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
          <button
            onClick={async () => {
              const res = await seedClinicalData();
              if (res.success) loadPatients();
            }}
            style={{
              background: '#F1F2FF', color: C.indigo, border: `1px solid ${C.indigo}`,
              padding: '6px 12px', borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer'
            }}
          >
            🌱 Seed Demo
          </button>
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
                <label htmlFor="patient-name" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 4 }}>NOMBRE</label>
                <input 
                  id="patient-name"
                  value={newPatient.name}
                  onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                  placeholder="Ej: Daniel"
                  style={{ width: '100%', padding: '12px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 16 }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label htmlFor="patient-age" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 4 }}>EDAD</label>
                  <input 
                    id="patient-age"
                    type="number"
                    value={newPatient.age}
                    onChange={e => setNewPatient({ ...newPatient, age: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '12px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 16 }}
                  />
                </div>
                <div>
                  <label htmlFor="patient-avatar" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 4 }}>AVATAR</label>
                  <select 
                    id="patient-avatar"
                    value={newPatient.avatar}
                    onChange={e => setNewPatient({ ...newPatient, avatar: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 16 }}
                  >
                    <option value="base-unicorn">🦄 Unicornio</option>
                    <option value="base-dragon">🐉 Dragón</option>
                    <option value="base-puppy">🐶 Perrito</option>
                    <option value="base-kitten">🐱 Gatito</option>
                  </select>
                </div>
              </div>
              {createError && (
                <div style={{
                  padding: '8px 12px', borderRadius: 10,
                  background: '#FEE2E2', color: '#F43F5E',
                  fontSize: 12, fontWeight: 600,
                }}>
                  {createError}
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button 
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: '#F3F4F6', color: C.muted, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddPatient}
                  disabled={isCreating || !newPatient.name}
                  style={{ 
                    flex: 1, padding: '14px', borderRadius: 14, border: 'none', 
                    background: C.indigo, color: 'white', fontWeight: 800, 
                    opacity: (isCreating || !newPatient.name) ? 0.6 : 1,
                    cursor: (isCreating || !newPatient.name) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isCreating ? '⏳ Guardando…' : 'Añadir Paciente'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
