import React, { useEffect } from 'react';
import { useKioskStore } from '../store/kioskStore';
import { useFullscreen } from '../hooks/useFullscreen';
import { useWakeLock } from '../hooks/useWakeLock';
import { useOrientationLock } from '../hooks/useOrientationLock';
import { useGestureBlocker } from '../hooks/useGestureBlocker';
import { ExitPinModal } from './ExitPinModal';
import { motion } from 'framer-motion';

interface KioskGateProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export const KioskGate: React.FC<KioskGateProps> = ({ children, enabled = true }) => {
  const { isLocked, lock, requestExit, incrementSecretGesture, resetSecretGesture } = useKioskStore();
  
  // Detectar si estamos en modo desarrollo o si hay un bypass manual en la URL (?dev=true)
  const isDev = window.location.hostname === 'localhost' || window.location.search.includes('dev=true');
  
  // Solo activar el modo Kiosk en dispositivos táctiles reales y NO en modo desarrollo
  // Muchos laptops modernos reportan maxTouchPoints > 0 pero no son el target de Kiosk
  const isTouchDevice = typeof window !== 'undefined' && (('ontouchstart' in window) || navigator.maxTouchPoints > 0);
  
  const active = enabled && isLocked && isTouchDevice && !isDev;

  useFullscreen(active);
  useWakeLock(active);
  useOrientationLock('landscape', active); // WAY+ funciona mejor en apaisado
  useGestureBlocker(active);

  // Gesto secreto para salir: 5 toques rápidos en la esquina superior derecha
  const handleSecretZoneClick = () => {
    if (!active) return;
    incrementSecretGesture();
    setTimeout(resetSecretGesture, 2000); // Reset si tarda más de 2s entre toques
  };

  // Auto-lock al montar si está habilitado
  useEffect(() => {
    if (enabled && !isLocked) lock();
  }, [enabled, isLocked, lock]);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
      {children}

      {/* Zona secreta de salida (invisible, esquina superior derecha) */}
      {active && (
        <button
          onClick={handleSecretZoneClick}
          className="fixed top-0 right-0 w-24 h-24 z-[9990] opacity-0 cursor-default"
          aria-hidden="true"
        />
      )}

      {/* Botón de emergencia visible (solo para terapeutas, pequeño y discreto) */}
      {active && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          whileHover={{ opacity: 1, scale: 1.05 }}
          onClick={requestExit}
          className="fixed bottom-6 right-6 z-[9990] bg-white/90 backdrop-blur px-6 py-3 rounded-full text-[10px] font-black text-slate-500 shadow-xl border-2 border-slate-100 uppercase tracking-widest flex items-center gap-2"
        >
          <span>🔒</span> MODO SEGURO
        </motion.button>
      )}

      <ExitPinModal />
    </div>
  );
};
