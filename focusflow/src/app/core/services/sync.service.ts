import { Injectable, inject } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { TaskRepository } from '../repositories/task.repository';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private supabase = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey
  );
  private repo   = inject(TaskRepository);
  private auth   = inject(AuthService);

  async syncPending(): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;

    const unsynced = await this.repo.getUnsynced(user.id);
    if (!unsynced.length) return;

    const { error } = await this.supabase
      .from('tasks')
      .upsert(
        unsynced.map(t => ({
          id:           t.id,
          user_id:      t.userId,
          title:        t.title,
          notes:        t.notes,
          status:       t.status,
          context:      t.context,
          deadline:     t.deadline,
          completed_at: t.completedAt,
          created_at:   t.createdAt,
          updated_at:   t.updatedAt,
        })),
        { onConflict: 'id' }
      );

    if (!error) {
      await Promise.all(
        unsynced.map(t => this.repo.update(t.id, { synced: true }))
      );
      console.log(`[Sync] ${unsynced.length} tareas sincronizadas`);
    }
  }

  subscribeToRemoteChanges(userId: string): void {
    this.supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            await this.repo.update(payload.new['id'], {
              ...(payload.new as any),
              synced: true,
            });
          }
        }
      )
      .subscribe();
  }
}
