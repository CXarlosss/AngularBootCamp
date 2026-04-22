import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const result = await signIn(email, password);
        if (result?.error) throw result.error;
        if (!result) throw new Error('Servicio de autenticación no disponible');
      } else {
        const result = await signUp(email, password, { 
          full_name: name, 
          role: 'therapist' 
        });
        if (result?.error) throw result.error;
        if (!result) throw new Error('Servicio de autenticación no disponible');
      }
      navigate('/terapeuta');
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6 font-outfit">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            🧠
          </motion.div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">WAY+</h1>
          <p className="text-slate-500 font-bold mt-2 italic text-sm">Tu plataforma de terapia clínica SaaS</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border-4 border-white p-10">
          <h2 className="text-2xl font-black text-slate-800 mb-8 text-center">
            {isLogin ? '¡Hola de nuevo!' : 'Crea tu cuenta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nombre clínico</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-5 py-4 rounded-2xl border-4 border-slate-50 focus:border-indigo-200 focus:outline-none bg-slate-50/50 transition-all font-bold text-slate-700"
                  placeholder="Dra. Lucía Méndez"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email profesional</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-2xl border-4 border-slate-50 focus:border-indigo-200 focus:outline-none bg-slate-50/50 transition-all font-bold text-slate-700"
                placeholder="lucia@clinica.es"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-5 py-4 rounded-2xl border-4 border-slate-50 focus:border-indigo-200 focus:outline-none bg-slate-50/50 transition-all font-bold text-slate-700"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-50 text-rose-600 text-xs font-bold p-4 rounded-2xl border-2 border-rose-100 italic"
              >
                ⚠️ {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:bg-slate-300 transition-all border-b-4 border-indigo-900/20"
            >
              {loading ? '⏳ PROCESANDO...' : isLogin ? 'ENTRAR AL PANEL' : 'REGISTRARME'}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 font-black text-sm hover:text-indigo-800 transition-colors uppercase tracking-widest"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate gratis' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] font-black text-slate-400 mt-10 uppercase tracking-[0.2em]">
          WAY+ CLOUD • CIFRADO AES-256 • RGPD COMPLIANT
        </p>
      </motion.div>
    </div>
  );
};
