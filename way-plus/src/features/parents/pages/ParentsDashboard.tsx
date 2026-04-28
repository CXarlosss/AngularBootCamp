import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { calculateCompetencies, detectImbalances } from '@/features/therapist/utils/clinicalRadarUtils';
import { generateRecommendations } from '../utils/parentRecommendationUtils';
import { syncService, type TherapistRecommendation } from '@/core/services/syncService';
import { ClinicalRadar } from '@/features/therapist/components/ClinicalRadar';
import { FamilyOnboarding } from '../components/FamilyOnboarding';

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
function FamilyCard({ children, style = {}, title, icon }: { children: React.ReactNode; style?: React.CSSProperties, title?: string, icon?: string }) {
  return (
    <div style={{
      background: C.card,
      borderRadius: 24,
      padding: 20,
      border: `1.5px solid ${C.border}`,
      boxShadow: '0 4px 20px rgba(99,102,241,0.04)',
      ...style
    }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.text }}>{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

export function ParentsDashboard() {
  const profile = usePlayerStore(s => s.profile);
  if (!profile) return <div style={{ padding: 40, textAlign: 'center' }}>Cargando perfil...</div>;
  const relaxationLog = usePlayerStore(s => s.relaxationLog) ?? {};
  const roleplayLog = usePlayerStore(s => s.roleplayLog) ?? {};
  const { totalXp = 0, streakDays = 0, inventory = [] } = useRewardsStore();
  
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  // 1. Calculate clinical data for the engine
  const scores = useMemo(() => calculateCompetencies({
    completedWays: profile.completedWays,
    relaxationLog,
    roleplayLog,
    streakDays,
    totalXp
  }), [profile.completedWays, relaxationLog, roleplayLog, streakDays, totalXp]);

  const imbalances = useMemo(() => detectImbalances(scores), [scores]);
  const autoRecommendations = useMemo(() => generateRecommendations(scores, imbalances), [scores, imbalances]);
  const [therapistRecs, setTherapistRecs] = React.useState<TherapistRecommendation[]>([]);

  React.useEffect(() => {
    if (profile?.id) {
      syncService.getRecommendations(profile.id).then(setTherapistRecs);
    }
    
    // Check onboarding
    const onboardingDone = localStorage.getItem('way-family-onboarding-done');
    if (!onboardingDone) {
      setShowOnboarding(true);
    }
  }, [profile?.id]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('way-family-onboarding-done', 'true');
    setShowOnboarding(false);
  };

  const handleUpdateStatus = async (id: string, status: 'completed' | 'dismissed') => {
    if (!profile?.id) return;
    await syncService.updateRecommendationStatus(id, profile.id, status);
    setTherapistRecs(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div style={{ background: C.bg, minHeight: '100dvh', padding: '24px 16px 100px' }}>
      <AnimatePresence>
        {showOnboarding && <FamilyOnboarding onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

      {!syncService.isSupabaseAvailable() && (
        <div style={{ 
          background: '#FFFBEB', border: '1px solid #FEF3C7', padding: '10px 16px', 
          borderRadius: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#92400E' }}>Modo Local</div>
            <div style={{ fontSize: 11, color: '#B45309' }}>Conéctate para sincronizar con el terapeuta.</div>
          </div>
        </div>
      )}
      
      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text }}>👨‍👩‍👧‍👦 Family Hub</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: C.muted }}>Acompañando el progreso de {profile.name}</p>
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

        {/* ── Therapist Recommendations (Manual) ──────────────────────── */}
        {therapistRecs.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              👩‍⚕️ Mensajes del Terapeuta
              {therapistRecs.some(r => !localStorage.getItem(`read_rec_${r.id}`)) && (
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ width: 8, height: 8, borderRadius: '50%', background: C.secondary }} 
                />
              )}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {therapistRecs.map(rec => {
                const isRead = localStorage.getItem(`read_rec_${rec.id}`);
                return (
                  <motion.div
                    key={rec.id}
                    onViewportEnter={() => {
                      if (!isRead) {
                        localStorage.setItem(`read_rec_${rec.id}`, 'true');
                        // Force re-render would be better here with a state, but this works for basic flow
                      }
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: isRead ? '#fff' : '#EEF2FF',
                      border: isRead ? `1.5px solid ${C.border}` : '1.5px solid #4F46E5',
                      borderRadius: 20, padding: 18,
                      boxShadow: isRead ? 'none' : '0 4px 12px rgba(79, 70, 229, 0.1)',
                      position: 'relative'
                    }}
                  >
                    {!isRead && (
                      <span style={{ 
                        position: 'absolute', top: -6, right: 12, 
                        background: C.secondary, color: '#fff', 
                        fontSize: 9, fontWeight: 900, padding: '2px 8px', 
                        borderRadius: 10, textTransform: 'uppercase' 
                      }}>Nuevo</span>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 900, fontSize: 14, color: isRead ? C.text : '#4F46E5' }}>{rec.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>
                        {new Date(rec.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ fontSize: 14, color: C.text, lineHeight: 1.5, marginBottom: 12 }}>{rec.advice}</div>
                    
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button 
                        onClick={() => handleUpdateStatus(rec.id, 'completed')}
                        style={{
                          flex: 1, background: '#10B981',
                          color: '#fff', border: 'none',
                          borderRadius: 12, padding: '10px', fontSize: 13, fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        ✅ Completado
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(rec.id, 'dismissed')}
                        style={{
                          background: '#F1F5F9',
                          color: '#64748B', border: 'none',
                          borderRadius: 12, padding: '10px 16px', fontSize: 13, fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        Descartar
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Clinical Radar ─────────────────────────────────────── */}
        <FamilyCard 
          title="Mapa de Progreso" 
          icon="🎯"
        >
          <div style={{ position: 'absolute', top: 20, right: 20 }}>
            <button 
              onClick={() => alert("Mapa de Progreso:\n\nEste gráfico muestra el equilibrio entre diferentes áreas:\n- Calma: Relajación y autorregulación.\n- Autonomía: Capacidad de hacer cosas por sí mismo.\n- Social: Interacción y empatía.\n- Retos: Superación de misiones en la app.\n\nEl objetivo es que el gráfico sea lo más equilibrado posible, no que llegue al máximo en todo.")}
              style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', opacity: 0.5 }}
            >
              ℹ️
            </button>
          </div>
           <ClinicalRadar 
            completedWays={profile.completedWays}
            relaxationLog={relaxationLog}
            roleplayLog={roleplayLog}
            streakDays={streakDays}
            totalXp={totalXp}
            patientName={profile.name}
            readOnly={true}
          />
          <p style={{ fontSize: 12, color: C.muted, marginTop: 16, textAlign: 'center', fontStyle: 'italic' }}>
            Este mapa muestra las áreas que {profile.name} está fortaleciendo esta semana. 
            No es una evaluación, es un mapa de trabajo.
          </p>
        </FamilyCard>

        {/* ── Smart Recommendations (Auto) ─────────────────────────── */}
        <div style={{ marginTop: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            💡 Ideas para hoy
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {autoRecommendations.map(rec => (
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
                {card.icon || '❓'}
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

        <footer style={{ marginTop: 40, padding: '0 20px', textAlign: 'center', opacity: 0.6 }}>
          <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5 }}>
            Lo que ves aquí es un resumen preparado por el terapeuta. Los datos clínicos completos son confidenciales y solo los gestiona el profesional médico.
          </p>
        </footer>

      </div>
    </div>
  );
}
