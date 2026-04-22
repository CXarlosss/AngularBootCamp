import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  id: string;
  image: string;
  label: string;
  isCorrect: boolean;
  order?: number;
}

interface Props {
  options: Option[];
  onChange: (options: Option[]) => void;
  type: string;
}

export const OptionBuilder: React.FC<Props> = ({ options, onChange, type }) => {
  const addOption = () => {
    if (options.length >= 6) return;
    onChange([
      ...options,
      { 
        id: `opt-${Date.now()}`, 
        image: '', 
        label: '', 
        isCorrect: false,
        order: options.length
      },
    ]);
  };

  const updateOption = (index: number, updates: Partial<Option>) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    onChange(newOptions);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border-4 border-slate-50 mb-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-black text-slate-800 flex items-center gap-3 text-lg uppercase tracking-tight">
          <span className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">🔘</span>
          Configurar Opciones
        </h3>
        <div className="bg-slate-100 px-4 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {options.length} / 6 Opciones
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {options.map((opt, idx) => (
            <motion.div
              key={opt.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`rounded-3xl border-4 p-5 relative transition-all shadow-md group
                ${opt.isCorrect ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white hover:border-indigo-100'}
              `}
            >
              <div className="absolute -top-3 -right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={() => updateOption(idx, { isCorrect: !opt.isCorrect })}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shadow-lg border-2
                    ${opt.isCorrect ? 'bg-emerald-500 text-white border-white' : 'bg-white text-slate-300 border-slate-100'}
                  `}
                  title="Marcar como correcta"
                >
                  ✓
                </button>
                <button
                  onClick={() => removeOption(idx)}
                  className="w-10 h-10 rounded-2xl bg-white text-rose-500 border-2 border-slate-100 flex items-center justify-center text-sm font-black shadow-lg"
                >
                  ✕
                </button>
              </div>

              <div 
                className="aspect-video bg-slate-50 rounded-2xl mb-4 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-slate-200 hover:border-indigo-300 transition-all"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) updateOption(idx, { image: URL.createObjectURL(file) });
                  };
                  input.click();
                }}
              >
                {opt.image ? (
                  <img src={opt.image} alt="" className="w-full h-full object-contain p-3" />
                ) : (
                  <div className="text-center">
                    <span className="text-2xl mb-1 block">🖼️</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Pictograma</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {type === 'sequencing' && (
                  <div className="w-12">
                    <input
                      type="number"
                      value={opt.order}
                      onChange={(e) => updateOption(idx, { order: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border-2 border-slate-100 text-center font-black text-indigo-600 focus:outline-none focus:border-indigo-500 shadow-inner"
                      placeholder="#"
                    />
                  </div>
                )}
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => updateOption(idx, { label: e.target.value })}
                  placeholder="Nombre de la opción"
                  className="flex-1 p-3 rounded-xl border-2 border-slate-100 font-bold text-slate-700 text-sm focus:outline-none focus:border-indigo-500 shadow-inner"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {options.length < 6 && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={addOption}
          className="mt-8 w-full py-5 rounded-[2rem] border-4 border-dashed border-slate-200 text-slate-400 font-black uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-500 transition-all bg-slate-50/50"
        >
          + Añadir Opción Nueva
        </motion.button>
      )}
    </div>
  );
};
