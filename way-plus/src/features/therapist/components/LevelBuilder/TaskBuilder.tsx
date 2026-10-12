/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ TaskBuilder — Modal para configurar una tarea
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GLASS, BTN, TEXT, way } from '@/shared/lib/wayTheme';
import { hapticService } from '@/core/services/hapticService';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import type { TaskDraft, TaskType } from './useLevelBuilder';

const TASK_TYPES: { id: TaskType; label: string; emoji: string; description: string }[] = [
  { id: 'tap', label: 'Tocar', emoji: '👆', description: 'El niño toca un elemento en pantalla' },
  { id: 'drag', label: 'Arrastrar', emoji: '↔️', description: 'Arrastra un objeto de un lado a otro' },
  { id: 'hold', label: 'Mantener', emoji: '✊', description: 'Mantiene presionado para cargar energía' },
  { id: 'trace', label: 'Trazar', emoji: '✏️', description: 'Dibuja sobre una línea o forma' },
  { id: 'match', label: 'Emparejar', emoji: '🔗', description: 'Une elementos que van juntos' },
  { id: 'memory', label: 'Memoria', emoji: '🃏', description: 'Encuentra las parejas iguales' },
];

interface TaskBuilderProps {
  task?: TaskDraft;
  onSave: (task: Omit<TaskDraft, 'id' | 'orderIndex'>) => void;
  onClose: () => void;
}

export const TaskBuilder: React.FC<TaskBuilderProps> = ({ task, onSave, onClose }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [type, setType] = useState<TaskType>(task?.type || 'tap');
  const [instruction, setInstruction] = useState(task?.config?.instructionText || '');
  const [feedback, setFeedback] = useState(task?.config?.successFeedback || '');
  const [timeLimit, setTimeLimit] = useState(task?.config?.timeLimitSeconds || 0);
  const [attempts, setAttempts] = useState(task?.config?.attemptsAllowed || 3);

  const isValid = title.trim().length > 0;

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      title,
      description,
      type,
      config: {
        instructionText: instruction,
        successFeedback: feedback,
        timeLimitSeconds: timeLimit > 0 ? timeLimit : undefined,
        attemptsAllowed: attempts,
      },
    });
  };

  return (
    <Modal isOpen onClose={onClose} title={task ? 'Editar tarea' : 'Nueva tarea'}>
      <div className="space-y-4">
        {/* Tipo de tarea */}
        <div>
          <label className={way(TEXT.label, 'mb-2 block')}>Tipo de interacción</label>
          <div className="grid grid-cols-3 gap-2">
            {TASK_TYPES.map((t) => (
              <button
                key={t.id}
                className={way(
                  'flex flex-col items-center rounded-xl border-2 p-3 text-center transition-all',
                  type === t.id
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white/60 text-slate-600 hover:border-indigo-300'
                )}
                onClick={() => {
                  setType(t.id);
                  hapticService.click();
                }}
              >
                <span className="mb-1 text-2xl">{t.emoji}</span>
                <span className="text-xs font-semibold">{t.label}</span>
              </button>
            ))}
          </div>
          <p className={way(TEXT.micro, 'mt-1 text-slate-500')}>
            {TASK_TYPES.find((t) => t.id === type)?.description}
          </p>
        </div>

        {/* Título */}
        <div>
          <label className={way(TEXT.label, 'mb-1 block')}>Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Toca la estrella brillante"
            className={way(
              'w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm',
              'focus-visible:ring-4 focus-visible:ring-indigo-500/50 focus-visible:outline-none'
            )}
          />
        </div>

        {/* Descripción */}
        <div>
          <label className={way(TEXT.label, 'mb-1 block')}>Descripción (opcional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notas internas para el terapeuta..."
            className={way(
              'w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm',
              'focus-visible:ring-4 focus-visible:ring-indigo-500/50 focus-visible:outline-none',
              'min-h-[60px] resize-y'
            )}
          />
        </div>

        {/* Instrucción para el niño */}
        <div>
          <label className={way(TEXT.label, 'mb-1 block')}>Instrucción para el niño</label>
          <input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Lo que verá el niño en pantalla"
            className={way(
              'w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm',
              'focus-visible:ring-4 focus-visible:ring-indigo-500/50 focus-visible:outline-none'
            )}
          />
        </div>

        {/* Feedback de éxito */}
        <div>
          <label className={way(TEXT.label, 'mb-1 block')}>Mensaje al completar</label>
          <input
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Ej: ¡Increíble! Sigues brillando."
            className={way(
              'w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm',
              'focus-visible:ring-4 focus-visible:ring-indigo-500/50 focus-visible:outline-none'
            )}
          />
        </div>

        {/* Config avanzada */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={way(TEXT.label, 'mb-1 block')}>Límite de tiempo (seg)</label>
            <input
              type="number"
              min={0}
              max={300}
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className={way(
                'w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm',
                'focus-visible:ring-4 focus-visible:ring-indigo-500/50 focus-visible:outline-none'
              )}
            />
            <p className={way(TEXT.micro, 'mt-0.5 text-slate-500')}>0 = sin límite</p>
          </div>
          <div>
            <label className={way(TEXT.label, 'mb-1 block')}>Intentos permitidos</label>
            <input
              type="number"
              min={1}
              max={10}
              value={attempts}
              onChange={(e) => setAttempts(Number(e.target.value))}
              className={way(
                'w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm',
                'focus-visible:ring-4 focus-visible:ring-indigo-500/50 focus-visible:outline-none'
              )}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="claim" fullWidth disabled={!isValid} onClick={handleSave}>
            {task ? '💾 Guardar cambios' : '✨ Añadir tarea'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
