import React from 'react';
import { motion } from 'framer-motion';
import { useRewardsStore, type AvatarPart } from '../store/rewardsStore';
import { useNavigate } from 'react-router-dom';
import { AvatarPreview } from '../components/AvatarPreview';
import { ArrowLeft, ShoppingBag, Star, Sparkles } from 'lucide-react';

export const RewardsBackpack: React.FC = () => {
  const navigate = useNavigate();
  const { wayCoins, inventory, currentAvatar, equipPart, totalXp, resetPreview } = useRewardsStore();
  
  const categories = [
    { id: 'base', name: 'Amigos', icon: '👤' },
    { id: 'hat', name: 'Gorros', icon: '🧢' },
    { id: 'cape', name: 'Capas', icon: '🦸' },
    { id: 'shoes', name: 'Zapatos', icon: '👟' },
    { id: 'background', name: 'Casas', icon: '🏰' }
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 p-6 md:p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <motion.button
              onClick={() => navigate('/')}
              className="w-14 h-14 rounded-[1.5rem] bg-white shadow-xl flex items-center justify-center text-amber-600 border-b-4 border-amber-200"
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft size={28} />
            </motion.button>
            <div>
              <h1 className="text-5xl font-black text-amber-900 tracking-tighter font-outfit">Mi Mochila</h1>
              <p className="text-amber-600 font-bold uppercase tracking-widest text-sm">Inventario de Tesoros</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-4 bg-white rounded-[2rem] px-8 py-4 shadow-xl border-b-4 border-amber-100">
              <motion.span 
                animate={{ rotateY: 360 }}
                className="text-4xl"
              >
                🪙
              </motion.span>
              <span className="text-4xl font-black text-amber-600">{wayCoins}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-black text-amber-800 bg-white/50 px-4 py-1 rounded-full">
              <Star size={12} fill="currentColor" />
              <span>{totalXp} XP TOTAL</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Avatar Showcase */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-12 bg-white/60 backdrop-blur-xl rounded-[3.5rem] p-12 shadow-2xl border-4 border-white flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-amber-100/50 to-transparent pointer-events-none" />
              <h2 className="text-2xl font-black text-amber-900 mb-12 relative z-10 flex items-center gap-2">
                <Sparkles className="text-amber-500" /> Mi Avatar WAY+
              </h2>
              
              <div className="relative z-10 w-full">
                <AvatarPreview />
              </div>

              <div className="mt-12 w-full grid grid-cols-3 gap-3 relative z-10">
                <div className="bg-white/80 p-4 rounded-2xl text-center shadow-sm">
                  <span className="text-xs font-black text-slate-400 block mb-1">CABEZA</span>
                  <span className="text-2xl">{currentAvatar.hat === 'hat-none' ? '❌' : '✅'}</span>
                </div>
                <div className="bg-white/80 p-4 rounded-2xl text-center shadow-sm">
                  <span className="text-xs font-black text-slate-400 block mb-1">CUERPO</span>
                  <span className="text-2xl">✅</span>
                </div>
                <div className="bg-white/80 p-4 rounded-2xl text-center shadow-sm">
                  <span className="text-xs font-black text-slate-400 block mb-1">PIES</span>
                  <span className="text-2xl">✅</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  resetPreview();
                  navigate('/shop');
                }}
                className="mt-8 w-full py-4 rounded-2xl bg-amber-500 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-amber-200 flex items-center justify-center gap-3"
              >
                <ShoppingBag size={20} /> Ir a la Tienda
              </motion.button>
            </div>
          </div>

          {/* Inventory Controls */}
          <div className="lg:col-span-7 space-y-8 pb-20">
            {categories.map((cat) => (
              <section key={cat.id} className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <span className="text-3xl">{cat.icon}</span> {cat.name}
                  </h3>
                  <span className="text-sm font-black text-slate-400 bg-white/50 px-3 py-1 rounded-full border border-slate-100">
                    {inventory.filter(i => i.category === cat.id).length} OBJETOS
                  </span>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {inventory
                    .filter(item => item.category === cat.id)
                    .map(item => {
                      const isEquipped = currentAvatar[cat.id] === item.id;
                      return (
                        <motion.button
                          key={item.id}
                          whileHover={{ scale: 1.05, translateY: -4 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            equipPart(cat.id, item.id as AvatarPart);
                          }}
                          className={`aspect-square rounded-[2.5rem] flex flex-col items-center justify-center p-4 transition-all duration-300 relative border-4
                            ${isEquipped 
                              ? 'bg-emerald-500 border-emerald-300 shadow-xl shadow-emerald-100' 
                              : 'bg-white border-transparent hover:border-amber-200 shadow-lg shadow-slate-100'}`}
                        >
                          <span className="text-5xl mb-2 filter drop-shadow-sm">{item.icon}</span>
                          <span className={`text-[10px] font-black text-center leading-tight uppercase tracking-tight
                            ${isEquipped ? 'text-white' : 'text-slate-500'}`}>
                            {item.name}
                          </span>
                          
                          {isEquipped && (
                            <div className="absolute -top-2 -right-2 bg-white text-emerald-500 rounded-full p-1.5 shadow-lg border-2 border-emerald-500">
                              <Star size={12} fill="currentColor" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  
                  {/* Empty slots for shop teaser */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate('/shop')}
                    className="aspect-square rounded-[2.5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-opacity bg-slate-50/50"
                  >
                    <ShoppingBag size={24} className="text-slate-400 mb-1" />
                    <span className="text-[10px] font-black text-slate-400">MÁS</span>
                  </motion.button>
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
