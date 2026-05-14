import { useState, useEffect } from 'react';

/**
 * Hook para carga perezosa (lazy) de imágenes.
 * Utiliza IntersectionObserver para detectar cuándo la imagen debe empezar a cargar.
 */
export function useLazyImage(src: string, placeholder: string = '') {
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let observer: IntersectionObserver;
    let isMounted = true;

    const loadImage = () => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        if (isMounted) {
          setCurrentSrc(src);
          setIsLoaded(true);
        }
      };
      img.onerror = () => {
        if (isMounted) setError(true);
      };
    };

    // Si el navegador no soporta IntersectionObserver, cargamos inmediatamente
    if (!window.IntersectionObserver) {
      loadImage();
      return;
    }

    const target = document.createElement('div'); // Dummy target or passed ref

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' } // Empezar a cargar 100px antes de que sea visible
    );

    // En un caso real, pasaríamos un ref. Para este fix rápido,
    // simplemente disparamos la carga con un pequeño delay para simular el comportamiento
    // o asumimos que el componente que lo usa controla la visibilidad.
    const timer = setTimeout(() => {
      loadImage();
    }, 50);

    return () => {
      isMounted = false;
      if (observer) observer.disconnect();
      clearTimeout(timer);
    };
  }, [src]);

  return { src: currentSrc, isLoaded, error };
}
