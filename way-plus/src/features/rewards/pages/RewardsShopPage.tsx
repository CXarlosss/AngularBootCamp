import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRewardsStore } from '../store/rewardsStore';
import { SHOP_CATALOG, type ShopItem } from '../data/shopCatalog';
import { AvatarPreview } from '../components/AvatarPreview';
import { ShopItemCard } from '../components/ShopItemCard';
import { PurchaseModal } from '../components/PurchaseModal';
import { Sparkles } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'Todo', icon: '🏪' },
  { id: 'base', name: 'Amigos', icon: '🦄' },
  { id: 'hat', name: 'Gorros', icon: '🧢' },
  { id: 'cape', name: 'Capas', icon: '🦸' },
  { id: 'shoes', name: 'Zapatos', icon: '👟' },
  { id: 'background', name: 'Casas', icon: '🏰' },
] as const;

export const RewardsShopPage: React.FC = () => {
  const navigate = useNavigate();
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
    <div className="flex-1 space-y-8 pb-20">
      {/* Header */}
      <header className="px-2 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter font-outfit">Tienda WAY+</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Escaparate de Ilusiones</p>
        </div>
        
        <div className="flex items-center gap-2 bg-amber-50 rounded-2xl px-4 py-2 border border-amber-100">
          <span className="text-xl">🪙</span>
          <span className="text-xl font-black text-amber-600">{wayCoins}</span>
        </div>
      </header>

      {/* Preview Mirror - Top Sticky or Fixed */}
      <section className="px-2">
        <div className="bg-slate-50 rounded-[2.5rem] p-6 border-2 border-white shadow-inner flex flex-col items-center">
           <div className="w-full flex justify-between items-center mb-4">
             <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" /> Probador
            </h2>
            <button onClick={resetPreview} className="text-[10px] font-black text-primary-500 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">
              Limpiar
            </button>
           </div>
           
           <div className="scale-75 -my-10">
            <AvatarPreview />
           </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="px-2">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-black whitespace-nowrap transition-all
                ${activeCategory === cat.id 
                  ? 'bg-primary-500 text-white shadow-lg' 
                  : 'bg-white text-slate-500 border border-slate-100'
                }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="uppercase tracking-widest text-[10px]">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Catalog Grid - 2 Columns */}
      <section className="px-2">
        <div className="grid grid-cols-2 gap-4">
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
      </section>

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
