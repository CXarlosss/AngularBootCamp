import React from 'react';
import { motion } from 'framer-motion';
import { PatientSelector } from '../components/PatientSelector';
import { EconomicBehavior } from '../components/EconomicBehavior';
import { AnnexCompliance } from '../components/AnnexCompliance';
import { ProgressTimeline } from '../components/ProgressTimeline';
import { AlertPanel } from '../components/AlertPanel';
import { ReportGenerator } from '../components/ReportGenerator';
import { useNavigate } from 'react-router-dom';
import { useTherapistStore } from '../store/therapistStore';
import { FileText, Settings, Share2, BrainCircuit, Edit3 } from 'lucide-react';
import { SyncStatus } from '../components/SyncStatus';
import { KioskConfigPanel } from '../components/KioskConfigPanel';

export const TherapistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { selectedPatientId, patients } = useTherapistStore();
  const patient = patients.find(p => p.id === selectedPatientId);

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-3 bg-indigo-600 text-white px-4 py-1.5 rounded-full w-fit text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100">
              <BrainCircuit size={14} /> Sistema de Inteligencia Terapéutica
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Dashboard WAY+</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
              Seguimiento Clínico Especializado • {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <SyncStatus />
            <PatientSelector />
          </div>
        </header>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Visualizations (Left 2/3) */}
          <div className="lg:col-span-8 space-y-10">
            <ProgressTimeline />
            <EconomicBehavior />
            <AnnexCompliance />
          </div>

          {/* Sidebar Info (Right 1/3) */}
          <div className="lg:col-span-4 space-y-10">
            <div className="sticky top-12 space-y-10">
              
              {/* Active Patient Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[3rem] p-10 shadow-2xl border-4 border-white text-center relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent" />
                <div className="relative z-10">
                  <div className="text-[6rem] mb-6 filter drop-shadow-xl group-hover:scale-110 transition-transform duration-500">
                    {patient.avatar}
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">{patient.name}</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
                    {patient.age} años • {patient.diagnosis}
                  </p>
                  
                  <div className="mt-8 flex flex-wrap justify-center gap-2">
                    <StatusBadge label={patient.currentLevel} color="indigo" />
                    <StatusBadge label="Activo hoy" color="emerald" />
                  </div>
                  
                  <div className="mt-10 pt-10 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div className="text-left">
                      <span className="text-[10px] font-black text-slate-300 uppercase block">Inicio</span>
                      <span className="text-sm font-bold text-slate-600">{new Date(patient.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-300 uppercase block">Última Sesión</span>
                      <span className="text-sm font-bold text-slate-600">{new Date(patient.lastSession).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Clinical Alerts */}
              <AlertPanel />

              {/* Kiosk Management */}
              <KioskConfigPanel />
              
              {/* Quick Actions */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl text-white">
                <h3 className="text-xl font-black mb-6 uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                  <Settings size={20} /> Acciones
                </h3>
                <div className="space-y-3">
                  <ReportGenerator />
                  <ActionButton 
                    icon={<Edit3 size={18} />} 
                    label="Crear Nuevo Way" 
                    onClick={() => navigate('/editor')}
                  />
                  <ActionButton icon={<BrainCircuit size={18} />} label="Ajustar Dificultad IA" />
                  <ActionButton icon={<Share2 size={18} />} label="Compartir con Familia" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ label, color }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-600 text-white shadow-lg shadow-indigo-100',
    emerald: 'bg-emerald-500 text-white shadow-lg shadow-emerald-100',
  };
  return (
    <span className={`${colors[color]} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest`}>
      {label}
    </span>
  );
};

const ActionButton = ({ icon, label, onClick }: any) => (
  <motion.button
    whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.1)' }}
    onClick={onClick}
    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 transition-colors text-left"
  >
    <div className="text-indigo-400">{icon}</div>
    <span className="text-sm font-bold uppercase tracking-tight">{label}</span>
  </motion.button>
);
