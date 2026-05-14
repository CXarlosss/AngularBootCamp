/**
 * RootLayout.tsx — Scroll-safe layout
 *
 * Architecture: let the browser body scroll naturally.
 * - NO overflow:hidden anywhere in this file
 * - NO height:100dvh on any wrapper div
 * - BottomNav is position:fixed (outside document flow)
 * - KioskGate only wraps inline, never sets overflow
 */

import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KioskGate } from '@/features/kiosk/components/KioskGate';
import { InstallPrompt } from '@/features/pwa/components/InstallPrompt';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { CardUnlockOverlay } from '@/features/rewards/components/CardUnlockOverlay';
import { SecretManager } from '@/features/rewards/components/SecretManager';
import { AchievementManager } from '@/features/rewards/components/AchievementManager';
import { AmbientPlayer } from '@/core/components/AmbientPlayer';
import { SoundToggle } from '@/core/components/SoundToggle';
import { audioService } from '@/core/utils/audioService';
import { SyncManager } from '@/core/components/SyncManager';

/* ─── Config ─────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { path: '/',          label: 'Inicio',    icon: '🏠' },
  { path: '/therapist', label: 'Terapeuta', icon: '🧠' },
  { path: '/annexes',   label: 'Anexos',    icon: '📋' },
  { path: '/shop',      label: 'Tienda',    icon: '🏪' },
  { path: '/backpack',  label: 'Mochila',   icon: '🎒' },
] as const;

const THERAPIST_PREFIXES = ['/therapist', '/dashboard', '/editor', '/auth'];

function isTherapist(path: string) {
  return THERAPIST_PREFIXES.some(p => path.startsWith(p));
}

/* ─── Header ─────────────────────────────────────────────────────── */

function AppHeader() {
  const navigate = useNavigate();
  const wayCoins   = useRewardsStore(s => s.wayCoins)   ?? 0;
  const streakDays = useRewardsStore(s => s.streakDays) ?? 0;
  const base       = useRewardsStore(s => s.currentAvatar?.base);

  const emoji =
    base === 'base-dragon' ? '🐉' :
    base === 'base-puppy'  ? '🐶' :
    base === 'base-kitten' ? '🐱' : '🦄';

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(79, 70, 229, 0.1)',
    }}>
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '0 16px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <motion.div 
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        >
          <div style={{
            width: 36, height: 36, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
          }}>
            <span style={{ fontSize: 20 }}>🧠</span>
          </div>
          <span style={{
            fontFamily: "'Outfit',sans-serif",
            fontWeight: 900, fontSize: 22, color: '#1E1B4B', letterSpacing: '-0.5px',
          }}>
            WAY<span style={{ color: '#4F46E5' }}>+</span>
          </span>
        </motion.div>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {streakDays > 0 && (
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: '#FFFBEB',
                border: '1.5px solid #FDE68A',
                borderRadius: 14, padding: '4px 10px',
              }}
            >
              <span style={{ fontSize: 14 }}>🔥</span>
              <span style={{ color: '#B45309', fontWeight: 800, fontSize: 13 }}>{streakDays}</span>
            </motion.div>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: '#F5F3FF',
            border: '1.5px solid #DDD6FE',
            borderRadius: 14, padding: '4px 10px',
          }}>
            <span style={{ fontSize: 14 }}>🪙</span>
            <span style={{ color: '#5B21B6', fontWeight: 800, fontSize: 13 }}>{wayCoins}</span>
          </div>
          
          <div style={{ width: 1, height: 24, background: '#E2E8F0', margin: '0 4px' }} />
          
          <SoundToggle />
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/backpack')}
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: '#fff',
              border: '2px solid #E2E8F0',
              fontSize: 22, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            {emoji}
          </motion.button>
        </div>
      </div>
    </header>
  );
}


/* ─── Bottom Nav ──────────────────────────────────────────────────── */

function BottomNav() {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      zIndex: 40,
      background: 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(79, 70, 229, 0.1)',
      paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
      paddingTop: 8,
      display: 'flex',
      justifyContent: 'space-around',
      boxShadow: '0 -8px 30px rgba(0,0,0,0.04)',
    }}>
      {NAV_ITEMS.map(item => {
        const active =
          item.path === '/'
            ? pathname === '/'
            : pathname.startsWith(item.path);
        return (
          <motion.button
            key={item.path}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer',
              width: 64,
            }}
          >
            <div style={{
              width: 42, height: 42,
              borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active ? '#4F46E5' : 'transparent',
              color: active ? '#fff' : '#94A3B8',
              fontSize: 22,
              transition: 'all 0.2s',
              boxShadow: active ? '0 8px 16px rgba(79, 70, 229, 0.2)' : 'none',
            }}>
              {item.icon}
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: 800,
              color: active ? '#4F46E5' : '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}


/* ─── Root Layout ─────────────────────────────────────────────────── */

export function RootLayout() {
  const { pathname } = useLocation();
  const therapist = isTherapist(pathname);
  
  // Audio Unlocker: Browsers block AudioContext until a user gesture
  React.useEffect(() => {
    const unlockAudio = () => {
      audioService.unlock();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  /*
    SCROLL CONTRACT
    ───────────────
    • html / body: min-height only, no overflow restriction  ← set in index.css
    • #root:       min-height only                           ← set in index.css
    • .layout-outer: centers the 480px column; min-height, no overflow
    • .layout-inner: the white column; min-height, no overflow
    • BottomNav:   position:fixed — outside document flow
    • paddingBottom on layout-inner keeps content above the nav
  */

  const patientId = sessionStorage.getItem('way-active-patient');

  return (
    <KioskGate enabled={!therapist}>
      <SyncManager key={patientId || 'none'} />
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100dvh',
        background: '#DDE0FF',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 480,
          background: '#F4F5FF',
          boxShadow: '0 0 40px rgba(79,70,229,.08)',
          paddingBottom: therapist ? 0 : 72,
        }}>
          {!therapist && <AppHeader />}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {!therapist && <BottomNav />}
      <InstallPrompt />
      <CardUnlockOverlay />
      <SecretManager />
      <AchievementManager />
      <AmbientPlayer />
    </KioskGate>
  );
}
