import React, { useState, useEffect } from 'react';
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
        // AUTO-CONFIG for Testing: Pedro
        sessionStorage.setItem('way-active-patient', '048cc2eb-a861-4ad4-ac1a-2fdf916e430b');
        sessionStorage.setItem('way-active-pin', '1234');
        window.location.reload();
        return;
      }

      if (!isSupabaseAvailable || !supabase) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('patient_profiles')
        .select('id, name, equipped_avatar_id, pin')
        .eq('id', patientId)
        .single();

      if (!error && data) {
        setPatient(data);
      }
      setLoading(false);
    }
    load();
  }, []);

  const validatePin = () => {
    if (!patient) return;
    if (pin === patient.pin) {
      setSuccess(true);
      setAttempts(0);
      audioService.playSFX('success');
      sessionStorage.setItem('way-active-pin', pin);
      setTimeout(() => {
        navigate('/player/home');
      }, 800);
    } else {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setError(true);
      audioService.playSFX('error');
      
      if (nextAttempts >= 3) {
        setLocked(true);
        setTimeout(() => {
          setLocked(false);
          setAttempts(0);
          setPin('');
          setError(false);
        }, 30000); // 30 second lockout
      } else {
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 1000);
      }
    }
  };

  const handleKeyPress = (key: string) => {
    if (success || locked) return;

    if (key === 'DEL') {
      audioService.playSFX('click');
      setPin(prev => prev.slice(0, -1));
      setError(false);
    } else if (key === 'OK') {
      if (pin.length > 0) {
        validatePin();
      }
    } else if (pin.length < 4) {
      audioService.playSFX('click');
      const newPin = pin + key;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4 && patient && newPin === patient.pin) {
        setTimeout(() => {
          setSuccess(true);
          setAttempts(0);
          audioService.playSFX('success');
          sessionStorage.setItem('way-active-pin', newPin);
          setTimeout(() => navigate('/player/home'), 800);
        }, 150);
      } else if (newPin.length === 4) {
        setTimeout(() => validatePin(), 150);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-dynamic bg-dynamic--normal flex items-center justify-center">
        <div className="spinner-glass" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-[100dvh] bg-dynamic bg-dynamic--normal flex flex-col items-center justify-center p-8 text-center gap-4">
        <div className="text-6xl">⚙️</div>
        <h2 className="text-2xl font-black text-[#1E1B4B]">Tablet no configurada</h2>
        <p className="text-[#6B7280]">Maite necesita configurar esta tablet desde el panel del terapeuta.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-[100dvh] flex flex-col items-center justify-center p-8 gap-8 touch-none bg-dynamic ${error ? 'bg-dynamic--error' : success ? 'bg-dynamic--success' : 'bg-dynamic--normal'}`}>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <motion.div animate={success ? { scale: [1, 1.2, 1] } : {}} className="text-8xl mb-4 leading-none avatar-float">
          {patient.equipped_avatar_id}
        </motion.div>
        <h1 className="text-4xl font-black text-[#1E1B4B] uppercase tracking-wide">
          ¡Hola, {patient.name}!
        </h1>
        <p className="text-indigo-500 font-bold text-lg mt-2">
          Introduce tu PIN para jugar
        </p>
      </motion.div>

      {/* Puntos del PIN */}
      <div className="flex justify-center gap-6 mb-4 h-12">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`
              pin-dot
              ${error 
                ? 'pin-dot--error' 
                : success 
                ? 'pin-dot--success'
                : i < pin.length 
                ? 'pin-dot--filled' 
                : ''
              }
            `}
          />
        ))}
      </div>

      {/* Mensajes de error */}
      <div className="h-8 mb-4 flex items-center justify-center">
        <AnimatePresence>
          {error && !locked && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-lg font-bold text-rose-500 glass-message">
              PIN incorrecto ({3 - attempts} intentos)
            </motion.div>
          )}
          {locked && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-lg font-bold text-rose-500 glass-message text-center">
              🔒 Demasiados intentos.<br/>Avisa a Maite.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Teclado */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-md mx-auto">
        {PIN_KEYS.map((key) => {
          let extraClass = '';
          if (key === 'OK') extraClass = 'key-mechanical--ok';
          if (key === 'DEL') extraClass = 'key-mechanical--del';
          
          return (
            <button
              key={key}
              onPointerDown={() => handleKeyPress(key)}
              className={`h-[140px] w-full key-mechanical ${extraClass}`}
              aria-label={key === 'DEL' ? 'Borrar' : key === 'OK' ? 'Confirmar' : `Número ${key}`}
            >
              {key === 'DEL' ? '←' : key === 'OK' ? '✓' : key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
