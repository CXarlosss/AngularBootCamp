import React from 'react';
import { format } from 'date-fns';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { AnnexCard } from '../components/AnnexCard';
import { WeeklySummary } from '../components/WeeklySummary';
import { PreFlightChecklist } from '../components/PreFlightChecklist';
import { SessionTimer } from '../components/SessionTimer';

const C = {
  indigo:      '#4F46E5',
  slate:       '#64748B',
  slateDark:   '#1E293B',
  text:        '#1E1B4B',
  white:       '#ffffff',
};

export const AnnexesHubPage: React.FC = () => {
  const [timerLocked, setTimerLocked] = React.useState(true);
  
  const { relaxationLog, roleplayLog } = usePlayerStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const hasRelaxationToday = !!relaxationLog[today]?.completed;
  const hasRoleplayToday = !!roleplayLog[today] && roleplayLog[today].length > 0;

  return (
    <div style={{ padding: '20px 16px 80px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: '-0.5px', margin: 0 }}>
          📋 Mis <span style={{ color: C.indigo }}>Anexos</span>
        </h1>
        <p style={{ fontSize: 14, fontWeight: 500, color: C.slate, margin: 0, lineHeight: 1.4 }}>
          Sigue tu progreso diario para convertirte en un Maestro WAY+.
        </p>
      </header>

      {/* Pre-flight Checklist & Timer Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <PreFlightChecklist onComplete={() => setTimerLocked(false)} />
        <SessionTimer locked={timerLocked} />
      </section>

      {/* Cards Grid */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 900, color: C.slateDark, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          ✨ Registros Diarios
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnnexCard
            title="Relajación"
            subtitle="Practica 5 minutos diarios"
            icon="🧘"
            to="/annexes/relaxation"
            color="bg-gradient-to-br from-emerald-400 to-teal-500"
            completedToday={hasRelaxationToday}
          />
          <AnnexCard
            title="Role Playing"
            subtitle="Practica situaciones reales"
            icon="🎭"
            to="/annexes/role-play"
            color="bg-gradient-to-br from-orange-400 to-rose-500"
            completedToday={hasRoleplayToday}
          />
          <AnnexCard
            title="Seguimiento"
            subtitle="Revisa tus logros semanales"
            icon="📊"
            to="/annexes/self-check"
            color="bg-gradient-to-br from-primary-400 to-primary-600"
          />
        </div>
      </section>

      <div style={{ paddingTop: 12 }}>
        <WeeklySummary />
      </div>
    </div>
  );
};
