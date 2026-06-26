import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseAvailable } from '@/core/services/supabaseClient';
import { audioService } from '@/core/utils/audioService';

interface PatientInfo {
  id: string;
  name: string;
  equipped_avatar_id: string;
  pin: string;
}

const PIN_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'DEL', '0', 'OK'];

export function PlayerLoginPage() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    async function load() {
      const patientId = sessionStorage.getItem('way-active-patient');
      if (!patientId) {
        sessionStorage.setItem('way-active-patient', '048cc2eb-a861-4ad4-ac1a-2fdf916e430b');
        sessionStorage.setItem('way-active-pin', '1234');
        window.location.reload();
        return;
      }

      if (!isSupabaseAvailable || !supabase) {
        setLoading(false);
        return;
      }

      const { data, error: err } = await supabase
        .from('patient_profiles')
        .select('id, name, equipped_avatar_id, pin')
        .eq('id', patientId)
        .single();

      if (!err && data) {
        setPatient(data);
      }
      setLoading(false);
    }
    load();
  }, []);

  const validatePin = useCallback((currentPin: string) => {
    if (!patient) return;
    if (currentPin === patient.pin) {
      setSuccess(true);
      setAttempts(0);
      try { audioService.playSFX('success'); } catch (e) {}
      sessionStorage.setItem('way-active-pin', currentPin);
      setTimeout(() => {
        navigate('/player/home');
      }, 800);
    } else {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setError(true);
      try { audioService.playSFX('error'); } catch (e) {}
      
      if (nextAttempts >= 3) {
        setLocked(true);
        setTimeout(() => {
          setLocked(false);
          setAttempts(0);
          setPin('');
          setError(false);
        }, 30000);
      } else {
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 1000);
      }
    }
  }, [patient, attempts, navigate]);

  const handleKeyPress = useCallback((key: string) => {
    if (success || locked) return;

    if (key === 'DEL') {
      try { audioService.playSFX('click'); } catch (e) {}
      setPin(prev => prev.slice(0, -1));
      setError(false);
    } else if (key === 'OK') {
      if (pin.length > 0) {
        validatePin(pin);
      }
    } else if (pin.length < 4) {
      try { audioService.playSFX('click'); } catch (e) {}
      const newPin = pin + key;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4 && patient && newPin === patient.pin) {
        setTimeout(() => {
          setSuccess(true);
          setAttempts(0);
          try { audioService.playSFX('success'); } catch (e) {}
          sessionStorage.setItem('way-active-pin', newPin);
          setTimeout(() => navigate('/player/home'), 800);
        }, 150);
      } else if (newPin.length === 4) {
        setTimeout(() => validatePin(newPin), 150);
      }
    }
  }, [success, locked, pin, patient, validatePin]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-8 text-center gap-4 bg-slate-50">
        <div className="text-6xl drop-shadow-sm">⚙️</div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tablet no configurada</h2>
        <p className="text-slate-600 font-medium max-w-sm">Maite necesita configurar esta tablet desde el panel del terapeuta.</p>
      </div>
    );
  }

  const bgClass = error 
    ? 'from-rose-50/50 to-red-100/50' 
    : success 
    ? 'from-emerald-50/50 to-teal-100/50' 
    : 'from-indigo-50/30 to-violet-50/30';

  return (
    <div className={`min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-8 gap-6 sm:gap-8 touch-none bg-gradient-to-br ${bgClass} transition-colors duration-500`}>

      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="text-center z-10"
      >
        <motion.div 
          animate={success ? { scale: [1, 1.1, 1] } : { y: [-2, 2, -2] }} 
          transition={success ? { duration: 0.5 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-7xl sm:text-8xl mb-2 sm:mb-4 leading-none drop-shadow-md"
        >
          {patient.equipped_avatar_id}
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
          ¡Hola, {patient.name}!
        </h1>
        <p className="text-indigo-600 font-bold text-base sm:text-lg mt-2 tracking-wide">
          Introduce tu PIN para jugar
        </p>
      </motion.div>

      <div className="flex justify-center gap-4 sm:gap-6 mb-2 h-10 sm:h-12 z-10">
        {[0, 1, 2, 3].map((i) => {
          const isFilled = i < pin.length;
          return (
            <motion.div
              key={i}
              animate={{
                scale: isFilled ? 1.15 : 1,
                backgroundColor: error ? '#F43F5E' : success ? '#10B981' : isFilled ? '#4F46E5' : '#F1F5F9',
                borderColor: error ? '#F43F5E' : success ? '#10B981' : isFilled ? '#4F46E5' : '#CBD5E1'
              }}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-4 shadow-sm"
            />
          );
        })}
      </div>

      <div className="h-10 mb-2 flex items-center justify-center z-10">
        <AnimatePresence>
          {error && !locked && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }} 
              className="px-6 py-2 rounded-full bg-rose-100 text-rose-600 font-bold shadow-sm"
            >
              PIN incorrecto ({3 - attempts} intentos)
            </motion.div>
          )}
          {locked && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }} 
              className="px-6 py-2 rounded-full bg-rose-100 text-rose-600 font-bold shadow-sm text-center"
            >
              🔒 Demasiados intentos. Avisa a Maite.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-[320px] sm:max-w-sm mx-auto z-10">
        {PIN_KEYS.map((key) => {
          const isNumber = !['DEL', 'OK'].includes(key);
          const isOk = key === 'OK';
          const isDel = key === 'DEL';
          
          return (
            <button
              key={key}
              onPointerDown={() => handleKeyPress(key)}
              disabled={locked}
              className={`
                relative flex items-center justify-center h-20 sm:h-24 rounded-3xl font-black text-2xl sm:text-3xl
                transition-[transform,box-shadow,background-color] duration-150 active:scale-95 select-none focus-visible:ring-4 ring-indigo-400/50
                ${isNumber ? 'bg-white text-slate-800 border-b-4 border-slate-200 hover:bg-slate-50' : ''}
                ${isOk ? 'bg-emerald-100 text-emerald-700 border-b-4 border-emerald-200 hover:bg-emerald-200' : ''}
                ${isDel ? 'bg-rose-100 text-rose-700 border-b-4 border-rose-200 hover:bg-rose-200' : ''}
                ${locked ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              aria-label={isDel ? 'Borrar' : isOk ? 'Confirmar' : `Número ${key}`}
            >
              {isDel ? '⌫' : isOk ? '✓' : key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
