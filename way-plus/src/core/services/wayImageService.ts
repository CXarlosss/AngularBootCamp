import { useState, useEffect } from "react";

/**
 * WAY+ PREGAMER - wayImageService.ts
 * Gestión de activos visuales para los retos.
 */

/**
 * Genera la ruta de la imagen para un WAY específico
 * Formato: /images/ways/way_s{step}_w{wayNumber}.jpg
 */
export function getWayImageUrl(stepNumber: number, wayNumber: number): string {
  return `/images/ways/way_s${stepNumber}_w${wayNumber}.jpg`;
}

/**
 * Verifica si una imagen existe (útil para validación en tiempo de ejecución)
 */
export function checkImageExists(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Precarga imágenes para evitar el efecto de parpadeo (flash of unstyled content)
 */
export async function preloadWayImages(urls: string[]): Promise<void> {
  const promises = urls.map((url) => checkImageExists(url));
  await Promise.all(promises);
}

/**
 * Placeholder SVG como fallback dinámico
 */
export function getWayPlaceholder(stepNumber: number): string {
  const colors = ["#EEF2FF", "#ECFDF5", "#FFF7ED"]; // Indigo, Emerald, Orange pastels
  const color = colors[(stepNumber - 1) % colors.length] || "#F8FAFC";
  const textColor = ["#4338CA", "#059669", "#D97706"][(stepNumber - 1) % 3];

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="${color}"/>
      <rect x="350" y="250" width="100" height="100" rx="20" fill="white" opacity="0.5"/>
      <text x="400" y="315" text-anchor="middle" font-family="system-ui, sans-serif" font-size="60">📷</text>
      <text x="400" y="380" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="${textColor}">
        SITUACIÓN WAY+ (STEP ${stepNumber})
      </text>
    </svg>
  `)}`;
}

/**
 * Hook para manejar la carga de imagen con lógica de fallback automático
 */
export function useWayImage(stepNumber: number, wayNumber: number) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const imageUrl = getWayImageUrl(stepNumber, wayNumber);
  const placeholderUrl = getWayPlaceholder(stepNumber);

  useEffect(() => {
    setLoaded(false);
    setError(false);

    const img = new Image();
    img.onload = () => setLoaded(true);
    img.onerror = () => {
      setError(true);
      setLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  return {
    src: error ? placeholderUrl : imageUrl,
    loaded,
    error,
  };
}
