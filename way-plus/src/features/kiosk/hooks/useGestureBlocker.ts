import { useEffect } from 'react';

export function useGestureBlocker(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    // 1. Prevenir menú contextual (click derecho / pulsación larga)
    const blockContext = (e: Event) => e.preventDefault();
    
    // 2. Prevenir zoom con gestos de pinza
    const blockZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    
    // 3. Prevenir teclas de sistema
    const blockKeys = (e: KeyboardEvent) => {
      const blocked = [
        'Escape', 'F5', 'F11', 'F12', 'Alt', 'Meta', 'ContextMenu'
      ];
      if (blocked.includes(e.key) || (e.altKey && e.key === 'F4')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('contextmenu', blockContext);
    document.addEventListener('touchstart', blockZoom, { passive: false });
    document.addEventListener('keydown', blockKeys);
    
    // CSS dinámico para bloquear selección y overscroll
    const style = document.createElement('style');
    style.id = 'kiosk-blocker';
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        overscroll-behavior: none !important;
      }
      html, body {
        overflow: hidden !important;
        touch-action: manipulation !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('contextmenu', blockContext);
      document.removeEventListener('touchstart', blockZoom);
      document.removeEventListener('keydown', blockKeys);
      document.getElementById('kiosk-blocker')?.remove();
    };
  }, [enabled]);
}
