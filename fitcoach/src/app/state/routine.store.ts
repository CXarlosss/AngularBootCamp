import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { Routine, RoutineDay, Exercise } from '../core/models/routine.model';
import { RoutineService } from '../core/services/routine.service';
import { v4 as uuid } from 'uuid';

interface RoutineState {
  // Lista de templates guardados por el coach
  templates: Routine[];
  // La rutina que se está editando ahora mismo en el builder
  draft: Routine | null;
  // Índice del día activo en el builder (tab seleccionado)
  activeDayIndex: number;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: RoutineState = {
  templates: [],
  draft: null,
  activeDayIndex: 0,
  loading: false,
  saving: false,
  error: null,
};

export const RoutineStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ draft, activeDayIndex }) => ({

    activeDay: computed((): RoutineDay | null =>
      draft()?.days[activeDayIndex()] ?? null
    ),

    totalExercises: computed((): number =>
      draft()?.days.reduce((sum, d) => sum + d.exercises.length, 0) ?? 0
    ),

    isValid: computed((): boolean => {
      const d = draft();
      if (!d?.name.trim()) return false;
      if (d.days.length === 0) return false;
      // Cada día debe tener al menos un ejercicio
      return d.days.every(day => day.exercises.length > 0);
    }),
  })),

  withMethods((store, svc = inject(RoutineService)) => ({

    // ── Gestión del draft ─────────────────────────────────────

    newDraft(coachId: string): void {
      const draft: Routine = {
        id: uuid(),
        name: '',
        goal: 'hypertrophy',
        coachId,
        days: [],
        isTemplate: false,
        createdAt: new Date(),
      };
      patchState(store, { draft, activeDayIndex: 0 });
    },

    loadDraftFromTemplate(template: Routine): void {
      // Clonar con IDs nuevos para no mutar el template
      const draft: Routine = {
        ...template,
        id: uuid(),
        name: `${template.name} (copia)`,
        isTemplate: false,
        createdAt: new Date(),
        days: template.days.map(d => ({
          ...d,
          id: uuid(),
          exercises: d.exercises.map(e => ({ ...e, id: uuid() })),
        })),
      };
      patchState(store, { draft, activeDayIndex: 0 });
    },

    updateDraftField<K extends keyof Routine>(key: K, value: Routine[K]): void {
      const d = store.draft();
      if (!d) return;
      patchState(store, { draft: { ...d, [key]: value } });
    },

    // ── Gestión de días ───────────────────────────────────────

    addDay(): void {
      const d = store.draft();
      if (!d) return;
      const dayLabels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      const newDay: RoutineDay = {
        id: uuid(),
        dayNumber: d.days.length + 1,
        label: dayLabels[d.days.length] ?? `Día ${d.days.length + 1}`,
        exercises: [],
      };
      const days = [...d.days, newDay];
      patchState(store, {
        draft: { ...d, days },
        activeDayIndex: days.length - 1,  // activar el nuevo día
      });
    },

    removeDay(dayId: string): void {
      const d = store.draft();
      if (!d) return;
      const days = d.days.filter(day => day.id !== dayId);
      patchState(store, {
        draft: { ...d, days },
        activeDayIndex: Math.min(store.activeDayIndex(), Math.max(0, days.length - 1)),
      });
    },

    updateDayLabel(dayId: string, label: string): void {
      const d = store.draft();
      if (!d) return;
      patchState(store, {
        draft: {
          ...d,
          days: d.days.map(day => day.id === dayId ? { ...day, label } : day),
        },
      });
    },

    setActiveDay(index: number): void {
      patchState(store, { activeDayIndex: index });
    },

    // ── Gestión de ejercicios ─────────────────────────────────

    addExercise(dayId: string, name: string): void {
      const d = store.draft();
      if (!d) return;
      const exercise: Exercise = {
        id: uuid(),
        name,
        sets: 3,
        reps: 10,
        targetWeight: undefined,
        restSeconds: 90,
        notes: '',
      };
      patchState(store, {
        draft: {
          ...d,
          days: d.days.map(day =>
            day.id === dayId
              ? { ...day, exercises: [...day.exercises, exercise] }
              : day
          ),
        },
      });
    },

    updateExercise(dayId: string, exerciseId: string, changes: Partial<Exercise>): void {
      const d = store.draft();
      if (!d) return;
      patchState(store, {
        draft: {
          ...d,
          days: d.days.map(day =>
            day.id === dayId
              ? {
                  ...day,
                  exercises: day.exercises.map(ex =>
                    ex.id === exerciseId ? { ...ex, ...changes } : ex
                  ),
                }
              : day
          ),
        },
      });
    },

    removeExercise(dayId: string, exerciseId: string): void {
      const d = store.draft();
      if (!d) return;
      patchState(store, {
        draft: {
          ...d,
          days: d.days.map(day =>
            day.id === dayId
              ? { ...day, exercises: day.exercises.filter(ex => ex.id !== exerciseId) }
              : day
          ),
        },
      });
    },

    // Reordenar con drag & drop (recibe el array ya reordenado)
    reorderExercises(dayId: string, reordered: Exercise[]): void {
      const d = store.draft();
      if (!d) return;
      patchState(store, {
        draft: {
          ...d,
          days: d.days.map(day =>
            day.id === dayId ? { ...day, exercises: reordered } : day
          ),
        },
      });
    },

    // ── Persistencia ──────────────────────────────────────────

    async saveAsTemplate(): Promise<void> {
      const d = store.draft();
      if (!d || !store.isValid()) return;
      patchState(store, { saving: true });
      const template = { ...d, isTemplate: true };
      await svc.saveRoutine(template);
      patchState(store, {
        templates: [...store.templates(), template],
        saving: false,
      });
    },

    async saveAndAssign(clientIds: string[]): Promise<string> {
      const d = store.draft();
      if (!d || !store.isValid()) return '';
      patchState(store, { saving: true });
      const saved = await svc.saveRoutine(d);
      await svc.assignToClients(saved.id, clientIds);
      patchState(store, { saving: false });
      return saved.id;
    },

    async loadTemplates(coachId: string): Promise<void> {
      patchState(store, { loading: true });
      const templates = await svc.getCoachTemplates(coachId);
      patchState(store, { templates, loading: false });
    },
  }))
);
