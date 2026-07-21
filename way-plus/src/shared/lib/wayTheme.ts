/**
 * WAY+ Design System Tokens
 * Centraliza todas las clases Tailwind para coherencia visual y mantenibilidad.
 */

/* ─── Layout & Glassmorphism ─── */
export const GLASS = {
  main: 'min-h-screen bg-[#F8FAFF] relative overflow-hidden font-sans forced-colors:bg-white',
  dark: 'min-h-[100dvh] bg-slate-900 relative overflow-hidden font-sans forced-colors:bg-black forced-colors:text-white',
  card: 'bg-white/80 backdrop-blur-md border border-white/20 shadow-xl shadow-indigo-500/10 rounded-3xl forced-colors:bg-white forced-colors:border-2 forced-colors:border-[#1E1B4B]',
  cardSolid: 'bg-white/95 backdrop-blur-md border-2 border-indigo-400 shadow-xl shadow-indigo-500/20 rounded-3xl forced-colors:bg-white forced-colors:border-2 forced-colors:border-[#1E1B4B]',
  header: 'sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/30 px-4 py-3 shadow-sm forced-colors:bg-white forced-colors:border-b-2 forced-colors:border-[#1E1B4B]',
  modalOverlay: 'fixed inset-0 z-[1100] bg-indigo-950/60 backdrop-blur-sm flex items-center justify-center p-5',
  modalContent: 'w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-8 text-center shadow-2xl border-4 border-white/80 forced-colors:bg-white forced-colors:border-4 forced-colors:border-[#1E1B4B]',
  bottomNav: 'fixed bottom-0 inset-x-0 bg-white/10 backdrop-blur-xl border-t border-white/20 p-6 pb-10 z-50 shadow-[0_-10px_40px_rgba(99,102,241,0.3)] forced-colors:bg-white forced-colors:border-t-2 forced-colors:border-[#1E1B4B]',
} as const;

/* ─── Interactive States ─── */
export const INTERACTIVE = {
  base: 'transition-all duration-200 outline-none',
  hover: 'hover:scale-[1.02] hover:-translate-y-0.5',
  active: 'active:scale-95',
  focus: 'focus-visible:ring-4 focus-visible:ring-indigo-500/50 focus-visible:outline-none',
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:active:scale-100',
} as const;

/* ─── Buttons ─── */
export const BTN = {
  primary: 'bg-indigo-600 text-white font-black px-8 py-4 rounded-3xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 ' + INTERACTIVE.hover + ' ' + INTERACTIVE.active + ' ' + INTERACTIVE.focus + ' forced-colors:bg-[#1E1B4B] forced-colors:border-2 forced-colors:border-[#1E1B4B]',
  secondary: 'bg-white/80 backdrop-blur-md text-slate-700 font-bold px-5 py-2.5 rounded-2xl border border-white/60 shadow-sm hover:bg-white hover:shadow-md ' + INTERACTIVE.active + ' ' + INTERACTIVE.focus + ' forced-colors:bg-white forced-colors:border-2 forced-colors:border-[#1E1B4B]',
  ghost: 'bg-transparent text-slate-600 font-bold px-4 py-2 rounded-2xl border border-transparent hover:bg-white/40 hover:backdrop-blur-sm hover:border-white/30 hover:text-slate-800 hover:shadow-sm ' + INTERACTIVE.active + ' ' + INTERACTIVE.focus + ' forced-colors:bg-white forced-colors:border-2 forced-colors:border-[#1E1B4B]',
  icon: 'w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-white/70 hover:bg-white/95 backdrop-blur-md border border-white/40 text-slate-600 flex items-center justify-center ' + INTERACTIVE.hover + ' ' + INTERACTIVE.active + ' ' + INTERACTIVE.focus + ' shadow-[0_4px_12px_rgba(99,102,241,0.06)] forced-colors:bg-white forced-colors:text-[#1E1B4B] forced-colors:border-2 forced-colors:border-[#1E1B4B]',
  close: 'w-11 h-11 rounded-2xl bg-white/80 hover:bg-white backdrop-blur-sm border border-white/40 text-slate-500 hover:text-slate-700 flex items-center justify-center ' + INTERACTIVE.hover + ' ' + INTERACTIVE.active + ' ' + INTERACTIVE.focus + ' shadow-sm forced-colors:bg-white forced-colors:text-[#1E1B4B] forced-colors:border-2 forced-colors:border-[#1E1B4B]',
  claim: 'w-full py-3.5 rounded-2xl bg-amber-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 hover:bg-amber-400 ' + INTERACTIVE.hover + ' ' + INTERACTIVE.active + ' ' + INTERACTIVE.focus + ' forced-colors:bg-[#1E1B4B] forced-colors:border-2 forced-colors:border-[#1E1B4B]',
  remind: 'w-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-black py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm ' + INTERACTIVE.active + ' ' + INTERACTIVE.focus + ' forced-colors:bg-white forced-colors:text-[#1E1B4B] forced-colors:border-2 forced-colors:border-[#1E1B4B]',
} as const;

