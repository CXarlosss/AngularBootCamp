/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ useTemplateLibrary — Aplica plantillas a pacientes
 * ═══════════════════════════════════════════════════════════════
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/services/supabase-client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { hapticService } from '@/core/services/hapticService';
import { LEVEL_TEMPLATES, getTemplatesByCategory, type LevelTemplate } from './levelTemplates';

export function useTemplateLibrary() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const therapistId = user?.id;

  // Obtener plantillas del sistema + las del terapeuta
  const { data: customTemplates, isLoading } = useQuery({
    queryKey: ['templates', therapistId],
    queryFn: async () => {
      if (!therapistId) return [];
      const { data, error } = await supabase
        .from('levels')
        .select('*, tasks(*)')
        .eq('therapist_id', therapistId)
        .eq('is_template', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!therapistId,
  });

  // Aplicar plantilla a paciente(s)
  const applyTemplate = useMutation({
    mutationFn: async ({
      template,
      patientIds,
      customize,
    }: {
      template: LevelTemplate;
      patientIds: string[];
      customize?: { title?: string; difficulty?: number };
    }) => {
      const results = [];

      for (const patientId of patientIds) {
        // 1. Crear nivel desde plantilla
        const { data: level, error: levelError } = await supabase
          .from('levels')
          .insert({
            therapist_id: therapistId,
            title: customize?.title || template.title,
            description: template.description,
            difficulty: customize?.difficulty || template.difficulty,
            category: template.category,
            order_index: 0,
            is_template: false,
            config: template.adaptiveConfig,
          })
          .select()
          .single();

        if (levelError) throw levelError;

        // 2. Crear tareas
        const tasks = template.tasks.map((t, i) => ({
          level_id: level.id,
          title: t.title,
          description: t.description,
          type: t.type,
          order_index: i,
          config: t.config,
        }));

        const { error: tasksError } = await supabase.from('tasks').insert(tasks);
        if (tasksError) throw tasksError;

        // 3. Asignar a paciente
        const { error: assignError } = await supabase.from('patient_levels').insert({
          patient_id: patientId,
          level_id: level.id,
          status: 'available',
        });
        if (assignError) throw assignError;

        results.push({ patientId, levelId: level.id });
      }

      return results;
    },
    onSuccess: () => {
      hapticService.celebration();
      queryClient.invalidateQueries({ queryKey: ['patient-levels'] });
      queryClient.invalidateQueries({ queryKey: ['therapist-levels'] });
    },
  });

  return {
    systemTemplates: LEVEL_TEMPLATES,
    customTemplates: customTemplates || [],
    isLoading,
    getByCategory: getTemplatesByCategory,
    applyTemplate: applyTemplate.mutateAsync,
    isApplying: applyTemplate.isPending,
  };
}
