import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { FamilyDashboardData, HomeworkStatus } from '@/types/familyHub';
import { validateFamilyToken, getFamilyDashboard, subscribeToHomeworkCompletions } from '@/services/familyHubService';
import { motion } from 'framer-motion';

export function FamilyDashboardPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<FamilyDashboardData | null>(null);
  const [homeworks, setHomeworks] = useState<HomeworkStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    
    validateFamilyToken(token)
      .then(({ patient_id }) => loadDashboard(patient_id))
      .catch(err => {
        setError('Este enlace ha expirado o no es válido. Contacta a Maite.');
        setLoading(false);
      });
  }, [token]);

  async function loadDashboard(patientId: string) {
    try {
      const dashboard = await getFamilyDashboard(patientId);
      setData(dashboard);
      
      // Cargar homeworks (necesitarías un join adicional o service separado)
      // Por ahora, mock básico:
      setHomeworks([
        { way_id: 'way-1', way_title: 'Respiro con el globo', module: 'Relajación', completed: true },
        { way_id: 'way-2', way_title: 'Elijo mi desayuno', module: 'Autonomía', completed: false },
      ]);
      
      setLoading(false);
      
      // Suscripción a notificaciones
      const unsubscribe = subscribeToHomeworkCompletions(patientId, (wayId, title) => {
        // Mostrar toast o badge
        alert(`¡${dashboard.patient_name || 'Tu hijo'} completó: ${title}!`);
      });
      
      return () => unsubscribe();
    } catch (err) {
      setError('Error cargando el dashboard');
      setLoading(false);
    }
  }

  if (loading) return <div style={centerStyle}>Cargando...</div>;
  if (error) return <div style={{ ...centerStyle, color: '#e53935' }}>{error}</div>;
  if (!data) return null;

  return (
    <div style={{ fontFamily: 'Verdana, Geneva, Tahoma, sans-serif', padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '64px', marginBottom: '8px' }}>{data.avatar_emoji}</div>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#1a1a1a' }}>
          Progreso de {data.patient_name}
        </h1>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>
          {data.gender === 'femenino' ? 'Campeona' : 'Campeón'} del WAY+
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Ways completados" value={`${data.completed_ways_count}/57`} color="#4A90D9" />
        <StatCard label="WayCoins" value={data.coins} color="#FFD700" />
        <StatCard label="Nivel" value={data.current_level} color="#7B68EE" />
        <StatCard label="Avatar" value={`${data.avatar_progress_percent}%`} color="#43a047" />
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          <span>Progreso total</span>
          <span>{data.avatar_progress_percent}%</span>
        </div>
        <div style={{ height: '24px', backgroundColor: '#eee', borderRadius: '12px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.avatar_progress_percent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ height: '100%', backgroundColor: '#4A90D9', borderRadius: '12px' }}
          />
        </div>
      </div>

      {/* Homework Tracker */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>📝 Tareas de esta semana</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {homeworks.map(hw => (
            <div
              key={hw.way_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                borderRadius: '14px',
                border: '2px solid',
                borderColor: hw.completed ? '#4caf50' : '#ffc107',
                backgroundColor: hw.completed ? '#e8f5e9' : '#fff8e1',
              }}
            >
              <span style={{ fontSize: '32px' }}>{hw.completed ? '✅' : '⏳'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#333' }}>{hw.way_title}</div>
                <div style={{ fontSize: '13px', color: '#666' }}>{hw.module}</div>
              </div>
              <span style={{
                fontSize: '13px',
                fontWeight: 'bold',
                color: hw.completed ? '#2e7d32' : '#f57f17',
                textTransform: 'uppercase',
              }}>
                {hw.completed ? 'Hecho' : 'Pendiente'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px', color: '#999', fontSize: '12px' }}>
        WAY+ Centro Clínico • Datos actualizados en tiempo real<br/>
        <a href="#" style={{ color: '#4A90D9' }}>¿Necesitas ayuda? Contacta a Maite</a>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{
      padding: '20px',
      borderRadius: '16px',
      backgroundColor: '#fff',
      border: '3px solid #eee',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '13px', color: '#666', fontWeight: 'bold' }}>{label}</div>
    </div>
  );
}

const centerStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  height: '100vh', fontFamily: 'Verdana', fontSize: '18px',
};
