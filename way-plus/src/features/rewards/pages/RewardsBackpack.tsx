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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #fef3c7, #fffbeb, #ffedd5)',
      padding: '24px 16px',
      overflowY: 'auto'
    }}>
      <div style={{ maxWidth: 1152, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <motion.button
              onClick={() => navigate('/')}
              style={{
                width: 56, height: 56, borderRadius: 24, backgroundColor: 'white',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#d97706', borderBottom: '4px solid #fde68a', cursor: 'pointer'
              }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft size={28} />
            </motion.button>
            <div>
              <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#78350f', letterSpacing: '-1px', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                Mi Mochila
              </h1>
              <p style={{ color: '#d97706', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 14, margin: 0 }}>
                Inventario de Tesoros
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16, backgroundColor: 'white',
              borderRadius: 32, padding: '16px 32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              borderBottom: '4px solid #fef3c7'
            }}>
              <motion.span animate={{ rotateY: 360 }} style={{ fontSize: 36 }}>🪙</motion.span>
              <span style={{ fontSize: 36, fontWeight: 900, color: '#d97706' }}>{wayCoins}</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 900,
              color: '#92400e', backgroundColor: 'rgba(255,255,255,0.5)', padding: '4px 16px', borderRadius: 9999
            }}>
              <Star size={12} fill="currentColor" />
              <span>{totalXp} XP TOTAL</span>
            </div>
          </div>
        </header>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'flex-start' }}>
          {/* Avatar Showcase */}
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 48 }}>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(24px)',
              borderRadius: 56, padding: 48, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '4px solid white', display: 'flex', flexDirection: 'column', alignItems: 'center',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(fef3c7, 0.5), transparent)', pointerEvents: 'none'
              }} />
              <h2 style={{
                fontSize: 24, fontWeight: 900, color: '#78350f', marginBottom: 48,
                position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 8
              }}>
                <Sparkles style={{ color: '#f59e0b' }} /> Mi Avatar WAY+
              </h2>
              
              <div style={{ position: 'relative', zIndex: 10, width: '100%' }}>
                <AvatarPreview />
              </div>

              <div style={{ marginTop: 48, width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, position: 'relative', zIndex: 10 }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.8)', padding: 16, borderRadius: 16, textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: '#94a3b8', display: 'block', marginBottom: 4 }}>CABEZA</span>
                  <span style={{ fontSize: 24 }}>{currentAvatar.hat === 'hat-none' ? '❌' : '✅'}</span>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.8)', padding: 16, borderRadius: 16, textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: '#94a3b8', display: 'block', marginBottom: 4 }}>CUERPO</span>
                  <span style={{ fontSize: 24 }}>✅</span>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.8)', padding: 16, borderRadius: 16, textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: '#94a3b8', display: 'block', marginBottom: 4 }}>PIES</span>
                  <span style={{ fontSize: 24 }}>✅</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  resetPreview();
                  navigate('/shop');
                }}
                style={{
                  marginTop: 32, width: '100%', padding: '16px 0', borderRadius: 16, backgroundColor: '#f59e0b',
                  color: 'white', fontWeight: 900, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em',
                  boxShadow: '0 10px 15px -3px rgba(253, 230, 138, 1)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 12, cursor: 'pointer', border: 'none'
                }}
              >
                <ShoppingBag size={20} /> Ir a la Tienda
              </motion.button>
            </div>
          </div>

          {/* Inventory Controls */}
          <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 80 }}>
            {categories.map((cat) => (
              <section key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
                  <h3 style={{ fontSize: 24, fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 12, margin: 0 }}>
                    <span style={{ fontSize: 30 }}>{cat.icon}</span> {cat.name}
                  </h3>
                  <span style={{
                    fontSize: 14, fontWeight: 900, color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.5)',
                    padding: '4px 12px', borderRadius: 9999, border: '1px solid #f1f5f9'
                  }}>
                    {inventory.filter(i => i.category === cat.id).length} OBJETOS
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 16 }}>
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
                          style={{
                            aspectRatio: '1 / 1', borderRadius: 40, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative',
                            border: isEquipped ? '4px solid #6ee7b7' : '4px solid transparent',
                            backgroundColor: isEquipped ? '#10b981' : 'white',
                            boxShadow: isEquipped ? '0 20px 25px -5px rgba(209, 250, 229, 1)' : '0 10px 15px -3px rgba(241, 245, 249, 1)',
                            transition: 'all 0.3s', cursor: 'pointer'
                          }}
                        >
                          <span style={{ fontSize: 48, marginBottom: 8, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}>{item.icon}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 900, textAlign: 'center', lineHeight: 1.2, textTransform: 'uppercase',
                            letterSpacing: '-0.5px', color: isEquipped ? 'white' : '#64748b'
                          }}>
                            {item.name}
                          </span>
                          
                          {isEquipped && (
                            <div style={{
                              position: 'absolute', top: -8, right: -8, backgroundColor: 'white', color: '#10b981',
                              borderRadius: 9999, padding: 6, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                              border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
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
                    style={{
                      aspectRatio: '1 / 1', borderRadius: 40, border: '4px dashed #e2e8f0', display: 'flex',
                      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      opacity: 0.6, backgroundColor: 'rgba(248, 250, 252, 0.5)', transition: 'opacity 0.3s',
                      cursor: 'pointer'
                    }}
                  >
                    <ShoppingBag size={24} color="#94a3b8" style={{ marginBottom: 4 }} />
                    <span style={{ fontSize: 10, fontWeight: 900, color: '#94a3b8' }}>MÁS</span>
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
