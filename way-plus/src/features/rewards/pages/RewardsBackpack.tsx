import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRewardsStore, type AvatarPart } from '../store/rewardsStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AvatarPreview } from '../components/AvatarPreview';
import { CollectibleCard } from '../components/CollectibleCard';
import { COLLECTIONS, STICKERS_CATALOG, type Sticker } from '../data/collections';
import { SECRET_CARDS } from '../data/secrets';
import { ArrowLeft, ShoppingBag, Trophy, Book, Shirt, Sparkles, RefreshCw } from 'lucide-react';
import { useAudio } from '@/core/hooks/useAudio';

export const RewardsBackpack: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'closet' | 'album') || 'closet';
  
  const { 
    wayCoins, 
    inventory, 
    currentAvatar, 
    equipPart, 
    totalXp, 
    ownedStickers,
    unlockedSecrets,
    exchangeDuplicates 
  } = useRewardsStore();
  const { playSFX } = useAudio();

  const [activeTab, setActiveTab] = useState<'closet' | 'album'>(initialTab);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [showExchange, setShowExchange] = useState(false);
  
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'closet' || tab === 'album') setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tab: 'closet' | 'album') => {
    playSFX('click');
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  
  const categories = [
    { id: 'base', name: 'Amigos', icon: '👤' },
    { id: 'hat', name: 'Gorros', icon: '🧢' },
    { id: 'cape', name: 'Capas', icon: '🦸' },
    { id: 'shoes', name: 'Zapatos', icon: '👟' },
    { id: 'background', name: 'Casas', icon: '🏰' },
    { id: 'pet', name: 'Mascotas', icon: '🐾' }
  ] as const;

  const totalDuplicates = useMemo(() => {
    let count = 0;
    Object.values(ownedStickers).forEach(s => {
      if (s.normal > 1) count += (s.normal - 1);
      if (s.shiny > 1) count += (s.shiny - 1);
    });
    return count;
  }, [ownedStickers]);

  const handleExchange = (count: number, type: 'random' | 'shiny') => {
    const res = exchangeDuplicates(count, type);
    if (res.success) {
      playSFX('magic');
      alert(res.message);
    } else {
      playSFX('error');
      alert(res.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
      padding: '24px 16px 120px',
      overflowY: 'auto'
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        <header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            style={{
              width: 48, height: 48, borderRadius: 16, backgroundColor: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#B45309',
              border: '2px solid #FDE68A', cursor: 'pointer'
            }}
          >
            <ArrowLeft size={24} />
          </motion.button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#78350F', margin: 0, letterSpacing: '-0.5px' }}>
              Mis Tesoros
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#D97706', fontWeight: 800, fontSize: 13 }}>
                <span>🪙</span> {wayCoins}
              </div>
              <div style={{ width: 1, height: 12, background: '#FDE68A' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#92400E', fontWeight: 800, fontSize: 13 }}>
                <Trophy size={14} /> {totalXp} XP
              </div>
            </div>
          </div>
        </header>

        <div style={{ 
          display: 'flex', background: 'rgba(255,255,255,0.7)', padding: 6, borderRadius: 24, 
          gap: 6, border: '2px solid #FDE68A', boxShadow: '0 8px 20px rgba(0,0,0,0.05)'
        }}>
          <button
            onClick={() => handleTabChange('closet')}
            style={{
              flex: 1, padding: '14px 0', borderRadius: 18, border: 'none',
              background: activeTab === 'closet' ? '#F59E0B' : 'transparent',
              color: activeTab === 'closet' ? 'white' : '#B45309',
              fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer', transition: 'all 0.2s', fontSize: 15
            }}
          >
            <Shirt size={18} /> Vestidor
          </button>
          <button
            onClick={() => handleTabChange('album')}
            style={{
              flex: 1, padding: '14px 0', borderRadius: 18, border: 'none',
              background: activeTab === 'album' ? '#F59E0B' : 'transparent',
              color: activeTab === 'album' ? 'white' : '#B45309',
              fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer', transition: 'all 0.2s', fontSize: 15
            }}
          >
            <Book size={18} /> Álbum
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'closet' ? (
            <motion.div
              key="closet"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
            >
              <div style={{
                backgroundColor: 'white', borderRadius: 40, padding: 32, 
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                border: '2px solid #FDE68A', display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}>
                <AvatarPreview />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { playSFX('click'); navigate('/shop'); }}
                  style={{
                    marginTop: 32, width: '100%', padding: '18px 0', borderRadius: 20, 
                    backgroundColor: '#F59E0B', color: 'white', fontWeight: 900, 
                    fontSize: 16, display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', gap: 12, cursor: 'pointer', border: 'none',
                    boxShadow: '0 8px 20px rgba(245,158,11,0.3)'
                  }}
                >
                  <ShoppingBag size={20} /> Ir a la Tienda
                </motion.button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {categories.map((cat) => {
                  const items = inventory.filter(item => item.category === cat.id);
                  if (items.length === 0 && cat.id !== 'base') return null;
                  
                  return (
                    <section key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#78350F', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                        <span style={{ fontSize: 22 }}>{cat.icon}</span> {cat.name}
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                        {items.map(item => {
                          const isEquipped = currentAvatar[cat.id] === item.id;
                          return (
                            <motion.button
                              key={item.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => { playSFX('click'); equipPart(cat.id, item.id as AvatarPart); }}
                              style={{
                                aspectRatio: '1/1', borderRadius: 20, 
                                border: isEquipped ? '3px solid #10B981' : '2px solid #FDE68A',
                                background: isEquipped ? '#ECFDF5' : 'white', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 24, boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
                              }}
                            >
                              {item.icon}
                            </motion.button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="album"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              <div style={{ 
                background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)', 
                borderRadius: 32, padding: 24, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 15px 30px rgba(79,70,229,0.2)'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 900, fontSize: 20 }}>Álbum de Cromos</h3>
                  <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: 14 }}>
                    {Object.keys(ownedStickers).length} de {STICKERS_CATALOG.length} encontrados
                  </p>
                </div>
                <div style={{ fontSize: 40, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>📔</div>
              </div>

              {totalDuplicates > 0 && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    background: 'white', padding: '16px 20px', borderRadius: 24,
                    border: '2px solid #E0E7FF', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 24 }}>🔄</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#1E1B4B' }}>Tienes {totalDuplicates} duplicados</div>
                      <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>¡Canjéalos por cromos nuevos!</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => { playSFX('click'); setShowExchange(true); }}
                    style={{
                      background: '#4F46E5', color: 'white', border: 'none',
                      padding: '8px 16px', borderRadius: 12, fontWeight: 800,
                      fontSize: 12, cursor: 'pointer'
                    }}
                  >
                    Canjear
                  </button>
                </motion.div>
              )}

              {COLLECTIONS.map(set => {
                const completedCount = set.stickerIds.filter(id => !!ownedStickers[id]).length;
                const isSetComplete = completedCount === set.stickerIds.length;

                return (
                  <section key={set.id} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#1E1B4B', margin: 0 }}>
                        {set.name}
                      </h3>
                      <div style={{ 
                        fontSize: 12, fontWeight: 800, color: isSetComplete ? '#10B981' : '#64748B',
                        background: isSetComplete ? '#ECFDF5' : '#F1F5F9',
                        padding: '4px 10px', borderRadius: 10
                      }}>
                        {completedCount}/{set.stickerIds.length}
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                      {set.stickerIds.map(id => {
                        const sticker = STICKERS_CATALOG.find(s => s.id === id)!;
                        const owned = ownedStickers[id];
                        const isLocked = !owned;
                        const count = (owned?.normal || 0) + (owned?.shiny || 0);

                        return (
                          <CollectibleCard 
                            key={id}
                            sticker={sticker}
                            isLocked={isLocked}
                            isShiny={(owned?.shiny || 0) > 0}
                            count={count}
                            onClick={() => {
                              if (!isLocked) {
                                playSFX('milestone');
                                setSelectedSticker(sticker);
                              }
                            }}
                          />
                        );
                      })}
                    </div>

                    {isSetComplete && (
                      <div style={{
                        background: 'linear-gradient(90deg, #10B98111, #34D39911)',
                        padding: 12, borderRadius: 16, border: '1.5px dashed #10B981',
                        fontSize: 12, fontWeight: 700, color: '#065F46', textAlign: 'center'
                      }}>
                        🎉 Bonus: {set.bonus.description} activo
                      </div>
                    )}
                  </section>
                );
              })}

              {/* Secret Cards Section */}
              <section style={{ marginTop: 40, borderTop: '2px dashed #E0E7FF', paddingTop: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#4F46E5', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={20} /> Secretos Ocultos
                  </h3>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#6366F1' }}>
                    {unlockedSecrets.length}/{SECRET_CARDS.length}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {SECRET_CARDS.map(secret => {
                    const isUnlocked = unlockedSecrets.includes(secret.id);
                    const sticker = STICKERS_CATALOG.find(s => s.id === secret.stickerId)!;

                    return (
                      <div key={secret.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <CollectibleCard 
                          sticker={sticker}
                          isLocked={!isUnlocked}
                          isShiny={true}
                          count={isUnlocked ? 1 : 0}
                          onClick={() => isUnlocked && setSelectedSticker(sticker)}
                        />
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#64748B', textAlign: 'center', minHeight: 24 }}>
                          {isUnlocked ? secret.name : secret.hint}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exchange Modal */}
      <AnimatePresence>
        {showExchange && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowExchange(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 1100,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
            }}
          >
            <motion.div
              className="modal-content"
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              style={{
                width: '100%', maxWidth: 400, background: 'white',
                borderRadius: 32, padding: 32, textAlign: 'center'
              }}
            >
              <div style={{ fontSize: 60, marginBottom: 16 }}>🔄</div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1E1B4B', margin: '0 0 8px' }}>Puesto de Canje</h2>
              <p style={{ fontSize: 14, color: '#64748B', fontWeight: 500, marginBottom: 24 }}>
                Usa tus cromos repetidos para obtener tesoros nuevos.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button 
                  disabled={totalDuplicates < 3}
                  onClick={() => handleExchange(3, 'random')}
                  style={{
                    padding: 16, borderRadius: 16, border: 'none',
                    background: totalDuplicates >= 3 ? '#F3F4F6' : '#F9FAFB',
                    color: totalDuplicates >= 3 ? '#1E1B4B' : '#9CA3AF',
                    fontWeight: 800, cursor: totalDuplicates >= 3 ? 'pointer' : 'not-allowed',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <span>3 Duplicados</span>
                  <span style={{ background: '#4F46E5', color: 'white', padding: '4px 8px', borderRadius: 8, fontSize: 10 }}>1 Nuevo</span>
                </button>

                <button 
                  disabled={totalDuplicates < 5}
                  onClick={() => handleExchange(5, 'shiny')}
                  style={{
                    padding: 16, borderRadius: 16, border: 'none',
                    background: totalDuplicates >= 5 ? '#EEF2FF' : '#F9FAFB',
                    color: totalDuplicates >= 5 ? '#4F46E5' : '#9CA3AF',
                    fontWeight: 800, cursor: totalDuplicates >= 5 ? 'pointer' : 'not-allowed',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <span>5 Duplicados</span>
                  <span style={{ background: '#8B5CF6', color: 'white', padding: '4px 8px', borderRadius: 8, fontSize: 10 }}>✨ Brillante</span>
                </button>
              </div>

              <button 
                onClick={() => setShowExchange(false)}
                style={{ marginTop: 24, background: 'transparent', border: 'none', color: '#64748B', fontWeight: 700, cursor: 'pointer' }}
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticker Detail Modal */}
      <AnimatePresence>
        {selectedSticker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSticker(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 1200,
              background: 'rgba(30, 27, 75, 0.8)', backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: 340, backgroundColor: 'white',
                borderRadius: 40, padding: 32, textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '4px solid white'
              }}
            >
              <div style={{ fontSize: 100, marginBottom: 24, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
                {selectedSticker.icon}
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1E1B4B', margin: '0 0 8px' }}>
                {selectedSticker.name}
              </h2>
              <div style={{ 
                display: 'inline-block', padding: '6px 16px', borderRadius: 12, 
                backgroundColor: '#F3F4F6', color: '#6B7280', fontWeight: 800, 
                fontSize: 12, textTransform: 'uppercase', letterSpacing: 1,
                marginBottom: 20
              }}>
                {selectedSticker.rarity}
              </div>
              <p style={{ fontSize: 18, color: '#4B5563', lineHeight: 1.5, margin: '0 0 32px', fontWeight: 500 }}>
                {selectedSticker.description}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSticker(null)}
                style={{
                  width: '100%', padding: '16px', borderRadius: 20,
                  backgroundColor: '#4F46E5', color: 'white', fontWeight: 900,
                  fontSize: 16, border: 'none', cursor: 'pointer',
                  boxShadow: '0 8px 16px rgba(79,70,229,0.3)'
                }}
              >
                ¡Genial!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
