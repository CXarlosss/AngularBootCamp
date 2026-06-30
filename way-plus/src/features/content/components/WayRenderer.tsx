import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { useWayImage } from '@/core/services/wayImageService';
import type { Way } from '@/core/engine/types';
import { audioService } from '@/core/utils/audioService';

type AttemptState = 'idle' | 'error' | 'retry';

interface Props {
  way: Way;
  onComplete: (success: boolean) => void;
  isSpeaking?: boolean;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
  sessionEnding?: boolean;
}

export const WayRenderer: React.FC<Props> = ({
  way,
  onComplete,
  isSpeaking: parentSpeaking = false,
  onSpeakStart,
  onSpeakEnd,
  sessionEnding = false
}) => {
  const [attemptState, setAttemptState] = useState<AttemptState>('idle');
  const [highlightedChoice, setHighlightedChoice] = useState<string | null>(null);
  const [localSpeaking, setLocalSpeaking] = useState(false);
  
  const { src: situationImg, loaded: imgLoaded } = useWayImage(
    way.stepNumber || 1, 
    way.wayNumber || 1,
    way.theme || 'default'
  );

  const isLocked = localSpeaking || parentSpeaking || attemptState === 'error';

  const speakFullQuestion = useCallback(() => {
    if (localSpeaking) return;
    
    const questionText = way.stimulus?.text || way.title || '';
    if (!questionText.trim()) {
      // WAY sin texto: liberar inmediatamente
      setLocalSpeaking(false);
      onSpeakStart?.();
      onSpeakEnd?.();
      return;
    }
    const optionsText = way.options?.map((o, idx) => 
      `Opción ${String.fromCharCode(65 + idx)}: ${o.label}`
    ).join('. ');
    
    const text = `${questionText}. ${optionsText}.`;
    
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
      }
    });
  }, [way, localSpeaking, onSpeakStart, onSpeakEnd]);

  // Audio inicial automático — con timeout de seguridad
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Fallback: si tras 5s sigue "speaking", forzar liberación
      setLocalSpeaking(false);
      onSpeakEnd?.();
    }, 5000);

    speakFullQuestion();

    return () => {
      clearTimeout(timeoutId);
      audioService.stopSpeak();
    };
  }, [way.id]); // ← SOLO way.id, NUNCA speakFullQuestion

  const handleChoice = useCallback((optionId: string) => {
    if (isLocked) return;
    
    const option = way.options.find(o => o.id === optionId);
    if (!option) return;
    
    if (option.isCorrect) {
      // Éxito
      setAttemptState('idle');
      setHighlightedChoice(null);
      audioService.playSFX('success');
      onComplete(true);
    } else {
      // Error (HF2)
      setAttemptState('error');
      audioService.playSFX('error');
      
      const correctOption = way.options.find(o => o.isCorrect);
      if (correctOption) setHighlightedChoice(correctOption.id);
      
      setTimeout(() => {
        setAttemptState('retry');
        setHighlightedChoice(null);
        audioService.stopSpeak();
        speakFullQuestion();
      }, 1500);
    }
  }, [way, isLocked, onComplete, speakFullQuestion]);

  return (
    <div className="flex flex-col gap-3">
      {/* Imagen */}
      <div className="relative w-full max-h-[35vh] min-h-[160px] rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm flex items-center justify-center">
        <img data-testid="way-image"
          src={situationImg || '/images/situations/default.png'}
          alt=""
          loading="lazy"
          className={cn(
            "max-h-[35vh] w-auto h-auto max-w-full object-contain p-2 transition-opacity duration-500",
            imgLoaded ? "opacity-100" : "opacity-0"
          )}
          draggable={false}
        />
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="w-6 h-6 rounded-full border-2 border-violet-200 border-t-violet-500 animate-spin" />
          </div>
        )}
      </div>
      
      {/* Pregunta */}
      <div className="text-center px-2">
        <h2 data-testid="way-question" className="text-sm font-bold text-slate-800 leading-normal" style={{ fontFamily: 'Verdana, sans-serif' }}>
          {way.stimulus?.text || way.title}
        </h2>
      </div>
      
      {/* Indicador audio */}
      <AnimatePresence>
        {localSpeaking && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center gap-2 text-violet-600 font-bold text-xs"
          >
            <span className="animate-pulse">🔊</span>
            Escuchando...
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Opciones */}
      <div className="flex gap-2 px-1">
        {way.options.map((option, idx) => {
          const isHighlighted = highlightedChoice === option.id;
          const isCorrect = option.isCorrect;
          const isError = attemptState === 'error' && !isCorrect && !isHighlighted;
          
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
                "flex-1 min-h-[100px] sm:min-h-[110px] rounded-xl border-2 p-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-150 relative overflow-hidden active:scale-95",
                isLocked && !isHighlighted ? "opacity-40 pointer-events-none" : "opacity-100",
                isHighlighted 
                  ? "bg-amber-50 border-amber-300 ring-2 ring-amber-200"
                  : isError
                  ? "bg-rose-50 border-rose-200"
                  : "bg-white border-slate-200 hover:bg-violet-50 active:bg-violet-100",
                isCorrect && attemptState === 'retry' ? "border-emerald-300 bg-emerald-50" : ""
              )}
              aria-label={`Opción ${String.fromCharCode(65 + idx)}: ${option.label}`}
            >
              {isHighlighted && (
                <div className="absolute inset-0 bg-amber-400/10 animate-pulse rounded-xl" />
              )}
              
              <AnimatePresence>
                {attemptState === 'idle' && highlightedChoice === option.id && isCorrect && (
                   <motion.div
                     initial={{ scale: 1.2, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     transition={{ duration: 0.15 }}
                     className="absolute top-2 right-2 text-emerald-500 font-bold"
                   >
                     ✓
                   </motion.div>
                )}
              </AnimatePresence>
              
              {option.image ? (
                <img 
                  src={option.image} 
                  alt="" 
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                  loading="lazy"
                  draggable={false}
                />
              ) : (
                <span className="text-lg">❓</span>
              )}
              
              <span className="text-sm font-bold text-slate-700 text-center leading-normal" style={{ fontFamily: 'Verdana, sans-serif' }}>
                {option.label}
              </span>
            </motion.button>
          );
        })}
      </div>
      
      {/* Feedback error */}
      <AnimatePresence>
        {attemptState === 'error' && (
          <motion.div
            data-testid="retry-feedback"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center py-1"
          >
            <span className="text-lg">😢</span>
            <span className="text-rose-600 font-bold text-xs mt-1">Inténtalo de nuevo</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Controles */}
      <div className="flex justify-center gap-2 pt-1">
        <button
          data-testid="speak-button"
          onClick={speakFullQuestion}
          disabled={localSpeaking}
          className="flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-xs active:scale-95 transition-transform duration-150 disabled:opacity-50 shadow-sm"
        >
          <span>🔊</span>
          Escuchar
        </button>
        
        {(way as any).hint && (
          <button
            onClick={() => audioService.speak((way as any).hint, { rate: 0.9 })}
            className="flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-lg bg-white border border-slate-200 text-slate-500 font-bold text-xs active:scale-95 transition-transform duration-150 shadow-sm"
          >
            <span>💡</span>
            Pista
          </button>
        )}
      </div>
      
      {/* Aviso sesión terminando */}
      {sessionEnding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-center"
        >
          <p className="text-[10px] font-bold text-amber-700">
            ⏱️ Este es el último ejercicio de la sesión
          </p>
        </motion.div>
      )}
    </div>
  );
};
