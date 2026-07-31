/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ CharacterSelector — Elige tu compañero de aventuras
 * 4 personajes, animaciones de selección, haptics, glassmorphism
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GLASS, BTN, TEXT, way } from '@/shared/lib/wayTheme';
import { hapticService } from '@/core/services/hapticService';
import { useReduceMotion } from '@/core/stores/configStore';
import { Button } from '@/shared/components/Button';

interface Character {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  sound: string; // Descripción del sonido para screen readers
}

const CHARACTERS: Character[] = [
  {
    id: 'luna',
    name: 'Luna',
    emoji: '🦊',
    color: 'bg-orange-100 border-orange-200 text-orange-700 shadow-orange-500/20',
    description: 'Astuta y valiente. Siempre encuentra el camino.',
    sound: 'Zorro naranja',
  },
  {
    id: 'nube',
    name: 'Nube',
    emoji: '🐰',
    color: 'bg-sky-100 border-sky-200 text-sky-700 shadow-sky-500/20',
    description: 'Suave y paciente. Te ayuda a respirar cuando estás nervioso.',
    sound: 'Conejo azul celeste',
  },
  {
    id: 'roble',
    name: 'Roble',
    emoji: '🐻',
    color: 'bg-emerald-100 border-emerald-200 text-emerald-700 shadow-emerald-500/20',
    description: 'Fuerte y protector. Te da confianza para seguir adelante.',
    sound: 'Oso verde',
  },
  {
    id: 'chispa',
    name: 'Chispa',
    emoji: '🐱',
    color: 'bg-violet-100 border-violet-200 text-violet-700 shadow-violet-500/20',
    description: 'Curiosa y rápida. Te anima a probar cosas nuevas.',
    sound: 'Gato violeta',
  },
];

interface CharacterSelectorProps {
  onSelect: (characterId: string) => void;
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({ onSelect }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const reduceMotion = useReduceMotion();

  const handleSelect = (char: Character) => {
    hapticService.success();
    setSelected(char.id);
  };

  const handleConfirm = () => {
    if (selected) {
      hapticService.celebration();
      onSelect(selected);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-6">
      <motion.div
        className="mb-8 text-center"
        initial={reduceMotion ? {} : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={way(TEXT.title, 'text-3xl')}>Elige tu compañero</h1>
        <p className={way(TEXT.subtitle, 'mt-2')}>
          Te acompañará en todas las aventuras
        </p>
      </motion.div>

      <div className="grid w-full max-w-md grid-cols-2 gap-4">
        {CHARACTERS.map((char, index) => {
          const isSelected = selected === char.id;

          return (
            <motion.button
              key={char.id}
              className={way(
                'relative flex flex-col items-center rounded-3xl border-2 p-5 transition-all',
                'min-h-[160px] min-w-[44px]',
                'focus-visible:ring-4 focus-visible:ring-indigo-500/50 focus-visible:outline-none',
                isSelected
                  ? way(char.color, 'border-current scale-[1.02] shadow-lg')
                  : way(GLASS.card, 'border-white/40 hover:border-indigo-300')
              )}
              onClick={() => handleSelect(char)}
              initial={reduceMotion ? {} : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={reduceMotion ? {} : { scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.95 }}
              aria-pressed={isSelected}
              aria-label={`${char.sound}. ${char.name}. ${char.description}`}
              role="button"
            >
              <motion.span
                className="text-6xl"
                animate={isSelected && !reduceMotion ? { y: [0, -8, 0] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                aria-hidden="true"
              >
                {char.emoji}
              </motion.span>

              <span className={way('mt-3 font-bold', isSelected ? 'text-current' : 'text-slate-800')}>
                {char.name}
              </span>

              <span className={way('mt-1 text-center text-xs', isSelected ? 'text-current/80' : 'text-slate-500')}>
                {char.description}
              </span>

              {isSelected && (
                <motion.div
                  className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  aria-hidden="true"
                >
                  ✓
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="mt-8 w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Button
              variant="claim"
              size="lg"
              fullWidth
              onClick={handleConfirm}
              className="shadow-indigo-500/20 shadow-lg"
            >
              ¡Vamos con {CHARACTERS.find((c) => c.id === selected)?.name}! 🚀
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
