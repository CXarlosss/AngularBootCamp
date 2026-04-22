import { useEffect } from 'react';

/**
 * Blocks unwanted gestures (context menu, pinch-zoom, keyboard shortcuts)
 * WITHOUT ever setting overflow:hidden on body — that kills the page scroll.
 */
export function useGestureBlocker(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    // 1. Block context menu (long-press on mobile)
    const blockContext = (e: Event) => e.preventDefault();

    // 2. Block pinch-to-zoom (multi-touch) but allow single-finger scroll
    const blockPinch = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };

    // 3. Block system keyboard shortcuts
    const blockKeys = (e: KeyboardEvent) => {
      const blocked = ['Escape', 'F5', 'F11', 'F12', 'ContextMenu'];
      if (blocked.includes(e.key) || (e.altKey && e.key === 'F4')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('contextmenu', blockContext);
    document.addEventListener('touchstart', blockPinch, { passive: false });
    document.addEventListener('keydown', blockKeys);

    // Inject minimal CSS — NO overflow:hidden, NO touch-action:none on body
    // Those would kill scroll. We only block text selection and callouts.
    const style = document.createElement('style');
    style.id = 'kiosk-gesture-blocker';
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      input, textarea {
        -webkit-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('contextmenu', blockContext);
      document.removeEventListener('touchstart', blockPinch);
      document.removeEventListener('keydown', blockKeys);
      document.getElementById('kiosk-gesture-blocker')?.remove();
    };
  }, [enabled]);
}
