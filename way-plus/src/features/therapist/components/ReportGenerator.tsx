import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Loader2 } from 'lucide-react';
import { useTherapistStore } from '../store/therapistStore';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { generateWAYReport } from '../utils/pdfGenerator';

export const ReportGenerator: React.FC = () => {
  const [generating, setGenerating] = useState(false);
  const { selectedPatientId, patients } = useTherapistStore();
  const { profile, relaxationLog = {}, roleplayLog = {}, weeklyCheck = {} } = usePlayerStore();
  const { streakDays, totalXp, purchaseHistory, wayCoins } = useRewardsStore();

  const patient = patients.find(p => p.id === selectedPatientId);
  if (!patient) return null;

  const handleGenerate = async () => {
    setGenerating(true);
    
    try {
      // Calcular métricas reales
      const completedWays = profile?.completedWays || [];
      const relaxationCount = Object.values(relaxationLog).filter(r => r.completed).length;
      const roleplayCount = Object.keys(roleplayLog).length;
      
      // Simulación de gasto para el ratio
      const totalSpent = purchaseHistory.length * 50; 
      const savingRatio = wayCoins / (totalSpent + wayCoins || 1);
      
      const profileName = savingRatio > 0.7 ? 'Planificador Estratégico' 
        : savingRatio > 0.4 ? 'Perfil Equilibrado' 
        : 'Impulsividad de Recompensa';

      // Datos semanales
      const weeklyData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        return {
          day: d.toLocaleDateString('es', { weekday: 'short' }),
          relaxation: !!relaxationLog[dateStr]?.completed,
          roleplay: !!(roleplayLog[dateStr]?.length > 0),
          selfcheck: Object.entries(weeklyCheck).filter(([k]) => k.endsWith(dateStr)).some(([, v]) => v),
        };
      });

      await generateWAYReport({
        patient,
        dateRange: 'Últimos 14 días',
        completedWays: completedWays.length,
        totalWays: 55, // Total estimado del nivel
        relaxationSessions: relaxationCount,
        roleplaySessions: roleplayCount,
        streakDays,
        totalXp,
        economicProfile: profileName,
        savingRatio,
        alerts: [
          { 
            title: 'Relajación', 
            message: relaxationCount < 3 ? 'Se observa baja adherencia a las técnicas de calma fuera de sesión.' : 'Excelente constancia en las técnicas de regulación emocional.', 
            type: relaxationCount < 3 ? 'warning' : 'success' 
          },
          { 
            title: 'Impulsividad', 
            message: savingRatio < 0.3 ? 'Tendencia a la gratificación inmediata. Trabajar demora de refuerzo.' : 'Buena capacidad de planificación y ahorro motivacional.', 
            type: savingRatio < 0.3 ? 'warning' : 'success' 
          },
        ],
        weeklyData,
        wayBreakdown: [
          { category: 'Relajación', count: completedWays.filter(id => id.includes('relax')).length },
          { category: 'Autonomía', count: completedWays.filter(id => id.includes('autonomy')).length },
          { category: 'Asertividad', count: completedWays.filter(id => id.includes('assertive')).length },
        ],
      });
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleGenerate}
      disabled={generating}
      className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg
        ${generating 
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
          : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-indigo-100'
        }`}
    >
      {generating ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          <span>Generando...</span>
        </>
      ) : (
        <>
          <FileText size={20} />
          <span>Generar Informe Clínico</span>
        </>
      )}
    </motion.button>
  );
};
