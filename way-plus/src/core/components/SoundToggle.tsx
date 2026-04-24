import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../hooks/useAudio';

export function SoundToggle() {
  const { toggleAudio } = useAudio();
  const [muted, setMuted] = useState(false);

  const handleToggle = () => {
    const newState = !muted;
    setMuted(newState);
    toggleAudio(!newState);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={handleToggle}
      style={{
        background: 'white',
        border: 'none',
        width: 44,
        height: 44,
        borderRadius: 22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        cursor: 'pointer'
      }}
    >
      {muted ? '🔇' : '🔊'}
    </motion.button>
  );
}
