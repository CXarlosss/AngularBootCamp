import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const C = {
  white: '#ffffff',
  text: '#1E1B4B',
};

interface AnnexCardProps {
  title: string;
  subtitle: string;
  icon: string;
  to: string;
  color: string; // Used as background linear-gradient
  completedToday?: boolean;
}

export const AnnexCard: React.FC<AnnexCardProps> = ({ 
  title, subtitle, icon, to, color, completedToday 
}) => {
  // Convert Tailwind gradient classes to real CSS gradients if possible, 
  // or just use the color string if it's already a gradient or hex.
  // The current AnnexesHubPage passes 'bg-gradient-to-br from-emerald-400 to-teal-500' etc.
  // I will map these known gradients.

  const gradientMap: Record<string, string> = {
    'bg-gradient-to-br from-emerald-400 to-teal-500': 'linear-gradient(135deg, #34D399, #14B8A6)',
    'bg-gradient-to-br from-orange-400 to-rose-500': 'linear-gradient(135deg, #FB923C, #F43F5E)',
    'bg-gradient-to-br from-primary-400 to-primary-600': 'linear-gradient(135deg, #818CF8, #4F46E5)',
  };

  const background = gradientMap[color] || color;

  return (
    <Link to={to} style={{ textDecoration: 'none', display: 'block' }}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 32,
          padding: 24,
          height: 180,
          background: background,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: '4px solid rgba(255,255,255,0.3)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
          transition: 'all 0.3s',
        }}
      >
        <div style={{ fontSize: 52, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{icon}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <h3 style={{ fontSize: 26, fontWeight: 900, color: C.white, margin: 0, letterSpacing: '-0.5px' }}>{title}</h3>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>{subtitle}</p>
        </div>
        
        {completedToday && (
          <div style={{
            position: 'absolute', top: 20, right: 20,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 16, padding: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: 24 }}>✅</span>
          </div>
        )}
        
        {/* Decorative background shape */}
        <div style={{
          position: 'absolute', bottom: -20, right: -20,
          width: 100, height: 100,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          filter: 'blur(20px)',
          pointerEvents: 'none'
        }} />
      </motion.div>
    </Link>
  );
};
