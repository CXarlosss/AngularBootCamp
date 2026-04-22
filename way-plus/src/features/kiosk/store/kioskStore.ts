import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface KioskState {
  isLocked: boolean;
  pin: string;              // PIN de 4 dígitos para salir
  exitAttempts: number;
  showExitModal: boolean;
  secretGestureCount: number; // Contador para gesto de salida oculto
  
  // Acciones
  lock: () => void;
  unlock: () => void;
  requestExit: () => void;
  cancelExit: () => void;
  validatePin: (input: string) => boolean;
  incrementSecretGesture: () => void;
  resetSecretGesture: () => void;
  setPin: (pin: string) => void;
}

export const useKioskStore = create<KioskState>()(
  persist(
    (set, get) => ({
      isLocked: false,
      pin: '0000',            // Default: terapeuta lo cambia en configuración
      exitAttempts: 0,
      showExitModal: false,
      secretGestureCount: 0,

      lock: () => set({ isLocked: true, showExitModal: false, exitAttempts: 0 }),
      unlock: () => set({ isLocked: false, showExitModal: false }),
      
      requestExit: () => set((state) => ({ 
        showExitModal: true, 
        exitAttempts: state.exitAttempts + 1 
      })),
      
      cancelExit: () => set({ showExitModal: false }),
      
      validatePin: (input) => input === get().pin,
      
      incrementSecretGesture: () => set((state) => {
        const newCount = state.secretGestureCount + 1;
        if (newCount >= 5) {
          return { secretGestureCount: 0, showExitModal: true };
        }
        return { secretGestureCount: newCount };
      }),
      
      resetSecretGesture: () => set({ secretGestureCount: 0 }),
      
      setPin: (pin) => set({ pin: pin.slice(0, 4) }),
    }),
    { name: 'way-kiosk-config' }
  )
);
