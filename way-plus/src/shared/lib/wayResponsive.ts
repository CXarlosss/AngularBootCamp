// src/shared/lib/wayResponsive.ts
/**
 * WAY+ Responsive Utilities
 * Clases Tailwind adaptativas para móvil-first sin breakpoints redundantes.
 */

export const RESPONSIVE = {
  /* ─── Grids ─── */
  gridShop: 'grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4',
  gridAlbum: 'grid-cols-2 sm:grid-cols-3 gap-3',
  gridCloset: 'grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3',
  gridZen: 'grid-cols-2 gap-4 w-full max-w-[320px] sm:max-w-[400px]',
  gridSecrets: 'grid-cols-2 sm:grid-cols-3 gap-3',

  /* ─── Tablas ─── */
  tableScroll: 'overflow-x-auto',
  tableMinWidth: 'min-w-[640px]',
  tableCell: 'px-4 py-4 sm:px-6 sm:py-5',

  /* ─── Modales ─── */
  modalWidth: 'w-full max-w-[90vw] sm:max-w-sm',
  modalWidthLg: 'w-full max-w-[95vw] sm:max-w-lg',
  modalPadding: 'p-6 sm:p-8',

  /* ─── Safe Areas ─── */
  safeBottom: 'pb-[env(safe-area-inset-bottom)]',
  safeTop: 'pt-[env(safe-area-inset-top)]',

  /* ─── Tamaños adaptativos ─── */
  avatarHero: 'text-[4rem] sm:text-[5rem]',
  iconHero: 'w-12 h-12 sm:w-14 sm:h-14',
  titleHero: 'text-2xl sm:text-3xl',
  subtitleHero: 'text-sm sm:text-base',

  /* ─── Headers compactos ─── */
  headerCompact: 'py-2 sm:py-3',
  headerNormal: 'py-3 sm:py-4',

  /* ─── Contenedores ─── */
  containerMobile: 'px-4 sm:px-6',
  containerTight: 'px-3 sm:px-4',
  maxWidthMobile: 'max-w-sm mx-auto',
  maxWidthTablet: 'max-w-2xl mx-auto',
} as const;

/* ─── Helper: Aplicar responsive + wayTheme juntos ─── */
export function rw(
  responsiveKey: keyof typeof RESPONSIVE,
  extraClasses?: string
): string {
  return [RESPONSIVE[responsiveKey], extraClasses].filter(Boolean).join(' ');
}
