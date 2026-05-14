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
  return `/images/ways/way_s${stepNumber}_w${wayNumber}`;
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
    
    // Intentamos cargar todas las extensiones en paralelo para máxima velocidad
    const loadPromises = EXTENSIONS.map(ext => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        const url = basePath + ext;
        img.onload = () => {
          if (cancelledRef.current) reject('cancelled');
          else resolve(url);
        };
        img.onerror = () => reject('failed');
        img.src = url;
      });
    });

    // Tomamos la primera que resuelva (usualmente .webp o .png)
    // Usamos una implementación compatible con navegadores que no soportan Promise.any
    const anyPromise = (promises: Promise<string>[]) => {
      return new Promise<string>((resolve, reject) => {
        let rejectedCount = 0;
        promises.forEach(p => {
          p.then(resolve).catch(() => {
            rejectedCount++;
            if (rejectedCount === promises.length) reject('all_failed');
          });
        });
      });
    };

    anyPromise(loadPromises)
      .then(url => {
        if (!cancelledRef.current) {
          setSrc(url);
          setLoaded(true);
        }
      })
      .catch(() => {
        // Si todas fallan, usamos el pictograma de categoría
        if (!cancelledRef.current) {
          setHasError(true);
          setSrc(getWayPlaceholder(theme));
          setLoaded(true);
        }
      });

    return () => {
      cancelledRef.current = true;
    };
  }, [stepNumber, wayNumber, theme]);

  return { src, loaded, hasError };
}

export function preloadWayImages(stepNumber: number, wayNumber: number) {
  const basePath = getWayImageBase(stepNumber, wayNumber);
  EXTENSIONS.forEach(ext => {
    const img = new Image();
    img.src = basePath + ext;
  });
}
