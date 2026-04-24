import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { registry } from '@/content/registry';
import { TutorialTour } from '../components/TutorialTour';
import { MilestoneOverlay } from '../components/MilestoneOverlay';
import { DailyChest } from '@/features/rewards/components/DailyChest';
import { StreakTracker } from '@/features/rewards/components/StreakTracker';
import { AdventureMap } from '../components/AdventureMap';
import { MissionBanner } from '@/features/rewards/components/MissionBanner';
import type { Step } from '@/core/engine/types';
import { useAudio } from '@/core/hooks/useAudio';

const C = {
  indigo:      '#4F46E5',
  indigoLight: '#E8E9FF',
  slate:       '#64748B',
  slateLight:  '#F1F5F9',
  slateDark:   '#1E293B',
  text:        '#1E1B4B',
  white:       '#ffffff',
  emerald:     '#10B981',
  amber:       '#F59E0B',
  rose:        '#F43F5E',
  purple:      '#8B5CF6',
};

const THEME_COLORS: Record<string, { bg: string; iconBg: string; text: string }> = {
  relaxation:    { bg: '#ECFDF5', iconBg: '#D1FAE5', text: '#065F46' },
  'self-esteem': { bg: '#F5F3FF', iconBg: '#EDE9FE', text: '#5B21B6' },
  assertiveness: { bg: '#FFF1F2', iconBg: '#FFE4E6', text: '#9F1239' },
  autonomy:      { bg: '#FFFBEB', iconBg: '#FEF3C7', text: '#92400E' },
  default:       { bg: '#F8FAFC', iconBg: '#F1F5F9', text: '#475569' },
};

