/**
 * ═══════════════════════════════════════════════════════════════
 * WayRenderer v2 — Limpio, responsive, sin lag
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { useWayImage } from '@/core/services/wayImageService';
import type { Way } from '@/core/engine/types';
import { audioService } from '@/core/utils/audioService';
import { hapticService } from '@/core/services/hapticService';
import { useReduceMotion } from '@/core/stores/configStore';

type AttemptState = 'idle' | 'error' | 'retry' | 'success';

interface Props {
  way: Way;
  onComplete: (success: boolean) => void;
  isSpeaking?: boolean;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
  sessionEnding?: boolean;
}

/* ─── Validación defensiva ─── */
function validateWay(way: Way): { valid: boolean; error?: string } {
  if (!way) return { valid: false, error: 'way_missing' };
  if (!way.options || way.options.length < 2) return { valid: false, error: 'options_insufficient' };
  if (!way.stimulus?.text && !way.title) return { valid: false, error: 'text_missing' };
  return { valid: true };
}

export const WayRenderer: React.FC<Props> = ({
  way,
  onComplete,
  isSpeaking: parentSpeaking = false,
  onSpeakStart,
  onSpeakEnd,
  sessionEnding = false,
}) => {
  const [attemptState, setAttemptState] = useState<AttemptState>('idle');
  const [highlightedChoice, setHighlightedChoice] = useState<string | null>(null);
  const [localSpeaking, setLocalSpeaking] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const reduceMotion = useReduceMotion();
  const audioRef = useRef<{ stop: () => void } | null>(null);

  const { src: situationImg, loaded: imgLoaded } = useWayImage(
    way?.stepNumber || 1,
    way?.wayNumber || 1,
    way?.theme || 'default'
  );

  const isLocked = localSpeaking || parentSpeaking || attemptState === 'error' || attemptState === 'success';

  /* ─── Audio: hablar pregunta + opciones ─── */
  const speakFullQuestion = useCallback(() => {
    if (localSpeaking) return;
    const questionText = way?.stimulus?.text || way?.title || '';
    if (!questionText.trim()) {
      onSpeakEnd?.();
      return;
    }
    const optionsText = way?.options
      ?.map((o, idx) => `Opción ${String.fromCharCode(65 + idx)}: ${o.label}`)
      .join('. ') || '';
    const text = `${questionText}. ${optionsText}.`.trim();

    setLocalSpeaking(true);
    onSpeakStart?.();
    audioRef.current = audioService.speak(text, {
      rate: 0.85,
      onStart: () => { setLocalSpeaking(true); onSpeakStart?.(); },
      onEnd: () => { setLocalSpeaking(false); onSpeakEnd?.(); },
      onError: () => { setLocalSpeaking(false); onSpeakEnd?.(); },
    });
  }, [way, localSpeaking, onSpeakStart, onSpeakEnd]);

  /* ─── Auto-leer al montar ─── */
  useEffect(() => {
    speakFullQuestion();
    return () => {
      audioService.stopSpeak();
      audioRef.current = null;
    };
  }, [way?.id]);

  /* ─── Manejar elección ─── */
  const handleChoice = useCallback(
    (optionId: string) => {
      if (isLocked) return;
      const option = way?.options?.find((o) => o.id === optionId);
      if (!option) return;

      if (option.isCorrect) {
        setAttemptState('success');
        setHighlightedChoice(optionId);
        audioService.playSFX('success');
        hapticService.success();
        setTimeout(() => onComplete(true), 600);
      } else {
        setAttemptState('error');
        audioService.playSFX('error');
        hapticService.error();

        const correctOption = way?.options?.find((o) => o.isCorrect);
        if (correctOption) setHighlightedChoice(correctOption.id);

        setTimeout(() => {
          setAttemptState('retry');
          setHighlightedChoice(null);
          audioService.stopSpeak();
          speakFullQuestion();
        }, 1200);
      }
    },
    [way, isLocked, onComplete, speakFullQuestion]
  );

  /* ─── Press visual para móvil ─── */
  const handlePressStart = (id: string) => {
    if (!isLocked) setPressedId(id);
  };
  const handlePressEnd = () => setPressedId(null);

  /* ─── Render error de validación ─── */
  const validation = validateWay(way);
  if (!validation.valid) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center">
        <span className="text-3xl">🛠️</span>
        <h2 className="text-sm font-bold text-slate-700">Este reto necesita revisión</h2>
        <p className="text-xs text-slate-500">Pide ayuda a tu terapeuta</p>
        <button
          onClick={() => onComplete(false)}
          className="mt-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-500 active:scale-95 transition-all"
        >
          Saltar reto
        </button>
      </div>
    );
  }

  const questionText = way?.stimulus?.text || way?.title || '';
  const optionCount = way?.options?.length || 0;
  const gridCols = optionCount <= 2 ? 'grid-cols-2' : optionCount === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4';

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      {/* ─── Imagen principal ─── */}
      <div className="relative w-full rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden flex items-center justify-center min-h-[180px] max-h-[40vh]">
        {!imgLoaded && !imageError && !way?.stimulus?.image && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
          </div>
        )}
        <img
          src={
            way?.stimulus?.image && !imageError
              ? way.stimulus.image
              : imageError || !situationImg
              ? '/assets/pictograms/important.png'
              : situationImg
          }
          alt=""
          loading="lazy"
          draggable={false}
          onError={() => setImageError(true)}
          className={cn(
            'max-h-[40vh] w-auto max-w-full object-contain p-3 transition-opacity duration-300',
            (way?.stimulus?.image || imgLoaded) && !imageError ? 'opacity-100' : 'opacity-0'
          )}
        />
      </div>

      {/* ─── Pregunta ─── */}
      <div className="text-center">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">{questionText}</h2>
      </div>

      {/* ─── Indicador de audio ─── */}
      <AnimatePresence>
        {localSpeaking && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-600"
          >
            <span className="animate-pulse">🔊</span>
            Escuchando...
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Opciones: GRID responsive ─── */}
      <div className={cn('grid gap-3', gridCols)}>
        {way?.options?.map((option) => {
          const isHighlighted = highlightedChoice === option.id;
          const isCorrect = option.isCorrect;
          const isError = attemptState === 'error' && !isCorrect && !isHighlighted;
          const isPressed = pressedId === option.id && !isLocked;

          return (
            <motion.button
              key={option.id}
              onClick={() => handleChoice(option.id)}
              onPointerDown={() => handlePressStart(option.id)}
              onPointerUp={handlePressEnd}
              onPointerLeave={handlePressEnd}
              disabled={isLocked}
              animate={
                isError && !reduceMotion
                  ? { x: [0, -6, 6, -6, 6, 0] }
                  : isPressed
                  ? { scale: 0.95 }
                  : { scale: 1 }
              }
              transition={{ duration: 0.25 }}
              className={cn(
                'relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 transition-colors duration-150 outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30',
                isLocked && !isHighlighted ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95',
                isHighlighted
                  ? 'border-amber-400 bg-amber-50 shadow-md'
                  : isError
                  ? 'border-rose-300 bg-rose-50'
                  : isCorrect && attemptState === 'retry'
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50 shadow-sm'
              )}
            >
              {/* Checkmark en la opción correcta */}
              <AnimatePresence>
                {isHighlighted && isCorrect && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-sm"
                  >
                    ✓
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Imagen o emoji de la opción */}
              {option.image ? (
                <img
                  src={option.image}
                  alt=""
                  draggable={false}
                  className="h-16 w-16 object-contain sm:h-20 sm:w-20"
                />
              ) : (
                <span className="text-3xl sm:text-4xl">❓</span>
              )}

              {/* Label */}
              <span className="text-xs font-bold text-slate-700 sm:text-sm">{option.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* ─── Feedback de error ─── */}
      <AnimatePresence>
        {attemptState === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex flex-col items-center gap-1 py-2"
          >
            <span className="text-2xl">😢</span>
            <span className="text-xs font-bold text-rose-500">Inténtalo de nuevo</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Feedback de éxito ─── */}
      <AnimatePresence>
        {attemptState === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-1 py-2"
          >
            <span className="text-2xl">🎉</span>
            <span className="text-xs font-bold text-emerald-600">¡Muy bien!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Controles inferiores ─── */}
      <div className="flex justify-center gap-2 pt-1">
        <button
          onClick={speakFullQuestion}
          disabled={localSpeaking}
          className={cn(
            'flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95',
            localSpeaking && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span>🔊</span>Escuchar
        </button>
        {(way as any)?.hint && (
          <button
            onClick={() => audioService.speak((way as any).hint, { rate: 0.9 })}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
          >
            <span>💡</span>Pista
          </button>
        )}
      </div>

      {/* ─── Aviso último ejercicio ─── */}
      <AnimatePresence>
        {sessionEnding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-center"
          >
            <p className="text-[10px] font-bold text-amber-700">⏱️ Último ejercicio de la sesión</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WayRenderer;
