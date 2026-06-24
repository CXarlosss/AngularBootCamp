import { useState, useEffect, useRef } from 'react';

// Mapeo de temas a pictogramas base (fallbacks de alta calidad)
const THEME_PICTOS: Record<string, string> = {
  'relaxation': '/assets/pictograms/happy.png',
  'social': '/assets/pictograms/social.png',
  'danger': '/assets/pictograms/danger.png',
  'autonomy': '/assets/pictograms/important.png',
  'default': '/assets/pictograms/important.png'
};

export function getWayImageBase(stepNumber: number, wayNumber: number): string {
  return `/images/ways/webp/way_s${stepNumber}_w${wayNumber}`;
}

export function getWayPlaceholder(theme: string = 'default'): string {
  return THEME_PICTOS[theme] || THEME_PICTOS['default'];
}

const EXTENSIONS = ['.webp', '.png', '.jpg'] as const;

interface UseWayImageResult {
  src: string;
  loaded: boolean;
  hasError: boolean;
}

/**
 * Hook para cargar imágenes de retos con sistema de fallbacks inteligentes.
 * Optimizado para cargar extensiones en paralelo.
 */
export function useWayImage(stepNumber: number, wayNumber: number, theme: string = 'default'): UseWayImageResult {
  const [src, setSrc] = useState<string>('');
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    setLoaded(false);
    setHasError(false);
    setSrc('');

    const basePath = getWayImageBase(stepNumber, wayNumber);
    
    const tryExtensions = async () => {
      for (const ext of EXTENSIONS) {
        if (cancelledRef.current) return;
        try {
          const url = basePath + ext;
          // Use fetch HEAD to avoid 404 errors polluting the console
          const response = await fetch(url, { method: 'HEAD' });
          if (response.ok && !cancelledRef.current) {
            setSrc(url);
            setLoaded(true);
            return; // Success, stop trying other extensions
          }
        } catch (e) {
          // Network error or CORS, continue to next extension
        }
      }
      
      // Si todas fallan, usamos el pictograma de categoría
      if (!cancelledRef.current) {
        setHasError(true);
        setSrc(getWayPlaceholder(theme));
        setLoaded(true);
      }
    };

    tryExtensions();

    return () => {
      cancelledRef.current = true;
    };
  }, [stepNumber, wayNumber, theme]);

  return { src, loaded, hasError };
}

export function preloadWayImages(stepNumber: number, wayNumber: number) {
  const basePath = getWayImageBase(stepNumber, wayNumber);
  // Solo precargar webp para no spammar la red con posibles 404s
  const img = new Image();
  img.src = basePath + '.webp';
}
