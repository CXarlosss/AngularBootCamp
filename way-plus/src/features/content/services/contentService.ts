import { supabase, isSupabaseAvailable } from '@/core/services/supabaseClient';
import type { Way, Step } from '@/core/engine/types';

export const contentService = {
  async getStepsByLevel(levelId: string): Promise<Step[]> {
    if (!supabase || !isSupabaseAvailable) {
      console.warn('[ContentService] Supabase unavailable — using local fallback.');
      return [];
    }

    const { data, error } = await supabase
      .from('steps')
      .select(`*, ways (*)`)
      .eq('level_id', levelId)
      .order('order_index');
    if (error) {
      console.error('[ContentService] Error fetching steps:', error.message);
      return [];
    }

    const steps = data as any[];
    
    const transformImageUrl = (path: string) => {
      if (!path) return '';
      if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('/')) return path;
      // Assume it's a file in the 'pictograms' bucket
      return `https://bbarfrolxffbzakcfnzd.supabase.co/storage/v1/object/public/pictograms/${path}`;
    };

    return (steps ?? []).map((s: any) => ({
      id: s.id,
      levelId: s.level_id,
      title: s.title,
      subtitle: s.subtitle,
      theme: s.theme,
      isPublished: s.is_published,
      ways: (s.ways ?? [])
        .filter((w: any) => w.is_published)
        .map((w: any) => {
          console.log(`[ContentService] Mapping way ${w.id}:`, w);
          return {
            id: w.id,
            type: w.type,
            title: w.title,
            name: w.name,
            stimulus: {
              ...w.stimulus,
              image: transformImageUrl(w.stimulus?.image)
            },
            options: (w.options ?? []).map((o: any) => ({
              id: o.id || Math.random().toString(),
              label: o.label || o.text || o.name || o.title || o.description || 'Opción',
              image: transformImageUrl(o.image || o.picto || o.icon),
              isCorrect: o.isCorrect ?? o.is_correct ?? false,
              feedback: o.feedback || { visual: 'happy' }
            })),
            modelingVideoUrl: w.modeling_video_url,
            difficulty: w.difficulty,
            source: w.source,
            metadata: w.metadata
          };
        })
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
