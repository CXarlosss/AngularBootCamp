import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useKioskStore } from '@/features/kiosk/store/kioskStore';
import { ShieldCheck, Lock, Smartphone, Monitor } from 'lucide-react';

export const KioskConfigPanel: React.FC = () => {
  const { pin, setPin, lock } = useKioskStore();
  const [newPin, setNewPin] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    if (newPin.length === 4) {
      setPin(newPin);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setNewPin('');
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border-4 border-slate-50 font-outfit">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Modo Kiosko</h3>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Seguridad de la Estación</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
            PIN de salida (Actual: {pin})
          </label>
          <div className="flex gap-3">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="flex-1 px-5 py-4 rounded-2xl border-4 border-slate-50 focus:border-indigo-100 focus:outline-none text-center text-2xl font-black tracking-[0.5em] text-slate-700 bg-slate-50/50"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={newPin.length !== 4}
              className="px-8 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:bg-slate-200 transition-all shadow-lg shadow-indigo-100 border-b-4 border-indigo-900/20"
            >
              Guardar
            </motion.button>
          </div>
        </div>

        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-xs font-black text-center border-2 border-emerald-100"
          >
            ✅ PIN actualizado correctamente
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FeatureItem icon={<Monitor size={14} />} label="Fullscreen" />
          <FeatureItem icon={<Smartphone size={14} />} label="Orientation" />
          <FeatureItem icon={<Lock size={14} />} label="No-Gestures" />
          <FeatureItem icon={<ShieldCheck size={14} />} label="Wake-Lock" />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={lock}
          className="w-full py-5 bg-rose-50 text-rose-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-100 transition-all border-2 border-rose-100 shadow-lg shadow-rose-100/20"
        >
          🚀 Activar Modo Seguro
        </motion.button>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, label }: any) => (
  <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
    <div className="text-indigo-400">{icon}</div>
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{label}</span>
  </div>
);
