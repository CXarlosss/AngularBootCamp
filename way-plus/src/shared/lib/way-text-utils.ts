/**
 * Normaliza los textos de los Ways para asegurar consistencia visual y accesibilidad.
 * - Elimina espacios extra.
 * - Asegura que la primera letra sea mayúscula.
 * - Si viene todo en mayúsculas, lo convierte a Title Case.
 */
export function normalizeWayText(text: string | undefined | null): string {
  if (!text) return '';
  
  let normalized = text.trim();
  
  // Eliminar espacios dobles
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Si viene todo en mayúsculas, convertir a Title Case
  if (normalized === normalized.toUpperCase()) {
    normalized = normalized.toLowerCase().replace(/(^|[.]\s+)([a-z])/g, (_, sep, char) => sep + char.toUpperCase());
  } else if (normalized.length > 0) {
    // Si no es todo mayúsculas, asegurar primera letra mayúscula al menos
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  
  return normalized;
}
