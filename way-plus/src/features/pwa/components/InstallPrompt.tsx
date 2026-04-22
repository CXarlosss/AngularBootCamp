import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Detectar iOS (no soporta beforeinstallprompt)
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Detectar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    // Mostrar prompt para iOS después de un retraso si no está instalado
    if (isIOSDevice && !window.matchMedia('(display-mode: standalone)').matches) {
      const timer = setTimeout(() => setIsVisible(true), 5000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 left-6 right-6 md:left-auto md:right-8 md:w-96 z-50 bg-indigo-600 text-white rounded-3xl p-6 shadow-2xl flex items-center gap-5 border-4 border-indigo-400 font-outfit"
      >
        <div className="text-4xl">📲</div>
        <div className="flex-1">
          <h4 className="font-black text-sm uppercase tracking-wider">Instala WAY+</h4>
          <p className="text-[10px] font-bold text-indigo-100 mt-1 leading-relaxed uppercase">
            {isIOS 
              ? 'Toca Compartir ➜ "Añadir a pantalla de inicio"' 
              : 'Accede más rápido y usa la app sin conexión'}
          </p>
        </div>
        {!isIOS && deferredPrompt && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleInstall}
            className="bg-white text-indigo-600 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-900/20"
          >
            Instalar
          </motion.button>
        )}
        <button 
          onClick={() => setIsVisible(false)} 
          className="text-indigo-300 hover:text-white transition-colors p-2"
        >
          ✕
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
