import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../store/playerStore';
import { audioService } from '@/core/utils/audioService';

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: '¡Hola, Amigo! 👋',
    text: '¡Soy tu compañero en WAY+! Estoy aquí para ayudarte a aprender cosas increíbles mientras nos divertimos.',
    icon: '✨'
  },
  {
    id: 'ways',
    title: 'Supera los Retos 🏆',
    text: 'Completa los "Ways" para ganar monedas. Cada vez que lo logres, ¡celebraremos juntos!',
    icon: '🪙'
  },
  {
    id: 'shop',
    title: 'Tienda de Premios 👕',
    text: 'Usa tus monedas en la tienda para comprarme sombreros, capas y nuevos amigos en la mochila.',
    icon: '🎒'
  },
  {
    id: 'ready',
    title: '¿Estás Listo? 🚀',
    text: '¡Vamos a empezar nuestra primera aventura! Toca el botón para comenzar.',
    icon: '🎮'
  }
];

export const TutorialTour: React.FC = () => {
  const { profile, completeTutorial } = usePlayerStore();
  const [stepIndex, setStepIndex] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Solo mostrar si no se ha completado el tutorial
    if (!profile.tutorialCompleted) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [profile.tutorialCompleted]);

  useEffect(() => {
    if (show) {
      audioService.speak(TUTORIAL_STEPS[stepIndex].text);
    }
  }, [show, stepIndex]);

  const nextStep = () => {
    if (stepIndex < TUTORIAL_STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setShow(false);
      completeTutorial();
    }
  };

  const currentStep = TUTORIAL_STEPS[stepIndex];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(79, 70, 229, 0.9)', // Indigo overlay
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, backdropFilter: 'blur(10px)'
          }}
        >
          <motion.div
            key={stepIndex}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            style={{
              background: 'white', borderRadius: 40,
              padding: '40px 32px', maxWidth: 400, width: '100%',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              position: 'relative', textAlign: 'center'
            }}
          >
            {/* Avatar Placeholder / Icon */}
            <div style={{ fontSize: 64, marginBottom: 20 }}>
              {currentStep.icon}
            </div>

            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1E1B4B', marginBottom: 12 }}>
              {currentStep.title}
            </h2>
            
            <p style={{ fontSize: 16, color: '#64748B', fontWeight: 500, lineHeight: 1.6, marginBottom: 32 }}>
              {currentStep.text}
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextStep}
              style={{
                background: '#4F46E5', color: 'white', border: 'none',
                borderRadius: 24, padding: '16px 32px',
                fontWeight: 800, fontSize: 16, cursor: 'pointer',
                width: '100%', boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)'
              }}
            >
              {stepIndex === TUTORIAL_STEPS.length - 1 ? '¡EMPEZAR AHORA!' : 'SIGUIENTE'}
            </motion.button>

            {/* Pagination dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              {TUTORIAL_STEPS.map((_, i) => (
                <div 
                  key={i}
                  style={{
                    width: i === stepIndex ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: i === stepIndex ? '#4F46E5' : '#E2E8F0',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
