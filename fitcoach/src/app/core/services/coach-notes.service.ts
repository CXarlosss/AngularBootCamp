import { Injectable, inject } from '@angular/core';
import { supabase } from '../supabase.client';
import { SyncQueueService } from './sync-queue.service';

export interface CoachNote {
  id: string;
  coach_id: string;
  client_id: string;
  content: string;
  category: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class CoachNotesService {
  private sb = supabase;
  private syncQueue = inject(SyncQueueService);
  
  async getNotes(clientId: string, limit = 50): Promise<CoachNote[]> {
    const { data, error } = await this.sb
      .from('coach_notes')
      .select('id, content, category, created_at, coach_id, client_id')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('[CoachNotesService] Error fetching notes:', error);
      throw error;
    }
    return (data as CoachNote[]) ?? [];
  }
  
  async addNote(clientId: string, content: string, category: string): Promise<void> {
    const userRes = await this.sb.auth.getUser();
    const userId = userRes.data.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const note = {
      coach_id: userId,
      client_id: clientId,
      content: content.trim(),
      category
    };
    
    if (!navigator.onLine) {
      this.syncQueue.enqueue({
        type: 'data',
        table: 'coach_notes',
        payload: note,
        priority: 1 // Misma prioridad que workout logs
      });
      return;
    }
    
    const { error } = await this.sb.from('coach_notes').insert(note);
    if (error) {
      // Fallback a cola si Supabase falla (rate limit, etc.)
      this.syncQueue.enqueue({ type: 'data', table: 'coach_notes', payload: note, priority: 1 });
      throw error;
    }
  }
  
  async deleteNote(noteId: string): Promise<void> {
    const { error } = await this.sb.from('coach_notes').delete().eq('id', noteId);
    if (error) {
      console.error('[CoachNotesService] Error deleting note:', error);
      throw error;
    }
  }
}
