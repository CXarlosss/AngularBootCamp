import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, PlaneTakeoff } from 'lucide-react';

interface Task {
  id: string;
  label: string;
  icon: string;
}

const TASKS: Task[] = [
  { id: 'hydration', label: 'He bebido agua', icon: '💧' },
  { id: 'bathroom', label: 'He ido al baño', icon: '🚽' },
  { id: 'posture', label: 'Estoy bien sentado', icon: '🪑' },
  { id: 'environment', label: 'Hay silencio fuera', icon: '🤫' },
];

export const PreFlightChecklist: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const toggleTask = (id: string) => {
    const newSet = new Set(completed);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setCompleted(newSet);

    if (newSet.size === TASKS.length) {
      onComplete();
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
        <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
          <PlaneTakeoff size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-800">Checklist Pre-Vuelo</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Preparación para la misión</p>
        </div>
      </div>

      <div className="space-y-3">
        {TASKS.map((task) => {
          const isDone = completed.has(task.id);
          return (
            <motion.button
              key={task.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleTask(task.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
                ${isDone 
                  ? 'bg-primary-50 border-primary-200 text-primary-700' 
                  : 'bg-slate-50 border-transparent text-slate-600 hover:border-slate-200'}
              `}
            >
              <div className="text-2xl">{task.icon}</div>
              <span className="flex-1 text-left font-black text-sm uppercase tracking-tight">{task.label}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all
                ${isDone ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-slate-200 text-transparent'}
              `}>
                <Check size={20} strokeWidth={4} />
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {completed.size === TASKS.length && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl text-emerald-700 border border-emerald-100"
          >
            <Info size={20} />
            <span className="text-xs font-bold">¡Todo listo! El temporizador está desbloqueado.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
