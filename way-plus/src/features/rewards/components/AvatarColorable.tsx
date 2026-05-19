import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { registry } from '@/content/registry';

const AVATAR_IMAGES: Record<string, string> = {
  'base-unicorn': '/assets/avatars/base-unicorn.png',
  'base-dragon': '/assets/avatars/base-dragon.png',
  'base-puppy': '/assets/avatars/base-puppy.png',
  'base-kitten': '/assets/avatars/base-kitten.png',
  'base-fox': '/assets/avatars/base-puppy.png', // Fallback for new bases
  'base-panda': '/assets/avatars/base-puppy.png',
  'base-robot': '/assets/avatars/base-puppy.png',
  'base-alien': '/assets/avatars/base-dragon.png',
};

const ZONE_COLORS = {
  relaxation: '#6366f1',
  autonomy: '#10b981',
  assertiveness: '#f59e0b',
};

export function AvatarColorable() {
  const { currentAvatar, inventory } = useRewardsStore();
  const completedWays = usePlayerStore(s => s.profile?.completedWays ?? []);
  const patientName = usePlayerStore(s => s.profile?.name ?? 'Gamer');

  const allWays = useMemo(() => registry.getAllWays(), []);
  const totalWays = allWays.length || 57; // Fallback to 57 if registry empty
  const completed = completedWays.length;
  const percentage = Math.min(100, Math.round((completed / totalWays) * 100));

  // Obtener icono de la mascota equipada
  const equippedPet = useMemo(() => {
    const petId = currentAvatar.pet;
    if (!petId || petId === 'pet-none') return null;
    return inventory.find(i => i.id === petId);
  }, [currentAvatar.pet, inventory]);

  const avatarImg = AVATAR_IMAGES[currentAvatar.base] || AVATAR_IMAGES['base-unicorn'];

  return (
    <div className="w-full flex flex-col items-center" style={{ fontFamily: 'Verdana, sans-serif' }}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-slate-800 mb-1">
          ¡Hola, {patientName}! ✨
        </h2>
        <div className="flex items-center justify-center gap-2">
          <div className="px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
              Nivel de Energía: {percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Escena del Avatar */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        
        {/* Aura de Progreso Circular */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
          <circle
            cx="128" cy="128" r="120"
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="8"
          />
          <motion.circle
            cx="128" cy="128" r="120"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            initial={{ strokeDasharray: "0 1000" }}
            animate={{ strokeDasharray: `${(percentage / 100) * 754} 1000` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>

        {/* Fondo del Avatar (Círculo Interior) */}
        <div className="absolute inset-4 rounded-full bg-white shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)] border-4 border-white overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(#6366F1 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
        </div>

        {/* Imagen del Avatar */}
        <div className="relative w-48 h-48">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentAvatar.base}
              src={avatarImg}
              alt="Avatar"
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            />
          </AnimatePresence>

          {/* Accesorios Flotantes (Emojis) */}
          <AnimatePresence>
            {equippedPet && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute -right-4 bottom-4 w-14 h-14 bg-white rounded-2xl shadow-lg border-2 border-indigo-100 flex items-center justify-center text-3xl z-20"
              >
                {equippedPet.icon}
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-1 -right-1 text-[10px]"
                >
                  ✨
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Partículas de Éxito */}
        {percentage === 100 && (
          <div className="absolute inset-0 pointer-events-none">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-dashed border-amber-300/30 rounded-full"
            />
          </div>
        )}
      </div>

      {/* Info de Progreso */}
      <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-sm">
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="text-indigo-600 font-black text-lg">{completed}</div>
          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Retos</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="text-amber-500 font-black text-lg">{percentage}%</div>
          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Energía</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="text-emerald-500 font-black text-lg">
            {currentAvatar.pet !== 'pet-none' ? 'SÍ' : 'NO'}
          </div>
          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Mascota</div>
        </div>
      </div>
    </div>
  );
}

