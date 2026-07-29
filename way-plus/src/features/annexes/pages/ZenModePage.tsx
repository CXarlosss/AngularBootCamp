import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/core/hooks/useAudio';
import type { AmbientZone } from '@/core/utils/audioService';
import { ArrowLeft, Droplets, TreePine, Waves } from 'lucide-react';
import { rw, wayResponsive } from '@/shared/lib/wayResponsive';
import { way, wayTheme } from '@/shared/lib/wayTheme';
import { hapticService } from '@/core/services/hapticService';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/lib/utils';

const ZEN_OPTIONS = [
  { id: 'zen',        label: 'Lluvia',    icon: <Droplets size={32} />,  color: 'text-blue-400',  bg: 'bg-blue-400' },
  { id: 'zen-forest', label: 'Bosque',    icon: <TreePine size={32} />,  color: 'text-emerald-400', bg: 'bg-emerald-400' },
  { id: 'zen-waves',  label: 'Mar',       icon: <Waves size={32} />,     color: 'text-teal-400',   bg: 'bg-teal-400' },
  { id: 'zen-stream', label: 'Arroyo',    icon: <Waves size={32} />,     color: 'text-slate-400',  bg: 'bg-slate-400' },
] as const;

export function ZenModePage() {
  const navigate = useNavigate();
  const { playAmbient, playSFX } = useAudio();
  const [activeZone, setActiveZone] = useState<AmbientZone>('none');

  const handleSelect = (id: AmbientZone) => {
    playSFX('click');
    hapticService.click();
    if (activeZone === id) {
      setActiveZone('none');
      playAmbient('none');
    } else {
      setActiveZone(id);
      playAmbient(id);
    }
  };

  const activeOption = ZEN_OPTIONS.find(o => o.id === activeZone);

  return (
    <div className={way("min-h-screen bg-slate-900 text-slate-50 flex flex-col p-4 sm:p-6 pb-24", "dark")}>
      <header className={way("flex items-center gap-4 mb-8 max-w-2xl mx-auto w-full")}>
        <Button
          variant="icon"
          onClick={() => { playSFX('click'); navigate(-1); }}
          className={wayTheme.GLASS.dark}
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className={way(wayTheme.TEXT.title, "text-white m-0 leading-tight")}>Modo Zen</h1>
          <p className={way(wayTheme.TEXT.subtitle, "text-slate-400 m-0")}>Encuentra tu momento de calma</p>
        </div>
      </header>

      <div className={way("flex-1 flex flex-col justify-center items-center gap-10 max-w-2xl mx-auto w-full")}>
        <div className="relative w-48 h-48 sm:w-56 sm:h-56">
          <AnimatePresence>
            {activeZone !== 'none' && activeOption && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0.15 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 3, repeat: Infinity }}
                className={cn("absolute inset-0 rounded-full", activeOption.bg)}
              />
            )}
          </AnimatePresence>
          <div className={way(
            "absolute inset-0 rounded-full flex items-center justify-center text-6xl shadow-2xl",
            wayTheme.GLASS.dark,
            activeZone !== 'none' ? 'border-transparent' : 'border-slate-700'
          )}>
            {activeZone === 'none' ? '🧘' : <div className={activeOption?.color}>{activeOption?.icon}</div>}
          </div>
        </div>

        <div className={way(wayResponsive.GRIDS.gridZen, "w-full")}>
          {ZEN_OPTIONS.map(opt => {
            const isActive = activeZone === opt.id;
            return (
              <motion.button
                key={opt.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(opt.id as AmbientZone)}
                className={way(
                  wayTheme.GLASS.dark,
                  "p-6 rounded-3xl flex flex-col items-center gap-3 cursor-pointer transition-all duration-300",
                  isActive ? "border-transparent bg-white/10 ring-2 ring-white/20" : "hover:bg-white/5",
                  isActive ? opt.color : "text-slate-400"
                )}
              >
                <div className={cn("transition-opacity duration-300", isActive ? "opacity-100" : "opacity-50")}>
                  {opt.icon}
                </div>
                <span className="text-sm font-black uppercase tracking-widest">{opt.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <div className="text-center p-5 mt-auto">
        <p className={way(wayTheme.TEXT.label, "text-slate-400 normal-case font-medium")}>
          Cierra los ojos y respira profundamente...
        </p>
      </div>
    </div>
  );
}