/* ─── Progress ─── */
export const PROGRESS = {
  track: 'h-4 bg-white/20 rounded-full overflow-hidden border border-white/20 shadow-inner forced-colors:bg-white forced-colors:border-2 forced-colors:border-[#1E1B4B]',
  fill: (color: 'indigo' | 'emerald' | 'amber' | 'violet' = 'indigo') => {
    const colors = {
      indigo: 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]',
      emerald: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]',
      amber: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]',
      violet: 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]',
    };
    return 'h-full rounded-full ' + colors[color] + ' forced-colors:bg-[#1E1B4B]';
  },
} as const;

/* ─── Typography ─── */
export const TEXT = {
  title: 'text-2xl sm:text-3xl font-black text-slate-800 drop-shadow-sm forced-colors:text-[#1E1B4B]',
  subtitle: 'text-sm font-bold text-slate-500 uppercase tracking-wider',
  label: 'text-[11px] font-black text-slate-500 uppercase tracking-widest forced-colors:text-[#1E1B4B]',
  micro: 'text-[10px] font-black uppercase tracking-widest',
} as const;

/* ─── Status Colors ─── */
export const STATUS = {
  completed: 'bg-emerald-50/90 backdrop-blur-md border border-emerald-200/50 shadow-lg shadow-emerald-500/10 text-emerald-950',
  current: 'bg-white/95 backdrop-blur-md border-2 border-indigo-400 shadow-xl shadow-indigo-500/20 text-indigo-950',
  locked: 'bg-slate-300/30 backdrop-blur-md border border-white/20 shadow-none opacity-60 cursor-not-allowed text-slate-700',
  warning: 'bg-amber-100/90 backdrop-blur-md border border-amber-300/50 text-amber-900',
  error: 'bg-rose-50/90 backdrop-blur-md border border-rose-200 text-rose-700',
} as const;

/* ─── Decorative ─── */
export const DECORATIVE = {
  orb: (color: 'indigo' | 'emerald' | 'amber' | 'blue' | 'slate' = 'indigo', position: 'top-right' | 'bottom-left' = 'top-right') => {
    const colors = {
      indigo: 'bg-indigo-200/40',
      emerald: 'bg-emerald-200/30',
      amber: 'bg-amber-200/40',
      blue: 'bg-blue-200/30',
      slate: 'bg-slate-800/30',
    };
    const positions = {
      'top-right': 'top-[-10%] right-[-10%]',
      'bottom-left': 'bottom-[10%] left-[-10%]',
    };
    return `fixed ${positions[position]} w-[400px] h-[400px] ${colors[color]} rounded-full blur-[100px] pointer-events-none`;
  },
} as const;

/* ─── Helper: Combine tokens ─── */
export function way(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
