/**
 * AuthPage.tsx
 * Autenticación via magic link (email).
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';

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
};

type PageState = 'form' | 'sent' | 'error';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signInWithMagicLink } = useAuth();

  const [email, setEmail] = useState('');
  const [pageState, setPageState] = useState<PageState>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const from = (location.state as any)?.from?.pathname ?? '/therapist';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSending) return;

    setIsSending(true);
    setErrorMsg('');

    const { error } = await signInWithMagicLink(email.trim().toLowerCase());

    if (error) {
      setErrorMsg(error.message ?? 'Error al enviar el enlace. Inténtalo de nuevo.');
      setPageState('error');
    } else {
      setPageState('sent');
    }
    setIsSending(false);
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #EEF2FF 0%, #F8FAFF 50%, #F0FDF4 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%', maxWidth: 420,
          background: C.white, borderRadius: 28,
          padding: 40, boxShadow: '0 20px 60px rgba(79,70,229,0.12)',
          border: `1px solid ${C.border}`,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎮</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: 0 }}>WAY+</h1>
          <p style={{ color: C.muted, fontSize: 14, margin: '6px 0 0' }}>
            Panel terapéutico
          </p>
        </div>

        <AnimatePresence mode="wait">
          {pageState === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: '0 0 8px' }}>
                Accede a tu panel
              </h2>
              <p style={{ color: C.muted, fontSize: 13, margin: '0 0 24px', lineHeight: 1.5 }}>
                Introduce tu email y te enviaremos un enlace de acceso. Sin contraseñas.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: 'block', marginBottom: 6 }}>
                    Email profesional
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="maite@clinica.es"
                    required
                    autoFocus
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 14,
                      border: `1.5px solid ${C.border}`, fontSize: 14,
                      color: C.text, outline: 'none', boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  disabled={isSending || !email.trim()}
                  style={{
                    background: C.indigo, color: C.white, border: 'none',
                    padding: '14px', borderRadius: 14, fontWeight: 800,
                    fontSize: 15, cursor: isSending ? 'wait' : 'pointer',
                    opacity: (isSending || !email.trim()) ? 0.6 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {isSending ? 'Enviando…' : 'Enviar enlace de acceso →'}
                </motion.button>
              </form>
            </motion.div>
          )}

          {pageState === 'sent' && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '8px 0' }}
            >
              <div style={{ fontSize: 56, marginBottom: 20 }}>📬</div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: '0 0 12px' }}>
                ¡Revisa tu email!
              </h2>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
                Hemos enviado un enlace de acceso a <strong style={{ color: C.indigo }}>{email}</strong>.
                Haz clic en él para entrar al panel.
              </p>
              <div style={{
                background: C.indigoLt, borderRadius: 14, padding: '12px 16px',
                fontSize: 12, color: C.indigo, fontWeight: 600, marginBottom: 20,
              }}>
                💡 El enlace caduca en 1 hora. Revisa también la carpeta de spam.
              </div>
              <button
                onClick={() => { setPageState('form'); setEmail(''); }}
                style={{
                  background: 'none', border: 'none', color: C.muted,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Usar otro email
              </button>
            </motion.div>
          )}

          {pageState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '8px 0' }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.rose, margin: '0 0 8px' }}>
                Error al enviar
              </h2>
              <p style={{ color: C.muted, fontSize: 13, margin: '0 0 20px' }}>{errorMsg}</p>
              <button
                onClick={() => setPageState('form')}
                style={{
                  background: C.indigo, color: C.white, border: 'none',
                  padding: '12px 24px', borderRadius: 12,
                  fontWeight: 800, fontSize: 14, cursor: 'pointer',
                }}
              >
                Intentar de nuevo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
