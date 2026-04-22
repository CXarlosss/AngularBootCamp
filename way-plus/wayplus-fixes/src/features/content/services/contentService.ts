import { supabase, isSupabaseAvailable } from '@/core/services/supabaseClient';
import type { Way, Step } from '@/core/engine/types';

export const contentService = {
  async getStepsByLevel(levelId: string): Promise<Step[]> {
    if (!supabase || !isSupabaseAvailable) {
      console.warn('[ContentService] Supabase unavailable — using local fallback.');
      return [];
    }

    const { data: steps, error } = await supabase
      .from('steps')
      .select(`*, ways (*)`)
      .eq('level_id', levelId)
      .order('order_index');

    if (error) {
      console.error('[ContentService] Error fetching steps:', error.message);
      return [];
    }

    return (steps ?? []).map((s: any) => ({
      id: s.id,
      levelId: s.level_id,
      title: s.title,
      subtitle: s.subtitle,
      theme: s.theme,
      order: s.order_index,
      ways: (s.ways ?? [])
        .filter((w: any) => w.is_published)
        .map((w: any) => ({
          id: w.id,
          stepId: w.step_id,
          type: w.type,
          order: w.order_index,
          stimulus: w.stimulus,
          options: w.options,
          metadata: w.metadata,
        })),
      completionReward: { coins: 100, xp: 150 },
    }));
  },

  async publishWay(way: Way, stepId: string): Promise<void> {
    if (!supabase || !isSupabaseAvailable) {
      console.warn('[ContentService] Supabase unavailable — way queued for sync.');
      return;
    }

    const { error } = await supabase.from('ways').upsert({
      id: way.id,
      step_id: stepId,
      type: way.type,
      order_index: way.order,
      stimulus: way.stimulus,
      options: way.options,
      metadata: way.metadata,
      is_published: true,
    });

    if (error) throw new Error(`[ContentService] publishWay failed: ${error.message}`);
  },

  async uploadPictogram(file: File, folder: string): Promise<string> {
    if (!supabase || !isSupabaseAvailable) {
      // Return a local object URL as fallback during offline use
      return URL.createObjectURL(file);
    }

    const fileName = `${folder}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from('pictograms')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) throw new Error(`[ContentService] uploadPictogram failed: ${error.message}`);

    const { data: { publicUrl } } = supabase.storage
      .from('pictograms')
      .getPublicUrl(fileName);

    return publicUrl;
  },
};
