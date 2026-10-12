/**
 * ═══════════════════════════════════════════════════════════════
 * RewardsBackpack v2 — Responsive, sin inline styles, con wayTheme
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Trophy, Book, Shirt, Sparkles } from 'lucide-react';
import { useRewardsStore, type AvatarPart } from '../store/rewardsStore';
import { AvatarColorable } from '../components/AvatarColorable';
import { CollectibleCard } from '../components/CollectibleCard';
import { COLLECTIONS, STICKERS_CATALOG, type Sticker } from '../data/collections';
import { SECRET_CARDS } from '../data/secrets';
import { useAudio } from '@/core/hooks/useAudio';
import { hapticService } from '@/core/services/hapticService';
import { useReduceMotion } from '@/core/stores/configStore';
import { way, GLASS, TEXT } from '@/shared/lib/wayTheme';

export const RewardsBackpack: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'closet' | 'album') || 'closet';
  const reduceMotion = useReduceMotion();

  const {
    wayCoins,
    inventory,
    currentAvatar,
    equipPart,
    totalXp,
    ownedStickers,
    unlockedSecrets = [],
    exchangeDuplicates,
  } = useRewardsStore();
  const { playSFX } = useAudio();

  const [activeTab, setActiveTab] = useState<'closet' | 'album'>(initialTab);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [showExchange, setShowExchange] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'closet' || tab === 'album') setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = useCallback(
    (tab: 'closet' | 'album') => {
      playSFX('click');
      hapticService.click();
      setActiveTab(tab);
      setSearchParams({ tab });
    },
    [playSFX, setSearchParams]
  );

  const categories = useMemo(
    () => [
      { id: 'base', name: 'Amigos', icon: '👤' },
      { id: 'hat', name: 'Gorros', icon: '🧢' },
      { id: 'cape', name: 'Capas', icon: '🦸' },
      { id: 'shoes', name: 'Zapatos', icon: '👟' },
      { id: 'background', name: 'Casas', icon: '🏰' },
      { id: 'pet', name: 'Mascotas', icon: '🐾' },
    ],
    []
  );

  const totalDuplicates = useMemo(() => {
    let count = 0;
    Object.values(ownedStickers).forEach((s) => {
      if (s.normal > 1) count += s.normal - 1;
      if (s.shiny > 1) count += s.shiny - 1;
    });
    return count;
  }, [ownedStickers]);

  const handleExchange = useCallback(
    (count: number, type: 'random' | 'shiny') => {
      hapticService.success();
      const res = exchangeDuplicates(count, type);
      playSFX(res.success ? 'chest' : 'error');
      alert(res.message);
    },
    [exchangeDuplicates, playSFX]
  );

  const handleEquip = useCallback(
    (catId: string, itemId: string) => {
      playSFX('click');
      hapticService.click();
      equipPart(catId as AvatarPart, itemId as AvatarPart);
    },
    [playSFX, equipPart]
  );

  const handleBack = useCallback(() => {
    hapticService.click();
    navigate('/');
  }, [navigate]);

  const handleGoShop = useCallback(() => {
    playSFX('click');
    hapticService.click();
    navigate('/shop');
  }, [playSFX, navigate]);

  /* ─── Animaciones ─── */
  const tabAnim = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } };

  return (
    <div className="min-h-screen bg-amber-50 px-4 pb-24 pt-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* ─── Header ─── */}
        <header className="mb-6 flex items-center gap-3">
          <m.button
            whileTap={{ scale: 0.9 }}
            onClick={handleBack}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-amber-200 bg-white text-amber-700 shadow-sm transition-colors hover:bg-amber-50"
          >
            <ArrowLeft size={20} />
          </m.button>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-black text-amber-900 sm:text-2xl">Mis Tesoros</h1>
            <div className="mt-0.5 flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                🪙 {wayCoins}
              </span>
              <span className="h-3 w-px bg-amber-200" />
              <span className="flex items-center gap-1 text-xs font-bold text-amber-700">
                <Trophy size={12} /> {totalXp} XP
              </span>
            </div>
          </div>
        </header>

        {/* ─── Tabs ─── */}
        <div className="mb-6 flex rounded-2xl border border-amber-200 bg-white/70 p-1.5 shadow-sm backdrop-blur-sm">
          <button
            onClick={() => handleTabChange('closet')}
            className={way(
              'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all',
              activeTab === 'closet'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-amber-700 hover:bg-amber-50'
            )}
          >
            <Shirt size={16} /> Vestidor
          </button>
          <button
            onClick={() => handleTabChange('album')}
            className={way(
              'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all',
              activeTab === 'album'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-amber-700 hover:bg-amber-50'
            )}
          >
            <Book size={16} /> Álbum
          </button>
        </div>

        {/* ─── Contenido ─── */}
        <AnimatePresence mode="wait">
          {activeTab === 'closet' ? (
            <m.div key="closet" {...tabAnim} className="flex flex-col gap-6">
              {/* Avatar preview */}
              <div className="flex flex-col items-center rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
                <AvatarColorable />
                <m.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGoShop}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-sm font-black text-white shadow-md transition-colors hover:bg-amber-600"
                >
                  <ShoppingBag size={18} /> Ir a la Tienda
                </m.button>
              </div>

              {/* Categorías */}
              <div className="flex flex-col gap-6">
                {categories.map((cat) => {
                  const items = inventory.filter((item) => item.category === cat.id);
                  const isBase = cat.id === 'base';
                  if (items.length === 0 && !isBase) return null;

                  return (
                    <section key={cat.id}>
                      <div className="mb-3 flex items-center justify-between px-1">
                        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-base shadow-sm">
                            {cat.icon}
                          </span>
                          {cat.name}
                        </h3>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          {items.length} {items.length === 1 ? 'objeto' : 'objetos'}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 rounded-2xl border border-slate-100 bg-white/60 p-3 shadow-sm sm:grid-cols-5 sm:gap-3 sm:p-4">
                        {items.length > 0 ? (
                          items.map((item) => {
                            const isEquipped = currentAvatar[cat.id] === item.id;
                            return (
                              <m.button
                                key={item.id}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEquip(cat.id, item.id)}
                                className={way(
                                  'relative flex aspect-square items-center justify-center rounded-xl text-xl transition-all sm:text-2xl',
                                  isEquipped
                                    ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200'
                                    : 'border border-slate-100 bg-white text-slate-400 hover:border-indigo-100 hover:text-indigo-600'
                                )}
                              >
                                {item.icon}
                                {isEquipped && (
                                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-emerald-500 text-[8px] text-white shadow-sm">
                                    ✓
                                  </span>
                                )}
                              </m.button>
                            );
                          })
                        ) : (
                          <div className="col-span-full py-4 text-center">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                              No tienes {cat.name.toLowerCase()} aún
                            </p>
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            </m.div>
          ) : (
            <m.div key="album" {...tabAnim} className="flex flex-col gap-6">
              {/* Header álbum */}
              <div className="flex items-center justify-between rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white shadow-lg">
                <div>
                  <h3 className="text-lg font-black">Álbum de Cromos</h3>
                  <p className="mt-0.5 text-xs font-bold opacity-90">
                    {Object.keys(ownedStickers).length} de {STICKERS_CATALOG.length} encontrados
                  </p>
                </div>
                <span className="text-3xl">📔</span>
              </div>

              {/* Duplicados */}
              {totalDuplicates > 0 && (
                <m.div
                  initial={reduceMotion ? {} : { scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔄</span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{totalDuplicates} duplicados</p>
                      <p className="text-xs font-bold text-slate-500">¡Canjéalos por cromos nuevos!</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { playSFX('click'); hapticService.click(); setShowExchange(true); }}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
                  >
                    Canjear
                  </button>
                </m.div>
              )}

              {/* Colecciones */}
              {COLLECTIONS.map((set) => {
                const completedCount = set.stickerIds.filter((id) => !!ownedStickers[id]).length;
                const isSetComplete = completedCount === set.stickerIds.length;

                return (
                  <section key={set.id}>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-900">{set.name}</h3>
                      <span
                        className={way(
                          'rounded-full px-2.5 py-0.5 text-xs font-bold',
                          isSetComplete
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-slate-100 text-slate-500'
                        )}
                      >
                        {completedCount}/{set.stickerIds.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {set.stickerIds.map((id) => {
                        const sticker = STICKERS_CATALOG.find((s) => s.id === id)!;
                        const owned = ownedStickers[id];
                        const isLocked = !owned;
                        const count = (owned?.normal || 0) + (owned?.shiny || 0);

                        return (
                          <CollectibleCard
                            key={id}
                            sticker={sticker}
                            isLocked={isLocked}
                            isShiny={(owned?.shiny || 0) > 0}
                            count={count}
                            onClick={() => {
                              if (!isLocked) {
                                playSFX('milestone');
                                hapticService.success();
                                setSelectedSticker(sticker);
                              }
                            }}
                          />
                        );
                      })}
                    </div>

                    {isSetComplete && (
                      <div className="mt-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-3 text-center">
                        <p className="text-xs font-bold text-emerald-700">
                          🎉 Bonus: {set.bonus.description} activo
                        </p>
                      </div>
                    )}
                  </section>
                );
              })}

              {/* Secretos */}
              <section className="border-t-2 border-dashed border-indigo-100 pt-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-base font-black text-indigo-700">
                    <Sparkles size={18} /> Secretos Ocultos
                  </h3>
                  <span className="text-xs font-bold text-indigo-600">
                    {unlockedSecrets.length}/{SECRET_CARDS.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {SECRET_CARDS.map((secret) => {
                    const isUnlocked = unlockedSecrets.includes(secret.id);
                    const sticker = STICKERS_CATALOG.find((s) => s.id === secret.stickerId)!;

                    return (
                      <div key={secret.id} className="flex flex-col gap-2">
                        <CollectibleCard
                          sticker={sticker}
                          isLocked={!isUnlocked}
                          isShiny={true}
                          count={isUnlocked ? 1 : 0}
                          onClick={() => isUnlocked && setSelectedSticker(sticker)}
                        />
                        <p className="text-center text-[10px] font-bold text-slate-500">
                          {isUnlocked ? secret.name : secret.hint}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ Modal: Canje ═══ */}
      <AnimatePresence>
        {showExchange && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowExchange(false)}
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <m.div
              initial={reduceMotion ? {} : { scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border border-white/50 bg-white p-6 text-center shadow-2xl sm:p-8"
            >
              <div className="mb-4 text-5xl">🔄</div>
              <h2 className="text-xl font-black text-slate-900">Puesto de Canje</h2>
              <p className="mt-1 text-xs font-bold text-slate-500">
                Usa tus cromos repetidos para obtener tesoros nuevos.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  disabled={totalDuplicates < 3}
                  onClick={() => handleExchange(3, 'random')}
                  className={way(
                    'flex items-center justify-between rounded-2xl border-2 p-4 text-sm font-bold transition-all',
                    totalDuplicates >= 3
                      ? 'border-slate-100 bg-slate-50 text-slate-900 hover:bg-slate-100 active:scale-[0.98]'
                      : 'cursor-not-allowed border-slate-50 bg-slate-50 text-slate-300'
                  )}
                >
                  <span>3 Duplicados</span>
                  <span className="rounded-lg bg-indigo-600 px-2 py-1 text-[10px] font-bold text-white">
                    1 Nuevo
                  </span>
                </button>

                <button
                  disabled={totalDuplicates < 5}
                  onClick={() => handleExchange(5, 'shiny')}
                  className={way(
                    'flex items-center justify-between rounded-2xl border-2 p-4 text-sm font-bold transition-all',
                    totalDuplicates >= 5
                      ? 'border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-[0.98]'
                      : 'cursor-not-allowed border-slate-50 bg-slate-50 text-slate-300'
                  )}
                >
                  <span>5 Duplicados</span>
                  <span className="rounded-lg bg-purple-600 px-2 py-1 text-[10px] font-bold text-white">
                    ✨ Brillante
                  </span>
                </button>
              </div>

              <button
                onClick={() => setShowExchange(false)}
                className="mt-6 text-xs font-bold text-slate-400 transition-colors hover:text-slate-600"
              >
                Cerrar
              </button>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* ═══ Modal: Detalle cromo ═══ */}
      <AnimatePresence>
        {selectedSticker && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSticker(null)}
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          >
            <m.div
              initial={reduceMotion ? {} : { scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs rounded-[2rem] border-4 border-white bg-white p-6 text-center shadow-2xl sm:max-w-sm sm:p-8"
            >
              <div className="mb-4 text-7xl sm:text-8xl">{selectedSticker.icon}</div>
              <h2 className="text-xl font-black text-slate-900">{selectedSticker.name}</h2>
              <span className="mt-2 inline-block rounded-xl bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {selectedSticker.rarity}
              </span>
              <p className="mt-4 text-sm font-medium leading-relaxed text-slate-600">
                {selectedSticker.description}
              </p>
              <m.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSticker(null)}
                className="mt-6 w-full rounded-2xl bg-indigo-600 py-3.5 text-sm font-black text-white shadow-lg transition-colors hover:bg-indigo-700"
              >
                ¡Genial!
              </m.button>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RewardsBackpack;
