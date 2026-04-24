import type { AvatarPart } from "../store/rewardsStore";

export interface ShopItem {
  id: AvatarPart;
  name: string;
  icon: string;
  category: "base" | "hat" | "cape" | "shoes" | "background" | "pet";
  price: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  requiredLevel?: "pregamer" | "gamer" | "pro"; // Requisito de nivel
}

export const SHOP_CATALOG: ShopItem[] = [
  // BASES - Set Exclusivo & Original
  { id: "base-unicorn", name: "Unicornio Arcoíris", icon: "🦄", category: "base", price: 0, rarity: "common" },
  { id: "base-dragon", name: "Dragón Fuego", icon: "🐉", category: "base", price: 200, rarity: "epic" },
  { id: "base-puppy", name: "Perrito Leal", icon: "🐶", category: "base", price: 100, rarity: "common" },
  { id: "base-kitten", name: "Gatito Mágico", icon: "🐱", category: "base", price: 150, rarity: "rare" },
  { id: "base-fox", name: "Zorro Astuto", icon: "🦊", category: "base", price: 120, rarity: "rare" },
  { id: "base-panda", name: "Panda Mimosón", icon: "🐼", category: "base", price: 150, rarity: "epic" },
  { id: "base-robot", name: "Robot Amigo", icon: "🤖", category: "base", price: 180, rarity: "epic", requiredLevel: "gamer" },
  { id: "base-alien", name: "Alienigena WAY+", icon: "👽", category: "base", price: 200, rarity: "legendary", requiredLevel: "pro" },
  { id: "base-bear", name: "Oso Cariñoso", icon: "🐻", category: "base", price: 100, rarity: "common" },
  { id: "base-monkey", name: "Mono Travieso", icon: "🐵", category: "base", price: 110, rarity: "rare" },

  // SOMBREROS - Set Mágico & Original
  { id: "hat-crown", name: "Corona Real", icon: "👑", category: "hat", price: 50, rarity: "rare", requiredLevel: "gamer" },
  { id: "hat-cap", name: "Gorra Aventura", icon: "🧢", category: "hat", price: 30, rarity: "common" },
  { id: "hat-bow", name: "Lazo Brillante", icon: "🎀", category: "hat", price: 40, rarity: "common" },
  { id: "hat-wizard", name: "Sombrero Mago", icon: "🧙", category: "hat", price: 120, rarity: "epic", requiredLevel: "pro" },
  { id: "hat-party", name: "Gorro Fiesta", icon: "🥳", category: "hat", price: 60, rarity: "rare" },
  { id: "hat-cat-ears", name: "Orejas de Gato", icon: "🐱", category: "hat", price: 35, rarity: "common" },
  { id: "hat-cowboy", name: "Sombrero Vaquero", icon: "🤠", category: "hat", price: 45, rarity: "common" },
  { id: "hat-graduation", name: "Birrete de Graduado", icon: "🎓", category: "hat", price: 100, rarity: "epic", requiredLevel: "pro" },
  { id: "hat-santa", name: "Gorro de Invierno", icon: "🎅", category: "hat", price: 50, rarity: "rare" },
  { id: "hat-crown-gold", name: "Corona de Oro", icon: "👸", category: "hat", price: 150, rarity: "legendary", requiredLevel: "pro" },
  { id: "hat-headphones", name: "Auriculares WAY+", icon: "🎧", category: "hat", price: 60, rarity: "rare" },
  { id: "hat-ribbon", name: "Cinta de Campeón", icon: "🏅", category: "hat", price: 40, rarity: "common" },
  { id: "hat-astronaut", name: "Casco Espacial", icon: "👨‍🚀", category: "hat", price: 130, rarity: "epic", requiredLevel: "gamer" },

  // CAPAS - Set Épico & Original
  { id: "cape-super", name: "Capa Super", icon: "🦸", category: "cape", price: 60, rarity: "rare" },
  { id: "cape-magic", name: "Capa Mágica", icon: "✨", category: "cape", price: 100, rarity: "epic", requiredLevel: "pro" },
  { id: "cape-rainbow", name: "Capa Arcoíris", icon: "🌈", category: "cape", price: 150, rarity: "legendary" },
  { id: "cape-bat", name: "Capa Murciélago", icon: "🦇", category: "cape", price: 85, rarity: "rare" },
  { id: "cape-angel", name: "Alas de Ángel", icon: "👼", category: "cape", price: 110, rarity: "epic" },
  { id: "cape-ninja", name: "Capa Ninja", icon: "🥷", category: "cape", price: 75, rarity: "rare" },
  { id: "cape-butterfly", name: "Alas de Mariposa", icon: "🦋", category: "cape", price: 95, rarity: "epic" },
  { id: "cape-invisible", name: "Capa de Invisibilidad", icon: "👻", category: "cape", price: 200, rarity: "legendary", requiredLevel: "pro" },
  { id: "cape-royal", name: "Manto Real", icon: "🧣", category: "cape", price: 120, rarity: "epic", requiredLevel: "gamer" },

  // ZAPATOS - Set Leyenda & Original
  { id: "shoes-gold", name: "Botas de Oro", icon: "👢", category: "shoes", price: 150, rarity: "epic", requiredLevel: "pro" },
  { id: "shoes-rainbow", name: "Zapas Arcoíris", icon: "👟", category: "shoes", price: 80, rarity: "rare" },
  { id: "shoes-rocket", name: "Botas Cohete", icon: "🚀", category: "shoes", price: 200, rarity: "legendary", requiredLevel: "gamer" },
  { id: "shoes-slippers", name: "Pantuflas Cómodas", icon: "🩴", category: "shoes", price: 20, rarity: "common" },
  { id: "shoes-sport", name: "Zapatillas Deportivas", icon: "👟", category: "shoes", price: 40, rarity: "common" },
  { id: "shoes-roller", name: "Patines de Ruedas", icon: "🛼", category: "shoes", price: 70, rarity: "rare" },
  { id: "shoes-boots", name: "Botas de Montaña", icon: "🥾", category: "shoes", price: 60, rarity: "rare" },
  { id: "shoes-magic", name: "Zapatillas Mágicas", icon: "✨", category: "shoes", price: 110, rarity: "epic", requiredLevel: "gamer" },
  { id: "shoes-ice", name: "Patines de Hielo", icon: "⛸️", category: "shoes", price: 85, rarity: "rare" },

  // FONDOS - Set Increíble & Original
  { id: "background-clouds", name: "Nubes Celestes", icon: "☁️", category: "background", price: 0, rarity: "common" },
  { id: "background-space", name: "Espacio Estelar", icon: "🌌", category: "background", price: 150, rarity: "epic", requiredLevel: "pro" },
  { id: "background-garden", name: "Jardín Zen", icon: "🌳", category: "background", price: 50, rarity: "rare" },
  { id: "background-castle", name: "Castillo Real", icon: "🏰", category: "background", price: 100, rarity: "rare", requiredLevel: "gamer" },
  { id: "background-beach", name: "Playa Tropical", icon: "🏖️", category: "background", price: 60, rarity: "common" },
  { id: "background-mountains", name: "Montañas Nevadas", icon: "🏔️", category: "background", price: 90, rarity: "rare" },
  { id: "background-rainbow", name: "Arcoíris Completo", icon: "🌈", category: "background", price: 70, rarity: "rare" },
  { id: "background-night", name: "Noche Estrellada", icon: "🌃", category: "background", price: 100, rarity: "epic" },
  { id: "background-underwater", name: "Fondo del Mar", icon: "🐠", category: "background", price: 120, rarity: "epic", requiredLevel: "gamer" },
  { id: "background-candy", name: "Mundo de Dulces", icon: "🍭", category: "background", price: 180, rarity: "legendary", requiredLevel: "pro" },

  // MASCOTAS - ¡Nueva Categoría!
  { id: "pet-bee", name: "Abeja Trabajadora", icon: "🐝", category: "pet", price: 50, rarity: "common" },
  { id: "pet-fish", name: "Pez Dorado", icon: "🐠", category: "pet", price: 60, rarity: "common" },
  { id: "pet-bird", name: "Pájaro Cantor", icon: "🐦", category: "pet", price: 80, rarity: "rare" },
  { id: "pet-hamster", name: "Hámster Veloz", icon: "🐹", category: "pet", price: 70, rarity: "rare" },
  { id: "pet-turtle", name: "Tortuga Sabia", icon: "🐢", category: "pet", price: 90, rarity: "epic" },
  { id: "pet-butterfly", name: "Mariposa Guía", icon: "🦋", category: "pet", price: 100, rarity: "epic" },
  { id: "pet-dragon-baby", name: "Bebé Dragón", icon: "🐲", category: "pet", price: 250, rarity: "legendary", requiredLevel: "pro" },
];
