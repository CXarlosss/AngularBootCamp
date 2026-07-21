import React, { useState, useEffect, useCallback } from 'react';

interface VoiceButtonProps {
  text: string;
}

export function VoiceButton({ text }: VoiceButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSpeech = useCallback(() => {
    if (!window.speechSynthesis) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel(); // Detener audios previos
    
    const utterance = new SpeechSynthesisUtterance(text);
    // Configuración terapéutica sugerida
    utterance.lang = 'es-ES'; 
    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  }, [isPlaying, text]);

  return (
    <button
      onClick={toggleSpeech}
      aria-label={isPlaying ? "Detener instrucciones de audio" : "Escuchar instrucciones"}
      className={`voice-btn ${isPlaying ? 'voice-btn--speaking text-rose-500' : 'text-indigo-600'} shrink-0`}
    >
      {isPlaying ? '⏹️' : '🔊'}
    </button>
  );
}
