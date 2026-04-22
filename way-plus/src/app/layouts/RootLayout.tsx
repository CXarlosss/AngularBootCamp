import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { Trophy, Home, BarChart2, BookOpen, ShoppingBag, Backpack } from 'lucide-react';

import { KioskGate } from '@/features/kiosk/components/KioskGate';
import { InstallPrompt } from '@/features/pwa/components/InstallPrompt';

export const RootLayout: React.FC = () => {
  const profile = usePlayerStore((s) => s.profile);
  const { wayCoins } = useRewardsStore();
  const location = useLocation();

  const isPlaying = location.pathname.startsWith('/play');
  
  // Solo activar Kiosko en rutas del niño, NO en terapeuta/editor/auth
  const isChildRoute = !location.pathname.startsWith('/terapeuta') 
    && !location.pathname.startsWith('/editor')
    && !location.pathname.startsWith('/auth')
    && !location.pathname.startsWith('/dashboard');

  return (
    <KioskGate enabled={isChildRoute}>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans items-center overflow-x-hidden">
        {/* Main Wrapper - Mobile Centered Constraints */}
        <div className="w-full max-w-[480px] min-h-screen bg-white shadow-2xl flex flex-col relative">
          
          {/* Navigation Header */}
          {!isPlaying && (
            <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 h-16 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
                  <Trophy size={20} />
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tighter">WAY<span className="text-primary-500">+</span></span>
              </Link>

              <div className="flex items-center gap-3">
                 {/* Coin Display */}
                 <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100"
                >
                  <span className="text-lg">🪙</span>
                  <span className="font-black text-amber-600 text-sm">{wayCoins}</span>
                </motion.div>

                <Link to="/auth" className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-accent-500 flex items-center justify-center text-white text-xs font-bold">
                    {profile?.avatar === 'unicorn' ? '🦄' : '🐉'}
                  </div>
                </Link>
              </div>
            </header>
          )}

          {/* Main Content Area */}
          <main className={`flex-1 overflow-y-auto px-4 pt-4 scrollbar-hide ${!isPlaying ? 'pb-32' : 'pb-4'}`} style={{ minHeight: 0 }}>
            <Outlet />
          </main>

          {/* Bottom Navigation */}
          {!isPlaying && (
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/80 backdrop-blur-2xl border-t border-slate-100 px-6 py-4 pb-8 flex items-center justify-between z-50">
              <MobileNavLink to="/" icon={<Home size={26} />} active={location.pathname === '/'} />
              <MobileNavLink to="/shop" icon={<ShoppingBag size={26} />} active={location.pathname === '/shop'} />
              <MobileNavLink to="/backpack" icon={<Backpack size={26} />} active={location.pathname === '/backpack'} />
              <MobileNavLink to="/annexes" icon={<BookOpen size={26} />} active={location.pathname === '/annexes'} />
              <MobileNavLink to="/dashboard" icon={<BarChart2 size={26} />} active={location.pathname === '/dashboard'} />
            </nav>
          )}

          <InstallPrompt />
        </div>
      </div>
    </KioskGate>
  );
};


const NavLink = ({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
      active ? 'bg-primary-50 text-primary-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

const MobileNavLink = ({ to, icon, active }: { to: string; icon: React.ReactNode; active: boolean }) => (
  <Link 
    to={to} 
    className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all ${
      active ? 'bg-primary-500 text-white shadow-lg shadow-primary-200' : 'text-slate-400'
    }`}
  >
    {icon}
  </Link>
);
