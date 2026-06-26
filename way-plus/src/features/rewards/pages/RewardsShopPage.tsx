import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRewardsStore } from '../store/rewardsStore';
import { useAudio } from '@/core/hooks/useAudio';
import { SHOP_CATALOG } from '../data/shopCatalog';
import { BOOSTS_CATALOG } from '../data/boosts';
import type { ShopItem } from '../data/shopCatalog';
import { cn } from '@/shared/lib/utils';

export function RewardsShopPage() {
  const navigate = useNavigate();
  const wayCoins        = useRewardsStore(s => s.wayCoins)        ?? 0;
  const purchaseHistory = useRewardsStore(s => s.purchaseHistory) ?? [];
  const currentAvatar   = useRewardsStore(s => s.currentAvatar);
  const purchaseItem    = useRewardsStore(s => s.purchaseItem);
  const purchaseBoost   = useRewardsStore(s => s.purchaseBoost);
  const equipPart       = useRewardsStore(s => s.equipPart);
  const ownedBoosts     = useRewardsStore(s => s.ownedBoosts) || {};
  const { playSFX } = useAudio();

  const [limit, setLimit] = useState(6);
  // Animación por item comprado
  const [justBought, setJustBought] = useState<string | null>(null);

  // Combine items
  const ALL_ITEMS = useMemo(() => {
    return [
      ...SHOP_CATALOG,
      ...BOOSTS_CATALOG.map(b => ({ ...b, category: 'boost' }))
    ] as ShopItem[];
  }, []);

  const displayed = useMemo(() => ALL_ITEMS.slice(0, limit), [ALL_ITEMS, limit]);

  // Handle direct inline buy or equip
  const handleAction = (item: ShopItem) => {
    const isBoost = (item as any).effect !== undefined;
    const owned = isBoost ? (ownedBoosts[item.id] > 0) : (purchaseHistory.includes(item.id) || item.price === 0);
    const equipped = !isBoost && currentAvatar?.[item.category as keyof typeof currentAvatar] === item.id;

    if (equipped) return; // Ya lo tiene puesto

    if (owned && !isBoost) {
      // Si ya lo tiene y no es pocion, equipar
      playSFX('click');
      equipPart(item.category as any, item.id as any);
      return;
    }

    // Comprar
    if (wayCoins >= item.price) {
      playSFX('coins');
      if (isBoost) {
        purchaseBoost(item.id);
      } else {
        const res = purchaseItem(item.id as any);
        if (res?.success) {
          equipPart(item.category as any, item.id as any);
        }
      }
      playSFX('success');
      setJustBought(item.id);
      setTimeout(() => setJustBought(null), 1500);
    } else {
      playSFX('error');
    }
  };

  // Calcular items equipados para la Mochila
  const equippedItems = useMemo(() => {
    if (!currentAvatar) return [];
    return Object.values(currentAvatar).map(id => ALL_ITEMS.find(i => i.id === id)).filter(Boolean) as ShopItem[];
  }, [currentAvatar, ALL_ITEMS]);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-y-auto" style={{ fontFamily: 'Verdana, sans-serif' }}>
      
      {/* ── Top bar - Clean ── */}
      <div className="sticky top-0 z-[60] bg-white/90 backdrop-blur-md border-b-2 border-slate-200/60 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => { playSFX('click'); navigate('/'); }}
          className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl hover:bg-slate-200 active:scale-95 transition-all group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">🔙</span>
        </button>
        
        <div className="flex items-center gap-4">
          <motion.div
            key={wayCoins}
            initial={{ scale: 1.2, color: '#F59E0B' }}
            animate={{ scale: 1, color: '#D97706' }}
            className="bg-amber-50 rounded-full px-5 py-2 flex items-center gap-2 border-[2px] border-amber-200 shadow-sm"
          >
            <span className="text-2xl drop-shadow-sm">⭐</span>
            <span className="text-xl font-black tabular-nums tracking-tight">
              {wayCoins}
            </span>
          </motion.div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="relative z-10 max-w-4xl mx-auto p-4 sm:p-6 pb-32">
        <div className="text-center mb-8">
          <h1 className="font-black text-3xl sm:text-4xl text-slate-800 tracking-tight flex items-center justify-center gap-3">
            <span>🏪</span> TIENDA DE RECOMPENSAS
          </h1>
        </div>

        {/* Grid 2 columnas: Items enormes */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {displayed.map(item => {
            const isBoost = (item as any).effect !== undefined;
            const owned = isBoost ? (ownedBoosts[item.id] > 0) : (purchaseHistory.includes(item.id) || item.price === 0);
            const equipped = !isBoost && currentAvatar?.[item.category as keyof typeof currentAvatar] === item.id;
            const canAfford = wayCoins >= item.price;
            const isJustBought = justBought === item.id;

            return (
              <motion.div
                key={item.id}
                layoutId={`shop-item-${item.id}`}
                className={cn(
                  "bg-white rounded-[2rem] border-[4px] border-slate-100 shadow-sm p-4 sm:p-6 flex flex-col items-center text-center relative overflow-hidden transition-all",
                  equipped && "border-emerald-400 bg-emerald-50",
                  isJustBought && "ring-8 ring-amber-300 scale-105 z-20"
                )}
              >
                {/* Rarity & Celebration */}
                <AnimatePresence>
                  {isJustBought && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: [0, 1, 0] }} 
                      transition={{ duration: 1 }} 
                      className="absolute inset-0 bg-amber-400 mix-blend-overlay pointer-events-none" 
                    />
                  )}
                </AnimatePresence>

                <div className="text-6xl sm:text-7xl mb-2 drop-shadow-md relative z-10">
                  {item.icon}
                </div>
                
                <h3 className="font-black text-slate-700 text-sm sm:text-xl leading-tight mb-auto z-10">
                  {item.name}
                </h3>

                <div className="mt-4 w-full z-10">
                  {equipped ? (
                    <button disabled className="w-full bg-emerald-500 text-white font-black py-3 sm:py-4 rounded-xl text-sm sm:text-lg uppercase tracking-wider shadow-sm">
                      ✅ Puesto
                    </button>
                  ) : owned && !isBoost ? (
                    <button 
                      onClick={() => handleAction(item)}
                      className="w-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 active:scale-95 transition-transform font-black py-3 sm:py-4 rounded-xl text-sm sm:text-lg uppercase tracking-wider"
                    >
                      Ponerme
                    </button>
                  ) : (
                    <button
                      disabled={!canAfford}
                      onClick={() => handleAction(item)}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 font-black py-3 sm:py-4 rounded-xl text-sm sm:text-lg uppercase transition-all shadow-sm",
                        canAfford 
                          ? "bg-amber-400 text-amber-900 hover:bg-amber-500 active:scale-95" 
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      <span>⭐ {item.price}</span>
                      {canAfford && <span className="hidden sm:inline">COMPRAR</span>}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {limit < ALL_ITEMS.length && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => { playSFX('click'); setLimit(prev => prev + 6); }}
              className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-black px-10 py-4 rounded-full text-lg transition-colors"
            >
              ➕ VER MÁS
            </button>
          </div>
        )}
      </main>

      {/* ── Mochila (Equipado) ── */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t-[3px] border-slate-200 p-4 sm:p-6 z-[70] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🎒</span>
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-wider">Mi Mochila (Puesto)</h3>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {equippedItems.map(item => (
              <div key={item.id} className="flex items-center gap-2 bg-slate-100 border-2 border-slate-200 rounded-2xl px-4 py-2 whitespace-nowrap">
                <span className="text-2xl drop-shadow-sm">{item.icon}</span>
                <span className="font-bold text-slate-600 text-sm">{item.name}</span>
              </div>
            ))}
            {equippedItems.length === 0 && (
              <span className="text-slate-400 font-bold text-sm italic">Tu mochila está vacía... ¡A comprar!</span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
