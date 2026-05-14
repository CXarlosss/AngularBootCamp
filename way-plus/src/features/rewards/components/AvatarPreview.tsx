import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRewardsStore, type AvatarPart } from '../store/rewardsStore';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { audioService } from '@/core/utils/audioService';
import { useSecretTracker } from '../hooks/useSecretTracker';

// Mapping table for all icons
const ICON_MAP: Record<string, string> = {
  // Bases (Premium Illustrations)
  'base-unicorn': '/assets/avatars/base-unicorn.png', 
  'base-dragon': '/assets/avatars/base-dragon.png', 
  'base-puppy': '/assets/avatars/base-puppy.png', 
  'base-kitten': '/assets/avatars/base-kitten.png',
  'base-fox': '🦊', 'base-panda': '🐼', 'base-robot': '🤖', 'base-alien': '👽',
  'base-bear': '🐻', 'base-monkey': '🐵',
  
  // Hats
  'hat-crown': '👑', 'hat-cap': '🧢', 'hat-bow': '🎀', 'hat-wizard': '🧙', 'hat-party': '🥳',
  'hat-cat-ears': '🐱', 'hat-cowboy': '🤠', 'hat-graduation': '🎓', 'hat-santa': '🎅',
  'hat-crown-gold': '👸', 'hat-headphones': '🎧', 'hat-ribbon': '🏅', 'hat-astronaut': '👨‍🚀',
  
  // Capes
  'cape-super': '🦸', 'cape-magic': '✨', 'cape-rainbow': '🌈',
  'cape-bat': '🦇', 'cape-angel': '👼', 'cape-ninja': '🥷', 'cape-butterfly': '🦋',
  'cape-invisible': '👻', 'cape-royal': '🧣',
  
  // Shoes
  'shoes-gold': '👟', 'shoes-rainbow': '🌈', 'shoes-rocket': '🚀', 'shoes-normal': '👟',
  'shoes-slippers': '🩴', 'shoes-sport': '👟', 'shoes-roller': '🛼', 'shoes-boots': '🥾',
  'shoes-magic': '✨', 'shoes-ice': '⛸️',
  
  // Pets
  'pet-bee': '🐝', 'pet-fish': '🐠', 'pet-bird': '🐦', 'pet-hamster': '🐹',
  'pet-turtle': '🐢', 'pet-butterfly': '🦋', 'pet-dragon-baby': '🐲',
};

