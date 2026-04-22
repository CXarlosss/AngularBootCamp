import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KioskGate } from '@/features/kiosk/components/KioskGate';
import { InstallPrompt } from '@/features/pwa/components/InstallPrompt';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';

// ─── Bottom nav items (child-facing routes only) ──────────────────────
const NAV_ITEMS = [
  { path: '/',         label: 'Inicio',    icon: '🏠' },
  { path: '/anexos',  label: 'Anexos',    icon: '📋' },
  { path: '/tienda',  label: 'Tienda',    icon: '🏪' },
  { path: '/mochila', label: 'Mochila',   icon: '🎒' },
];

// Routes that belong to the therapist / admin — no child UI
const THERAPIST_PATHS = ['/terapeuta', '/editor', '/login'];

function isTherapistRoute(pathname: string) {
  return THERAPIST_PATHS.some(p => pathname.startsWith(p));
}

// ─── Header ───────────────────────────────────────────────────────────
function AppHeader() {
  const navigate = useNavigate();
  const { wayCoins, streakDays, currentAvatar } = useRewardsStore();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'linear-gradient(135deg, #3730A3 0%, #4F46E5 100%)',
        // Safe area for notched phones / tablets
        paddingTop: 'max(env(safe-area-inset-top), 0px)',
        boxShadow: '0 4px 24px rgba(55,48,163,0.3)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 60,
          padding: '0 16px',
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>🧠</span>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 21,
              color: '#fff',
              letterSpacing: '-0.5px',
            }}
          >
            WAY<span style={{ color: '#A5B4FC' }}>+</span>
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Streak */}
          {streakDays > 0 && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'rgba(245,158,11,0.2)',
                border: '1.5px solid rgba(245,158,11,0.35)',
                borderRadius: 20, padding: '4px 10px',
              }}
            >
              <span style={{ fontSize: 15 }}>🔥</span>
              <span style={{ color: '#FCD34D', fontWeight: 700, fontSize: 14 }}>{streakDays}</span>
            </div>
          )}
          {/* Coins */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(255,255,255,0.12)',
              border: '1.5px solid rgba(255,255,255,0.2)',
              borderRadius: 20, padding: '4px 10px',
            }}
          >
            <span style={{ fontSize: 15 }}>🪙</span>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{wayCoins}</span>
          </div>
          {/* Avatar */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate('/mochila')}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.3)',
              fontSize: 20, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {currentAvatar.base === 'base-unicorn' && '🦄'}
            {currentAvatar.base === 'base-dragon'  && '🐉'}
            {currentAvatar.base === 'base-puppy'   && '🐶'}
            {currentAvatar.base === 'base-kitten'  && '🐱'}
          </motion.button>
        </div>
      </div>
    </header>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────
function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid #E8E9FF',
        // Safe area bottom for home-indicator devices
        paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
        display: 'flex',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: 480,
          margin: '0 auto',
          paddingTop: 6,
        }}
      >
        {NAV_ITEMS.map(item => {
          const active = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          return (
            <motion.button
              key={item.path}
              whileTap={{ scale: 0.88 }}
              onClick={() => navigate(item.path)}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                background: 'none', border: 'none', cursor: 'pointer',
                paddingBottom: 4,
                minHeight: 52, // min touch target
              }}
            >
              <motion.span
                animate={{ scale: active ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                style={{ fontSize: 22, lineHeight: 1 }}
              >
                {item.icon}
              </motion.span>
              <span
                style={{
                  fontSize: 10, fontWeight: active ? 700 : 500,
                  color: active ? '#4F46E5' : '#9CA3AF',
                  transition: 'color 0.15s',
                }}
              >
                {item.label}
              </span>
              {active && (
                <motion.div
                  layoutId="navIndicator"
                  style={{ width: 4, height: 4, borderRadius: 2, background: '#4F46E5', marginTop: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Root Layout ──────────────────────────────────────────────────────
export function RootLayout() {
  const { pathname } = useLocation();
  const therapistRoute = isTherapistRoute(pathname);

  // Bottom nav height + safe area — content must not be hidden beneath it
  const BOTTOM_NAV_HEIGHT = 72; // px, conservative estimate

  return (
    <KioskGate enabled={!therapistRoute}>
      {/*
        ──────────────────────────────────────────────────
        OUTER wrapper: centers the 480px column on desktop,
        fills 100% height, clips horizontal overflow that
        causes layout shifts on some mobile browsers.
        ──────────────────────────────────────────────────
      */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          minHeight: '100dvh',       // dynamic viewport height
          background: '#E8E9FF',     // gutters on desktop > 480px
          overflowX: 'hidden',
        }}
      >
        {/*
          Inner column — the actual app shell.
          All children are scoped inside this 480px box.
        */}
        <div
          style={{
            width: '100%',
            maxWidth: 480,
            minHeight: '100dvh',
            background: '#F4F5FF',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            boxShadow: '0 0 60px rgba(79,70,229,0.08)',
            overflowX: 'hidden',
          }}
        >
          {/* Header — only on child routes */}
          {!therapistRoute && <AppHeader />}

          {/* Page content */}
          <main
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              // Padding ensures content is never hidden under the bottom nav
              paddingBottom: therapistRoute ? 0 : BOTTOM_NAV_HEIGHT,
              // Horizontal padding – consistent gutter across all pages
              // Individual pages can override with their own padding
              padding: therapistRoute
                ? 0
                : `0 0 ${BOTTOM_NAV_HEIGHT}px 0`,
              // Smooth momentum scrolling on iOS
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{ minHeight: '100%' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Bottom nav — only on child routes */}
          {!therapistRoute && <BottomNav />}
        </div>
      </div>

      {/* PWA install prompt — floating, works on any route */}
      <InstallPrompt />
    </KioskGate>
  );
}
