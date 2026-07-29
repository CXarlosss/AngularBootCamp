import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { useWayImage } from '@/core/services/wayImageService';
import type { Way } from '@/core/engine/types';
import { audioService } from '@/core/utils/audioService';
import { hapticService } from '@/core/services/hapticService';

type AttemptState = 'idle' | 'error' | 'retry';

interface Props {
  way: Way;
  onComplete: (success: boolean) => void;
  isSpeaking?: boolean;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
  sessionEnding?: boolean;
}

/* ─── Tailwind class constants ─── */

const ERROR_CONTAINER =
  'flex flex-col items-center justify-center gap-3 py-8 px-4 text-center';

const ERROR_EMOJI = 'text-2xl drop-shadow-sm';

const ERROR_TITLE = 'text-sm font-black text-slate-700 leading-normal';

const ERROR_SUBTITLE = 'text-xs font-bold text-slate-500';

const BTN_SKIP =
  'mt-2 px-6 py-3 min-h-[44px] min-w-[44px] rounded-2xl bg-indigo-600 text-white font-black text-xs shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all focus-visible:ring-4 focus-visible:ring-indigo-500/50 outline-none forced-colors:bg-[#1E1B4B] forced-colors:border-2 forced-colors:border-[#1E1B4B]';

const IMAGE_CONTAINER =
  'relative w-full max-h-[35vh] min-h-[160px] rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm border border-white/40 shadow-lg shadow-indigo-500/5 flex items-center justify-center forced-colors:bg-white forced-colors:border-2 forced-colors:border-[#1E1B4B]';

const IMAGE_SKELETON =
  'absolute inset-0 flex items-center justify-center bg-slate-100/80 backdrop-blur-sm';

const SPINNER =
  'w-6 h-6 rounded-full border-2 border-indigo-200/60 border-t-indigo-600 animate-spin';

const IMAGE =
  'max-h-[35vh] w-auto h-auto max-w-full object-contain p-2 transition-opacity duration-500';

const QUESTION =
  'text-sm font-black text-slate-800 leading-normal text-center px-2 forced-colors:text-[#1E1B4B]';

const AUDIO_INDICATOR =
  'flex items-center justify-center gap-2 text-indigo-600 font-bold text-xs forced-colors:text-[#1E1B4B]';

const OPTIONS_CONTAINER = 'flex gap-2 px-1';

const OPTION_BASE =
  'flex-1 min-h-[100px] sm:min-h-[110px] rounded-2xl border-2 p-2 flex flex-col items-center justify-center gap-1.5 relative overflow-hidden transition-all duration-200 active:scale-95 outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/50 forced-colors:border-2';

const OPTION_LOCKED = 'opacity-40 pointer-events-none';

const OPTION_HIGHLIGHTED =
  'bg-amber-50/90 backdrop-blur-sm border-amber-300 ring-2 ring-amber-200/50 shadow-lg shadow-amber-500/10';

const OPTION_ERROR =
  'bg-rose-50/90 backdrop-blur-sm border-rose-200 shadow-sm';

const OPTION_DEFAULT =
  'bg-white/90 backdrop-blur-sm border-white/60 hover:bg-indigo-50/80 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/10 active:bg-indigo-100/50 forced-colors:bg-white forced-colors:border-[#1E1B4B]';

const OPTION_CORRECT_RETRY =
  'border-emerald-300 bg-emerald-50/90 shadow-sm';

const OPTION_ICON =
  'w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-sm';

const OPTION_LABEL =
  'text-sm font-black text-slate-700 text-center leading-normal forced-colors:text-[#1E1B4B]';

const OPTION_CHECK =
  'absolute top-2 right-2 text-emerald-500 font-bold text-xs bg-white/80 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center shadow-sm';

const OPTION_PULSE =
  'absolute inset-0 bg-amber-400/10 animate-pulse rounded-2xl pointer-events-none';

const ERROR_FEEDBACK =
  'flex flex-col items-center py-2';

const ERROR_FEEDBACK_EMOJI = 'text-2xl drop-shadow-sm';

