import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useRewardsStore } from '../store/rewardsStore';
import { useAudio } from '@/core/hooks/useAudio';
import { SHOP_CATALOG } from '../data/shopCatalog';
import { BOOSTS_CATALOG } from '../data/boosts';
import type { ShopItem } from '../data/shopCatalog';
import { cn } from '@/shared/lib/utils';
import { RESPONSIVE } from '@/shared/lib/wayResponsive';

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
  const [justBought, setJustBought] = useState<string | null>(null);

  const ALL_ITEMS = useMemo(() => {
    return [
      ...SHOP_CATALOG,
      ...BOOSTS_CATALOG.map(b => ({ ...b, category: 'boost' }))
    ] as ShopItem[];
  }, []);

  const displayed = useMemo(() => ALL_ITEMS.slice(0, limit), [ALL_ITEMS, limit]);

  const handleAction = (item: ShopItem) => {
    const isBoost = (item as any).effect !== undefined;
    const owned = isBoost ? (ownedBoosts[item.id] > 0) : (purchaseHistory.includes(item.id) || item.price === 0);
    const equipped = !isBoost && currentAvatar?.[item.category as keyof typeof currentAvatar] === item.id;
    if (equipped) return;
    if (owned && !isBoost) {
      playSFX('click');
      equipPart(item.category as any, item.id as any);
      return;
    }
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

  const equippedItems = useMemo(() => {
    if (!currentAvatar) return [];
    return Object.values(currentAvatar).map(id => ALL_ITEMS.find(i => i.id === id)).filter(Boolean) as ShopItem[];
  }, [currentAvatar, ALL_ITEMS]);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-y-auto" style={{ fontFamily: 'Verdana, sans-serif' }}>
      
      {/* Top bar */}
      <div className="sticky top-0 z-[60] bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={() => { playSFX('click'); navigate('/'); }}
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-slate-100 flex items-center justify-center text-sm active:scale-95 transition-transform duration-150"
          aria-label="Volver"
        >
          🔙
        </button>
        
        <div className="flex items-center gap-2 bg-amber-50 rounded-full px-3 py-1.5 border border-amber-200">
          <span className="text-lg">⭐</span>
          <span className="text-base font-bold tabular-nums text-amber-700">
            {wayCoins}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-2xl mx-auto p-4 pb-28">
        <div className="text-center mb-4">
          <h1 className="text-base font-bold text-slate-800 leading-normal flex items-center justify-center gap-2">
            <span className="text-lg">🏪</span>
            Tienda de recompensas
          </h1>
        </div>

        {/* Grid */}
        <div className={RESPONSIVE.gridShop}>
          {displayed.map(item => {
            const isBoost = (item as any).effect !== undefined;
            const owned = isBoost ? (ownedBoosts[item.id] > 0) : (purchaseHistory.includes(item.id) || item.price === 0);
            const equipped = !isBoost && currentAvatar?.[item.category as keyof typeof currentAvatar] === item.id;
            const canAfford = wayCoins >= item.price;
            const isJustBought = justBought === item.id;

            return (
              <div
                data-testid={`shop-item-${item.id}`}
                key={item.id}
                className={cn(
                  "bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-3 flex flex-col items-center text-center relative overflow-hidden transition-all duration-150",
                  equipped && "border-emerald-300 bg-emerald-50",
                  isJustBought && "ring-2 ring-amber-300 scale-[1.02] z-20"
                )}
              >
                {isJustBought && (
                  <div className="absolute inset-0 bg-amber-400/10 pointer-events-none" />
                )}
                
                <div data-testid={`shop-item-icon-${item.id}`} className="text-lg mb-2 relative z-10">
                  {item.icon}
                </div>
                
                <h3 data-testid={`shop-item-name-${item.id}`} className="font-bold text-slate-700 text-sm leading-normal mb-auto relative z-10">
                  {item.name}
                </h3>
                
                <div className="mt-3 w-full relative z-10">
                  {equipped ? (
                    <button data-testid={`shop-item-button-${item.id}`} disabled className="w-full min-h-[44px] bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs shadow-sm">
                      Puesto
                    </button>
                  ) : owned && !isBoost ? (
                    <button 
                      data-testid={`shop-item-button-${item.id}`}
                      onClick={() => handleAction(item)}
                      className="w-full min-h-[44px] bg-violet-100 text-violet-700 hover:bg-violet-200 active:scale-95 transition-transform duration-150 font-bold py-2 rounded-xl text-xs"
                    >
                      Ponerme
                    </button>
                  ) : (
                    <button
                      data-testid={`shop-item-button-${item.id}`}
                      disabled={!canAfford}
                      onClick={() => handleAction(item)}
                      className={cn(
                        "w-full min-h-[44px] flex items-center justify-center gap-1.5 font-bold py-2 rounded-xl text-xs transition-all duration-150 shadow-sm",
                        canAfford 
                          ? "bg-amber-400 text-amber-900 hover:bg-amber-500 active:scale-95" 
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      <span>⭐ {item.price}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {limit < ALL_ITEMS.length && (
          <div className="flex justify-center mt-6">
            <button
              data-testid="load-more"
              onClick={() => { playSFX('click'); setLimit(prev => prev + 6); }}
              className="bg-violet-50 text-violet-600 hover:bg-violet-100 font-bold px-6 py-3 min-h-[44px] rounded-full text-sm active:scale-95 transition-transform duration-150"
            >
              Ver más
            </button>
          </div>
        )}
      </main>

      {/* Mochila (Equipado) */}
      <div data-testid="backpack" className="fixed bottom-0 inset-x-0 bg-white border-t-2 border-slate-200 p-4 z-[70] shadow-sm">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎒</span>
            <h3 className="font-bold text-slate-800 text-sm">Mi mochila</h3>
          </div>
          
          <div 
            className="flex items-center gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {equippedItems.map(item => (
              <div key={item.id} className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 whitespace-nowrap">
                <span className="text-sm">{item.icon}</span>
                <span className="font-bold text-slate-600 text-xs">{item.name}</span>
              </div>
            ))}
            {equippedItems.length === 0 && (
              <span className="text-slate-400 font-bold text-xs">Tu mochila está vacía</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
