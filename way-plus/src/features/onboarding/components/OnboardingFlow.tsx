/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ OnboardingFlow — Orquestador completo
 * Bienvenida → Selector → Tutorial → Primer nivel
 * ═══════════════════════════════════════════════════════════════
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useOnboardingStore } from '@/core/stores/useOnboarding';
import { useReduceMotion } from '@/core/stores/configStore';
import { hapticService } from '@/core/services/hapticService';
import { CharacterSelector } from './CharacterSelector';
import { InteractiveTutorial } from './InteractiveTutorial';
import { Button } from '@/shared/components/Button';
import { GLASS, TEXT, way } from '@/shared/lib/wayTheme';

const CHARACTERS: Record<string, string> = {
  luna: '🦊',
  nube: '🐰',
  roble: '🐻',
  chispa: '🐱',
};

export const OnboardingFlow: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { step, selectedCharacter, setStep, selectCharacter, completeTutorial, skipOnboarding } =
    useOnboardingStore();
  const reduceMotion = useReduceMotion();

  const handleCharacterSelect = (id: string) => {
    selectCharacter(id);
    setStep('tutorial');
  };

  const handleTutorialComplete = () => {
    completeTutorial();
    setStep('first-level');
  };

  const handleSkip = () => {
    hapticService.click();
    skipOnboarding();
    onComplete();
  };

  const handleFinish = () => {
    hapticService.celebration();
    setStep('completed');
    onComplete();
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-slate-50 to-indigo-50/30">
      <AnimatePresence mode="wait">
        {/* STEP 1: WELCOME */}
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            className="flex min-h-dvh flex-col items-center justify-center p-6 text-center"
            initial={reduceMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
          >
            <motion.div
              className="mb-6 text-8xl"
              animate={reduceMotion ? {} : { y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              aria-hidden="true"
            >
              🌟
            </motion.div>
            <h1 className={way(TEXT.title, 'text-4xl mb-3')}>
              ¡Bienvenido a WAY+!
            </h1>
            <p className={way(TEXT.subtitle, 'max-w-xs mx-auto mb-8')}>
              Aquí aprenderás jugando. Cada aventura te hace más fuerte.
            </p>
            <Button
              variant="claim"
              size="lg"
              onClick={() => {
                hapticService.success();
                setStep('character');
              }}
              className="shadow-indigo-500/20 shadow-lg"
            >
              ¡Empezar! →
            </Button>
            <button
              onClick={handleSkip}
              className={way('mt-4 text-sm text-slate-400 underline', 'focus-visible:ring-2')}
            >
              Ya tengo cuenta
            </button>
          </motion.div>
        )}

        {/* STEP 2: CHARACTER */}
        {step === 'character' && (
          <motion.div
            key="character"
            initial={reduceMotion ? {} : { opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <CharacterSelector onSelect={handleCharacterSelect} />
          </motion.div>
        )}

        {/* STEP 3: TUTORIAL */}
        {step === 'tutorial' && selectedCharacter && (
          <motion.div
            key="tutorial"
            initial={reduceMotion ? {} : { opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <InteractiveTutorial
              characterEmoji={CHARACTERS[selectedCharacter]}
              onComplete={handleTutorialComplete}
              onSkip={handleSkip}
            />
          </motion.div>
        )}

        {/* STEP 4: FIRST LEVEL */}
        {step === 'first-level' && (
          <motion.div
            key="first-level"
            className="flex min-h-dvh flex-col items-center justify-center p-6 text-center"
            initial={reduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4" aria-hidden="true">
              {CHARACTERS[selectedCharacter || 'luna']} 🎉
            </div>
            <h2 className={TEXT.title}>¡Listo para tu primera aventura!</h2>
            <p className={way(TEXT.subtitle, 'mt-2 mb-8')}>
              Tu compañero está emocionado. El Bosque Encantado os espera.
            </p>
            <Button variant="claim" size="lg" onClick={handleFinish}>
              Ir al mapa 🗺️
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingFlow;
