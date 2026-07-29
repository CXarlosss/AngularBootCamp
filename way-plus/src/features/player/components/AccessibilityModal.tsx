import React, { useEffect } from 'react';
import { useConfigStore } from '@/core/stores/configStore';
import { Button } from '@/shared/components/Button';
import { T } from '@/shared/components/TypographyScale';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessibilityModal({ isOpen, onClose }: Props) {
  const { accessibility, setReduceMotion, setContrastMode, setShowTextLabels, setHapticFeedback } = useConfigStore();

  // Sync with body class for reduce-motion and contrast-mode
  useEffect(() => {
    if (accessibility.reduceMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
    
    if (accessibility.contrastMode) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [accessibility.reduceMotion, accessibility.contrastMode]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
        role="dialog"
        aria-labelledby="a11y-title"
        aria-modal="true"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            aria-label="Cerrar panel de accesibilidad"
          >
            ✕
          </button>

          <T id="a11y-title" size="lg" bold className="text-center mb-6 text-indigo-950">
            Ajustes de Accesibilidad ♿
          </T>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 cursor-pointer transition-colors">
              <div>
                <T size="base" bold className="text-slate-800">Alto Contraste</T>
                <T size="xs" color="muted">Mejora la legibilidad de colores</T>
              </div>
              <input 
                type="checkbox" 
                checked={accessibility.contrastMode}
                onChange={(e) => setContrastMode(e.target.checked)}
                className="w-6 h-6 rounded text-indigo-600 focus:ring-indigo-500"
                aria-label="Activar Alto Contraste"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 cursor-pointer transition-colors">
              <div>
                <T size="base" bold className="text-slate-800">Reducir Animaciones</T>
                <T size="xs" color="muted">Desactiva movimientos y brillos</T>
              </div>
              <input 
                type="checkbox" 
                checked={accessibility.reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
                className="w-6 h-6 rounded text-indigo-600 focus:ring-indigo-500"
                aria-label="Desactivar Animaciones"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 cursor-pointer transition-colors">
              <div>
                <T size="base" bold className="text-slate-800">Etiquetas de Texto</T>
                <T size="xs" color="muted">Muestra texto junto a los iconos</T>
              </div>
              <input 
                type="checkbox" 
                checked={accessibility.showTextLabels}
                onChange={(e) => setShowTextLabels(e.target.checked)}
                className="w-6 h-6 rounded text-indigo-600 focus:ring-indigo-500"
                aria-label="Mostrar etiquetas de texto en iconos"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 cursor-pointer transition-colors">
              <div>
                <T size="base" bold className="text-slate-800">Vibración Táctil</T>
                <T size="xs" color="muted">Retroalimentación física al interactuar</T>
              </div>
              <input 
                type="checkbox" 
                checked={accessibility.hapticFeedback ?? true}
                onChange={(e) => setHapticFeedback(e.target.checked)}
                className="w-6 h-6 rounded text-indigo-600 focus:ring-indigo-500"
                aria-label="Activar vibración táctil"
              />
            </label>
          </div>

          <div className="mt-8">
            <Button variant="primary" size="lg" className="w-full" onClick={onClose}>
              Guardar y Cerrar
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
