import React, { useState, useMemo, useCallback } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { audioService } from "@/core/utils/audioService";
import { useRewardsStore } from "@/features/rewards/store/rewardsStore";
import { SHOP_CATALOG } from "../data/shopCatalog";
import type { ShopItem } from "../data/shopCatalog";

// ─── Constantes ────────────────────────────────────────────────
const PAGE_SIZE = 6;

const CATEGORIES = [
  { id: "all", label: "Todo", icon: "✨" },
  { id: "base", label: "Avatares", icon: "👤" },
  { id: "hat", label: "Sombreros", icon: "🎩" },
  { id: "cape", label: "Capas", icon: "🧣" },
  { id: "shoes", label: "Zapatos", icon: "👟" },
  { id: "pet", label: "Mascotas", icon: "🐾" },
  { id: "background", label: "Fondos", icon: "🖼️" },
];

const RARITY_STYLES: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  common: { label: "Común", bg: "bg-slate-100", text: "text-slate-500" },
  rare: { label: "Raro", bg: "bg-blue-50", text: "text-blue-600" },
  epic: { label: "Épico", bg: "bg-indigo-50", text: "text-indigo-600" },
  legendary: { label: "Legendario", bg: "bg-amber-50", text: "text-amber-600" },
};

// ─── Sub-componente: tarjeta de objeto ─────────────────────────
interface ItemCardProps {
  item: ShopItem;
  purchased: boolean;
  canAfford: boolean;
  onPurchase: (item: ShopItem) => void;
  index: number;
}

const ItemCard = React.memo(function ItemCard({
  item,
  purchased,
  canAfford,
  onPurchase,
  index,
}: ItemCardProps) {
  const rarity = RARITY_STYLES[item.rarity] ?? RARITY_STYLES.common;

  return (
    <m.div
      layout="position"
      style={{ willChange: "transform" }}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        delay: (index % 6) * 0.05,
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      className={`relative flex flex-col items-center p-3 rounded-[2rem] border-2 transition-all group
        ${
          purchased
            ? "bg-indigo-50/40 border-indigo-100/50 grayscale-[0.3]"
            : "bg-white border-slate-50 hover:border-indigo-100 hover:shadow-[0_15px_30px_-10px_rgba(79,70,229,0.1)]"
        }`}
    >
      {/* Icono / Pictograma */}
      <div className="relative mb-3">
        <m.div
          whileHover={!purchased && canAfford ? { scale: 1.1, rotate: 5 } : {}}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl transition-colors
            ${purchased ? "bg-indigo-100/50" : "bg-slate-50 group-hover:bg-indigo-50"}`}
        >
          {item.icon}
        </m.div>
        
        {purchased && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm border-2 border-white">
            ✓
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col items-center gap-1 w-full overflow-hidden text-center">
        <h3 className="text-[11px] sm:text-xs font-black text-slate-700 leading-tight line-clamp-1">
          {item.name}
        </h3>
        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${rarity.bg} ${rarity.text} opacity-80`}>
          {rarity.label}
        </span>
      </div>

      {/* Acción */}
      <div className="mt-3 w-full">
        {purchased ? (
          <div data-testid={`shop-item-purchased-${item.id}`} className="py-1 text-[8px] font-black text-indigo-300 text-center uppercase tracking-widest bg-indigo-50/30 rounded-xl">
            Adquirido
          </div>
        ) : (
          <m.button
            data-testid={`shop-item-button-${item.id}`}
            whileTap={{ scale: 0.95 }}
            disabled={!canAfford}
            onClick={() => onPurchase(item)}
            className={`w-full py-1.5 rounded-xl flex items-center justify-center gap-1 transition-all
              ${canAfford 
                ? "bg-slate-900 text-white shadow-md hover:bg-indigo-600" 
                : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-50"}`}
          >
            <span className="text-[10px]">🪙</span>
            <span className="text-[11px] font-black" style={{ fontFamily: 'Verdana, sans-serif' }}>
              {item.price}
            </span>
          </m.button>
        )}
      </div>
    </m.div>
  );
});

