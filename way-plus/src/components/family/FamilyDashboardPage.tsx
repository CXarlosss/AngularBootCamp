import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { FamilyDashboardData } from '@/types/familyHub';
import { validateFamilyToken, getFamilyDashboard, subscribeToHomeworkCompletions } from '@/services/familyHubService';
import { motion, AnimatePresence } from 'framer-motion';

export function FamilyDashboardPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<FamilyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{message: string, isVisible: boolean}>({ message: '', isVisible: false });

  async function loadDashboard(patientId: string) {
    try {
      const dashboard = await getFamilyDashboard(patientId);
      setData(dashboard);
      setLoading(false);
      
      const unsubscribe = subscribeToHomeworkCompletions(patientId, (wayId, title) => {
        setToast({ message: `¡${dashboard.patient_name || 'Tu hijo'} acaba de completar: ${title}! 🎉`, isVisible: true });
        setTimeout(() => setToast({ message: '', isVisible: false }), 5000);
        // Recargar datos suavemente
        getFamilyDashboard(patientId).then(setData);
      });
      
      return () => unsubscribe();
    } catch {
      setError('Error cargando el dashboard');
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    
    validateFamilyToken(token)
      .then(({ patient_id }) => loadDashboard(patient_id))
      .catch(() => {
        setError('Este enlace ha expirado o no es válido. Contacta a Maite.');
        setLoading(false);
      });
  }, [token]);

  const handleRemind = (wayTitle: string) => {
    if (!data) return;
    const text = `¡Hola! 👋 Solo un recordatorio amigable para que ${data.patient_name} haga su misión de hoy: "${wayTitle}". ¡Tú puedes, campeón/a! 🌟`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) return <div style={centerStyle}>Cargando progreso de WAY+...</div>;
  if (error) return <div style={{ ...centerStyle, color: '#e53935' }}>{error}</div>;
  if (!data) return null;

  const pctSemana = Math.min(100, Math.round((data.ways_this_week / 15) * 100)); // Suponiendo un objetivo de 15 a la semana

  return (
    <div style={{ fontFamily: 'Verdana, sans-serif', padding: '16px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#F8FAFF', minHeight: '100vh' }}>
      
      {/* Toast Animado */}
      <AnimatePresence>
        {toast.isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{ position: 'fixed', top: 20, left: 20, right: 20, backgroundColor: '#10B981', color: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, fontWeight: 'bold', textAlign: 'center' }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '24px', textAlign: 'center', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ fontSize: '64px', marginBottom: '8px' }}>{data.avatar_emoji}</div>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#1E1B4B', fontWeight: 900 }}>
          Progreso de {data.patient_name}
        </h1>
        <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '4px', fontWeight: 'bold' }}>
          🏫 WAY+ Centro Clínico
        </p>
      </div>

      {/* Celebración de Semana */}
      <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '24px', marginBottom: '20px', border: '2px solid #E0E7FF' }}>
        <div style={{ fontSize: '18px', fontWeight: 900, color: '#1E1B4B', marginBottom: '16px', textAlign: 'center' }}>
          😄 {data.patient_name} ha completado <span style={{ color: '#4F46E5' }}>{data.ways_this_week} retos</span> esta semana
        </div>
        <div style={{ height: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pctSemana}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ height: '100%', backgroundColor: '#4F46E5', borderRadius: '8px' }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
        <StatCard label="Retos semana" value={data.ways_this_week} color="#4F46E5" />
        <StatCard label="Min semana" value={data.minutes_this_week} color="#10B981" />
        <StatCard label="Días activo" value={data.days_active_this_week} color="#F59E0B" />
      </div>

      {/* Homework Tracker */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '2px', backgroundColor: '#E5E7EB' }} />
          <h2 style={{ fontSize: '14px', margin: 0, color: '#6B7280', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Tareas para casa</h2>
          <div style={{ flex: 1, height: '2px', backgroundColor: '#E5E7EB' }} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.homework_list.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280', backgroundColor: 'white', borderRadius: '16px' }}>No hay tareas asignadas por Maite ahora mismo.</div>
          )}
          {data.homework_list.map(hw => (
            <div
              key={hw.way_id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '20px',
                borderRadius: '20px',
                backgroundColor: 'white',
                border: '2px solid',
                borderColor: hw.completed ? '#10B981' : '#F59E0B',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ fontSize: '32px' }}>{hw.completed ? '✅' : '🏠'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900, fontSize: '16px', color: '#1E1B4B' }}>{hw.way_title}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', fontWeight: 'bold' }}>Asignado por Maite • {hw.module}</div>
                </div>
              </div>
              
              {!hw.completed && (
                <button
                  onClick={() => handleRemind(hw.way_title)}
                  style={{ width: '100%', padding: '12px', backgroundColor: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A', borderRadius: '12px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <span>🔔</span> Recordar a {data.patient_name}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Logros (Mocked since we don't have achievements system yet) */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '2px', backgroundColor: '#E5E7EB' }} />
          <h2 style={{ fontSize: '14px', margin: 0, color: '#6B7280', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Últimos logros</h2>
          <div style={{ flex: 1, height: '2px', backgroundColor: '#E5E7EB' }} />
        </div>
        
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '20px', border: '1.5px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontWeight: 'bold', color: '#1E1B4B' }}>
            <span style={{ fontSize: '24px' }}>🏆</span> {data.ways_this_week >= 5 ? '¡Racha de 5 retos superada!' : 'Comenzando la aventura'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold', color: '#1E1B4B' }}>
            <span style={{ fontSize: '24px' }}>🐉</span> Desbloqueó: Dragón Azul
          </div>
        </div>
      </div>

    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{
      padding: '16px 8px',
      borderRadius: '20px',
      backgroundColor: 'white',
      textAlign: 'center',
      border: '1.5px solid #F3F4F6',
      boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
    }}>
      <div style={{ fontSize: '28px', fontWeight: 900, color, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 800, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

const centerStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  height: '100vh', fontFamily: 'Verdana, sans-serif', fontSize: '16px', fontWeight: 'bold', color: '#4F46E5', backgroundColor: '#F8FAFF'
};
