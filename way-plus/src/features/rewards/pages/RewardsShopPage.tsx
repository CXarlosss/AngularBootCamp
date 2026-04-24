import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRewardsStore } from '../store/rewardsStore';
import { useAudio } from '@/core/hooks/useAudio';
import { SHOP_CATALOG } from '../data/shopCatalog';
import { BOOSTS_CATALOG } from '../data/boosts';
import type { ShopItem } from '../data/shopCatalog';
import type { Boost } from '../data/boosts';

/* ─── colours ────────────────────────────────────────────────────── */
const C = {
  indigo:  '#4F46E5',
  amber:   '#F59E0B',
  emerald: '#10B981',
  rose:    '#F43F5E',
  text:    '#1E1B4B',
  muted:   '#6B7280',
  border:  '#E8E9FF',
  white:   '#ffffff',
  bg:      '#F4F5FF',
};

const RARITY_STYLE: Record<string, { border: string; bg: string; label: string; badge: string }> = {
  common:    { border: '#D1D5DB', bg: '#F9FAFB', label: 'BÁSICO',    badge: '' },
  rare:      { border: '#93C5FD', bg: '#EFF6FF', label: 'ESPECIAL',  badge: '⭐' },
  epic:      { border: '#C4B5FD', bg: '#F5F3FF', label: 'ÉPICO',     badge: '💎' },
  legendary: { border: '#FDE68A', bg: '#FFFBEB', label: '¡LEGENDARIO!', badge: '👑' },
};

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
  const [status, setStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const { playSFX } = useAudio();

  if (!item) return null;
  const canAfford = coins >= item.price;

  const handleBuy = () => {
    if (!canAfford) { 
      playSFX('error');
      setStatus('fail'); 
      return; 
    }
    playSFX('coins');
    onConfirm();
    playSFX('success');
    setStatus('success');
    setTimeout(() => { setStatus('idle'); onClose(); }, 1800);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={status === 'idle' ? onClose : undefined}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
      >
        <motion.div
          initial={{ scale: 0.8, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 40 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: C.white, borderRadius: 28,
            padding: 28, width: '100%', maxWidth: 320,
            textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.25)',
          }}
        >
          {status === 'success' ? (
            <>
              <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
              <div style={{ fontWeight: 800, fontSize: 22, color: C.emerald }}>¡Es tuyo!</div>
              <div style={{ color: C.muted, marginTop: 6 }}>Ya está en tu mochila</div>
            </>
          ) : status === 'fail' ? (
            <>
              <div style={{ fontSize: 64, marginBottom: 12 }}>😢</div>
              <div style={{ fontWeight: 800, fontSize: 20, color: C.rose }}>¡Faltan monedas!</div>
              <div style={{ color: C.muted, marginTop: 6, marginBottom: 16 }}>
                Necesitas {item.price - coins} 🪙 más
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={onClose}
                style={{ width: '100%', padding: '14px', borderRadius: 16, border: 'none', background: '#F1F2FF', color: C.indigo, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
                Volver
              </motion.button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 72, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 20, color: C.text, marginBottom: 4 }}>{item.name}</div>
              <div style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>
                ¿Quieres comprar este artículo?
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#FEF3C7', border: '1.5px solid #FCD34D',
                borderRadius: 20, padding: '8px 18px', marginBottom: 24,
              }}>
                <span style={{ fontSize: 20 }}>🪙</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: C.amber }}>{item.price}</span>
              </div>
              {!canAfford && (
                <div style={{ color: C.rose, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
                  Tienes {coins} 🪙 — te faltan {item.price - coins}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button whileTap={{ scale: 0.95 }} onClick={onClose}
                  style={{ flex: 1, padding: '14px', borderRadius: 16, border: '2px solid #E8E9FF', background: C.white, color: C.muted, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
                  Cancelar
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleBuy}
                  disabled={!canAfford}
                  style={{
                    flex: 1, padding: '14px', borderRadius: 16, border: 'none',
                    background: canAfford ? C.emerald : '#D1D5DB',
                    color: '#fff', fontWeight: 700, fontSize: 16,
                    cursor: canAfford ? 'pointer' : 'not-allowed',
                  }}>
                  {canAfford ? '¡Comprar!' : 'Sin monedas'}
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
  const rs = RARITY_STYLE[item.rarity] ?? RARITY_STYLE.common;

  return (
    <motion.button
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(79,70,229,.15)' }}
      whileTap={{ scale: 0.95 }}
      onClick={() => { playSFX('click'); onTap(); }}
      style={{
        background: rs.bg,
        border: `2px solid ${equipped ? C.emerald : rs.border}`,
        borderRadius: 16, padding: '12px 8px',
        cursor: 'pointer', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        position: 'relative', overflow: 'hidden',
        boxShadow: equipped ? `0 0 0 3px ${C.emerald}` : 'none',
        transition: 'box-shadow .2s',
        minHeight: 130,
        justifyContent: 'space-between',
      }}
    >
      {/* Rarity badge */}
      {rs.badge && (
        <span style={{
          position: 'absolute', top: 8, right: 8,
          fontSize: 16, lineHeight: 1,
        }}>{rs.badge}</span>
      )}

      {/* Rarity label */}
      <span style={{
        fontSize: 8, fontWeight: 700, letterSpacing: '0.6px',
        color: C.muted, textTransform: 'uppercase',
      }}>{rs.label}</span>

      {/* Icon */}
      <span style={{ fontSize: 36, lineHeight: 1 }}>{item.icon}</span>

      {/* Name */}
      <span style={{
        fontSize: 10, fontWeight: 700, color: C.text,
        lineHeight: 1.2, textAlign: 'center',
      }}>{item.name}</span>

      {/* Price / state */}
      <div style={{ width: '100%' }}>
        {equipped ? (
          <div style={{
            background: C.emerald, color: '#fff',
            borderRadius: 10, padding: '6px 0',
            fontWeight: 700, fontSize: 12,
          }}>✅ PUESTO</div>
        ) : owned ? (
          <div style={{
            background: isBoost ? '#FEF3C7' : '#E8E9FF', 
            color: isBoost ? C.amber : C.indigo,
            borderRadius: 10, padding: '6px 0',
            fontWeight: 700, fontSize: 12,
          }}>
            {isBoost ? `TIENES ${ownedBoosts[item.id] || 0}` : 'PONERME'}
          </div>
        ) : (
          <div style={{
            background: canAfford ? '#FEF3C7' : '#F3F4F6',
            color: canAfford ? C.amber : C.muted,
            borderRadius: 8, padding: '4px 0',
            fontWeight: 700, fontSize: 11,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            <span>🪙</span>{item.price}
          </div>
        )}
      </div>
    </motion.button>
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

  const ALL_ITEMS = [
    ...SHOP_CATALOG,
    ...BOOSTS_CATALOG.map(b => ({ ...b, category: 'boost' }))
  ] as ShopItem[];

  const filtered = ALL_ITEMS.filter(
    item => category === 'all' || item.category === category
  );

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
    <div style={{ background: C.bg, minHeight: '100dvh', paddingBottom: 80 }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg,#3730A3,#4F46E5)',
        padding: '18px 16px 16px',
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div onClick={() => { playSFX('click'); navigate('/'); }} style={{ cursor: 'pointer' }}>
              <div style={{ fontWeight: 800, fontSize: 20, color: '#fff' }}>🏪 Tienda WAY+</div>
              <div style={{ color: '#A5B4FC', fontSize: 13 }}>Escaparate de ilusiones</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,.15)', borderRadius: 20,
                padding: '8px 16px',
              }}>
                <span style={{ fontSize: 18 }}>🪙</span>
                <motion.span
                  key={wayCoins}
                  initial={{ scale: 1.4, color: '#FDE68A' }}
                  animate={{ scale: 1, color: '#fff' }}
                  style={{ fontWeight: 800, fontSize: 18 }}
                >
                  {wayCoins}
                </motion.span>
              </div>
              <div style={{
                fontSize: 32, background: 'rgba(255,255,255,.12)',
                borderRadius: 14, padding: '4px 10px',
              }}>{avatarEmoji}</div>
            </div>
          </div>

          {/* Hint */}
          <div style={{
            background: 'rgba(255,255,255,.1)', borderRadius: 12,
            padding: '8px 12px', fontSize: 12, color: '#C7D2FE', textAlign: 'center',
            marginBottom: 20
          }}>
            👆 Toca un artículo para probártelo · Toca dos veces para comprar
          </div>

          {/* ── Category filter ─────────────────────────────────── */}
          <div style={{
            display: 'flex', gap: 12, overflowX: 'auto',
            paddingBottom: 4,
            scrollbarWidth: 'none',
            justifyContent: 'space-between'
          }}>
            {CATEGORIES.map(cat => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => { playSFX('click'); setCategory(cat.id); }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '8px 4px', borderRadius: 16, flexShrink: 0,
                  border: 'none',
                  background: category === cat.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: '#fff',
                  fontWeight: 900, fontSize: 9, cursor: 'pointer',
                  transition: 'all 0.2s',
                  opacity: category === cat.id ? 1 : 0.5,
                  minWidth: 64
                }}
              >
                <span style={{ fontSize: 24 }}>{cat.icon}</span>
                <span style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{cat.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 12px' }}>

        {/* ── Grid ─────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
        }}>
          {filtered.map(item => (
            <ShopItemCard
              key={item.id}
              item={item}
              onTap={() => handleTap(item)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: C.muted, padding: 40, fontSize: 14 }}>
            No hay artículos en esta categoría
          </div>
        )}
      </div>

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
