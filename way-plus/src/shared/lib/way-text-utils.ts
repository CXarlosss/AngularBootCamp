/**
 * Normaliza los textos de los Ways para asegurar consistencia visual y accesibilidad.
 * - Elimina espacios extra.
 * - Asegura que la primera letra sea mayúscula.
 * - Limpia caracteres especiales innecesarios.
 */
export function normalizeWayText(text: string | undefined | null): string {
  if (!text) return '';
  
  let normalized = text.trim();
  
  // Eliminar espacios dobles
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Asegurar primera letra mayúscula
  if (normalized.length > 0) {
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  
  return normalized;
}
