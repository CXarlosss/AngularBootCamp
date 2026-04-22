import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { registry } from '@/content/registry';
import { useDailyQuests } from '@/features/rewards/hooks/useDailyQuests';
import { StreakFlame } from '@/features/rewards/components/StreakFlame';
import type { Step } from '@/core/engine/types';
import { Sparkles, Target, Zap, Clock, ChevronRight } from 'lucide-react';

/* ─── helpers ────────────────────────────────────────────────────────── */
const pct = (done: number, total: number) =>
  total === 0 ? 0 : Math.round((done / total) * 100);

const LEVEL_META: Record<string, {
  icon: string; label: string; subtitle: string;
  color: string; bg: string;
}> = {
  'step-1-relaxation':  { icon: '🧘', label: 'Relajación',  subtitle: 'Calma y control', color: '#14B8A6', bg: '#CCFBF1' },
  'step-2-autonomy':    { icon: '⭐', label: 'Autonomía',   subtitle: '¡Yo puedo solo!', color: '#4F46E5', bg: '#E8E9FF' },
  'step-3-assertiveness':{ icon: '🤝', label: 'Asertividad', subtitle: 'Hablo y escucho', color: '#F59E0B', bg: '#FEF3C7' },
};

/* ─── Step card ──────────────────────────────────────────────────────── */
function StepCard({ step, done, total, locked, onTap }: {
  step: Step; done: number; total: number; locked: boolean; onTap: () => void;
}) {
  const meta = LEVEL_META[step.id] ?? {
    icon: '📚', label: step.title, subtitle: '', color: '#6B7280', bg: '#F3F4F6',
  };
  const progress = pct(done, total);
  const complete = progress === 100;

  return (
    <motion.button
      whileHover={!locked ? { x: 4, scale: 1.01 } : {}}
      whileTap={!locked ? { scale: 0.98 } : {}}
      onClick={!locked ? onTap : undefined}
      className={`w-full relative overflow-hidden rounded-[2.5rem] p-6 text-left border-4 transition-all duration-300
        ${locked ? 'bg-slate-50 border-slate-100 opacity-60 grayscale' : 'bg-white border-white shadow-xl shadow-slate-100'}
      `}
    >
      <div className="flex items-center gap-6">
        {/* Icon Container */}
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-inner
          ${locked ? 'bg-slate-200' : 'bg-gradient-to-br from-white to-slate-50'}
        `} style={{ color: meta.color }}>
          {meta.icon}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{meta.label}</h3>
            {locked ? <span className="text-xl">🔒</span> : complete ? <span className="text-xl">✅</span> : null}
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{meta.subtitle}</p>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full rounded-full"
                style={{ backgroundColor: meta.color }}
              />
            </div>
            <span className="text-[10px] font-black text-slate-500">{progress}%</span>
          </div>
        </div>
        
        {!locked && <ChevronRight className="text-slate-300" size={24} />}
      </div>
    </motion.button>
  );
}

/* ─── Daily quest card ───────────────────────────────────────────────── */
function DailyQuestCard({ quest, onTap }: { quest: any; onTap: () => void }) {
  const isMorning = quest.title?.includes('Mañana');
  const isNight = quest.title?.includes('Noche');
  
  const colors = isMorning 
    ? 'from-amber-400 to-orange-500' 
    : isNight 
      ? 'from-indigo-600 to-slate-800' 
      : 'from-blue-400 to-indigo-500';

  return (
    <motion.button
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={onTap}
      className={`relative w-[240px] h-[180px] shrink-0 rounded-[2.5rem] p-6 text-left shadow-xl overflow-hidden group
        ${quest.completed ? 'bg-emerald-500' : `bg-gradient-to-br ${colors}`}
      `}
    >
      <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl rotate-12 group-hover:scale-125 transition-transform duration-500">
        {isMorning ? '🌅' : isNight ? '🌙' : '☀️'}
      </div>
      
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">
            {quest.completed ? 'Completado' : 'Misión Diaria'}
          </div>
          <h4 className="text-lg font-black text-white leading-tight">
            {quest.title.split(' ')[2]}
          </h4>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2">
             <span className="text-sm">🪙</span>
             <span className="text-sm font-black text-white">+{quest.reward.coins}</span>
          </div>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-800">
            <Zap size={16} fill="currentColor" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export function LevelSelectPage() {
  const navigate = useNavigate();
  const { profile } = usePlayerStore();
  const completedWays = profile.completedWays;
  const { streakDays } = useRewardsStore();
  const dailyQuests = useDailyQuests();

  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registry.getStepsForLevel('pregamer')
      .then(setSteps)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalWays = steps.reduce((s, st) => s + st.ways.length, 0);
  const totalDone = steps.reduce(
    (s, st) => s + st.ways.filter(w => completedWays?.includes(w.id)).length, 0
  );
  const totalPct = pct(totalDone, totalWays);

  const handleStepTap = (step: Step) => {
    const firstIncomplete = step.ways.find(w => !completedWays?.includes(w.id));
    if (firstIncomplete) {
      navigate(`/play/pregamer/${step.id}/${firstIncomplete.id}`);
    } else {
      // Si ya está completo, ir al primero
      navigate(`/play/pregamer/${step.id}/${step.ways[0].id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Hero Header */}
      <section className="relative rounded-[3rem] bg-gradient-to-br from-indigo-600 to-primary-700 p-8 text-white shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-9xl opacity-10 rotate-12">🎮</div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-4xl font-black tracking-tighter leading-none">¡Hola, Gamer! 👋</h2>
              <p className="text-white/70 font-bold uppercase tracking-widest text-[10px]">¿Qué superpoder practicamos hoy?</p>
            </div>
            {streakDays > 0 && <StreakFlame />}
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black uppercase tracking-widest">Nivel PREGAMER</span>
              <span className="text-xs font-black">{totalDone}/{totalWays} WAYs</span>
            </div>
            <div className="h-4 bg-black/20 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${totalPct}%` }}
                className="h-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Daily Quests - Horizontal Scroll */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Clock size={14} /> Misiones de Hoy
          </h3>
          <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Ver Todas</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
          {dailyQuests.map(q => (
            <DailyQuestCard
              key={q.id}
              quest={q}
              onTap={() => navigate(`/play/pregamer/${q.stepId}/${q.wayId}`)}
            />
          ))}
          {dailyQuests.length === 0 && (
            <div className="w-full bg-slate-50 rounded-3xl p-8 border-2 border-dashed border-slate-200 text-center text-slate-400 font-bold">
              ¡Todas las misiones completadas! 🌟
            </div>
          )}
        </div>
      </section>

      {/* Module Modules */}
      <section className="space-y-4">
        <h3 className="px-2 text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Target size={14} /> Módulos de Entrenamiento
        </h3>
        <div className="space-y-4">
          {steps.map((step, idx) => {
            const stepDone = step.ways.filter(w => !completedWays || completedWays?.includes(w.id)).length;
            const prevStep = steps[idx - 1];
            const prevDone = prevStep
              ? prevStep.ways.filter(w => completedWays && completedWays?.includes(w.id)).length
              : 999;
            const locked = idx > 0 && prevDone < (prevStep?.ways.length ?? 0);

            return (
              <StepCard
                key={step.id}
                step={step}
                done={stepDone}
                total={step.ways.length}
                locked={locked}
                onTap={() => handleStepTap(step)}
              />
            );
          })}
        </div>
      </section>

      {/* GAMER Teaser */}
      <section className="relative rounded-[3rem] bg-slate-900 p-8 text-white shadow-2xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 opacity-50" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
            🎮
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-black tracking-tight">Nivel GAMER</h4>
            <p className="text-white/50 text-xs font-bold leading-tight mt-1">
              Desbloquea desafíos de memoria avanzada y lógica compleja.
            </p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
            🔒 Bloqueado
          </div>
        </div>
      </section>

    </div>
  );
}
