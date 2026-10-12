/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ TemplateDetailModal — Vista previa de plantilla + asignar
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GLASS, BTN, TEXT, way } from '@/shared/lib/wayTheme';
import { hapticService } from '@/core/services/hapticService';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { useTherapistPatients } from '@/hooks/queries/useTherapistPatients';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { LevelTemplate } from './levelTemplates';

interface TemplateDetailModalProps {
  template: LevelTemplate;
  onClose: () => void;
  onApply: (patientIds: string[], customize?: { title?: string; difficulty?: number }) => void;
  isApplying: boolean;
}

export const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
  template,
  onClose,
  onApply,
  isApplying,
}) => {
  const { user } = useAuth();
  const { data: patients } = useTherapistPatients(user?.id || null);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [customTitle, setCustomTitle] = useState(template.title);
  const [customDifficulty, setCustomDifficulty] = useState(template.difficulty);

  const togglePatient = (id: string) => {
    hapticService.click();
    setSelectedPatients((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <Modal isOpen onClose={onClose} title={template.title} maxWidth="2xl">
      <div className="space-y-5">
        {/* Header info */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-4xl">
            {template.emoji}
          </div>
          <div>
            <p className="text-sm text-slate-600">{template.description}</p>
            <div className="mt-2 flex gap-3 text-xs text-slate-500">
              <span>⏱️ {template.estimatedMinutes} minutos</span>
              <span>📊 Dificultad base: {template.difficulty}/10</span>
              <span>🧩 {template.tasks.length} tareas</span>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <p className={way(TEXT.label, 'mb-2')}>Habilidades que trabaja</p>
          <div className="flex flex-wrap gap-2">
            {template.targetSkills.map((skill) => (
              <span key={skill} className="rounded-lg bg-indigo-50 px-3 py-1 text-sm text-indigo-700 border border-indigo-100">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Tasks preview */}
        <div>
          <p className={way(TEXT.label, 'mb-2')}>Secuencia de tareas</p>
          <div className="space-y-2">
            {template.tasks.map((task, i) => (
              <div key={i} className={way(GLASS.card, 'rounded-xl p-3 flex items-center gap-3')}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{task.title}</p>
                  <p className={way(TEXT.micro, 'text-slate-500')}>{task.config.instructionText}</p>
                </div>
                <span className="text-xs text-slate-400">{task.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customization */}
        <div className={way(GLASS.card, 'rounded-xl p-4 space-y-3')}>
          <p className={way(TEXT.label)}>Personalizar antes de asignar</p>
          <div>
            <label className={way(TEXT.micro, 'block mb-1')}>Título del nivel (opcional)</label>
            <input
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className={way(
                'w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm',
                'focus-visible:ring-2 focus-visible:ring-indigo-500/50'
              )}
            />
          </div>
          <div>
            <label className={way(TEXT.micro, 'block mb-1')}>Ajustar dificultad: {customDifficulty}</label>
            <input
              type="range"
              min={1}
              max={10}
              value={customDifficulty}
              onChange={(e) => setCustomDifficulty(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Más fácil</span>
              <span>Más difícil</span>
            </div>
          </div>
        </div>

        {/* Patient selection */}
        <div>
          <p className={way(TEXT.label, 'mb-2')}>Asignar a pacientes</p>
          {!patients || patients.length === 0 ? (
            <p className="text-sm text-slate-500">No tienes pacientes registrados aún.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {patients.map((p) => (
                <button
                  key={p.id}
                  className={way(
                    'flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all',
                    selectedPatients.includes(p.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 bg-white/60 hover:border-indigo-300'
                  )}
                  onClick={() => togglePatient(p.id)}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-xl">
                    👤
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{p.displayName}</p>
                    <p className={way(TEXT.micro, 'text-slate-500')}>{p.age} años • {p.status}</p>
                  </div>
                  {selectedPatients.includes(p.id) && (
                    <span className="text-indigo-600 font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="claim"
            fullWidth
            disabled={selectedPatients.length === 0 || isApplying}
            onClick={() =>
              onApply(selectedPatients, {
                title: customTitle !== template.title ? customTitle : undefined,
                difficulty: customDifficulty !== template.difficulty ? customDifficulty : undefined,
              })
            }
          >
            {isApplying
              ? 'Asignando...'
              : `Asignar a ${selectedPatients.length} paciente${selectedPatients.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
