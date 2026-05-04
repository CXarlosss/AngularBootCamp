import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKioskStore } from '@/features/kiosk/store/kioskStore';

interface SecurityGateProps {
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
}

export const SecurityGate: React.FC<SecurityGateProps> = ({ 
  onSuccess, 
  onCancel, 
  title = "Acceso Restringido" 
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const validatePin = useKioskStore(s => s.validatePin);

  const handleKeypad = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (validatePin(newPin)) {
          onSuccess();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 1000);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(79, 70, 229, 0.98)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20, color: 'white', backdropFilter: 'blur(10px)'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center', width: '100%', maxWidth: 320 }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>{title}</h2>
        <p style={{ opacity: 0.8, marginBottom: 32, fontSize: 14 }}>Introduce el PIN de seguridad de Maite</p>

        {/* PIN Indicators */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 40 }}>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              style={{
                width: 20, height: 20, borderRadius: '50%',
                background: i < pin.length ? 'white' : 'rgba(255,255,255,0.2)',
                border: error ? '2px solid #ef4444' : 'none'
              }}
            />
          ))}
        </div>

        {/* Keypad */}
        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
          marginBottom: 32
        }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
            <motion.button
              key={k}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (k === 'C') setPin('');
                else if (k === '⌫') handleBackspace();
                else handleKeypad(k);
              }}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                borderRadius: 20,
                height: 64,
                fontSize: 24,
                fontWeight: 700,
                color: 'white',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {k}
            </motion.button>
          ))}
        </div>

        <button
          onClick={onCancel}
          style={{
            background: 'transparent', border: 'none', color: 'white',
            opacity: 0.6, fontSize: 14, fontWeight: 700, cursor: 'pointer'
          }}
        >
          Cancelar y Volver
        </button>
      </motion.div>
    </div>
  );
};
