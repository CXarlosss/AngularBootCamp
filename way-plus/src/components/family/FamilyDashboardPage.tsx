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
      console.log("FAMILY DASHBOARD DATA:", dashboard);
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50 font-[Verdana]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-4xl mb-4">🌟</motion.div>
      <div className="text-orange-600 font-bold">Cargando el progreso...</div>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-rose-50 font-[Verdana] p-6 text-center">
      <div className="text-6xl mb-4">😥</div>
      <div className="text-rose-600 font-bold text-lg">{error}</div>
    </div>
  );
  if (!data) return null;

  const pctSemana = Math.min(100, Math.round((data.ways_this_week / 15) * 100)); // Suponiendo un objetivo de 15 a la semana

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: 'Verdana, sans-serif', backgroundColor: '#FFF7ED' }}>
      
      {/* Background Warm Blobs */}
      <div className="fixed inset-0 pointer-events-none opacity-60 z-0">
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-yellow-200/50 rounded-full blur-[80px]" 
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 -left-20 w-[500px] h-[500px] bg-orange-200/40 rounded-full blur-[100px]" 
        />
      </div>

      <div className="relative z-10 p-4 sm:p-6 max-w-[600px] mx-auto pb-24 flex flex-col gap-6">
        
        {/* Toast Animado */}
        <AnimatePresence>
          {toast.isVisible && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="fixed top-5 left-5 right-5 z-[1000] bg-emerald-500 text-white p-4 rounded-2xl shadow-xl font-bold text-center border-2 border-emerald-400"
            >
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Familiar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="header-family"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl">✨</div>
          <div className="absolute bottom-0 left-0 p-4 opacity-20 text-6xl">🎈</div>
          
          <motion.div 
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-7xl mb-4 drop-shadow-md relative z-10"
          >
            {data.avatar_emoji}
          </motion.div>
          <h1 className="m-0 text-3xl text-amber-900 font-black tracking-tight relative z-10">
            ¡Hola, familia! 👋
          </h1>
          <p className="text-amber-700/80 text-sm mt-2 font-bold uppercase tracking-wider relative z-10">
            Así va el progreso de {data.patient_name}
          </p>
        </motion.div>

        {/* Celebración de Semana (Simple y positiva) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-family rounded-[32px] p-8 text-center"
        >
          <h2 className="text-xl font-black text-slate-800 mb-6 leading-tight">
            ¡{data.patient_name} ha completado <span className="text-amber-500">{data.ways_this_week} retos</span> esta semana! 🌟
          </h2>
          
          <div className="progress-family-bar">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctSemana}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
              className="progress-family-fill"
            />
          </div>
          
          <div className="flex justify-between items-center mt-3 text-xs font-bold text-amber-600/70 uppercase tracking-wide">
            <span>Inicio de semana</span>
            <span>¡Sigue así!</span>
          </div>
        </motion.div>

        {/* Logros Recientes */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4 opacity-80">
            <div className="flex-1 h-0.5 bg-orange-200/50 rounded-full" />
            <h3 className="text-xs font-black text-orange-800 uppercase tracking-widest m-0">Sus Logros</h3>
            <div className="flex-1 h-0.5 bg-orange-200/50 rounded-full" />
          </div>
          
          <div className="glass-family rounded-[24px] p-5 flex flex-wrap gap-3 justify-center">
            <div className="achievement-pill">
              <span className="text-xl">🏆</span> {data.ways_this_week >= 5 ? '¡Racha Imparable!' : 'Aventurero Constante'}
            </div>
            <div className="achievement-pill">
              <span className="text-xl">🐉</span> Nuevo Amigo
            </div>
          </div>
        </motion.div>

        {/* Tareas / Misiones */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4 opacity-80">
            <div className="flex-1 h-0.5 bg-orange-200/50 rounded-full" />
            <h3 className="text-xs font-black text-orange-800 uppercase tracking-widest m-0">Misiones para casa</h3>
            <div className="flex-1 h-0.5 bg-orange-200/50 rounded-full" />
          </div>
          
          <div className="flex flex-col gap-4">
            {data.homework_list.length === 0 && (
              <div className="glass-family rounded-[24px] p-8 text-center text-slate-500 font-bold">
                <span className="text-4xl block mb-3 opacity-50">✨</span>
                No hay misiones pendientes por ahora.<br/>¡A descansar!
              </div>
            )}
            
            {data.homework_list.map((hw, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (idx * 0.1) }}
                key={hw.way_id}
                className={`hw-card ${hw.completed ? 'hw-card--completed' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`text-4xl p-2 rounded-2xl ${hw.completed ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                    {hw.completed ? '✅' : '🏠'}
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-black text-[17px] text-slate-800 m-0 leading-tight">
                      {hw.way_title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1.5 font-bold uppercase tracking-wider">
                      Misión recomendada
                    </p>
                  </div>
                </div>
                
                {!hw.completed && (
                  <button
                    onClick={() => handleRemind(hw.way_title)}
                    className="btn-remind mt-2"
                  >
                    <span className="text-xl">🔔</span> Recordar a {data.patient_name}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

