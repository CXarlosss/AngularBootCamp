import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useRewardsStore } from '../store/rewardsStore';
import { useAudio } from '@/core/hooks/useAudio';
import { SHOP_CATALOG } from '../data/shopCatalog';
import { BOOSTS_CATALOG } from '../data/boosts';
import type { ShopItem } from '../data/shopCatalog';
import { rw, wayResponsive } from '@/shared/lib/wayResponsive';
import { way, wayTheme } from '@/shared/lib/wayTheme';
import { Button } from '@/shared/components/Button';
import { hapticService } from '@/core/services/hapticService';

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
      hapticService.click();
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
      hapticService.success();
      setJustBought(item.id);
      setTimeout(() => setJustBought(null), 1500);
    } else {
      playSFX('error');
      hapticService.error();
    }
  };

  const equippedItems = useMemo(() => {
    if (!currentAvatar) return [];
    return Object.values(currentAvatar).map(id => ALL_ITEMS.find(i => i.id === id)).filter(Boolean) as ShopItem[];
  }, [currentAvatar, ALL_ITEMS]);

  return (
    <div className="min-h-screen relative overflow-y-auto pb-32">
      
      {/* Top bar */}
      <div className={way('sticky top-0 z-[60] px-4', wayTheme.GLASS.header)}>
        <div className={wayResponsive.HEADERS.headerCompact}>
          <Button
            variant="icon"
            size="sm"
            onClick={() => { playSFX('click'); navigate('/'); }}
            aria-label="Volver"
          >
            🔙
          </Button>
          
          <div className="flex items-center gap-2 bg-amber-400/20 rounded-full px-4 py-2 border border-amber-400/30 backdrop-blur-md">
            <span className="text-xl drop-shadow-md">⭐</span>
            <span className="text-lg font-black tabular-nums text-amber-500 drop-shadow-sm">
              {wayCoins}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={way('relative z-10 p-4', wayResponsive.CONTAINERS.maxWidthTablet)}>
        <div className="text-center mb-8 mt-4">
          <h1 className={way(wayTheme.TEXT.title, 'text-3xl flex items-center justify-center gap-3')}>
            <span className="text-4xl drop-shadow-md">🏪</span>
            Tienda
          </h1>
        </div>

        {/* Grid */}
        <div className={wayResponsive.GRIDS.gridShop}>
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
                className={way(
                  wayTheme.GLASS.card,
                  'p-4 flex flex-col items-center text-center relative overflow-hidden transition-all duration-300',
                  equipped && 'border-emerald-400 bg-emerald-500/10',
                  isJustBought && 'ring-4 ring-amber-400 scale-[1.05] z-20',
                  !isJustBought && wayTheme.INTERACTIVE.hover
                )}
              >
                {isJustBought && (
                  <div className="absolute inset-0 bg-amber-400/20 pointer-events-none animate-pulse" />
                )}
                
                <div data-testid={`shop-item-icon-${item.id}`} className="text-4xl mb-3 relative z-10 drop-shadow-lg">
                  {item.icon}
                </div>
                
                <h3 data-testid={`shop-item-name-${item.id}`} className={way(wayTheme.TEXT.subtitle, 'text-sm font-bold leading-tight mb-4 relative z-10')}>
                  {item.name}
                </h3>
                
                <div className="mt-auto w-full relative z-10">
                  {equipped ? (
                    <Button 
                      data-testid={`shop-item-button-${item.id}`} 
                      variant="secondary"
                      disabled 
                      className="w-full text-xs min-h-[36px] bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                    >
                      Puesto
                    </Button>
                  ) : owned && !isBoost ? (
                    <Button 
                      data-testid={`shop-item-button-${item.id}`}
                      variant="secondary"
                      onClick={() => handleAction(item)}
                      className="w-full text-xs min-h-[36px] bg-violet-500/20 text-violet-400 border-violet-500/30 hover:bg-violet-500/30"
                    >
                      Ponerme
                    </Button>
                  ) : (
                    <Button
                      data-testid={`shop-item-button-${item.id}`}
                      variant={canAfford ? 'claim' : 'secondary'}
                      disabled={!canAfford}
                      onClick={() => handleAction(item)}
                      className={way("w-full text-xs min-h-[36px] flex items-center justify-center gap-1.5", !canAfford && 'opacity-50 grayscale')}
                    >
                      <span>⭐ {item.price}</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {limit < ALL_ITEMS.length && (
          <div className="flex justify-center mt-10">
            <Button
              data-testid="load-more"
              variant="secondary"
              size="lg"
              onClick={() => { playSFX('click'); hapticService.click(); setLimit(prev => prev + 6); }}
            >
              Ver más artículos
            </Button>
          </div>
        )}
      </main>

      {/* Mochila (Equipado) */}
      <div data-testid="backpack" className={way(wayTheme.GLASS.bottomNav, 'fixed bottom-0 inset-x-0 p-4 z-[70]')}>
        <div className={wayResponsive.CONTAINERS.maxWidthTablet}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl drop-shadow-sm">🎒</span>
            <h3 className={way(wayTheme.TEXT.subtitle, 'text-sm font-bold')}>Mi mochila</h3>
          </div>
          
          <div 
            className="flex items-center gap-3 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {equippedItems.map(item => (
              <div key={item.id} className={way(wayTheme.GLASS.card, 'flex items-center gap-2 px-4 py-2 whitespace-nowrap rounded-xl hover:scale-105 transition-transform')}>
                <span className="text-lg drop-shadow-sm">{item.icon}</span>
                <span className={way(wayTheme.TEXT.micro, 'font-bold')}>{item.name}</span>
              </div>
            ))}
            {equippedItems.length === 0 && (
              <span className={way(wayTheme.TEXT.micro, 'font-bold opacity-70')}>Tu mochila está vacía</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
