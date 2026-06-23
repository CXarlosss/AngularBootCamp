import React, { useState } from 'react';
import { supabase } from '@/core/services/supabaseClient';
import { motion } from 'framer-motion';

interface Props {
  patientId: string;
  patientName: string;
}

export function FamilyAccessManager({ patientId, patientName }: Props) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(false);

  async function generateLink() {
    if (!supabase) {
      alert('Servicio offline');
      return;
    }
    setLoading(true);
    const token = crypto.randomUUID();
    
    const { data } = await supabase
      .from('family_access')
      .insert({
        patient_id: patientId,
        therapist_id: (await supabase.auth.getUser()).data.user?.id,
        parent_email: email || null,
        parent_phone: phone || null,
        access_token: token,
      })
      .select()
      .single();

    if (data) {
      const baseUrl = window.location.origin;
      setGeneratedLink(`${baseUrl}/family/${token}`);
    }
    setLoading(false);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(generatedLink);
  }

  return (
    <div style={{ fontFamily: 'Verdana, Geneva, Tahoma, sans-serif', padding: '24px' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>
        🏠 Acceso Familiar: {patientName}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <div>
          <label htmlFor="parent-email" style={labelStyle}>Email del padre/madre (opcional)</label>
          <input
            id="parent-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
            placeholder="padre@email.com"
          />
        </div>
        <div>
          <label htmlFor="parent-phone" style={labelStyle}>Teléfono (opcional)</label>
          <input
            id="parent-phone"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={inputStyle}
            placeholder="+34 600 000 000"
          />
        </div>
      </div>

      <button
        onClick={generateLink}
        disabled={loading}
        style={{
          padding: '16px 32px',
          borderRadius: '14px',
          border: 'none',
          backgroundColor: '#4A90D9',
          color: 'white',
          fontFamily: 'Verdana',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        {loading ? 'Generando...' : '🔗 Generar Magic Link'}
      </button>

      {generatedLink && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '24px',
            padding: '20px',
            backgroundColor: '#e8f5e9',
            borderRadius: '14px',
            border: '2px solid #4caf50',
          }}
        >
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: '#2e7d32' }}>
            ✅ Link generado. Envíalo por WhatsApp:
          </p>
          <code style={{
            display: 'block',
            padding: '12px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            fontSize: '13px',
            wordBreak: 'break-all',
            marginBottom: '12px',
          }}>
            {generatedLink}
          </code>
          <button
            onClick={copyToClipboard}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: '2px solid #4caf50',
              backgroundColor: 'transparent',
              color: '#4caf50',
              fontFamily: 'Verdana',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            📋 Copiar al portapapeles
          </button>
        </motion.div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #ddd',
  fontSize: '16px', fontFamily: 'Verdana', boxSizing: 'border-box',
};
