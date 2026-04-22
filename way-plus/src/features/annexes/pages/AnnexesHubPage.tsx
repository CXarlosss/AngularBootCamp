import React from 'react';
import { format } from 'date-fns';
import { Sparkles } from 'lucide-react';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { AnnexCard } from '../components/AnnexCard';
import { WeeklySummary } from '../components/WeeklySummary';
import { PreFlightChecklist } from '../components/PreFlightChecklist';
import { SessionTimer } from '../components/SessionTimer';

export const AnnexesHubPage: React.FC = () => {
  const [timerLocked, setTimerLocked] = React.useState(true);
  
  const { relaxationLog, roleplayLog } = usePlayerStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const hasRelaxationToday = !!relaxationLog[today]?.completed;
  const hasRoleplayToday = !!roleplayLog[today] && roleplayLog[today].length > 0;

  return (
    <div className="flex-1 space-y-10 pb-20">
      <header className="px-2 space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
          📋 Mis <span className="text-primary-500">Anexos</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm leading-relaxed">
          Sigue tu progreso diario para convertirte en un Maestro WAY+.
        </p>
      </header>

      {/* Pre-flight Checklist & Timer Section */}
      <section className="space-y-6">
        <PreFlightChecklist onComplete={() => setTimerLocked(false)} />
        <SessionTimer locked={timerLocked} />
      </section>

      {/* Cards Grid */}
      <section className="space-y-6">
        <h2 className="text-xl font-black text-slate-800 px-2 flex items-center gap-2">
          <Sparkles className="text-primary-500" size={20} />
          Registros Diarios
        </h2>
        
        <div className="grid grid-cols-1 gap-4">
          <AnnexCard
            title="Relajación"
            subtitle="Practica 5 minutos diarios"
            icon="🧘"
            to="/anexos/relajacion"
            color="bg-gradient-to-br from-emerald-400 to-teal-500"
            completedToday={hasRelaxationToday}
          />
          <AnnexCard
            title="Role Playing"
            subtitle="Practica situaciones reales"
            icon="🎭"
            to="/anexos/roleplaying"
            color="bg-gradient-to-br from-orange-400 to-rose-500"
            completedToday={hasRoleplayToday}
          />
          <AnnexCard
            title="Seguimiento"
            subtitle="Revisa tus logros semanales"
            icon="📊"
            to="/anexos/autocomprobacion"
            color="bg-gradient-to-br from-primary-400 to-primary-600"
          />
        </div>
      </section>

      <div className="px-2 pt-6">
        <WeeklySummary />
      </div>
    </div>
  );
};

