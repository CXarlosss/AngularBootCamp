import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { way } from "./wayTheme";

export function rw(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const wayResponsive = {
  GRIDS: {
    gridShop: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
    gridAlbum: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4",
    gridCloset: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3",
    gridZen: "grid grid-cols-1 sm:grid-cols-2 gap-6",
    gridSecrets: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5",
  },
  TABLES: {
    tableScroll: "w-full overflow-x-auto overflow-y-hidden",
    tableMinWidth: "min-w-[600px] w-full",
    tableCell: "px-4 py-3 text-sm sm:px-6 sm:py-4",
  },
  MODALS: {
    modalWidth: "w-full max-w-md mx-auto",
    modalWidthLg: "w-full max-w-2xl mx-auto",
    modalPadding: "p-4 sm:p-6 md:p-8",
  },
  SAFE_AREAS: {
    safeBottom: "pb-[env(safe-area-inset-bottom,20px)]",
    safeTop: "pt-[env(safe-area-inset-top,20px)]",
    safeX: "px-[env(safe-area-inset-left,16px)] pr-[env(safe-area-inset-right,16px)]",
  },
  ADAPTIVE_SIZES: {
    avatarHero: "w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32",
    iconHero: "w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16",
    titleHero: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight",
    subtitleHero: "text-lg sm:text-xl md:text-2xl text-zinc-600 dark:text-zinc-400",
  },
  HEADERS: {
    headerCompact: "h-14 sm:h-16 px-4 flex items-center justify-between",
    headerNormal: "h-16 sm:h-20 px-4 sm:px-6 flex items-center justify-between",
  },
  CONTAINERS: {
    containerMobile: "w-full px-4 sm:px-6 md:px-8 mx-auto",
    containerTight: "w-full max-w-3xl px-4 sm:px-6 mx-auto",
    maxWidthMobile: "max-w-md mx-auto",
    maxWidthTablet: "max-w-2xl mx-auto",
  }
};