const ERROR_FEEDBACK_TEXT =
  'text-rose-600 font-bold text-xs mt-1 forced-colors:text-[#1E1B4B]';

const CONTROLS_CONTAINER = 'flex justify-center gap-2 pt-1';

const CONTROL_BTN =
  'flex items-center gap-2 px-4 py-2.5 min-h-[44px] min-w-[44px] rounded-xl bg-white/80 backdrop-blur-sm border border-white/40 text-slate-600 font-bold text-xs shadow-sm hover:bg-white hover:shadow-md active:scale-95 transition-all focus-visible:ring-4 focus-visible:ring-indigo-500/50 outline-none forced-colors:bg-white forced-colors:border-2 forced-colors:border-[#1E1B4B]';

const SESSION_WARNING =
  'p-3 rounded-2xl bg-amber-50/90 backdrop-blur-sm border border-amber-200/50 text-center shadow-sm forced-colors:bg-white forced-colors:border-2 forced-colors:border-[#1E1B4B]';

const SESSION_WARNING_TEXT =
  'text-[10px] font-black text-amber-700 forced-colors:text-[#1E1B4B]';

// Validación defensiva: WAY corrupto o incompleto
function validateWay(way: Way): { valid: boolean; error?: string } {
  if (!way) return { valid: false, error: 'way_missing' };
  if (!way.options || way.options.length < 2)
    return { valid: false, error: 'options_insufficient' };
  if (!way.stimulus?.text && !way.title)
    return { valid: false, error: 'text_missing' };
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
  const [highlightedChoice, setHighlightedChoice] = useState<string | null>(
    null
  );
  const [localSpeaking, setLocalSpeaking] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { src: situationImg, loaded: imgLoaded } = useWayImage(
    way?.stepNumber || 1,
    way?.wayNumber || 1,
    way?.theme || 'default'
  );

  const isLocked = localSpeaking || parentSpeaking || attemptState === 'error';

  // Guard + timeout defensivo
  const speakFullQuestion = useCallback(() => {
    if (localSpeaking) return;

    const questionText = way?.stimulus?.text || way?.title || '';
    if (!questionText.trim()) {
      setLocalSpeaking(false);
      onSpeakStart?.();
      onSpeakEnd?.();
      return;
    }

    const optionsText =
      way?.options
        ?.map((o, idx) => `Opción ${String.fromCharCode(65 + idx)}: ${o.label}`)
        .join('. ') || '';

    const text = `${questionText}. ${optionsText}.`.trim();

    setLocalSpeaking(true);
    onSpeakStart?.();

    audioService.speak(text, {
      rate: 0.85,
      onStart: () => {
        setLocalSpeaking(true);
        onSpeakStart?.();
      },
      onEnd: () => {
        setLocalSpeaking(false);
        onSpeakEnd?.();
      },
      onError: () => {
        setLocalSpeaking(false);
        onSpeakEnd?.();
      },
    });
  }, [way, localSpeaking, onSpeakStart, onSpeakEnd]);

  // Audio inicial con timeout de seguridad
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLocalSpeaking(false);
      onSpeakEnd?.();
    }, 5000);
    speakFullQuestion();
    return () => {
      clearTimeout(timeoutId);
      audioService.stopSpeak();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [way?.id]);

  const handleChoice = useCallback(
    (optionId: string) => {
      if (isLocked) return;

      const option = way?.options?.find((o) => o.id === optionId);
      if (!option) return;

      if (option.isCorrect) {
        setAttemptState('idle');
        setHighlightedChoice(null);
        audioService.playSFX('success');
        hapticService.success();
        onComplete(true);
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
        }, 1500);
      }
    },
    [way, isLocked, onComplete, speakFullQuestion]
  );

  // WAY corrupto: pantalla de error amigable
  const validation = validateWay(way);
  if (!validation.valid) {
    return (
      <div className={ERROR_CONTAINER} data-testid="way-error">
        <span className={ERROR_EMOJI}>🛠️</span>
        <h2 className={ERROR_TITLE}>Este reto necesita una revisión</h2>
        <p className={ERROR_SUBTITLE}>Pide ayuda a Maite</p>
        <button
          onClick={() => onComplete(false)}
          className={BTN_SKIP}
          data-testid="way-error-skip"
        >
          Saltar reto
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Imagen con skeleton + fallback */}
      <div className={IMAGE_CONTAINER}>
        {!imgLoaded && !imageError && (
          <div className={IMAGE_SKELETON}>
            <div className={SPINNER} />
          </div>
        )}

        <img
          src={
            imageError || !situationImg
              ? '/images/situations/default.png'
              : situationImg
          }
          alt=""
          loading="lazy"
          onError={() => setImageError(true)}
          className={cn(
            IMAGE,
            imgLoaded && !imageError ? 'opacity-100' : 'opacity-0'
          )}
          draggable={false}
        />
      </div>

      {/* Pregunta */}
      <div className="text-center px-2">
        <h2 className={QUESTION} data-testid="way-question">
          {way?.stimulus?.text || way?.title}
        </h2>
      </div>

      {/* Indicador audio */}
      <AnimatePresence>
        {localSpeaking && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={AUDIO_INDICATOR}
          >
            <span className="animate-pulse">🔊</span>
            Escuchando...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opciones */}
      <div className={OPTIONS_CONTAINER}>
        {way?.options?.map((option, idx) => {
          const isHighlighted = highlightedChoice === option.id;
          const isCorrect = option.isCorrect;
          const isError =
            attemptState === 'error' && !isCorrect && !isHighlighted;

          return (
            <motion.button
              key={option.id}
              data-testid="choice-option"
              data-choice-id={option.id}
              onPointerDown={() => handleChoice(option.id)}
              disabled={isLocked}
              animate={isError ? { x: [0, -4, 4, -4, 4, 0] } : {}}
              transition={{ duration: 0.2 }}
              className={cn(
                OPTION_BASE,
                isLocked && !isHighlighted && OPTION_LOCKED,
                isHighlighted
                  ? OPTION_HIGHLIGHTED
                  : isError
                  ? OPTION_ERROR
                  : OPTION_DEFAULT,
                isCorrect && attemptState === 'retry' && OPTION_CORRECT_RETRY
              )}
              aria-label={`Opción ${String.fromCharCode(65 + idx)}: ${
                option.label
              }`}
            >
              {isHighlighted && <div className={OPTION_PULSE} />}

              {/* Micro-animación acierto */}
              <AnimatePresence>
                {attemptState === 'idle' &&
                  highlightedChoice === option.id &&
                  isCorrect && (
                    <motion.div
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className={OPTION_CHECK}
                    >
                      ✓
                    </motion.div>
                  )}
              </AnimatePresence>

              {option.image ? (
                <img
                  src={option.image}
                  alt=""
                  className={OPTION_ICON}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  draggable={false}
                />
              ) : (
                <span className="text-2xl drop-shadow-sm">❓</span>
              )}

              <span className={OPTION_LABEL}>{option.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Feedback error */}
      <AnimatePresence>
        {attemptState === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={ERROR_FEEDBACK}
          >
            <span className={ERROR_FEEDBACK_EMOJI}>😢</span>
            <span className={ERROR_FEEDBACK_TEXT}>Inténtalo de nuevo</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controles */}
      <div className={CONTROLS_CONTAINER}>
        <button
          onClick={speakFullQuestion}
          disabled={localSpeaking}
          className={cn(CONTROL_BTN, 'disabled:opacity-50')}
          data-testid="speak-button"
        >
          <span aria-hidden="true">🔊</span>
          Escuchar
        </button>

        {(way as any)?.hint && (
          <button
            onClick={() =>
              audioService.speak((way as any).hint, { rate: 0.9 })
            }
            className={CONTROL_BTN}
          >
            <span aria-hidden="true">💡</span>
            Pista
          </button>
        )}
      </div>

      {/* Aviso sesión terminando */}
      {sessionEnding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={SESSION_WARNING}
        >
          <p className={SESSION_WARNING_TEXT}>
            ⏱️ Este es el último ejercicio de la sesión
          </p>
        </motion.div>
      )}
    </div>
  );
};
