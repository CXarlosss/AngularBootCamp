import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * AvatarColorable - Sistema de personalización de avatar.
 * Permite al niño interactuar con su progreso visualmente.
 */
export function AvatarColorable() {
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#64748b'];

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-50">
      <h2 className="text-2xl font-black text-indigo-900 mb-6">Tu Avatar Personal</h2>
      
      <div className="flex flex-col md:flex-row gap-12 items-center">
        {/* Visualizador del Avatar */}
        <div className="relative w-48 h-48 bg-indigo-50 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-inner">
          <motion.div
            animate={{ backgroundColor: selectedColor }}
            className="w-32 h-32 rounded-3xl"
            transition={{ duration: 0.5 }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-4xl">👤</span>
          </div>
        </div>

        {/* Controles de Color */}
        <div className="flex flex-col gap-4">
          <span className="font-bold text-slate-500 uppercase text-xs tracking-widest">Elige tu energía</span>
          <div className="flex gap-3">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-10 h-10 rounded-full border-4 transition-transform ${selectedColor === color ? 'border-white scale-125 shadow-lg' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <p className="text-sm text-amber-900 font-medium">
              ✨ ¡Sigue completando retos para desbloquear más colores y accesorios!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
