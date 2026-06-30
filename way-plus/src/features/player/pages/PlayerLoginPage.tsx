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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
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
        <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  if (!isSupabaseAvailable || !isOnline) {
    const lastPatientId = localStorage.getItem('way-last-patient-id') || 'offline-pedro';
    const lastPatientName = localStorage.getItem('way-last-patient-name') || 'Pedro';
    
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 gap-3 bg-slate-50 text-center" style={{ fontFamily: 'Verdana, sans-serif' }}>
        <span className="text-lg">📡</span>
        <h2 className="text-base font-bold text-slate-800 leading-normal">No hay internet</h2>
        <p className="text-sm text-slate-500 leading-normal">
          Última sesión: <span className="font-bold text-slate-700">{lastPatientName}</span>
        </p>
        <button
          onClick={() => {
            sessionStorage.setItem('way-active-patient', lastPatientId);
            sessionStorage.setItem('way-active-pin', '1234');
            window.location.href = '/player/home';
          }}
          className="px-6 py-3 min-h-[44px] rounded-xl bg-violet-500 text-white font-bold text-sm active:scale-95 transition-transform duration-150 w-full max-w-[250px]"
        >
          Jugar como {lastPatientName}
        </button>
        <button
          onClick={() => {
            const newId = `offline-${Date.now()}`;
            const name = prompt('¿Cómo te llamas?') || 'Invitado';
            localStorage.setItem('way-last-patient-id', newId);
            localStorage.setItem('way-last-patient-name', name);
            sessionStorage.setItem('way-active-patient', newId);
            sessionStorage.setItem('way-active-pin', '1234');
            window.location.href = '/player/home';
          }}
          className="px-4 py-3 min-h-[44px] rounded-xl bg-white border-2 border-slate-200 text-slate-600 font-bold text-xs active:scale-95 transition-transform duration-150 w-full max-w-[250px]"
        >
          Nuevo jugador
        </button>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center gap-3 bg-slate-50">
        <span className="text-lg">⚙️</span>
        <h2 className="text-base font-bold text-slate-800 leading-normal">Tablet no configurada</h2>
        <p className="text-sm text-slate-500 font-medium max-w-sm leading-normal">
          Maite necesita configurar esta tablet desde el panel del terapeuta.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 gap-4 sm:gap-6 bg-slate-50">
      {/* Avatar + Título */}
      <div className="text-center">
        <div className="text-lg mb-1 leading-none">
          {patient.equipped_avatar_id}
        </div>
        <h1 className="text-base font-bold text-slate-800 leading-normal">
          ¡Hola, {patient.name}!
        </h1>
        <p className="text-sm text-slate-500 font-bold mt-1 leading-normal">
          Introduce tu PIN para jugar
        </p>
      </div>

      {/* Dots PIN */}
      <div className="flex justify-center gap-3 sm:gap-4 h-8 sm:h-10">
        {[0, 1, 2, 3].map((i) => {
          const isFilled = i < pin.length;
          const dotClasses = error
            ? 'bg-rose-500 border-rose-500 scale-110'
            : success
            ? 'bg-emerald-500 border-emerald-500 scale-110'
            : isFilled
            ? 'bg-violet-500 border-violet-500 scale-110'
            : 'bg-slate-100 border-slate-300';

          return (
            <div
              data-testid={`pin-dot-${i}`}
              key={i}
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-300 ${dotClasses}`}
            />
          );
        })}
      </div>

      {/* Mensajes */}
      <div className="h-8 flex items-center justify-center">
        <AnimatePresence>
          {error && !locked && (
            <motion.div 
              data-testid="login-error"
              initial={{ opacity: 0, y: -4 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }} 
              className="px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 font-bold text-xs"
            >
              PIN incorrecto ({3 - attempts} intentos)
            </motion.div>
          )}
          {locked && (
            <motion.div 
              data-testid="login-locked"
              initial={{ opacity: 0, y: -4 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }} 
              className="px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 font-bold text-xs text-center"
            >
              🔒 Demasiados intentos. Avisa a Maite.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Teclado numérico */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-[280px] sm:max-w-xs mx-auto">
        {PIN_KEYS.map((key) => {
          const isNumber = !['DEL', 'OK'].includes(key);
          const isOk = key === 'OK';
          const isDel = key === 'DEL';
          
          return (
            <button
              data-testid={`pin-key-${key}`}
              key={key}
              onPointerDown={() => handleKeyPress(key)}
              disabled={locked}
              className={`
                relative flex items-center justify-center h-16 sm:h-[72px] rounded-2xl font-bold text-lg
                transition-all duration-150 active:scale-95 select-none focus-visible:ring-2 ring-violet-400/40
                ${isNumber ? 'bg-white text-slate-800 border-2 border-slate-200 hover:bg-slate-50' : ''}
                ${isOk ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-200' : ''}
                ${isDel ? 'bg-rose-100 text-rose-700 border-2 border-rose-200 hover:bg-rose-200' : ''}
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
