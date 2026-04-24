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
      background: 'linear-gradient(135deg,#3730A3,#4F46E5)',
      boxShadow: '0 4px 20px rgba(55,48,163,.3)',
    }}>
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '0 16px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🧠</span>
          <span style={{
            fontFamily: "'Outfit',sans-serif",
            fontWeight: 800, fontSize: 20, color: '#fff', letterSpacing: '-0.5px',
          }}>
            WAY<span style={{ color: '#A5B4FC' }}>+</span>
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {streakDays > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(245,158,11,.2)',
              border: '1.5px solid rgba(245,158,11,.4)',
              borderRadius: 20, padding: '4px 10px',
            }}>
              <span style={{ fontSize: 14 }}>🔥</span>
              <span style={{ color: '#FCD34D', fontWeight: 700, fontSize: 13 }}>{streakDays}</span>
            </div>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(255,255,255,.12)',
            border: '1.5px solid rgba(255,255,255,.2)',
            borderRadius: 20, padding: '4px 10px',
          }}>
            <span style={{ fontSize: 14 }}>🪙</span>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{wayCoins}</span>
          </div>
          <SoundToggle />
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate('/backpack')}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(255,255,255,.15)',
              border: '2px solid rgba(255,255,255,.3)',
              fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
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
      /* Center on any screen width, capped at 480px */
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      zIndex: 40,
      background: 'rgba(255,255,255,.97)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid #E8E9FF',
      paddingBottom: 'max(env(safe-area-inset-bottom),4px)',
      display: 'flex',
    }}>
      {NAV_ITEMS.map(item => {
        const active =
          item.path === '/'
            ? pathname === '/'
            : pathname.startsWith(item.path);
        return (
          <motion.button
            key={item.path}
            whileTap={{ scale: 0.85 }}
            onClick={() => navigate(item.path)}
            style={{
              flex: 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              background: 'none', border: 'none', cursor: 'pointer',
              paddingTop: 8, paddingBottom: 4,
              minHeight: 52,
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{
              fontSize: 9,
              fontWeight: active ? 700 : 500,
              color: active ? '#4F46E5' : '#9CA3AF',
            }}>
              {item.label}
            </span>
            {active && (
              <motion.div
                layoutId="navDot"
                style={{ width: 4, height: 4, borderRadius: 2, background: '#4F46E5' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
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

  return (
    <KioskGate enabled={!therapist}>
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
