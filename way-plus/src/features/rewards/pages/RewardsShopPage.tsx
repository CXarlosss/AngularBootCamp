import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRewardsStore } from '../store/rewardsStore';
import { useAudio } from '@/core/hooks/useAudio';
import { SHOP_CATALOG } from '../data/shopCatalog';
import { BOOSTS_CATALOG } from '../data/boosts';
import type { ShopItem } from '../data/shopCatalog';
import type { Boost } from '../data/boosts';

const CATEGORIES = [
  { id: 'all',   label: 'TODO',    icon: '🏪' },
  { id: 'base',  label: 'AMIGOS',  icon: '🦄' },
  { id: 'hat',   label: 'GORROS',  icon: '🧢' },
  { id: 'cape',  label: 'CAPAS',   icon: '🦸' },
  { id: 'shoes', label: 'ZAPATOS', icon: '👟' },
  { id: 'pet',   label: 'MASCOTAS', icon: '🐾' },
  { id: 'boost', label: 'POCIONES', icon: '🧪' },
];

/* ─── Purchase Modal ─────────────────────────────────────────────── */
function PurchaseModal({
  item, coins, onClose, onConfirm,
}: {
  item: ShopItem | Boost | null;
  coins: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const { playSFX } = useAudio();

  // Reset status when item changes
  useEffect(() => {
    setStatus('idle');
  }, [item]);

  if (!item) return null;
  const canAfford = coins >= item.price;

  const handleBuy = () => {
    if (!canAfford) return; // Silent return, button is disabled anyway
    
    playSFX('coins');
    onConfirm();
    playSFX('success');
    setStatus('success');
    setTimeout(() => { setStatus('idle'); onClose(); }, 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={status === 'idle' ? onClose : undefined}
        className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
        style={{ fontFamily: 'Verdana, sans-serif' }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="relative bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-8 w-full max-w-sm text-center shadow-2xl border-4 border-white overflow-hidden"
        >
          {status === 'success' ? (
            <div className="py-4">
              {/* Celebración de compra interna */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="coin-burst"
                    style={{
                      '--tx': `${(Math.random() - 0.5) * 200}px`,
                      animationDelay: `${Math.random() * 0.2}s`
                    } as React.CSSProperties}
                  >
                    ✨
                  </div>
                ))}
              </div>
              
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="text-7xl mb-4"
              >
                🎉
              </motion.div>
              <h3 className="font-black text-2xl text-emerald-500 tracking-tight">¡Es tuyo!</h3>
              <p className="text-slate-500 font-bold mt-2">Ya está en tu mochila</p>
            </div>
          ) : (
            <>
              {/* Fondo decorativo del modal */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-50 to-transparent -z-10" />
              
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-amber-200/30 rounded-full blur-2xl" />
                <motion.div 
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="text-7xl filter drop-shadow-lg relative z-10"
                >
                  {item.icon}
                </motion.div>
              </div>
              
              <h3 className="font-black text-2xl text-slate-800 tracking-tight mb-2">{item.name}</h3>
              <p className="text-slate-500 font-bold text-sm mb-6">¿Quieres añadir esto a tu colección?</p>
              
              <div className="inline-flex items-center gap-2 bg-amber-50 border-2 border-amber-200 rounded-2xl px-6 py-3 mb-8">
                <span className="text-2xl drop-shadow-sm">🪙</span>
                <span className="font-black text-2xl text-amber-600">{item.price}</span>
              </div>
              
              <div className="flex gap-3">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-black text-slate-500 bg-slate-100 border-2 border-slate-200"
                >
                  Volver
                </motion.button>
                <motion.button 
                  whileHover={canAfford ? { scale: 1.02 } : {}}
                  whileTap={canAfford ? { scale: 0.98 } : {}}
                  onClick={handleBuy}
                  disabled={!canAfford}
                  className="btn-buy flex-1 py-4 text-lg"
                >
                  {canAfford ? '¡Conseguir!' : `🪙 ${item.price}`}
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Shop Item Card ─────────────────────────────────────────────── */
function ShopItemCard({ item, onTap }: { item: ShopItem; onTap: () => void }) {
  const wayCoins       = useRewardsStore(s => s.wayCoins) ?? 0;
  const purchaseHistory = useRewardsStore(s => s.purchaseHistory) ?? [];
  const { playSFX } = useAudio();
  const currentAvatar  = useRewardsStore(s => s.currentAvatar);
  const ownedBoosts    = useRewardsStore(s => s.ownedBoosts) || {};

  const isBoost = (item as any).effect !== undefined;
  const owned    = isBoost 
    ? (ownedBoosts[item.id] > 0)
    : (purchaseHistory || []).includes(item.id) || item.price === 0;

  const equipped = !isBoost && currentAvatar?.[item.category as keyof typeof currentAvatar] === item.id;
  const canAfford = wayCoins >= item.price;
  
  // Determine card style based on rarity
  const rarityClass = 
    item.rarity === 'legendary' ? 'shop-card--legendary' :
    item.rarity === 'epic' ? 'shop-card--epic' :
    item.rarity === 'rare' ? 'shop-card--rare' : '';

  const badge = 
    item.rarity === 'legendary' ? '👑' :
    item.rarity === 'epic' ? '💎' :
    item.rarity === 'rare' ? '⭐' : '';

  return (
    <div
      onClick={() => { playSFX('click'); onTap(); }}
      className={`shop-card ${rarityClass} flex flex-col items-center justify-between min-h-[160px] p-4`}
    >
      {/* Equipped Glow */}
      {equipped && <div className="equipped-glow" />}

      {/* Rarity badge */}
      {badge && <div className="rarity-badge">{badge}</div>}

      {/* Icon with float effect */}
      <motion.div 
        animate={{ y: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: Math.random() }}
        className="text-5xl drop-shadow-md mt-2 relative z-10"
      >
        {item.icon}
      </motion.div>

      {/* Info container */}
      <div className="w-full flex flex-col items-center gap-2 mt-auto relative z-10">
        <span className="font-black text-slate-700 text-xs text-center leading-tight">
          {item.name}
        </span>

        <div className="w-full">
          {equipped ? (
            <div className="bg-emerald-500 text-white rounded-xl py-1.5 text-center font-black text-[10px] uppercase tracking-wider shadow-sm">
              ✅ Puesto
            </div>
          ) : owned ? (
            <div className="bg-indigo-100 text-indigo-700 rounded-xl py-1.5 text-center font-black text-[10px] uppercase tracking-wider">
              {isBoost ? `Tienes ${ownedBoosts[item.id] || 0}` : 'Ponerme'}
            </div>
          ) : (
            <div className={`rounded-xl py-1 flex items-center justify-center gap-1 font-black text-xs bg-amber-100 text-amber-600 ${!canAfford ? 'opacity-50' : ''}`}>
              <span className={canAfford ? 'drop-shadow-sm' : ''}>🪙</span>
              {item.price}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export function RewardsShopPage() {
  const navigate = useNavigate();
  const wayCoins        = useRewardsStore(s => s.wayCoins)        ?? 0;
  const purchaseHistory = useRewardsStore(s => s.purchaseHistory) ?? [];
  const currentAvatar   = useRewardsStore(s => s.currentAvatar);
  const purchaseItem    = useRewardsStore(s => s.purchaseItem);
  const purchaseBoost   = useRewardsStore(s => s.purchaseBoost);
  const equipPart       = useRewardsStore(s => s.equipPart);
  const { playSFX } = useAudio();

  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState<ShopItem | Boost | null>(null);
  const [limit, setLimit] = useState(6);

  useEffect(() => {
    setLimit(6);
  }, [category]);

  const ALL_ITEMS = [
    ...SHOP_CATALOG,
    ...BOOSTS_CATALOG.map(b => ({ ...b, category: 'boost' }))
  ] as ShopItem[];

  const filtered = ALL_ITEMS.filter(
    item => category === 'all' || item.category === category
  );

  const displayed = filtered.slice(0, limit);

  const avatarEmoji =
    currentAvatar?.base === 'base-dragon' ? '🐉' :
    currentAvatar?.base === 'base-puppy'  ? '🐶' :
    currentAvatar?.base === 'base-kitten' ? '🐱' : '🦄';

  const handleTap = (item: ShopItem) => {
    const isBoost = (item as any).effect !== undefined;
    const owned = isBoost ? false : (purchaseHistory ?? []).includes(item.id) || item.price === 0;
    
    if (owned) {
      equipPart(item.category as any, item.id as any);
    } else {
      setSelected(item as any);
    }
  };

  const handleConfirmPurchase = () => {
    if (!selected) return;
    const isBoost = (selected as any).effect !== undefined;
    
    if (isBoost) {
      purchaseBoost(selected.id);
    } else {
      const result = purchaseItem(selected.id as any);
      if (result?.success) {
        equipPart(selected.category as any, selected.id as any);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] relative overflow-y-auto" style={{ fontFamily: 'Verdana, sans-serif' }}>
      
      {/* Immersive Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-300/40 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-amber-200/30 rounded-full blur-[120px]" 
        />
      </div>

      {/* ── Header Premium ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-indigo-600/90 backdrop-blur-2xl border-b border-indigo-500/50 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-4">
            
            <div onClick={() => { playSFX('click'); navigate('/'); }} className="cursor-pointer group flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl group-hover:-translate-x-1 transition-transform">
                🔙
              </div>
              <div>
                <h1 className="font-black text-2xl text-white tracking-tight drop-shadow-sm">Tienda WAY+</h1>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Escaparate Mágico</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-indigo-900/40 border border-indigo-400/30 rounded-2xl px-4 py-2 shadow-inner">
                <div className="coin-float-3d text-2xl drop-shadow-lg">🪙</div>
                <motion.span
                  key={wayCoins}
                  initial={{ scale: 1.5, color: '#FDE68A' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  className="font-black text-xl tabular-nums tracking-tight"
                >
                  {wayCoins}
                </motion.span>
              </div>
              <div className="text-3xl bg-white/10 border border-white/20 rounded-2xl p-2 drop-shadow-md">
                {avatarEmoji}
              </div>
            </div>
            
          </div>

          {/* ── Category Filter - Glassmorphism ─────────────────────────────────── */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORIES.map(cat => {
              const isActive = category === cat.id;
              return (
                <motion.div
                  key={cat.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { playSFX('click'); setCategory(cat.id); }}
                  className={`category-pill ${isActive ? 'category-pill--active text-white' : 'text-indigo-200'} min-w-[80px] flex-shrink-0 flex flex-col items-center gap-1`}
                >
                  <span className="text-2xl drop-shadow-sm">{cat.icon}</span>
                  <span>{cat.label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-3xl mx-auto p-4 pb-24">
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {displayed.map(item => (
            <ShopItemCard
              key={item.id}
              item={item}
              onTap={() => handleTap(item)}
            />
          ))}
        </div>

        {limit < filtered.length && (
          <div className="flex justify-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { playSFX('click'); setLimit(prev => prev + 6); }}
              className="bg-indigo-100 text-indigo-600 font-black px-8 py-3 rounded-full border-2 border-indigo-200"
            >
              Ver más artículos
            </motion.button>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="empty-glass">
            <div className="text-6xl mb-4 opacity-50">👻</div>
            <h3 className="font-black text-xl text-slate-700 tracking-tight">¡Vaya, está vacío!</h3>
            <p className="text-slate-500 font-bold mt-2">No hay artículos en esta sección aún.</p>
          </div>
        )}
      </main>

      {/* ── Purchase modal ────────────────────────────────────── */}
      <PurchaseModal
        item={selected}
        coins={wayCoins}
        onClose={() => setSelected(null)}
        onConfirm={handleConfirmPurchase}
      />
    </div>
  );
}
