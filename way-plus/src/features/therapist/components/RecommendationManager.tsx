import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { syncService, type TherapistRecommendation } from '@/core/services/syncService';
import { MessageSquare, Send, Trash2, Lightbulb } from 'lucide-react';

interface Props {
  patientId: string;
}

const CATEGORIES: { id: TherapistRecommendation['category']; label: string; icon: string }[] = [
  { id: 'autonomy',   label: 'Autonomía',    icon: '⚡' },
  { id: 'regulation',  label: 'Calma',        icon: '🧘' },
  { id: 'social',      label: 'Habilidades',  icon: '🤝' },
  { id: 'asertivity',  label: 'Asertividad',  icon: '🛡️' },
  { id: 'general',     label: 'General',      icon: '💡' },
];

export const RecommendationManager: React.FC<Props> = ({ patientId }) => {
  const [recs, setRecs] = useState<TherapistRecommendation[]>([]);
  const [title, setTitle] = useState('');
  const [advice, setAdvice] = useState('');
  const [category, setCategory] = useState<TherapistRecommendation['category']>('general');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecs();
  }, [patientId]);

  const loadRecs = async () => {
    setLoading(true);
    const data = await syncService.getRecommendations(patientId);
    setRecs(data);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!title.trim() || !advice.trim()) return;
    const res = await syncService.addRecommendation(patientId, { title, advice, category });
    if (res) {
      setRecs([res, ...recs]);
      setTitle('');
      setAdvice('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Form Card */}
      <div style={{ 
        background: 'white', padding: 24, borderRadius: 24, 
        border: '1.5px solid #F1F2FF', boxShadow: '0 10px 25px rgba(79, 70, 229, 0.05)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ background: '#EEF2FF', padding: 8, borderRadius: 12, color: '#4F46E5' }}>
            <Lightbulb size={20} />
          </div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#1E1B4B' }}>Nueva Recomendación para Padres</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Category Picker */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                style={{
                  padding: '8px 14px', borderRadius: 12, border: '1.5px solid',
                  borderColor: category === cat.id ? '#4F46E5' : '#F1F2FF',
                  background: category === cat.id ? '#EEF2FF' : 'white',
                  color: category === cat.id ? '#4F46E5' : '#64748B',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                }}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>

          <input 
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título (ej: Practicar la espera)"
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 14,
              border: '1.5px solid #F1F2FF', outline: 'none', fontSize: 14,
              fontWeight: 700, color: '#1E1B4B'
            }}
          />

          <div style={{ position: 'relative' }}>
            <textarea 
              value={advice}
              onChange={e => setAdvice(e.target.value.slice(0, 280))}
              placeholder="Consejo práctico para casa..."
              style={{
                width: '100%', minHeight: 100, padding: '12px 16px', borderRadius: 14,
                border: advice.length >= 280 ? '1.5px solid #F43F5E' : '1.5px solid #F1F2FF',
                outline: 'none', fontSize: 14,
                color: '#475569', lineHeight: 1.5, resize: 'none'
              }}
            />
            <div style={{ 
              position: 'absolute', bottom: 10, right: 12, fontSize: 11, 
              color: advice.length >= 280 ? '#F43F5E' : '#94A3B8', fontWeight: 700 
            }}>
              {advice.length}/280
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSend}
            disabled={!title.trim() || !advice.trim() || advice.length > 280}
            style={{
              background: '#4F46E5', color: 'white', border: 'none',
              borderRadius: 14, padding: '14px', fontWeight: 800,
              fontSize: 14, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 10,
              opacity: (title.trim() && advice.trim()) ? 1 : 0.5
            }}
          >
            <Send size={18} />
            Enviar al Family Hub
          </motion.button>
        </div>
      </div>

      {/* History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h4 style={{ margin: '8px 0 4px', fontSize: 13, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
          Historial de Recomendaciones ({recs.length})
        </h4>
        <AnimatePresence>
          {recs.map(rec => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                background: 'white', padding: 18, borderRadius: 20,
                border: '1.5px solid #F1F2FF', position: 'relative',
                opacity: rec.status !== 'active' ? 0.7 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>
                  {CATEGORIES.find(c => c.id === rec.category)?.icon || '💡'}
                </span>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#1E1B4B', flex: 1 }}>{rec.title}</span>
                
                <div style={{ 
                  fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 8,
                  textTransform: 'uppercase',
                  background: rec.status === 'active' ? '#EEF2FF' : rec.status === 'completed' ? '#DCFCE7' : '#F1F5F9',
                  color: rec.status === 'active' ? '#4F46E5' : rec.status === 'completed' ? '#166534' : '#64748B',
                }}>
                  {rec.status === 'active' ? 'Activa' : rec.status === 'completed' ? 'Completada' : 'Ignorada'}
                </div>

                <button 
                  onClick={async () => {
                    await syncService.deleteRecommendation(rec.id, patientId);
                    setRecs(recs.filter(r => r.id !== rec.id));
                  }}
                  style={{
                    background: 'transparent', border: 'none', color: '#94A3B8',
                    cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{rec.advice}</p>
              <div style={{ marginTop: 10, fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
                Enviado el {new Date(rec.created_at).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {!loading && recs.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>
            <MessageSquare size={48} style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600 }}>No has enviado recomendaciones aún.</p>
          </div>
        )}
      </div>
    </div>
  );
};
