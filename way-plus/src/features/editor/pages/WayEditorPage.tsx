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

const C = {
  indigo:      '#4F46E5',
  indigoDark:  '#3730A3',
  indigoLight: '#E0E7FF',
  slate:       '#64748B',
  slateLight:  '#F1F5F9',
  slateDark:   '#1E293B',
  text:        '#1E1B4B',
  white:       '#ffffff',
  emerald:     '#10B981',
  amber:       '#F59E0B',
  rose:        '#F43F5E',
  purple:      '#8B5CF6',
};

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
      let stimulusImage = json.stimulus.image;
      if (stimulusImage && stimulusImage.startsWith('blob:')) {
        const response = await fetch(stimulusImage);
        const blob = await response.blob();
        const file = new File([blob], 'stimulus.png', { type: 'image/png' });
        stimulusImage = await contentService.uploadPictogram(file, 'stimuli');
      }

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
    <div style={{ minHeight: '100vh', background: C.slateLight, paddingBottom: 80, fontFamily: 'system-ui, sans-serif' }}>
      {/* Premium Header */}
      <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', borderBottom: '4px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <motion.button
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/terapeuta')}
              style={{ background: '#F1F5F9', padding: 12, borderRadius: 16, color: '#64748B', border: 'none', cursor: 'pointer', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </motion.button>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1E293B', letterSpacing: '-0.5px', margin: '0 0 4px 0', lineHeight: 1 }}>Editor de Ways</h1>
              <p style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 2, margin: 0 }}>Plataforma de Contenido Clínico No-Code</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 16 }}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={reset}
              style={{ padding: '12px 24px', borderRadius: 16, border: '4px solid #F1F5F9', background: 'transparent', color: '#64748B', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Limpiar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePublish}
              disabled={isPublishing}
              style={{ 
                padding: '12px 32px', borderRadius: 16, background: C.indigo, color: 'white', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, fontSize: 12, border: 'none', 
                borderBottom: '4px solid rgba(0,0,0,0.2)', boxShadow: '0 10px 20px rgba(79,70,229,0.3)', cursor: isPublishing ? 'not-allowed' : 'pointer', opacity: isPublishing ? 0.5 : 1, transition: 'all 0.2s' 
              }}
            >
              {isPublishing ? '🚀 Publicando...' : '🚀 Publicar Way'}
            </motion.button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48 }}>
        {/* Configuration Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, minWidth: 0 }}>
          <div style={{ background: 'linear-gradient(135deg, #4F46E5, #9333EA)', borderRadius: 24, padding: 32, color: 'white', boxShadow: '0 20px 40px rgba(79,70,229,0.3)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 10 }}>
              <h2 style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-1px', margin: '0 0 8px 0', textTransform: 'uppercase', fontStyle: 'italic' }}>Diseño Terapéutico</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: 14, margin: 0 }}>Configura la lógica y los estímulos visuales de tu intervención.</p>
            </div>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: 32, fontSize: 96, opacity: 0.1, transform: 'rotate(12deg)' }}>📐</div>
          </div>
          
          <section>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, marginLeft: 16 }}>1. Estrategia de Juego</label>
            <WayTypeSelector selected={draft.type} onSelect={(type) => updateField('type', type as any)} />
          </section>

          <section>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, marginLeft: 16 }}>2. Núcleo del Reto</label>
            <StimulusBuilder text={draft.stimulus.text} image={draft.stimulus.image} onTextChange={(text) => updateStimulus({ text })} onImageChange={(image) => updateStimulus({ image })} />
          </section>

          <section>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, marginLeft: 16 }}>3. Lógica de Respuesta</label>
            <OptionBuilder options={draft.options} onChange={(opts) => updateField('options', opts)} type={draft.type} />
          </section>

          {/* Classification Section */}
          <section style={{ background: 'white', borderRadius: 40, padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '4px solid #F8FAFC' }}>
            <h3 style={{ fontWeight: 900, color: '#1E293B', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, fontSize: 18, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
              <span style={{ background: '#FEF3C7', color: '#D97706', padding: 8, borderRadius: 12 }}>🏷️</span> Taxonomía Clínica
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Skill Tag (Categoría)</label>
                <input
                  type="text"
                  value={draft.metadata.skillTag}
                  onChange={(e) => updateMetadata({ skillTag: e.target.value })}
                  placeholder="ej: autonomy.hygiene.hands"
                  style={{ width: '100%', padding: 16, borderRadius: 16, border: '4px solid #F1F5F9', outline: 'none', fontWeight: 700, color: '#334155', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Dificultad Sugerida</label>
                <select
                  value={draft.metadata.difficulty}
                  onChange={(e) => updateMetadata({ difficulty: Number(e.target.value) as any })}
                  style={{ width: '100%', padding: 16, borderRadius: 16, border: '4px solid #F1F5F9', outline: 'none', fontWeight: 700, color: '#334155', background: 'white', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}
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
                style={{ background: '#FFF1F2', border: '4px solid #FFE4E6', borderRadius: 40, padding: 32, boxShadow: '0 20px 40px rgba(225,29,72,0.1)' }}
              >
                <h4 style={{ fontWeight: 900, color: '#9F1239', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                  <span style={{ background: '#F43F5E', color: 'white', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>!</span> Requisitos Pendientes
                </h4>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {errors.map((err, i) => (
                    <li key={i} style={{ fontSize: 14, color: '#E11D48', fontWeight: 700, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <span style={{ marginTop: 6, width: 8, height: 8, borderRadius: '50%', background: '#FB7185', flexShrink: 0 }} />
                      {err}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preview Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <LivePreview draft={draft} />
          
          <AnimatePresence>
            {showJSON && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ background: '#0F172A', borderRadius: 48, padding: 32, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <h3 style={{ color: 'white', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 12, textTransform: 'uppercase', letterSpacing: '-0.5px', margin: 0 }}>
                    <span style={{ background: '#6366F1', color: 'white', width: 32, height: 32, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📋</span> JSON Estructural
                  </h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedJSON)}
                    style={{ background: '#4F46E5', color: 'white', padding: '8px 16px', borderRadius: 12, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, border: 'none', cursor: 'pointer' }}
                  >
                    Copiar JSON
                  </button>
                </div>
                <div style={{ background: '#020617', borderRadius: 24, padding: 24, border: '2px solid #1E293B', boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                  <pre style={{ color: '#A5B4FC', fontSize: 10, fontFamily: 'monospace', overflow: 'auto', maxHeight: 384, lineHeight: 1.6, margin: 0 }}>
                    {generatedJSON}
                  </pre>
                </div>
                <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 24 }}>☁️</span>
                  <p style={{ fontSize: 10, color: '#64748B', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, lineHeight: 1.4, margin: 0 }}>
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
