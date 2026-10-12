/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ PageTransition — Envuelve rutas con AnimatePresence
 * Elimina los cortes bruscos al navegar
 * ═══════════════════════════════════════════════════════════════
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useConfigStore } from '@/core/stores/configStore';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const reduceMotion = useConfigStore(state => state.reduceMotion);

  const variants = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 16, scale: reduceMotion ? 1 : 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: reduceMotion ? 0 : -16, scale: reduceMotion ? 1 : 0.98 },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: reduceMotion ? 0 : 0.35,
          ease: [0.32, 0.72, 0, 1], // Custom spring-like ease
        }}
        className="min-h-dvh flex flex-col w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
