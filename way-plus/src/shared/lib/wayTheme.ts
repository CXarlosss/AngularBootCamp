import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function way(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const wayTheme = {
  GLASS: {
    main: "bg-white/10 backdrop-blur-md border border-white/20",
    dark: "bg-black/40 backdrop-blur-lg border border-white/10",
    card: "bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl",
    cardSolid: "bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-zinc-800",
    header: "bg-white/70 dark:bg-black/70 backdrop-blur-md border-b border-white/20 dark:border-white/10",
    modalOverlay: "bg-black/60 backdrop-blur-sm",
    modalContent: "bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl",
    bottomNav: "bg-white/80 dark:bg-black/80 backdrop-blur-lg border-t border-zinc-200 dark:border-white/10",
  },
  INTERACTIVE: {
    base: "transition-all duration-200 ease-in-out cursor-pointer",
    hover: "hover:scale-[1.02] hover:-translate-y-0.5",
    active: "active:scale-95",
    focus: "focus:outline-none focus:ring-4 focus:ring-indigo-500/50",
    disabled: "opacity-50 cursor-not-allowed pointer-events-none grayscale-[50%]",
  },
  BTN: {
    primary: "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 min-h-[44px] px-6 py-2 rounded-xl font-semibold forced-colors:border",
    secondary: "bg-white/10 text-white hover:bg-white/20 min-h-[44px] px-6 py-2 rounded-xl font-medium border border-white/10 forced-colors:border",
    ghost: "bg-transparent hover:bg-white/10 min-h-[44px] px-4 py-2 rounded-xl font-medium",
    icon: "p-3 rounded-full bg-white/10 hover:bg-white/20 min-h-[44px] min-w-[44px] flex items-center justify-center",
    close: "p-2 rounded-full bg-black/20 hover:bg-black/40 text-white min-h-[44px] min-w-[44px] flex items-center justify-center",
    claim: "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/40 min-h-[44px] px-6 py-2 rounded-xl font-bold animate-pulse",
    remind: "bg-violet-500 text-white shadow-lg shadow-violet-500/30 hover:bg-violet-600 min-h-[44px] px-6 py-2 rounded-xl font-medium",
  },
  PROGRESS: {
    track: "w-full bg-white/10 rounded-full overflow-hidden",
    fill: {
      indigo: "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] transition-all duration-500 ease-out h-full",
      emerald: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all duration-500 ease-out h-full",
      amber: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] transition-all duration-500 ease-out h-full",
      violet: "bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)] transition-all duration-500 ease-out h-full",
    }
  },
  TEXT: {
    title: "text-2xl font-bold tracking-tight text-zinc-900 dark:text-white",
    subtitle: "text-lg font-medium text-zinc-600 dark:text-zinc-300",
    label: "text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400",
    micro: "text-xs text-zinc-500 dark:text-zinc-400",
  },
  STATUS: {
    completed: "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20",
    current: "text-indigo-500 bg-indigo-500/10 border border-indigo-500/20",
    locked: "text-zinc-400 bg-zinc-400/10 border border-zinc-400/20",
    warning: "text-amber-500 bg-amber-500/10 border border-amber-500/20",
    error: "text-red-500 bg-red-500/10 border border-red-500/20",
  },
  DECORATIVE: {
    orb: (color: string, position: string) => `absolute w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none ${color} ${position}`,
  },
  A11Y: {
    srOnly: "sr-only",
    focusRing: "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    touchTarget: "min-h-[44px] min-w-[44px]",
    forcedColors: "forced-colors:border forced-colors:border-current",
  }
};
