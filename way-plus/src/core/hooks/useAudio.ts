import { useCallback } from 'react';
import { audioService, SoundType, AmbientZone } from '../utils/audioService';

/**
 * Hook to interact with the WAY+ Audio Engine
 */
export function useAudio() {
  const playSFX = useCallback((type: SoundType) => {
    audioService.playSFX(type);
  }, []);

  const playAmbient = useCallback((zone: AmbientZone) => {
    audioService.playAmbient(zone);
  }, []);

  const stopAmbient = useCallback(() => {
    audioService.stopAmbient();
  }, []);

  const speak = useCallback((text: string) => {
    audioService.speak(text);
  }, []);

  const toggleAudio = useCallback((enabled?: boolean) => {
    return audioService.toggle(enabled);
  }, []);

  return {
    playSFX,
    playAmbient,
    stopAmbient,
    speak,
    toggleAudio
  };
}
