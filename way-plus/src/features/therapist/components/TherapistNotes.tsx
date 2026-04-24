import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { syncService, type TherapistNote } from '@/core/services/syncService';

interface Props {
  patientId: string;
}

export const TherapistNotes: React.FC<Props> = ({ patientId }) => {
  const [notes, setNotes] = useState<TherapistNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, [patientId]);

  const loadNotes = async () => {
    setLoading(true);
    const data = await syncService.getNotes(patientId);
    setNotes(data);
    setLoading(false);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const note = await syncService.addNote(patientId, newNote);
    if (note) {
      setNotes([note, ...notes]);
      setNewNote('');
    }
  };

  const handleDelete = async (id: string) => {
    await syncService.deleteNote(id);
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Input area */}
      <div style={{ background: '#F8FAFF', padding: 20, borderRadius: 20, border: '1.5px solid #E8E9FF' }}>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Escribe una nota clínica sobre la sesión..."
          style={{
            width: '100%', minHeight: 100, border: 'none', background: 'transparent',
            resize: 'none', outline: 'none', fontSize: 14, color: '#1E1B4B',
            fontWeight: 500, fontFamily: 'inherit'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            style={{
              background: '#4F46E5', color: 'white', border: 'none',
              borderRadius: 12, padding: '10px 20px', fontWeight: 700,
              fontSize: 13, cursor: 'pointer', opacity: newNote.trim() ? 1 : 0.5
            }}
          >
            Guardar Nota
          </motion.button>
        </div>
      </div>

      {/* Notes list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#6B7280' }}>Cargando notas...</div>
        ) : notes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 20, border: '1px dashed #E8E9FF' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📝</div>
            <div style={{ color: '#6B7280', fontSize: 14, fontWeight: 600 }}>Aún no hay notas para este paciente.</div>
          </div>
        ) : (
          <AnimatePresence>
            {notes.map(note => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={{
                  background: 'white', padding: 18, borderRadius: 18,
                  border: '1.5px solid #F1F2FF', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase' }}>
                    {new Date(note.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <button 
                    onClick={() => handleDelete(note.id)}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#F43F5E', fontSize: 16 }}
                  >
                    ×
                  </button>
                </div>
                <div style={{ fontSize: 14, color: '#1E1B4B', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {note.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
