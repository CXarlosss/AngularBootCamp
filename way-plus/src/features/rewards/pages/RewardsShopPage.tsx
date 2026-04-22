import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRewardsStore } from '../store/rewardsStore';
import { SHOP_CATALOG, type ShopItem } from '../data/shopCatalog';
import { AvatarPreview } from '../components/AvatarPreview';
import { ShopItemCard } from '../components/ShopItemCard';
import { PurchaseModal } from '../components/PurchaseModal';

const C = {
  indigo:      '#4F46E5',
  indigoLight: '#E8E9FF',
  indigoDark:  '#3730A3',
  slate:       '#64748B',
  slateLight:  '#F1F5F9',
  slateDark:   '#1E293B',
  amber:       '#F59E0B',
  amberLight:  '#FEF3C7',
  text:        '#1E1B4B',
  white:       '#ffffff',
};

const CATEGORIES = [
  { id: 'all', name: 'Todo', icon: '🏪' },
  { id: 'base', name: 'Amigos', icon: '🦄' },
  { id: 'hat', name: 'Gorros', icon: '🧢' },
  { id: 'cape', name: 'Capas', icon: '🦸' },
  { id: 'shoes', name: 'Zapatos', icon: '👟' },
  { id: 'background', name: 'Casas', icon: '🏰' },
] as const;

export const RewardsShopPage: React.FC = () => {
  const { 
    wayCoins, previewItem, resetPreview, purchaseItem, equipPart, isPurchased 
  } = useRewardsStore();
  
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]['id']>('all');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    return () => resetPreview();
  }, [resetPreview]);

  const filteredItems = activeCategory === 'all' 
    ? SHOP_CATALOG 
    : SHOP_CATALOG.filter(item => item.category === activeCategory);

  const handlePreview = (item: ShopItem) => {
    previewItem(item.category, item.id);
  };

  const handlePurchaseClick = (item: ShopItem) => {
    if (isPurchased(item.id)) {
      equipPart(item.category, item.id);
      resetPreview();
    } else {
      setSelectedItem(item);
      setIsModalOpen(true);
    }
  };

  const handleConfirmPurchase = () => {
    if (selectedItem) {
      const result = purchaseItem(selectedItem.id);
      if (result.success) {
        equipPart(selectedItem.category, selectedItem.id);
        resetPreview();
      }
    }
  };

  return (
    <div style={{ padding: '20px 16px 80px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: '-0.5px' }}>
            Tienda <span style={{ color: C.indigo }}>WAY+</span>
          </h1>
          <p style={{ fontSize: 10, fontWeight: 800, color: C.slate, textTransform: 'uppercase', tracking: '1px' }}>
            Escaparate de Ilusiones
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: 6, 
          background: C.amberLight, borderRadius: 20, padding: '8px 16px',
          border: '1.5px solid #FCD34D'
        }}>
          <span style={{ fontSize: 20 }}>🪙</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#92400E' }}>{wayCoins}</span>
        </div>
      </header>

      {/* Preview Mirror */}
      <section style={{
        background: '#F8FAFC', borderRadius: 32, padding: 24,
        border: '2px solid #fff', boxShadow: 'inset 0 2px 10px rgba(0,0,0,.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 11, fontWeight: 800, color: C.slate, textTransform: 'uppercase', tracking: '1px' }}>
            ✨ Probador
          </h2>
          <button 
            onClick={resetPreview}
            style={{ 
              fontSize: 10, fontWeight: 800, color: C.indigo, 
              background: '#fff', border: 'none', padding: '4px 12px', 
              borderRadius: 20, boxShadow: '0 2px 4px rgba(0,0,0,.05)', cursor: 'pointer'
            }}
          >
            Limpiar
          </button>
        </div>
        
        <div style={{ transform: 'scale(0.85)', margin: '-30px 0' }}>
          <AvatarPreview />
        </div>
      </section>

      {/* Category Filters */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {CATEGORIES.map(cat => {
          const active = activeCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 16, border: 'none',
                background: active ? C.indigo : C.white,
                color: active ? C.white : C.slate,
                boxShadow: active ? '0 8px 20px rgba(79,70,229,.3)' : '0 2px 8px rgba(0,0,0,.05)',
                cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              <span style={{ fontSize: 18 }}>{cat.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>{cat.name}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Catalog Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <ShopItemCard
                item={item}
                onPreview={() => handlePreview(item)}
                onPurchase={() => handlePurchaseClick(item)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <PurchaseModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetPreview();
        }}
        onConfirm={handleConfirmPurchase}
      />
    </div>
  );
};
