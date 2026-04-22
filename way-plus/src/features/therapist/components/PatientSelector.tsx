import React from 'react';
import { motion } from 'framer-motion';
import { useTherapistStore } from '../store/therapistStore';
import { Plus } from 'lucide-react';

export const PatientSelector: React.FC = () => {
  const { patients, selectedPatientId, selectPatient } = useTherapistStore();

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {patients.map((patient) => (
        <motion.button
          key={patient.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => selectPatient(patient.id)}
          className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] font-black whitespace-nowrap shadow-xl border-4 transition-all duration-300
            ${selectedPatientId === patient.id 
              ? 'bg-primary-600 text-white border-primary-400 shadow-primary-200 scale-105' 
              : 'bg-white text-slate-600 border-slate-100 hover:border-primary-200'
            }`}
        >
          <span className="text-3xl filter drop-shadow-sm">{patient.avatar}</span>
          <div className="text-left">
            <div className="text-base uppercase tracking-tight">{patient.name}</div>
            <div className="text-xs font-bold opacity-70">{patient.age} años • {patient.diagnosis}</div>
          </div>
        </motion.button>
      ))}
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-3 px-8 py-4 rounded-[1.5rem] border-4 border-dashed border-slate-200 text-slate-400 font-black uppercase tracking-widest text-xs hover:border-primary-300 hover:text-primary-500 transition-all bg-white/50"
      >
        <Plus size={20} />
        <span>Añadir</span>
      </motion.button>
    </div>
  );
};
