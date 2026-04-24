import React from 'react';
import { motion } from 'framer-motion';
import { useRewardsStore } from '../store/rewardsStore';
import { usePlayerStore } from '@/features/player/store/playerStore';
import type { ShopItem } from '../data/shopCatalog';

const C = {
  indigo:      '#4F46E5',
  indigoLight: '#E8E9FF',
  slate:       '#64748B',
  slateLight:  '#F1F5F9',
  slateDark:   '#1E293B',
  amber:       '#F59E0B',
  emerald:     '#10B981',
  text:        '#1E1B4B',
  white:       '#ffffff',
};

interface ShopItemCardProps {
  item: ShopItem;
  onPreview: () => void;
  onPurchase: () => void;
}

export const ShopItemCard: React.FC<ShopItemCardProps> = ({ item, onPreview, onPurchase }) => {
  const { wayCoins, isPurchased, currentAvatar, previewAvatar } = useRewardsStore();
  const purchased = isPurchased(item.id);
  const { profile } = usePlayerStore();
  
  const levels = ['pregamer', 'gamer', 'pro'];
  const currentLevelIndex = levels.indexOf((profile.currentLevel || 'pregamer').toLowerCase());
  const requiredLevelIndex = item.requiredLevel ? levels.indexOf(item.requiredLevel.toLowerCase()) : -1;
  const isLocked = !purchased && requiredLevelIndex > currentLevelIndex;

  const equipped = currentAvatar[item.category] === item.id;
  const inPreview = previewAvatar[item.category] === item.id;
  const canAfford = wayCoins >= item.price;
  
  const rarityConfig: Record<string, { color: string; bg: string; label: string }> = {
    common:    { color: C.slate,   bg: '#F3F4F6', label: 'Básico' },
    rare:      { color: '#3B82F6', bg: '#EFF6FF', label: 'Especial' },
    epic:      { color: '#8B5CF6', bg: '#F5F3FF', label: 'Épico' },
    legendary: { color: '#F59E0B', bg: '#FFFBEB', label: 'Legendario' },
  };

  const config = rarityConfig[item.rarity] || rarityConfig.common;

  return (
    <motion.div
      whileHover={isLocked ? {} : { scale: 1.02, y: -4 }}
      whileTap={isLocked ? {} : { scale: 0.98 }}
      onClick={isLocked ? undefined : onPreview}
      style={{
        position: 'relative',
        borderRadius: 24,
        padding: '24px 16px 16px',
        background: equipped ? '#ECFDF5' : C.white,
        border: equipped ? `2px solid ${C.emerald}` : inPreview ? `2px solid ${C.indigo}` : '2px solid #E2E8F0',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        cursor: isLocked ? 'not-allowed' : 'pointer', transition: 'all 0.3s',
        boxShadow: inPreview ? '0 10px 25px rgba(79,70,229,.15)' : '0 4px 12px rgba(0,0,0,.04)',
        aspectRatio: '3/4',
        opacity: isLocked ? 0.8 : 1,
      }}
    >
      {/* Rarity Tag */}
      <div style={{
        position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
        padding: '4px 12px', borderRadius: 20, fontSize: 8, fontWeight: 900,
        textTransform: 'uppercase', letterSpacing: '1px',
        background: config.bg, color: config.color, border: `1.5px solid ${C.white}`,
        boxShadow: '0 2px 8px rgba(0,0,0,.1)', whiteSpace: 'nowrap'
      }}>
        {config.label}
      </div>

      <div style={{ fontSize: 52, margin: '8px 0', filter: isLocked ? 'grayscale(1) blur(2px)' : 'none' }}>
        {item.icon}
      </div>
      
      <div style={{ 
        textAlign: 'center', fontWeight: 800, color: isLocked ? C.slate : C.text, fontSize: 13, 
        lineHeight: 1.2, height: 32, display: 'flex', alignItems: 'center' 
      }}>
        {item.name}
      </div>
      
      <div style={{ width: '100%', marginTop: 'auto' }}>
        {isLocked ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            borderRadius: 16, padding: '8px', background: '#F1F2FF', border: '1px dashed #C7D2FE'
          }}>
            <span style={{ fontSize: 16 }}>🔒</span>
            <span style={{ fontWeight: 800, fontSize: 8, color: '#4F46E5', textTransform: 'uppercase' }}>
              Nivel {item.requiredLevel}
            </span>
          </div>
        ) : !purchased ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            borderRadius: 16, padding: '8px', fontWeight: 900, fontSize: 16,
            background: canAfford ? '#FFFBEB' : '#F3F4F6',
            color: canAfford ? '#B45309' : '#9CA3AF'
          }}>
            <span>🪙</span>
            <span>{item.price}</span>
          </div>
        ) : equipped ? (
          <div style={{
            background: C.emerald, color: C.white, borderRadius: 16, padding: '10px',
            textAlign: 'center', fontWeight: 900, fontSize: 10, textTransform: 'uppercase',
            boxShadow: '0 4px 12px rgba(16,185,129,.2)'
          }}>
            Puesto
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPurchase();
            }}
            style={{
              width: '100%', background: C.indigo, color: C.white, border: 'none',
              borderRadius: 16, padding: '10px', fontWeight: 900, fontSize: 10,
              textTransform: 'uppercase', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79,70,229,.2)'
            }}
          >
            Ponerme
          </button>
        )}
      </div>

      {item.rarity === 'legendary' && !isLocked && (
        <motion.div 
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            position: 'absolute', inset: 0, borderRadius: 24,
            background: 'linear-gradient(135deg, transparent, rgba(255,255,255,0.4), transparent)',
            pointerEvents: 'none'
          }}
        />
      )}
    </motion.div>
  );
};
