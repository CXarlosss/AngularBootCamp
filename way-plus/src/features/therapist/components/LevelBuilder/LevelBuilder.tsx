/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ LevelBuilder — Editor visual para terapeutas
 * Drag & drop de tareas, preview en tiempo real, publicación
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { GLASS, BTN, TEXT, way } from '@/shared/lib/wayTheme';
import { useReduceMotion } from '@/core/stores/configStore';
import { hapticService } from '@/core/services/hapticService';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { useLevelBuilder, type TaskType } from './useLevelBuilder';
import { TaskBuilder } from './TaskBuilder';
import { LevelPreview } from './LevelPreview';

const CATEGORIES = [
  { id: 'atencion', label: 'Atención', emoji: '🎯' },
  { id: 'regulacion', label: 'Regulación emocional', emoji: '🧘' },
  { id: 'memoria', label: 'Memoria', emoji: '🧠' },
  { id: 'coordinacion', label: 'Coordinación', emoji: '✋' },
  { id: 'lenguaje', label: 'Lenguaje', emoji: '💬' },
];

const TASK_TYPES: { id: TaskType; label: string; emoji: string }[] = [
  { id: 'tap', label: 'Tocar', emoji: '👆' },
  { id: 'drag', label: 'Arrastrar', emoji: '↔️' },
  { id: 'hold', label: 'Mantener', emoji: '✊' },
  { id: 'trace', label: 'Trazar', emoji: '✏️' },
  { id: 'match', label: 'Emparejar', emoji: '🔗' },
  { id: 'memory', label: 'Memoria', emoji: '🃏' },
];

interface LevelBuilderProps {
  levelId?: string;
  onSave?: () => void;
}