export const AvatarPreview: React.FC = () => {
  const { previewAvatar, currentAvatar } = useRewardsStore();
  const { profile } = usePlayerStore();
  const [showGreeting, setShowGreeting] = React.useState(false);
  const [greeting, setGreeting] = React.useState('¡Hola!');
  const petClickCount = React.useRef(0);
  const { trackPetClick } = useSecretTracker();

  const avatar = previewAvatar;
  const isPreviewDifferent = JSON.stringify(previewAvatar) !== JSON.stringify(currentAvatar);

  const GREETINGS = [
    '¡Eres genial!',
    '¿Jugamos hoy?',
    '¡Qué guapo estoy!',
    '¡Vamos a por monedas!',
    '¡Me encanta mi ropa!',
    '¡Eres un campeón!'
  ];

  const handleTouch = () => {
    const randomIdx = Math.floor(Math.random() * GREETINGS.length);
    setGreeting(GREETINGS[randomIdx]);
    setShowGreeting(true);
    audioService.speak(GREETINGS[randomIdx]);
    
    petClickCount.current++;
    trackPetClick(petClickCount.current);
    
    setTimeout(() => {
      setShowGreeting(false);
    }, 2000);
  };

  const getBackgroundColor = () => {
    switch (avatar.background) {
      case 'background-space': return '#0F172A';
      case 'background-garden': return '#ECFDF5';
      case 'background-castle': return '#FFFBEB';
      case 'background-clouds': return '#F0F9FF';
      case 'background-beach': return '#E0F2FE';
      case 'background-mountains': return '#F1F5F9';
      case 'background-rainbow': return '#FAF5FF';
      case 'background-night': return '#1E293B';
      case 'background-underwater': return '#0C4A6E';
      case 'background-candy': return '#FDF2F8';
      default: return '#F1F5F9';
    }
  };

  const renderBase = () => {
    const source = ICON_MAP[avatar.base];
    if (source && source.endsWith('.png')) {
      return (
        <img 
          src={source} 
          alt="Avatar" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain', 
            filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))' 
          }} 
        />
      );
    }
    return (
      <span style={{ fontSize: 160, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }}>
        {source || '🦄'}
      </span>
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 384, margin: '0 auto' }}>
      <div style={{ 
        aspectRatio: '1/1', borderRadius: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', 
        fontSize: 96, position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.1)', 
        border: '4px solid white', background: getBackgroundColor(), transition: 'background 0.5s ease'
      }}>
        
        {/* Background Decor */}
        {(avatar.background === 'background-space' || avatar.background === 'background-night') && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.span 
                key={i} 
                style={{ position: 'absolute', fontSize: 20, left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', opacity: 0.4 }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 2 + i % 3, repeat: Infinity }}
              >
                ⭐
              </motion.span>
            ))}
          </div>
        )}

        {/* ... Rest of Backgrounds (Underwater, Garden) ... */}
        {avatar.background === 'background-underwater' && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.span 
                key={i} 
                style={{ position: 'absolute', fontSize: 24, left: Math.random() * 100 + '%', bottom: -20 }}
                animate={{ y: [-50, -400], opacity: [0, 0.5, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: 'linear' }}
              >
                🫧
              </motion.span>
            ))}
          </div>
        )}
        
        {/* Composite Avatar */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Pet */}
            <AnimatePresence>
              {avatar.pet !== 'pet-none' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 80, y: [0, -15, 0] }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
                  style={{ position: 'absolute', fontSize: 48, zIndex: 30, top: 20 }}
                >
                  {ICON_MAP[avatar.pet]}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hat */}
            <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', zIndex: 40, width: '100%', display: 'flex', justifyContent: 'center' }}>
              <AnimatePresence>
                {avatar.hat !== 'hat-none' && (
                  <motion.div 
                     key={avatar.hat}
                     initial={{ y: -20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     exit={{ y: -20, opacity: 0 }}
                     style={{ fontSize: 72, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}
                  >
                    {ICON_MAP[avatar.hat]}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cape (Behind) */}
            <div style={{ position: 'absolute', zIndex: 5, top: 20, left: '50%', transform: 'translateX(-50%)', fontSize: 128, opacity: 0.8, filter: 'blur(1px)' }}>
              {ICON_MAP[avatar.cape]}
            </div>

            {/* Base Body */}
            <motion.div 
              animate={{ y: [0, -10, 0], rotate: [-1, 1, -1] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              whileTap={{ scale: 1.1 }}
              onClick={handleTouch}
              style={{ width: '100%', height: '100%', zIndex: 10, cursor: 'pointer', position: 'relative' }}
            >
              {renderBase()}
            </motion.div>

            {/* Shoes */}
            <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 20, display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 50 }}>{ICON_MAP[avatar.shoes]}</span>
              <span style={{ fontSize: 50 }}>{ICON_MAP[avatar.shoes]}</span>
            </div>
          </div>
        </div>

        {/* Speech Bubble */}
        <AnimatePresence>
          {showGreeting && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: -120 }}
              exit={{ opacity: 0, scale: 0.5, y: 0 }}
              style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translateX(-50%)',
                background: 'white', padding: '10px 20px', borderRadius: 20,
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 800,
                color: '#4F46E5', fontSize: 16, whiteSpace: 'nowrap', zIndex: 100,
                border: '2px solid #E8E9FF'
              }}
            >
              {greeting}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {isPreviewDifferent && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)', zIndex: 30 }}
        >
          <span style={{ 
            background: '#FBBF24', color: 'white', padding: '8px 24px', borderRadius: 9999, 
            fontWeight: 900, fontSize: 14, boxShadow: '0 4px 12px rgba(251,191,36,0.3)', 
            border: '2px solid white', textTransform: 'uppercase', letterSpacing: 2 
          }}>
            Vista Previa
          </span>
        </motion.div>
      )}
    </div>
  );
};
