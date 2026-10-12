/**
 * ═══════════════════════════════════════════════════════════════
 * AuthPage v2 — Sin inline styles, con wayTheme, haptic, responsive
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { hapticService } from '@/core/services/hapticService';
import { useReduceMotion } from '@/core/stores/configStore';

type PageState = 'form' | 'sent' | 'error';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signInWithMagicLink } = useAuth();
  const reduceMotion = useReduceMotion();

  const [email, setEmail] = useState('');
  const [pageState, setPageState] = useState<PageState>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  /* ─── Redirigir si ya está logueado ─── */
  useEffect(() => {
    if (!loading && user) {
      const from = (location.state as any)?.from?.pathname ?? '/therapist';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location.state]);

  /* ─── Enviar magic link ─── */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || isSending) return;

      hapticService.click();
      setIsSending(true);
      setErrorMsg('');

      const { error } = await signInWithMagicLink(email.trim().toLowerCase());

      if (error) {
        setErrorMsg(error.message ?? 'Error al enviar el enlace. Inténtalo de nuevo.');
        setPageState('error');
        hapticService.error();
      } else {
        setPageState('sent');
        hapticService.success();
      }
      setIsSending(false);
    },
    [email, isSending, signInWithMagicLink]
  );

  const handleReset = useCallback(() => {
    hapticService.click();
    setPageState('form');
    setEmail('');
    setErrorMsg('');
  }, []);

  /* ─── Animaciones ─── */
  const fadeAnim = reduceMotion
    ? {}
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  const slideAnim = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-emerald-50 px-4 py-8">
      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-indigo-500/5 sm:p-10"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-3 text-4xl sm:text-5xl">🎮</div>
          <h1 className="text-2xl font-black text-slate-900">
            WAY<span className="text-indigo-600">+</span>
          </h1>
          <p className="mt-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Panel terapéutico
          </p>
        </div>

        {/* Estados */}
        <AnimatePresence mode="wait">
          {/* ═══ FORM ═══ */}
          {pageState === 'form' && (
            <motion.div key="form" {...fadeAnim}>
              <h2 className="text-lg font-black text-slate-900">Accede a tu panel</h2>
              <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">
                Introduce tu email y te enviaremos un enlace de acceso. Sin contraseñas.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    Email profesional
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maite@clinica.es"
                    required
                    autoFocus
                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileTap={reduceMotion ? {} : { scale: 0.98 }}
                  disabled={isSending || !email.trim()}
                  className="rounded-xl bg-indigo-600 py-3.5 text-sm font-black text-white shadow-md transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 active:bg-indigo-800"
                >
                  {isSending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Enviando…
                    </span>
                  ) : (
                    'Enviar enlace de acceso →'
                  )}
                </motion.button>
              </form>

              <p className="mt-4 text-center text-[10px] font-bold text-slate-400">
                Solo para profesionales registrados
              </p>
            </motion.div>
          )}

          {/* ═══ SENT ═══ */}
          {pageState === 'sent' && (
            <motion.div key="sent" {...slideAnim} className="text-center">
              <div className="mb-4 text-5xl sm:text-6xl">📬</div>
              <h2 className="text-xl font-black text-slate-900">¡Revisa tu email!</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Hemos enviado un enlace de acceso a{' '}
                <strong className="text-indigo-600">{email}</strong>. Haz clic en él para
                entrar al panel.
              </p>

              <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                <p className="text-xs font-bold text-indigo-700">
                  💡 El enlace caduca en 1 hora. Revisa también la carpeta de spam.
                </p>
              </div>

              <button
                onClick={handleReset}
                className="mt-5 text-xs font-bold text-slate-500 underline transition-colors hover:text-slate-800"
              >
                Usar otro email
              </button>
            </motion.div>
          )}

          {/* ═══ ERROR ═══ */}
          {pageState === 'error' && (
            <motion.div key="error" {...slideAnim} className="text-center">
              <div className="mb-3 text-4xl">⚠️</div>
              <h2 className="text-lg font-black text-rose-600">Error al enviar</h2>
              <p className="mt-2 text-sm text-slate-600">{errorMsg}</p>
              <button
                onClick={handleReset}
                className="mt-5 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-md transition-colors hover:bg-indigo-700 active:bg-indigo-800"
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

export default AuthPage;