// ─── Componente principal ──────────────────────────────────────
export function EscaparateIlusiones() {
  const [activeTab, setActiveTab] = useState("all");
  const [visibleCount, setVisibleCount] = useState(12); // Aumentado por el grid 3-col

  const wayCoins = useRewardsStore((s) => s.wayCoins);
  const purchaseItem = useRewardsStore((s) => s.purchaseItem);
  const purchaseHistory = useRewardsStore((s) => s.purchaseHistory);

  const purchasedSet = useMemo(() => new Set(purchaseHistory || []), [purchaseHistory]);
  const isItemPurchased = useCallback((id: string) => purchasedSet.has(id), [purchasedSet]);

  const handleTabChange = useCallback((catId: string) => {
    setActiveTab(catId);
    setVisibleCount(12);
    audioService.playSFX("click");
  }, []);

  const filteredItems = useMemo(
    () =>
      SHOP_CATALOG.filter((i) => i.price > 0).filter(
        (i) => activeTab === "all" || i.category === activeTab,
      ),
    [activeTab],
  );

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = filteredItems.length > visibleCount;

  const handlePurchase = useCallback(
    (item: ShopItem) => {
      if (isItemPurchased(item.id)) return;
      const result = purchaseItem(item.id as any);
      audioService.playSFX(result.success ? "success" : "error");
    },
    [isItemPurchased, purchaseItem],
  );

  // Progreso de la colección
  const ownedCount = useMemo(() => 
    SHOP_CATALOG.filter((i) => isItemPurchased(i.id)).length,
    [isItemPurchased]
  );
  const totalCount = SHOP_CATALOG.length;
  const progressPct = Math.round((ownedCount / totalCount) * 100);

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-[#FDFDFF] pb-32 px-4 pt-12 overflow-x-hidden">
        
        {/* ── Header Flotante ── */}
        <header className="max-w-2xl mx-auto flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Tienda de <span className="text-indigo-600">Premios</span>
              </h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                Canjea tus medallas ganadas
              </p>
            </div>
            
            <div className="bg-amber-50 border-2 border-amber-100 rounded-3xl px-4 py-2 flex items-center gap-2 shadow-sm">
              <span className="text-xl">🪙</span>
              <span className="text-xl font-black text-amber-600" style={{ fontFamily: 'Verdana, sans-serif' }}>
                {wayCoins.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Barra de Progreso Colección */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-50 flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <span>Tu Colección</span>
              <span className="text-indigo-600">{ownedCount} / {totalCount} Objetos</span>
            </div>
            <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
              <m.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"
              />
            </div>
          </div>
        </header>

        {/* ── Filtros ── */}
        <nav className="max-w-2xl mx-auto mb-8 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 flex gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleTabChange(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap font-black text-xs uppercase tracking-widest transition-all
                ${activeTab === cat.id 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105" 
                  : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"}`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </nav>

        {/* ── Grid Principal ── */}
        <main className="max-w-2xl mx-auto">
          <AnimatePresence mode="popLayout">
            {visibleItems.length > 0 ? (
              <div className="flex flex-col gap-10">
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                >
                  {visibleItems.map((item, idx) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      index={idx}
                      purchased={isItemPurchased(item.id)}
                      canAfford={wayCoins >= item.price}
                      onPurchase={handlePurchase}
                    />
                  ))}
                </m.div>

                {hasMore && (
                  <m.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setVisibleCount(prev => prev + 12);
                      audioService.playSFX('click');
                    }}
                    className="w-full py-5 bg-white border-2 border-slate-100 rounded-[2rem] text-slate-400 font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center justify-center gap-3"
                  >
                    Ver más tesoros 🔍
                  </m.button>
                )}
              </div>
            ) : (
              <m.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-24 px-8 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100"
              >
                <div className="text-6xl mb-6 grayscale opacity-30">🎁</div>
                <h3 className="text-lg font-black text-slate-300 uppercase tracking-widest">
                  Próximamente
                </h3>
                <p className="text-slate-300 text-xs mt-2 font-bold">
                  Nuevos objetos mágicos están de camino
                </p>
              </m.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </LazyMotion>
  );
}

