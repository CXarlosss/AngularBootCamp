import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { patientService, type PatientProfile } from '@/core/services/patientService';
import { audioService } from '@/core/utils/audioService';

export function ProfilePickerPage() {
  const [profiles, setProfiles] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await patientService.getAll();
        if (data && data.length > 0) {
          setProfiles(data);
        } else {
          // Si no hay perfiles o Supabase falla (data []), vamos a local
          console.log('[ProfilePicker] No profiles found or Supabase unavailable. Falling back to local mode.');
          navigate('/');
        }
      } catch (err) {
        console.error('[ProfilePicker] Load failed, falling back to local mode:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  const handleSelect = (profile: PatientProfile) => {
    audioService.playSFX('click');
    // Guardamos el ID del paciente activo para el SyncEngine
    sessionStorage.setItem('way-active-patient', profile.id);
    // Redirigimos a la bienvenida del niño
    navigate('/player');
  };

  const getAvatarUrl = (avatarId: string) => {
    // Fallback por si no existen las imágenes reales todavía
    return `/assets/avatars/${avatarId}.png`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-8 flex flex-col items-center">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl flex justify-between items-center mb-16"
      >
        <button 
          onClick={() => navigate('/')}
          className="p-4 bg-white rounded-2xl shadow-sm text-indigo-600 font-bold hover:bg-indigo-50 transition-colors"
        >
          ← Volver
        </button>
        <h1 className="text-4xl font-black text-[#1E1B4B]">¿Quién eres hoy?</h1>
        <div className="w-24" /> {/* Spacer */}
      </motion.header>

      <div className="w-full max-w-5xl">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-20"
            >
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8"
            >
              {profiles.map((profile, idx) => (
                <motion.button
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelect(profile)}
                  className="group flex flex-col items-center p-6 bg-white rounded-[40px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-20px_rgba(79,70,229,0.15)] transition-all"
                >
                  <div className="w-32 h-32 mb-6 rounded-full bg-indigo-50 flex items-center justify-center overflow-hidden border-4 border-transparent group-hover:border-indigo-200 transition-all">
                    <img 
                      src={getAvatarUrl(profile.avatar)} 
                      alt={profile.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/bottts/svg?seed=" + profile.name;
                      }}
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                  <span className="text-2xl font-black text-[#1E1B4B] group-hover:text-indigo-600 transition-colors uppercase">
                    {profile.name}
                  </span>
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-sm font-bold text-amber-500">🪙 {profile.coins}</span>
                  </div>
                </motion.button>
              ))}

              {/* Botón Añadir (Demo) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth')} // Por ahora mandamos a auth para crear niño
                className="flex flex-col items-center justify-center p-6 bg-dashed border-4 border-dashed border-indigo-200 rounded-[40px] hover:border-indigo-400 hover:bg-indigo-50 transition-all text-indigo-400"
              >
                <div className="text-6xl mb-4">+</div>
                <span className="text-xl font-bold uppercase">Añadir</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-20">
        <p className="text-indigo-300 font-bold tracking-widest text-xs uppercase">Protegiendo la aventura de cada niño</p>
      </footer>
    </div>
  );
}
