import React, { useRef } from 'react';
import { motion } from 'framer-motion';

interface Props {
  text: string;
  image: string;
  onTextChange: (text: string) => void;
  onImageChange: (url: string) => void;
}

export const StimulusBuilder: React.FC<Props> = ({ text, image, onTextChange, onImageChange }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onImageChange(url);
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border-4 border-slate-50 mb-8">
      <h3 className="font-black text-slate-800 mb-6 flex items-center gap-3 text-lg uppercase tracking-tight">
        <span className="bg-indigo-100 text-indigo-600 p-2 rounded-xl">🎯</span>
        Estímulo Visual y Enunciado
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Pictograma Principal</label>
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => fileRef.current?.click()}
            className={`aspect-square rounded-[2rem] border-4 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all
              ${image ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-200'}
            `}
          >
            {image ? (
              <img src={image} alt="" className="w-full h-full object-contain p-6" />
            ) : (
              <div className="text-center p-6">
                <div className="text-5xl mb-4">🖼️</div>
                <div className="text-sm text-slate-800 font-black uppercase tracking-tight">Subir Pictograma</div>
                <div className="text-xs text-slate-400 font-bold mt-1">Formatos PNG, JPG, WEBP</div>
              </div>
            )}
          </motion.div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex-1">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Pregunta o Consigna</label>
            <textarea
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Ej: ¿Qué haces antes de comer?"
              className="w-full h-full p-6 rounded-[2rem] border-4 border-slate-100 focus:border-indigo-500 focus:outline-none text-xl font-bold text-slate-700 resize-none shadow-inner"
            />
          </div>
          
          <div className="bg-amber-50 rounded-3xl p-6 border-b-4 border-amber-200">
            <div className="flex items-center gap-2 text-amber-800 font-black text-xs uppercase tracking-widest mb-2">
              <span>💡</span> Consejo Clínico
            </div>
            <p className="text-sm text-amber-700 font-medium leading-relaxed">
              Usa lenguaje positivo y directo. Los pictogramas deben ser claros y sin distracciones de fondo para niños con TEA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