export const LevelBuilder: React.FC<LevelBuilderProps> = ({ levelId, onSave }) => {
  const {
    draft,
    isLoading,
    updateDraft,
    addTask,
    updateTask,
    removeTask,
    reorderTasks,
    save,
    isSaving,
    lastError,
  } = useLevelBuilder(levelId);

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const reduceMotion = useReduceMotion();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className={way(TEXT.subtitle, 'text-slate-400')}>Cargando nivel...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-slate-50 to-indigo-50/20">
      {/* Header */}
      <header className={way(GLASS.header, 'sticky top-0 z-40')}>
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div>
            <h1 className={TEXT.title}>{levelId ? 'Editar nivel' : 'Nuevo nivel'}</h1>
            <p className={TEXT.micro}>Diseña la experiencia para tu paciente</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'edit' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('edit')}
            >
              ✏️ Editar
            </Button>
            <Button
              variant={activeTab === 'preview' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => {
                hapticService.click();
                setActiveTab('preview');
              }}
            >
              👁️ Vista previa
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'edit' ? (
            <motion.div
              key="edit"
              initial={reduceMotion ? {} : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? {} : { opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Configuración básica */}
              <section className={way(GLASS.card, 'rounded-2xl p-5')}>
                <h2 className={way(TEXT.subtitle, 'mb-4')}>Configuración general</h2>
                <div className="space-y-4">
                  <div>
                    <label className={way(TEXT.label, 'mb-1 block')}>Título del nivel</label>
                    <Input
                      value={draft.title}
                      onChange={(e) => updateDraft({ title: e.target.value })}
                      placeholder="Ej: El Bosque Encantado"
                    />
                  </div>

                  <div>
                    <label className={way(TEXT.label, 'mb-1 block')}>Descripción</label>
                    <textarea
                      value={draft.description}
                      onChange={(e) => updateDraft({ description: e.target.value })}
                      placeholder="Describe qué aprenderá el niño..."
                      className={way(
                        'w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm',
                        'focus-visible:ring-4 focus-visible:ring-indigo-500/50 focus-visible:outline-none',
                        'min-h-[80px] resize-y'
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={way(TEXT.label, 'mb-1 block')}>Dificultad (1-10)</label>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={draft.difficulty}
                        onChange={(e) => updateDraft({ difficulty: Number(e.target.value) })}
                        className="w-full accent-indigo-500"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Fácil</span>
                        <span className="font-bold text-indigo-600">{draft.difficulty}</span>
                        <span>Difícil</span>
                      </div>
                    </div>

                    <div>
                      <label className={way(TEXT.label, 'mb-1 block')}>Categoría</label>
                      <div className="grid grid-cols-2 gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            className={way(
                              'rounded-xl border-2 px-3 py-2 text-left text-sm transition-all',
                              draft.category === cat.id
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 bg-white/60 text-slate-600 hover:border-indigo-300'
                            )}
                            onClick={() => updateDraft({ category: cat.id })}
                          >
                            <span className="mr-1">{cat.emoji}</span>
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Lista de tareas */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className={TEXT.subtitle}>Tareas del nivel ({draft.tasks.length})</h2>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      hapticService.click();
                      setEditingTaskId(null);
                      setShowTaskModal(true);
                    }}
                  >
                    + Añadir tarea
                  </Button>
                </div>

                {draft.tasks.length === 0 ? (
                  <div className={way(GLASS.card, 'rounded-2xl p-8 text-center')}>
                    <div className="mb-2 text-4xl">📝</div>
                    <p className={TEXT.subtitle}>Sin tareas aún</p>
                    <p className={way(TEXT.micro, 'mt-1')}>
                      Añade tareas para que el niño complete el nivel
                    </p>
                  </div>
                ) : (
                  <Reorder.Group
                    axis="y"
                    values={draft.tasks}
                    onReorder={(newOrder) => {
                      // Reorder devuelve los items reordenados
                      const reordered = newOrder.map((t, i) => ({ ...t, orderIndex: i }));
                      // Actualizar el draft con el nuevo orden
                      // Nota: reorderTasks espera índices, aquí simplificamos
                      updateDraft({ tasks: reordered as typeof draft.tasks });
                      hapticService.click();
                    }}
                    className="space-y-3"
                  >
                    {draft.tasks.map((task, index) => (
                      <Reorder.Item
                        key={task.id}
                        value={task}
                        className={way(
                          GLASS.card,
                          'cursor-grab rounded-2xl p-4 active:cursor-grabbing'
                        )}
                        whileDrag={reduceMotion ? {} : { scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xl">
                            {TASK_TYPES.find((t) => t.id === task.type)?.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{task.title}</p>
                            <p className={way(TEXT.micro, 'text-slate-500')}>
                              {TASK_TYPES.find((t) => t.id === task.type)?.label} • Intento {index + 1}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="icon"
                              size="sm"
                              aria-label="Editar tarea"
                              onClick={() => {
                                setEditingTaskId(task.id);
                                setShowTaskModal(true);
                              }}
                            >
                              ✏️
                            </Button>
                            <Button
                              variant="icon"
                              size="sm"
                              aria-label="Eliminar tarea"
                              onClick={() => {
                                hapticService.error();
                                removeTask(task.id);
                              }}
                            >
                              🗑️
                            </Button>
                          </div>
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                )}
              </section>

              {/* Guardar */}
              {lastError && (
                <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 border border-rose-200">
                  Error: {lastError.message}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="claim"
                  size="lg"
                  fullWidth
                  onClick={async () => {
                    await save();
                    onSave?.();
                  }}
                  disabled={isSaving || !draft.title}
                >
                  {isSaving ? 'Guardando...' : levelId ? '💾 Guardar cambios' : '✨ Crear nivel'}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={reduceMotion ? {} : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? {} : { opacity: 0, x: -20 }}
            >
              <LevelPreview draft={draft} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal de tarea */}
      <AnimatePresence>
        {showTaskModal && (
          <TaskBuilder
            task={editingTaskId ? draft.tasks.find((t) => t.id === editingTaskId) : undefined}
            onSave={(taskData) => {
              if (editingTaskId) {
                updateTask(editingTaskId, taskData);
              } else {
                addTask(taskData);
              }
              setShowTaskModal(false);
              hapticService.success();
            }}
            onClose={() => setShowTaskModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LevelBuilder;
