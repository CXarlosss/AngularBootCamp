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
      layout
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{
        delay: index * 0.04,
        type: "spring",
        stiffness: 260,
        damping: 22,
      }}
      className={`relative flex flex-col items-center gap-2 p-4 rounded-3xl border transition-all
        ${
          purchased
            ? "bg-indigo-50 border-indigo-200"
            : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
        }`}
    >
      {/* Badge de coleccionado */}
      {purchased && (
        <div
          className="absolute -top-2 -right-2 w-7 h-7 bg-indigo-600 text-white rounded-full
                        flex items-center justify-center text-[11px] font-bold shadow border-2 border-white z-10"
        >
          ✓
        </div>
      )}

      {/* Emoji grande */}
      <m.div
        whileHover={canAfford ? { scale: 1.12, rotate: [0, -4, 4, 0] } : {}}
        transition={{ duration: 0.35 }}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl
          ${purchased ? "bg-indigo-100" : "bg-slate-50"}`}
      >
        {item.icon}
      </m.div>

      {/* Nombre */}
      <p
        className="text-[13px] font-bold text-slate-800 text-center leading-tight line-clamp-2"
        style={{ fontFamily: "Outfit, sans-serif" }}
      >
        {item.name}
      </p>

      {/* Rareza */}
      <span
        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${rarity.bg} ${rarity.text}`}
      >
        {rarity.label}
      </span>

      {/* Precio / botón */}
      {purchased ? (
        <div
          className="w-full mt-auto py-1.5 text-center text-[9px] font-black uppercase tracking-widest
                        text-indigo-400 bg-indigo-50/50 rounded-2xl border border-indigo-100/50"
        >
          Obtenido
        </div>
      ) : (
        <div className="w-full mt-auto flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100/50">
            <span className="text-xs">🪙</span>
            <span
              className={`text-[13px] font-black ${canAfford ? "text-amber-600" : "text-slate-400"}`}
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {item.price}
            </span>
          </div>
          <m.button
            whileHover={canAfford ? { scale: 1.02, y: -1 } : {}}
            whileTap={canAfford ? { scale: 0.98 } : {}}
            disabled={!canAfford}
            onClick={() => onPurchase(item)}
            className={`w-full py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] transition-all
              ${
                canAfford
                  ? "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-100"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50"
              }`}
          >
            {canAfford ? "Canjear" : "Ahorrar"}
          </m.button>
        </div>
      )}
    </m.div>
  );
});

// ─── Componente principal ──────────────────────────────────────
export function EscaparateIlusiones() {
  const [activeTab, setActiveTab] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const wayCoins = useRewardsStore((s) => s.wayCoins);
  const purchaseItem = useRewardsStore((s) => s.purchaseItem);
  const purchaseHistory = useRewardsStore((s) => s.purchaseHistory);

  // Optimización O(1) para verificar propiedad sin recalcular el Set en cada ItemCard
  const purchasedSet = useMemo(() => new Set(purchaseHistory || []), [purchaseHistory]);
  const isItemPurchased = useCallback((id: string) => purchasedSet.has(id), [purchasedSet]);

  // Al cambiar de categoría resetea la paginación
  const handleTabChange = useCallback((catId: string) => {
    setActiveTab(catId);
    setVisibleCount(PAGE_SIZE);
    audioService.playSFX("click");
  }, []);

  // Items filtrados por categoría (excluye gratuitos)
  const filteredItems = useMemo(
    () =>
      SHOP_CATALOG.filter((i) => i.price > 0).filter(
        (i) => activeTab === "all" || i.category === activeTab,
      ),
    [activeTab],
  );

  // Solo los que se muestran ahora
  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = filteredItems.length > visibleCount;
  const remaining = Math.min(PAGE_SIZE, filteredItems.length - visibleCount);

  const handlePurchase = useCallback(
    (item: ShopItem) => {
      if (isItemPurchased(item.id)) return;
      const result = purchaseItem(item.id as any);
      audioService.playSFX(result.success ? "coins" : "error");
    },
    [isItemPurchased, purchaseItem],
  );

  // Progreso global del álbum
  const ownedCount = useMemo(() => 
    SHOP_CATALOG.filter((i) => isItemPurchased(i.id)).length,
    [isItemPurchased]
  );
  const totalCount = SHOP_CATALOG.length;
  const progressPct = totalCount > 0 ? (ownedCount / totalCount) * 100 : 0;

  return (
    <LazyMotion features={domAnimation}>
      <div
        className="min-h-screen bg-[#F8F9FA] pb-28 px-4 pt-10"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
      {/* ── Header ── */}
      <header className="max-w-md mx-auto text-center mb-8 pb-6 border-b border-slate-100">
        <h1
          className="text-3xl font-black text-[#1A1A2E] tracking-tight mb-1"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          ✨ Escaparate de <span className="text-indigo-600">Ilusiones</span>
        </h1>
        <p className="text-slate-400 text-sm font-medium">
          Colecciona objetos mágicos para tu aventura
        </p>

        {/* Monedero */}
        <div
          className="mt-5 inline-flex items-center gap-2 bg-amber-50 border border-amber-200
                        rounded-2xl px-5 py-2.5"
        >
          <span className="text-xl">🪙</span>
          <span
            className="text-2xl font-black text-amber-600"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            {wayCoins.toLocaleString()}
          </span>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest ml-1">
            Medallas
          </span>
        </div>
      </header>

      {/* ── Tabs de categoría ── */}
      <nav
        className="max-w-md mx-auto mb-6 flex gap-2 overflow-x-auto pb-1
                      [scrollbar-width:none] [&::-webkit-scrollbar]:hidden justify-center flex-wrap"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleTabChange(cat.id)}
            className={`px-4 py-2 rounded-full border-2 transition-all font-bold text-xs whitespace-nowrap
              ${
                activeTab === cat.id
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                  : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-indigo-500"
              }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </nav>

      {/* ── Grid de cromos 2 columnas ── */}
      <main className="max-w-md mx-auto">
        <AnimatePresence mode="popLayout">
          {visibleItems.length > 0 ? (
            <m.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-3"
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
          ) : (
            /* Estado vacío */
            <m.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 px-6"
            >
              <div className="text-5xl mb-4 opacity-20">📖</div>
              <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">
                Página Vacía
              </h3>
              <p className="text-slate-300 text-[11px] mt-1">
                Pronto habrá nuevos objetos en esta categoría
              </p>
            </m.div>
          )}
        </AnimatePresence>

        {/* ── Botón "Ver más" ── */}
        <AnimatePresence>
          {hasMore && (
            <m.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
              className="mt-4 w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-200
                         text-slate-400 font-bold text-sm hover:border-indigo-300 hover:text-indigo-500
                         transition-all flex items-center justify-center gap-2"
            >
              <span>Ver {remaining} objetos más</span>
              <span className="text-base">↓</span>
            </m.button>
          )}
        </AnimatePresence>
      </main>

      {/* ── Progreso del álbum ── */}
      <footer
        className="max-w-md mx-auto mt-10 p-6 bg-white rounded-3xl border
                         border-slate-100 shadow-sm text-center"
      >
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">
          Progreso de Álbum
        </p>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2.5">
          <m.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full rounded-full bg-indigo-500"
          />
        </div>
        <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">
          {ownedCount} / {totalCount} objetos coleccionados
        </p>
      </footer>
    </div>
    </LazyMotion>
  );
}
