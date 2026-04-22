import React from 'react';
import { motion } from 'framer-motion';
import { useRewardsStore } from '../store/rewardsStore';
import type { ShopItem } from '../data/shopCatalog';
import { Star } from 'lucide-react';

interface ShopItemCardProps {
  item: ShopItem;
  onPreview: () => void;
  onPurchase: () => void;
}

export const ShopItemCard: React.FC<ShopItemCardProps> = ({ item, onPreview, onPurchase }) => {
  const { wayCoins, isPurchased, currentAvatar, previewAvatar } = useRewardsStore();
  const purchased = isPurchased(item.id);
  const equipped = currentAvatar[item.category] === item.id;
  const inPreview = previewAvatar[item.category] === item.id;
  const canAfford = wayCoins >= item.price;
  
  const rarityColors = {
    common: 'border-slate-200 bg-white text-slate-600',
    rare: 'border-blue-200 bg-blue-50 text-blue-600',
    epic: 'border-purple-200 bg-purple-50 text-purple-600',
    legendary: 'border-amber-200 bg-amber-50 text-amber-600',
  };

  const rarityLabels = {
    common: 'Básico',
    rare: 'Especial',
    epic: 'Épico',
    legendary: '¡Legendario!',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, translateY: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onPreview}
      className={`relative rounded-[2.5rem] p-6 border-4 shadow-xl flex flex-col items-center gap-4 cursor-pointer transition-all duration-300
        ${rarityColors[item.rarity]}
        ${inPreview ? 'ring-4 ring-primary-400' : ''}
        ${equipped ? 'bg-emerald-50 border-emerald-200' : ''}
      `}
    >
      {/* Rarity Tag */}
      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2
        ${rarityColors[item.rarity]} border-white shadow-md`}>
        {rarityLabels[item.rarity]}
      </div>

      <div className="text-6xl my-2 filter drop-shadow-sm">{item.icon}</div>
      
      <div className="text-center font-black text-slate-800 text-sm leading-tight h-10 flex items-center">
        {item.name}
      </div>
      
      <div className="w-full mt-2">
        {!purchased ? (
          <motion.div 
            className={`flex items-center justify-center gap-2 rounded-2xl py-3 px-4 font-black text-xl shadow-inner
              ${canAfford ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-300'}
            `}
          >
            <span>🪙</span>
            <span>{item.price}</span>
          </motion.div>
        ) : equipped ? (
          <div className="bg-emerald-500 text-white rounded-2xl py-3 text-center font-black text-sm shadow-lg flex items-center justify-center gap-2">
            <Star size={16} fill="white" /> PUESTO
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPurchase();
            }}
            className="w-full bg-primary-500 text-white rounded-2xl py-3 font-black text-sm shadow-lg shadow-primary-100 hover:bg-primary-600 transition-colors"
          >
            PONERME
          </button>
        )}
      </div>

      {item.rarity === 'legendary' && (
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 rounded-[2.5rem] pointer-events-none"
        />
      )}
    </motion.div>
  );
};
