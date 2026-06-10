/**
 * PinConfig.tsx
 * Componente para que Maite configure el PIN del niño y el ID de tablet.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase, isSupabaseAvailable } from '@/core/services/supabaseClient';

const C = {
  indigo:   '#4F46E5',
  indigoLt: '#EEF2FF',
  text:     '#1E1B4B',
  muted:    '#6B7280',
  border:   '#E2E8F0',
  white:    '#ffffff',
  bg:       '#F8FAFF',
  emerald:  '#10B981',
  rose:     '#EF4444',
  amber:    '#F59E0B',
  amberLt:  '#FEF3C7',
};

interface Props {
  patientId: string;
  patientName: string;
  currentPin?: string;
}

export function PinConfig({ patientId, patientName, currentPin = '0000' }: Props) {
  const [pin, setPin] = useState(currentPin);
  const [newPin, setNewPin] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isThisTablet, setIsThisTablet] = useState(
    sessionStorage.getItem('way-active-patient') === patientId
  );

  const handleSavePin = async () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) return;
    setSaveStatus('saving');

    if (isSupabaseAvailable && supabase) {
      const { error } = await supabase
        .from('patient_profiles')
        .update({ pin: newPin })
        .eq('id', patientId);

      if (error) {
        setSaveStatus('error');
        return;
      }
    }

    setPin(newPin);
    setNewPin('');
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleConfigureTablet = () => {
    sessionStorage.setItem('way-active-patient', patientId);
    setIsThisTablet(true);
  };

  const handleRemoveTablet = () => {
    sessionStorage.removeItem('way-active-patient');
    setIsThisTablet(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        padding: 16, borderRadius: 20,
        background: isThisTablet ? C.indigoLt : C.bg,
        border: `1.5px solid ${isThisTablet ? C.indigo : C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.text }}>
            {isThisTablet ? `✅ Esta es la tablet de ${patientName}` : '📱 Configurar esta tablet'}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
            {isThisTablet
              ? `Al abrir /player verá directamente la pantalla de ${patientName}`
              : 'Pulsa para asignar esta tablet a este paciente'
            }
          </div>
        </div>
        {isThisTablet ? (
          <button
            onClick={handleRemoveTablet}
            style={{
              background: 'none', border: `1.5px solid ${C.border}`,
              color: C.muted, padding: '6px 12px', borderRadius: 10,
              fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Desvincular
          </button>
        ) : (
          <button
            onClick={handleConfigureTablet}
            style={{
              background: C.indigo, color: C.white, border: 'none',
              padding: '8px 16px', borderRadius: 12,
              fontSize: 12, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Configurar
          </button>
        )}
      </div>

      <div style={{
        padding: 20, borderRadius: 20, background: C.white,
        border: `1.5px solid ${C.border}`,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 4 }}>
            🔑 PIN de acceso
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>
            PIN actual: <strong style={{ color: C.indigo, letterSpacing: 4 }}>{pin}</strong>
            {' '}— díselo a {patientName} para que pueda entrar.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="new-pin" style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: 'block', marginBottom: 6 }}>
              Nuevo PIN (4 dígitos)
            </label>
            <input
              id="new-pin"
              type="text"
              value={newPin}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setNewPin(val);
                setSaveStatus('idle');
              }}
              placeholder="0000"
              maxLength={4}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 12,
                border: `1.5px solid ${C.border}`, fontSize: 18,
                fontWeight: 800, color: C.text, letterSpacing: 8,
                outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace',
              }}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSavePin}
            disabled={newPin.length !== 4 || saveStatus === 'saving'}
            style={{
              background: C.indigo, color: C.white, border: 'none',
              padding: '10px 16px', borderRadius: 12,
              fontWeight: 800, fontSize: 13, cursor: newPin.length === 4 ? 'pointer' : 'not-allowed',
              opacity: newPin.length === 4 ? 1 : 0.5,
              whiteSpace: 'nowrap',
            }}
          >
            {saveStatus === 'saving' ? '⏳' : saveStatus === 'saved' ? '✅ Guardado' : 'Cambiar PIN'}
          </motion.button>
        </div>

        {saveStatus === 'error' && (
          <div style={{ fontSize: 12, color: C.rose, fontWeight: 600 }}>
            ⚠️ Error al guardar. Inténtalo de nuevo.
          </div>
        )}
      </div>

      <div style={{
        padding: 16, borderRadius: 16,
        background: C.amberLt, border: `1.5px solid ${C.amber}`,
        fontSize: 12, color: '#92400E', lineHeight: 1.6,
      }}>
        <strong>Cómo configurar la tablet de {patientName}:</strong>
        <ol style={{ margin: '6px 0 0', paddingLeft: 16 }}>
          <li>Abre esta página en la tablet de {patientName}</li>
          <li>Pulsa "Configurar esta tablet" arriba</li>
          <li>A partir de ahora, al abrir <code>/player</code> verá su pantalla directamente</li>
          <li>Dile el PIN: <strong style={{ letterSpacing: 3 }}>{pin}</strong></li>
        </ol>
      </div>
    </div>
  );
}
