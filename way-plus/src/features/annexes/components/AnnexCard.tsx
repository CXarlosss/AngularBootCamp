import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface AnnexCardProps {
  title: string;
  subtitle: string;
  icon: string;
  to: string;
  color: string;
  completedToday?: boolean;
}

export const AnnexCard: React.FC<AnnexCardProps> = ({ 
  title, subtitle, icon, to, color, completedToday 
}) => {
  return (
    <Link to={to} className="block h-full">
      <motion.div
        whileHover={{ scale: 1.03, translateY: -5 }}
        whileTap={{ scale: 0.97 }}
        className={`relative overflow-hidden rounded-[2.5rem] p-8 h-64 flex flex-col justify-between
          ${color} shadow-2xl border-4 border-white/30 backdrop-blur-sm transition-all duration-300`}
      >
        <div className="text-6xl filter drop-shadow-lg">{icon}</div>
        <div className="space-y-1">
          <h3 className="text-3xl font-black text-white tracking-tighter">{title}</h3>
          <p className="text-white/90 text-lg font-medium leading-tight">{subtitle}</p>
        </div>
        
        {completedToday && (
          <div className="absolute top-6 right-6 bg-white/95 rounded-2xl p-3 shadow-lg animate-bounce">
            <span className="text-3xl">✅</span>
          </div>
        )}
        
        {/* Decorative background shape */}
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      </motion.div>
    </Link>
  );
};
