/**
 * PlayerLoginPage.tsx
 * Ruta: /player
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseAvailable } from '@/core/services/supabaseClient';

const C = {
  indigo:   '#4F46E5',
  indigoLt: '#EEF2FF',
  text:     '#1E1B4B',
  muted:    '#6B7280',
  border:   '#E2E8F0',
  white:    '#ffffff',
  bg:       '#F0F4FF',
  rose:     '#EF4444',
  emerald:  '#10B981',
};

interface PatientInfo {
  id: string;
  name: string;
  avatar_emoji: string;
  player_pin: string;
}

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

function Keypad({ onKey }: { onKey: (k: string) => void }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 12, width: '100%', maxWidth: 280,
    }}>
      {KEYS.map((key, i) => (
        <motion.button
          key={i}
          whileTap={key ? { scale: 0.9 } : {}}
          onClick={() => key && onKey(key)}
          style={{
            height: 72, borderRadius: 20,
            background: key ? C.white : 'transparent',
            border: key ? `2px solid ${C.border}` : 'none',
            fontSize: key === '⌫' ? 24 : 28,
            fontWeight: 800, color: C.text,
            cursor: key ? 'pointer' : 'default',
            boxShadow: key ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {key}
        </motion.button>
      ))}
    </div>
  );
}

export function PlayerLoginPage() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const patientId = sessionStorage.getItem('way-active-patient');
      if (!patientId) {
        // AUTO-CONFIG for Testing: Pedro
        sessionStorage.setItem('way-active-patient', '048cc2eb-a861-4ad4-ac1a-2fdf916e430b');
        window.location.reload();
        return;
      }

      if (!isSupabaseAvailable || !supabase) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('patients')
        .select('id, name, avatar_emoji, player_pin')
        .eq('id', patientId)
        .single();

      if (!error && data) {
        setPatient(data);
      }
      setLoading(false);
    }
    load();
  }, []);

  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  const handleKey = (key: string) => {
    if (success || locked) return;

    if (key === '⌫') {
      setPin(prev => prev.slice(0, -1));
      setError(false);
      return;
    }

    if (pin.length >= 4) return;

    const newPin = pin + key;
    setPin(newPin);

    if (newPin.length === 4) {
      if (patient && newPin === patient.player_pin) {
        setSuccess(true);
        setAttempts(0);
        setTimeout(() => {
          navigate('/player/home');
        }, 800);
      } else {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        setError(true);
        
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
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh', background: C.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ fontSize: 40 }}
        >
          ⏳
        </motion.div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div style={{
        minHeight: '100dvh', background: C.bg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 32, textAlign: 'center', gap: 16,
      }}>
        <div style={{ fontSize: 56 }}>⚙️</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: 0 }}>
          Tablet no configurada
        </h2>
        <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>
          Maite necesita configurar esta tablet desde el panel del terapeuta.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: `linear-gradient(160deg, #EEF2FF 0%, ${C.bg} 100%)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 32, gap: 32,
    }}>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center' }}
      >
        <motion.div
          animate={success ? { scale: [1, 1.2, 1] } : {}}
          style={{ fontSize: 80, marginBottom: 12, lineHeight: 1 }}
        >
          {patient.avatar_emoji}
        </motion.div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, margin: 0 }}>
          ¡Hola, {patient.name}!
        </h1>
        <p style={{ color: C.muted, fontSize: 15, margin: '8px 0 0' }}>
          Introduce tu PIN para jugar
        </p>
      </motion.div>

      <div style={{ display: 'flex', gap: 16 }}>
        {[0, 1, 2, 3].map(i => (
          <motion.div
            key={i}
            animate={{
              scale: pin.length === i + 1 ? [1, 1.2, 1] : 1,
              backgroundColor: error
                ? C.rose
                : success
                ? C.emerald
                : pin.length > i
                ? C.indigo
                : C.border,
            }}
            transition={{ duration: 0.2 }}
            style={{
              width: 20, height: 20, borderRadius: '50%',
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {error && !locked && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              fontSize: 14, fontWeight: 700, color: C.rose,
              marginTop: -16,
            }}
          >
            PIN incorrecto, inténtalo de nuevo ({3 - attempts} restantes)
          </motion.div>
        )}
        {locked && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              fontSize: 14, fontWeight: 700, color: C.rose,
              marginTop: -16, textAlign: 'center'
            }}
          >
            Demasiados intentos.<br/>Espera 30 segundos o avisa a Maite.
          </motion.div>
        )}
      </AnimatePresence>

      <Keypad onKey={handleKey} />
    </div>
  );
}
