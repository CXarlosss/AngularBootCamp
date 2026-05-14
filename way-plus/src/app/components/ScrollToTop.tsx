import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que desplaza la ventana hacia arriba cada vez que cambia la ruta.
 * Útil para asegurar que el niño siempre comience desde arriba al navegar entre retos.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
