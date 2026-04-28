import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Step {
  title: string;
  description: string;
  icon: string;
  color: string;
}

const STEPS: Step[] = [
  {
    title: "Bienvenido a Family Hub",
    description: "Este es tu nuevo espacio de acompañamiento. Aquí verás el progreso clínico de forma clara y constructiva.",
    icon: "👨‍👩‍👧‍👦",
    color: "#6366F1"
  },
  {
    title: "El Mapa de Crecimiento",
    description: "El Radar no mide fallos, mide dónde estamos trabajando. Cada color representa una habilidad que estamos fortaleciendo juntos.",
    icon: "🎯",
    color: "#10B981"
  },
  {
    title: "Guía Terapéutica",
    description: "Recibirás consejos directos de tu terapeuta. Todo lo que veas aquí ha sido diseñado para proteger y mejorar vuestra relación.",
    icon: "👩‍⚕️",
    color: "#EC4899"
  },
  {
    title: "Tu papel es clave",
    description: "Tú eres el mejor observador. Usa esta información para celebrar los logros y acompañar los retos con calma.",
    icon: "✨",
    color: "#F59E0B"
  }
];

export function FamilyOnboarding({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      onComplete();
    }
  };

  const step = STEPS[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
    >
      <div style={{
        maxWidth: 400,
        width: '100%',
        background: '#fff',
        borderRadius: 32,
        padding: '40px 32px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Accent */}
        <motion.div
          animate={{ background: step.color }}
          style={{
            position: 'absolute',
            top: -100,
            left: '50%',
            translateX: '-50%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            filter: 'blur(60px)',
            opacity: 0.2,
            zIndex: 0
          }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <div style={{ fontSize: 64, marginBottom: 24 }}>{step.icon}</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1E1B4B', marginBottom: 16 }}>
              {step.title}
            </h2>
            <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.6, marginBottom: 32 }}>
              {step.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress Indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentStep ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === currentStep ? step.color : '#E5E7EB',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          style={{
            width: '100%',
            background: step.color,
            color: '#fff',
            border: 'none',
            borderRadius: 16,
            padding: '16px',
            fontSize: 16,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: `0 8px 16px ${step.color}33`
          }}
        >
          {currentStep === STEPS.length - 1 ? 'Empezar ahora' : 'Continuar'}
        </button>
      </div>
    </motion.div>
  );
}
