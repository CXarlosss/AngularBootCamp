import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseAvailable } from '@/core/services/supabaseClient';
import { audioService } from '@/core/utils/audioService';
import { Button } from '@/shared/components/Button';
import { T, Emoji } from '@/shared/components/TypographyScale';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

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
        // Guardar en localStorage para modo offline
        localStorage.setItem('way-last-patient-id', data.id);
        localStorage.setItem('way-last-patient-name', data.name);
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

  // MODO OFFLINE
  if (!isSupabaseAvailable || !navigator.onLine) {
    const lastPatientId = localStorage.getItem('way-last-patient-id') || 'offline-pedro';
    const lastPatientName = localStorage.getItem('way-last-patient-name') || 'Pedro';
    
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 gap-3 bg-slate-50 text-center">
        <Emoji>📡</Emoji>
        <T size="base" bold>No hay internet</T>
        <T size="sm" color="muted">
          Última sesión: <span className="font-bold text-slate-700">{lastPatientName}</span>
        </T>
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            sessionStorage.setItem('way-active-patient', lastPatientId);
            sessionStorage.setItem('way-active-pin', '1234');
            window.location.href = '/player/home';
          }}
        >
          Jugar como {lastPatientName}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            const newId = `offline-${Date.now()}`;
            const name = prompt('¿Cómo te llamas?') || 'Invitado';
            localStorage.setItem('way-last-patient-id', newId);
            localStorage.setItem('way-last-patient-name', name);
            sessionStorage.setItem('way-active-patient', newId);
            sessionStorage.setItem('way-active-pin', '1234');
            window.location.href = '/player/home';
          }}
        >
          Nuevo jugador
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" label="Cargando..." />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center gap-3 bg-slate-50">
        <Emoji>⚙️</Emoji>
        <T size="base" bold>Tablet no configurada</T>
        <T size="sm" color="muted">Maite necesita configurar esta tablet desde el panel del terapeuta.</T>
      </div>
    );
  }

  const bgClass = error 
    ? 'bg-rose-50' 
    : success 
    ? 'bg-emerald-50' 
    : 'bg-slate-50';

  return (
    <div className={`min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 gap-4 sm:gap-6 ${bgClass} transition-colors duration-500`}>
      {/* Avatar + Título */}
      <div className="text-center">
        <div className="text-lg mb-1 leading-none">
          {patient.equipped_avatar_id}
        </div>
        <T size="base" bold>¡Hola, {patient.name}!</T>
        <T size="sm" color="muted" className="mt-1">Introduce tu PIN para jugar</T>
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
              key={i}
              data-testid={`pin-dot-${i}`}
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
              initial={{ opacity: 0, y: -4 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }} 
              className="px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 font-bold text-xs"
              data-testid="login-error"
            >
              PIN incorrecto ({3 - attempts} intentos)
            </motion.div>
          )}
          {locked && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }} 
              className="px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 font-bold text-xs text-center"
              data-testid="login-locked"
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
            <Button
              key={key}
              data-testid={`pin-key-${key}`}
              variant={isOk ? 'success' : isDel ? 'danger' : 'secondary'}
              size="lg"
              onPointerDown={() => handleKeyPress(key)}
              disabled={locked}
              className="h-16 sm:h-[72px] text-lg rounded-2xl"
              aria-label={isDel ? 'Borrar' : isOk ? 'Confirmar' : `Número ${key}`}
            >
              {isDel ? '⌫' : isOk ? '✓' : key}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
