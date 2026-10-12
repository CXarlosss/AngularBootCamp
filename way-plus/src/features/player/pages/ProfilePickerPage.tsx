/**
 * ═══════════════════════════════════════════════════════════════
 * ProfilePickerPage v2 — Responsive, sin textos desproporcionados
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { hapticService } from '@/core/services/hapticService';
import { useReduceMotion } from '@/core/stores/configStore';

interface Profile {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
}

interface Props {
  profiles?: Profile[];
  onSelectProfile?: (profile: Profile) => void;
  onAddProfile?: () => void;
}

const defaultProfiles: Profile[] = [
  { id: '1', name: 'Lucas', avatar: '🧒', color: 'bg-blue-100 border-blue-300 text-blue-700' },
  { id: '2', name: 'Sofía', avatar: '👧', color: 'bg-pink-100 border-pink-300 text-pink-700' },
];

export const ProfilePickerPage: React.FC<Props> = ({
  profiles = defaultProfiles,
  onSelectProfile,
  onAddProfile,
}) => {
  const navigate = useNavigate();
  const reduceMotion = useReduceMotion();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  const handleSelect = useCallback(
    (profile: Profile) => {
      if (isExiting) return;
      setSelectedId(profile.id);
      hapticService.success();

      setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          onSelectProfile?.(profile);
        }, 300);
      }, 400);
    },
    [isExiting, onSelectProfile]
  );

  const handleAdd = useCallback(() => {
    hapticService.click();
    onAddProfile?.();
  }, [onAddProfile]);

  const handleBack = useCallback(() => {
    hapticService.click();
    navigate(-1);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* ─── Header ─── */}
      <header className="border-b border-slate-100 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={handleBack}
            className="self-start rounded-lg px-3 py-2 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
          >
            ← Volver
          </button>
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
            ¿Quién eres hoy?
          </h1>
          <div className="hidden sm:block" /> {/* Spacer para centrar en desktop */}
        </div>
      </header>

      {/* ─── Grid de perfiles ─── */}
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Perfiles existentes */}
            {profiles.map((profile, index) => (
              <motion.button
                key={profile.id}
                initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
                onClick={() => handleSelect(profile)}
                disabled={isExiting}
                className={`
                  group relative flex flex-col items-center justify-center gap-3
                  rounded-2xl border-2 p-6 transition-all
                  sm:min-h-[200px] sm:p-8
                  ${
                    selectedId === profile.id
                      ? 'border-indigo-400 bg-indigo-50 shadow-lg scale-[1.02]'
                      : 'border-slate-200 bg-white shadow-sm hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-md active:scale-[0.98]'
                  }
                  ${isExiting && selectedId !== profile.id ? 'opacity-40' : ''}
                `}
              >
                {/* Avatar */}
                <div
                  className={`
                    flex h-16 w-16 items-center justify-center rounded-2xl text-3xl
                    border-2 shadow-sm transition-transform group-hover:scale-105
                    sm:h-20 sm:w-20 sm:text-4xl
                    ${profile.color || 'bg-slate-100 border-slate-200 text-slate-600'}
                  `}
                >
                  {profile.avatar || '👤'}
                </div>

                {/* Nombre */}
                <span className="text-lg font-black text-slate-900 sm:text-xl">
                  {profile.name}
                </span>

                {/* Indicador de selección */}
                <AnimatePresence>
                  {selectedId === profile.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs text-white shadow-sm"
                    >
                      ✓
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}

            {/* Botón "Añadir" con efecto 3D que escala */}
            <motion.button
              initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: profiles.length * 0.08, duration: 0.35 }}
              onClick={handleAdd}
              className="group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 transition-all hover:border-indigo-300 hover:bg-indigo-50/30 active:scale-[0.98] sm:min-h-[200px] sm:p-8"
            >
              {/* Icono + con "efecto 3D" sutil que escala */}
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl font-black text-indigo-600 shadow-[0_4px_0_0_rgb(99,102,241,0.3)] transition-all group-hover:shadow-[0_6px_0_0_rgb(99,102,241,0.4)] group-active:shadow-[0_2px_0_0_rgb(99,102,241,0.3)] group-active:translate-y-[2px] sm:h-20 sm:w-20 sm:text-4xl">
                +
              </div>
              <span className="text-sm font-bold text-slate-500">Añadir perfil</span>
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePickerPage;
