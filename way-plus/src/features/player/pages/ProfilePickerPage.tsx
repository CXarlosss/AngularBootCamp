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
          navigate('/');
        }
      } catch (err) {
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  const handleSelect = (profile: PatientProfile) => {
    audioService.playSFX('click');
    sessionStorage.setItem('way-active-patient', profile.id);
    navigate('/player');
  };

  const getAvatarUrl = (avatarId: string) => {
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
          onPointerDown={() => navigate('/')}
          className="p-4 bg-white rounded-2xl shadow-sm text-indigo-600 font-bold text-xl hover:bg-indigo-50 active:scale-95 transition-all touch-manipulation"
        >
          ← Volver
        </button>
        <h1 className="text-5xl font-black text-[#1E1B4B] uppercase tracking-wide">¿Quién eres hoy?</h1>
        <div className="w-24" />
      </motion.header>

      <div className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-20"
            >
              <div className="w-16 h-16 border-8 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-2 gap-8"
            >
              {profiles.map((profile, idx) => (
                <motion.button
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onPointerDown={() => handleSelect(profile)}
                  className="group flex flex-col items-center justify-center p-8 bg-white h-[280px] rounded-[40px] border-b-[12px] border-indigo-100 hover:border-indigo-300 active:border-b-[4px] active:translate-y-2 transition-all select-none touch-manipulation shadow-sm"
                >
                  <div className="w-40 h-40 mb-6 rounded-full bg-indigo-50 flex items-center justify-center overflow-hidden group-hover:bg-indigo-100 transition-colors">
                    <img 
                      src={getAvatarUrl(profile.avatar)} 
                      alt={profile.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/bottts/svg?seed=" + profile.name;
                      }}
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                  <span className="text-4xl font-black text-[#1E1B4B] uppercase group-hover:text-indigo-600 transition-colors">
                    {profile.name}
                  </span>
                </motion.button>
              ))}

              <motion.button
                onPointerDown={() => navigate('/auth')}
                className="flex flex-col items-center justify-center p-8 bg-dashed border-8 border-dashed border-indigo-200 rounded-[40px] hover:border-indigo-400 hover:bg-indigo-50 active:scale-95 transition-all text-indigo-400 h-[280px] touch-manipulation select-none"
              >
                <div className="text-8xl mb-4 font-black">+</div>
                <span className="text-3xl font-black uppercase">Añadir</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