export function LevelSelectPage() {
  const navigate = useNavigate();
  const { profile, dailyChallenge, setDailyChallenge } = usePlayerStore();
  const { playSFX } = useAudio();
  const { 
    wayCoins, 
    lastDailyChestOpened, 
    claimDailyReward,
    streakDays,
    lastStreakBonusDate,
    claimStreakBonus,
    claimStreakMilestone
  } = useRewardsStore();
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  
  useEffect(() => {
    if (!profile?.currentLevel) return;
    setLoading(true);
    registry.getStepsForLevel(profile.currentLevel).then(res => {
      setSteps(res || []);
      setLoading(false);

      // Generar desafío diario si no hay uno hoy
      const today = new Date().toISOString().split('T')[0];
      if (dailyChallenge?.date !== today && res && res.length > 0) {
        const randomStep = res[Math.floor(Math.random() * res.length)];
        const randomWay = randomStep.ways[Math.floor(Math.random() * randomStep.ways.length)];
        if (randomWay) {
          setDailyChallenge(randomWay.id);
        }
      }
    });
  }, [profile?.currentLevel, dailyChallenge?.date, setDailyChallenge]);

  const uniqueSteps = useMemo(() => {
    if (!steps) return [];
    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();
    
    return steps.filter((step: Step) => {
      if (!step) return false;
      const titleKey = step.title?.trim().toLowerCase() || '';
      if (seenIds.has(step.id) || (titleKey && seenTitles.has(titleKey))) return false;
      
      seenIds.add(step.id);
      if (titleKey) seenTitles.add(titleKey);
      return true;
    });
  }, [steps]);

  // Cálculo de progreso robusto
  const { totalWaysInLevel, completedCount } = useMemo(() => {
    if (!steps || !profile) return { totalWaysInLevel: 0, completedCount: 0 };
    
    const completedSet = new Set(profile.completedWays || []);
    let total = 0;
    let completed = 0;
    
    steps.forEach(s => {
      if (s.ways) {
        total += s.ways.length;
        s.ways.forEach(w => {
          if (completedSet.has(w.id)) completed++;
        });
      }
    });
    
    return { totalWaysInLevel: total, completedCount: completed };
  }, [steps, profile?.completedWays]);

  const progressPct = totalWaysInLevel > 0 ? Math.round((completedCount / totalWaysInLevel) * 100) : 0;

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: C.indigo, fontWeight: 700 }}>
        Cargando módulos...
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: C.rose }}>
        Error: Perfil no encontrado. Reinstala la app.
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 16px 100px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <TutorialTour />
      
      {/* Welcome Card */}
      <header style={{
        background: 'linear-gradient(135deg, #E0E7FF, #EEF2FF)',
        borderRadius: 32,
        padding: 24,
        boxShadow: '0 4px 20px rgba(79,70,229,0.08)',
        border: '1px solid #fff'
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.indigo, marginBottom: 4 }}>
          ¡Hola! 👋
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: '-0.5px', margin: 0 }}>
            ¿Listo para jugar hoy?
          </h1>
          <div style={{
            background: 'white', padding: '6px 14px', borderRadius: 20,
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #E8E9FF'
          }}>
            <span style={{ fontSize: 18 }}>🪙</span>
            <span style={{ fontWeight: 900, color: C.text, fontSize: 16 }}>{wayCoins || 0}</span>
          </div>
          <button
            onClick={() => { playSFX('click'); navigate('/backpack'); }}
            style={{
              background: 'white', padding: '6px 14px', borderRadius: 20,
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #E8E9FF',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: 18 }}>🎒</span>
            <span style={{ fontWeight: 900, color: C.text, fontSize: 13, textTransform: 'uppercase' }}>Mochila</span>
          </button>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.slate, marginBottom: 12 }}>
          Progreso {profile?.currentLevel?.toUpperCase() || ''} — {completedCount}/{totalWaysInLevel} WAYS
        </div>
        <div style={{ height: 10, background: 'rgba(255,255,255,0.5)', borderRadius: 5, overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ height: '100%', background: C.indigo, borderRadius: 5 }}
          />
        </div>
      </header>

      {/* Daily Mystery Chest */}
      <DailyChest 
        lastOpenedDate={lastDailyChestOpened}
        onClaimReward={claimDailyReward}
      />

      {/* Fire Streak Tracker */}
      <StreakTracker
        streakDays={streakDays}
        lastBonusDate={lastStreakBonusDate}
        onClaimBonus={claimStreakBonus}
        onMilestoneReached={claimStreakMilestone}
      />

      <MissionBanner />

      {/* View Toggle */}
      <div style={{ 
        display: 'flex', background: '#F1F5F9', padding: 4, borderRadius: 16, 
        gap: 4, alignSelf: 'center', marginBottom: 8
      }}>
        <button
          onClick={() => { playSFX('click'); setViewMode('map'); }}
          style={{
            padding: '8px 20px', borderRadius: 12, border: 'none',
            background: viewMode === 'map' ? C.white : 'transparent',
            color: viewMode === 'map' ? C.indigo : C.slate,
            fontWeight: 800, fontSize: 13, cursor: 'pointer',
            boxShadow: viewMode === 'map' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          🗺️ Mapa
        </button>
        <button
          onClick={() => { playSFX('click'); setViewMode('list'); }}
          style={{
            padding: '8px 20px', borderRadius: 12, border: 'none',
            background: viewMode === 'list' ? C.white : 'transparent',
            color: viewMode === 'list' ? C.indigo : C.slate,
            fontWeight: 800, fontSize: 13, cursor: 'pointer',
            boxShadow: viewMode === 'list' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          📋 Lista
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'map' ? (
          <motion.div
            key="map"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          >
            <AdventureMap 
              steps={uniqueSteps}
              completedWays={profile?.completedWays || []}
              currentLevelId={profile?.currentLevel || ''}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <h2 style={{ fontSize: 12, fontWeight: 800, color: C.slate, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Módulos {profile?.currentLevel?.toUpperCase() || ''}
            </h2>
            
            {uniqueSteps.map((step: Step) => {
              const theme = THEME_COLORS[step.theme] || THEME_COLORS.default;
              const pictoRaw = step.ways?.[0]?.stimulus?.image;
              const isUrl = typeof pictoRaw === 'string' && (pictoRaw?.includes('/') || pictoRaw?.startsWith('http') || pictoRaw?.startsWith('data:'));
              
              const stepCompletedCount = step?.ways?.filter(w => (profile?.completedWays || []).includes(w.id))?.length || 0;
              const stepTotalCount = step?.ways?.length || 0;
              const stepProgressPct = stepTotalCount > 0 ? Math.round((stepCompletedCount / stepTotalCount) * 100) : 0;

              return (
                <motion.div
                  key={step.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    playSFX('click');
                    navigate(`/play/${profile.currentLevel}/${step.id}`);
                  }}
                  style={{
                    background: theme.bg,
                    borderRadius: 32,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                    border: `1.5px solid ${theme.iconBg}`,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 20,
                      background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 32, boxShadow: `0 4px 12px rgba(0,0,0,0.05)`,
                      border: `2px solid ${theme.iconBg}`,
                      overflow: 'hidden'
                    }}>
                      {isUrl ? (
                        <img src={pictoRaw} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
                      ) : (
                        pictoRaw || '✨'
                      )}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: 0 }}>{step.title}</h3>
                      <p style={{ fontSize: 14, fontWeight: 500, color: theme.text, margin: '2px 0 0', opacity: 0.8 }}>
                        {step.subtitle}
                      </p>
                    </div>
                  </div>

                  <div style={{ width: '100%', height: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 3, position: 'relative', zIndex: 1 }}>
                    <div style={{ 
                      width: `${stepProgressPct}%`, 
                      height: '100%', background: theme.text, borderRadius: 3, opacity: 0.6 
                    }} />
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 700, color: theme.text, opacity: 0.6, position: 'relative', zIndex: 1 }}>
                    {stepCompletedCount}/{stepTotalCount} WAYS · {stepProgressPct}%
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
