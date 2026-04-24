import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { calculateCompetencies, detectImbalances } from '@/features/therapist/utils/clinicalRadarUtils';
import { generateRecommendations } from '../utils/parentRecommendationUtils';

/* ─── Styles & Tokens ────────────────────────────────────────────── */
const C = {
  primary: '#6366F1', // Indigo
  secondary: '#EC4899', // Pink
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  bg: '#FDFCFE',
  card: '#FFFFFF',
  text: '#1E1B4B',
  muted: '#6B7280',
  border: '#F3F4F6'
};

/* ─── Components ─────────────────────────────────────────────────── */
function FamilyCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.card,
      borderRadius: 24,
      padding: 20,
      border: `1.5px solid ${C.border}`,
      boxShadow: '0 4px 20px rgba(99,102,241,0.04)',
      ...style
    }}>
      {children}
    </div>
  );
}

export function ParentsDashboard() {
  const profile = usePlayerStore(s => s.profile);
  const relaxationLog = usePlayerStore(s => s.relaxationLog) ?? {};
  const roleplayLog = usePlayerStore(s => s.roleplayLog) ?? {};
  const { totalXp = 0, streakDays = 0, inventory = [] } = useRewardsStore();

  // 1. Calculate clinical data for the engine
  const scores = useMemo(() => calculateCompetencies({
    completedWays: profile.completedWays,
    relaxationLog,
    roleplayLog,
    streakDays,
    totalXp
  }), [profile.completedWays, relaxationLog, roleplayLog, streakDays, totalXp]);

  const imbalances = useMemo(() => detectImbalances(scores), [scores]);
  const recommendations = useMemo(() => generateRecommendations(scores, imbalances), [scores, imbalances]);

  return (
    <div style={{ background: C.bg, minHeight: '100dvh', padding: '24px 16px 100px' }}>
      
      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text }}>👨‍👩‍👧‍👦 Family Hub</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: C.muted }}>El progreso de {profile.name} esta semana</p>
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* ── Streak & Status ──────────────────────────────────── */}
        <FamilyCard style={{
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          color: '#fff', border: 'none', textAlign: 'center', padding: '32px 20px'
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔥</div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{streakDays} DÍAS</div>
          <div style={{ opacity: 0.9, fontSize: 14, fontWeight: 600 }}>¡Racha de compromiso imparable!</div>
        </FamilyCard>

        {/* ── Smart Recommendations ─────────────────────────────── */}
        <div style={{ marginTop: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            💡 Ideas para casa
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recommendations.map(rec => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  background: rec.priority === 'high' ? '#FFFBEB' : '#fff',
                  border: `1.5px solid ${rec.priority === 'high' ? '#F59E0B' : C.border}`,
                  borderRadius: 20, padding: 16, display: 'flex', gap: 12
                }}
              >
                <span style={{ fontSize: 24 }}>{rec.icon}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: C.text }}>{rec.title}</div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 4, lineHeight: 1.4 }}>{rec.advice}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Collection Progress ─────────────────────────────── */}
        <FamilyCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.text }}>🃏 Álbum de Colección</h3>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.primary, background: '#EEF2FF', padding: '4px 10px', borderRadius: 20 }}>
              {inventory.length} cartas
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {inventory.slice(0, 5).map((card, i) => (
              <div key={i} style={{
                minWidth: 60, height: 80, background: '#F9FAFB', borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, border: '1px solid #E5E7EB'
              }}>
                {card.image || '❓'}
              </div>
            ))}
            {inventory.length > 5 && (
              <div style={{
                minWidth: 60, height: 80, background: '#EEF2FF', borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, color: C.primary
              }}>
                +{inventory.length - 5}
              </div>
            )}
          </div>
        </FamilyCard>

        {/* ── Quick Stats ────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FamilyCard style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.primary }}>{profile.completedWays.length}</div>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Retos Logrados</div>
          </FamilyCard>
          <FamilyCard style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.success }}>{Object.keys(relaxationLog).length}</div>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Minutos de Calma</div>
          </FamilyCard>
        </div>

      </div>
    </div>
  );
}
