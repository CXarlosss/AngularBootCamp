import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWayBuilder } from '../hooks/useWayBuilder';
import { registry } from '@/content/registry';
import { contentService } from '@/features/content/services/contentService';
import { WayTypeSelector } from '../components/WayTypeSelector';
import { StimulusBuilder } from '../components/StimulusBuilder';
import { OptionBuilder } from '../components/OptionBuilder';
import { LivePreview } from '../components/LivePreview';

export const WayEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    draft,
    errors,
    updateField,
    updateStimulus,
    updateMetadata,
    generateJSON,
    reset,
  } = useWayBuilder();
  
  const [showJSON, setShowJSON] = useState(false);
  const [generatedJSON, setGeneratedJSON] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    const json = generateJSON();
    if (!json) return;

    setIsPublishing(true);
    try {
      // 1. Subir imagen del estímulo si es un blob local
      let stimulusImage = json.stimulus.image;
      if (stimulusImage && stimulusImage.startsWith('blob:')) {
        const response = await fetch(stimulusImage);
        const blob = await response.blob();
        const file = new File([blob], 'stimulus.png', { type: 'image/png' });
        stimulusImage = await contentService.uploadPictogram(file, 'stimuli');
      }

      // 2. Subir imágenes de opciones
      const processedOptions = await Promise.all(
        json.options.map(async (opt: any) => {
          if (opt.image?.startsWith('blob:')) {
            const response = await fetch(opt.image);
            const blob = await response.blob();
            const file = new File([blob], `${opt.id}.png`, { type: 'image/png' });
            const url = await contentService.uploadPictogram(file, 'options');
            return { ...opt, image: url };
          }
          return opt;
        })
      );

      const wayToPublish = {
        ...json,
        stimulus: { ...json.stimulus, image: stimulusImage },
        options: processedOptions,
      };

      // 3. Publicar via Registry (Hybrid: Cloud + Local Fallback)
      await registry.publishWay(wayToPublish, draft.stepId || 'custom-step');
      
      setGeneratedJSON(JSON.stringify(wayToPublish, null, 2));
      setShowJSON(true);
      alert('¡WAY publicado con éxito en la nube!');
      
    } catch (error) {
      console.error('Error publicando:', error);
      alert('Error al publicar. Se guardó localmente para sincronizar luego.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-md border-b-4 border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/terapeuta')}
              className="bg-slate-100 p-3 rounded-2xl text-slate-500 hover:text-slate-800 transition-colors shadow-inner"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </motion.button>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">Editor de Ways</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plataforma de Contenido Clínico No-Code</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={reset}
              className="px-6 py-3 rounded-2xl border-4 border-slate-100 text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
            >
              Limpiar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePublish}
              disabled={isPublishing}
              className={`px-8 py-3 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all border-b-4 border-indigo-900/20 ${isPublishing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isPublishing ? '🚀 Publicando...' : '🚀 Publicar Way'}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Configuration Column */}
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-black tracking-tight mb-2 uppercase italic">Diseño Terapéutico</h2>
              <p className="text-white/80 font-bold text-sm">Configura la lógica y los estímulos visuales de tu intervención.</p>
            </div>
            <div className="absolute top-0 right-0 p-8 text-8xl opacity-10 rotate-12">📐</div>
          </div>
          
          <section>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-4">1. Estrategia de Juego</label>
            <WayTypeSelector
              selected={draft.type}
              onSelect={(type) => updateField('type', type as any)}
            />
          </section>

          <section>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-4">2. Núcleo del Reto</label>
            <StimulusBuilder
              text={draft.stimulus.text}
              image={draft.stimulus.image}
              onTextChange={(text) => updateStimulus({ text })}
              onImageChange={(image) => updateStimulus({ image })}
            />
          </section>

          <section>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-4">3. Lógica de Respuesta</label>
            <OptionBuilder
              options={draft.options}
              onChange={(opts) => updateField('options', opts)}
              type={draft.type}
            />
          </section>

          {/* Classification Section */}
          <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border-4 border-slate-50">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-3 text-lg uppercase tracking-tight">
              <span className="bg-amber-100 text-amber-600 p-2 rounded-xl">🏷️</span>
              Taxonomía Clínica
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Skill Tag (Categoría)</label>
                <input
                  type="text"
                  value={draft.metadata.skillTag}
                  onChange={(e) => updateMetadata({ skillTag: e.target.value })}
                  placeholder="ej: autonomy.hygiene.hands"
                  className="w-full p-4 rounded-2xl border-4 border-slate-100 focus:border-indigo-500 focus:outline-none font-bold text-slate-700 shadow-inner"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Dificultad Sugerida</label>
                <select
                  value={draft.metadata.difficulty}
                  onChange={(e) => updateMetadata({ difficulty: Number(e.target.value) as any })}
                  className="w-full p-4 rounded-2xl border-4 border-slate-100 focus:border-indigo-500 focus:outline-none font-bold text-slate-700 bg-white shadow-inner"
                >
                  <option value={1}>🟢 Baja (Iniciación)</option>
                  <option value={2}>🟡 Media (Progresión)</option>
                  <option value={3}>🔴 Alta (Maestría)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Error Feed */}
          <AnimatePresence>
            {errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-rose-50 border-4 border-rose-100 rounded-[2.5rem] p-8 shadow-xl shadow-rose-100/50"
              >
                <h4 className="font-black text-rose-800 mb-4 flex items-center gap-2 uppercase tracking-tight">
                  <span className="bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">!</span>
                  Requisitos Pendientes
                </h4>
                <ul className="space-y-3">
                  {errors.map((err, i) => (
                    <li key={i} className="text-sm text-rose-600 font-bold flex items-start gap-3">
                      <span className="mt-1 w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                      {err}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preview Column */}
        <div className="space-y-8">
          <LivePreview draft={draft} />
          
          <AnimatePresence>
            {showJSON && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-black flex items-center gap-3 uppercase tracking-tight">
                    <span className="bg-indigo-500 text-white w-8 h-8 rounded-xl flex items-center justify-center text-sm">📋</span>
                    JSON Estructural
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedJSON);
                      // Feedback visual simple
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Copiar JSON
                  </button>
                </div>
                <div className="bg-slate-950 rounded-2xl p-6 border-2 border-slate-800 shadow-inner overflow-hidden">
                  <pre className="text-indigo-300 text-[10px] font-mono overflow-auto max-h-96 leading-relaxed custom-scrollbar">
                    {generatedJSON}
                  </pre>
                </div>
                <div className="mt-6 flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-2xl">☁️</span>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-tight">
                    En la versión de producción, este contenido se sincronizará automáticamente con Supabase y estará disponible para el paciente en milisegundos.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
