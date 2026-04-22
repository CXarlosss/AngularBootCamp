import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRewardsStore } from '../store/rewardsStore';
import { SHOP_CATALOG, type ShopItem } from '../data/shopCatalog';
import { AvatarPreview } from '../components/AvatarPreview';
import { ShopItemCard } from '../components/ShopItemCard';
import { PurchaseModal } from '../components/PurchaseModal';

const C = {
  purple:      '#8B5CF6',
  purpleLight: '#F5F3FF',
  purpleDark:  '#4C1D95',
  fuchsia:     '#D946EF',
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
    <div style={{ flex: 1, background: `linear-gradient(135deg, ${C.purpleLight}, #E879F920)`, padding: '24px 16px 100px', minHeight: '100vh', overflowY: 'auto' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.7)', padding: '16px 24px', borderRadius: 24, boxShadow: '0 8px 32px rgba(139,92,246,0.1)', border: '2px solid white' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: C.purpleDark, letterSpacing: '-0.5px', margin: 0 }}>
              Tienda <span style={{ color: C.fuchsia }}>WAY+</span>
            </h1>
            <p style={{ fontSize: 10, fontWeight: 800, color: C.purple, textTransform: 'uppercase', letterSpacing: '1px', margin: '4px 0 0' }}>
              Escaparate Mágico
            </p>
          </div>
          
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: 8, 
            background: C.amberLight, borderRadius: 20, padding: '8px 16px',
            border: '2px solid #FCD34D', boxShadow: '0 4px 12px rgba(245,158,11,0.2)'
          }}>
            <span style={{ fontSize: 24 }}>🪙</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#92400E' }}>{wayCoins}</span>
          </div>
        </header>

        {/* Preview Mirror */}
        <section style={{
          background: 'rgba(255,255,255,0.9)', borderRadius: 32, padding: 24,
          border: '4px solid white', boxShadow: '0 12px 40px rgba(139,92,246,0.15)',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Decorative blobs */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: C.fuchsia, opacity: 0.1, borderRadius: '50%', filter: 'blur(20px)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 120, height: 120, background: C.purple, opacity: 0.1, borderRadius: '50%', filter: 'blur(20px)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 14, fontWeight: 900, color: C.purpleDark, textTransform: 'uppercase', letterSpacing: '1px', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              ✨ Probador
            </h2>
            <button 
              onClick={resetPreview}
              style={{ 
                fontSize: 10, fontWeight: 800, color: C.purple, 
                background: C.white, border: `2px solid ${C.purpleLight}`, padding: '6px 16px', 
                borderRadius: 20, boxShadow: '0 4px 12px rgba(139,92,246,0.1)', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              QUITAR TODO
            </button>
          </div>
          
          <div style={{ transform: 'scale(0.85)', margin: '-20px 0', position: 'relative', zIndex: 1 }}>
            <AvatarPreview />
          </div>
        </section>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 20px', borderRadius: 20, border: 'none',
                  background: active ? C.purple : 'rgba(255,255,255,0.8)',
                  color: active ? C.white : C.slateDark,
                  boxShadow: active ? '0 8px 24px rgba(139,92,246,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                  border: active ? 'none' : '2px solid white'
                }}
              >
                <span style={{ fontSize: 20 }}>{cat.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>{cat.name}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Catalog Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
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
    </div>
  );
};
