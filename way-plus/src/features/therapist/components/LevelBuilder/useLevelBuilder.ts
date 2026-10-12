/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ useLevelBuilder — CRUD de niveles para terapeutas
 * TanStack Query + Supabase. Guardado automático y publicación.
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/services/supabase-client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { hapticService } from '@/core/services/hapticService';

export type TaskType = 'tap' | 'drag' | 'hold' | 'trace' | 'match' | 'memory';

export interface TaskDraft {
  id: string; // temp id para UI
  title: string;
  description: string;
  type: TaskType;
  orderIndex: number;
  config: {
    targetEmoji?: string;
    instructionText?: string;
    successFeedback?: string;
    timeLimitSeconds?: number;
    attemptsAllowed?: number;
  };
}

export interface LevelDraft {
  id?: string; // undefined = nuevo nivel
  title: string;
  description: string;
  difficulty: number; // 1-10
  category: string;
  orderIndex: number;
  isTemplate: boolean;
  tasks: TaskDraft[];
}

export function useLevelBuilder(levelId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<LevelDraft>({
    title: '',
    description: '',
    difficulty: 3,
    category: 'atencion',
    orderIndex: 0,
    isTemplate: false,
    tasks: [],
  });

  // Cargar nivel existente
  const { data: existingLevel, isLoading } = useQuery({
    queryKey: ['level-builder', levelId],
    queryFn: async () => {
      if (!levelId) return null;
      const { data: level, error } = await supabase
        .from('levels')
        .select('*, tasks(*)')
        .eq('id', levelId)
        .single();

      if (error) throw error;

      setDraft({
        id: level.id,
        title: level.title,
        description: level.description || '',
        difficulty: level.difficulty,
        category: level.category || 'atencion',
        orderIndex: level.order_index,
        isTemplate: level.is_template,
        tasks: (level.tasks || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description || '',
          type: t.type as TaskType,
          orderIndex: t.order_index,
          config: t.config || {},
        })),
      });

      return level;
    },
    enabled: !!levelId,
  });

  // Guardar borrador
  const saveMutation = useMutation({
    mutationFn: async (levelData: LevelDraft) => {
      const therapistId = user?.id;
      if (!therapistId) throw new Error('No autenticado');

      // Upsert nivel
      const { data: savedLevel, error: levelError } = await supabase
        .from('levels')
        .upsert({
          id: levelData.id,
          therapist_id: therapistId,
          title: levelData.title,
          description: levelData.description,
          difficulty: levelData.difficulty,
          category: levelData.category,
          order_index: levelData.orderIndex,
          is_template: levelData.isTemplate,
        })
        .select()
        .single();

      if (levelError) throw levelError;

      // Guardar tareas (borrar antiguas y recrear)
      if (levelData.id) {
        await supabase.from('tasks').delete().eq('level_id', levelData.id);
      }

      const tasksToInsert = levelData.tasks.map((t, index) => ({
        level_id: savedLevel.id,
        title: t.title,
        description: t.description,
        type: t.type,
        order_index: index,
        config: t.config,
      }));

      const { error: tasksError } = await supabase.from('tasks').insert(tasksToInsert);
      if (tasksError) throw tasksError;

      return savedLevel;
    },
    onSuccess: () => {
      hapticService.success();
      queryClient.invalidateQueries({ queryKey: ['therapist-levels'] });
      queryClient.invalidateQueries({ queryKey: ['level-builder', levelId] });
    },
  });

  // Publicar (asignar a pacientes)
  const publishMutation = useMutation({
    mutationFn: async ({ levelId: lid, patientIds }: { levelId: string; patientIds: string[] }) => {
      const assignments = patientIds.map((pid) => ({
        patient_id: pid,
        level_id: lid,
        status: 'available',
      }));

      const { error } = await supabase.from('patient_levels').insert(assignments);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      hapticService.celebration();
      queryClient.invalidateQueries({ queryKey: ['patient-levels'] });
    },
  });

  const updateDraft = useCallback((updates: Partial<LevelDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  }, []);

  const addTask = useCallback((task: Omit<TaskDraft, 'id' | 'orderIndex'>) => {
    setDraft((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          ...task,
          id: `temp-${Date.now()}`,
          orderIndex: prev.tasks.length,
        },
      ],
    }));
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<TaskDraft>) => {
    setDraft((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    }));
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setDraft((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId).map((t, i) => ({ ...t, orderIndex: i })),
    }));
  }, []);

  const reorderTasks = useCallback((startIndex: number, endIndex: number) => {
    setDraft((prev) => {
      const result = Array.from(prev.tasks);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { ...prev, tasks: result.map((t, i) => ({ ...t, orderIndex: i })) };
    });
  }, []);

  return {
    draft,
    isLoading,
    existingLevel,
    updateDraft,
    addTask,
    updateTask,
    removeTask,
    reorderTasks,
    save: () => saveMutation.mutateAsync(draft),
    isSaving: saveMutation.isPending,
    publish: (patientIds: string[]) =>
      draft.id ? publishMutation.mutateAsync({ levelId: draft.id, patientIds }) : Promise.reject('Guarda primero'),
    isPublishing: publishMutation.isPending,
    lastError: saveMutation.error || publishMutation.error,
  };
}
