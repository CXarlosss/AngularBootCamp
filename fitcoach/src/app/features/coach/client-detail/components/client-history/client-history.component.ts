import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { supabase } from '../../../../../core/supabase.client';

interface SetLog {
  exercise: string;
  weight: number | null;
  reps: number;
  set_number: number;
  notes?: string | null;
}

interface SessionLog {
  id: string;
  date: string;
  dayName: string;
  routineName: string;
  duration: number | null; // minutos
  sets: SetLog[];
  expanded: boolean;
}

@Component({
  selector: 'app-client-history',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="history-container">
      @if (loading()) {
        <div class="history-skeleton">
          @for (i of [1,2,3]; track i) {
            <div class="skeleton-session"></div>
          }
        </div>
      } @else if (!sessions().length) {
        <div class="empty-state">
          <span class="empty-icon">🏋️</span>
          <p>Aún no hay sesiones registradas</p>
        </div>
      } @else {
        @for (session of sessions(); track session.id) {
          <div class="session-card" (click)="toggleSession(session)">
            <!-- Header de sesión -->
            <div class="session-header">
              <div class="session-meta">
                <span class="session-date">
                  {{ session.date | date:'EEE d MMM' }}
                </span>
                <span class="session-routine">{{ session.routineName || 'Sesión libre' }}</span>
              </div>
              <div class="session-right">
                @if (session.duration) {
                  <span class="duration-badge">⏱ {{ session.duration }}min</span>
                }
                <span class="expand-icon" [class.open]="session.expanded">›</span>
              </div>
            </div>

            <!-- Sets — colapsable -->
            @if (session.expanded) {
              <div class="sets-table">
                <div class="sets-header">
                  <span>Ejercicio</span>
                  <span>Series</span>
                  <span class="text-right">Mejor</span>
                </div>
                @for (group of groupedSets(session); track group.exercise) {
                  <div class="exercise-row">
                    <span class="ex-name">{{ group.exercise }}</span>
                    <span class="ex-sets">{{ group.sets.length }} series</span>
                    <span class="ex-best">
                      {{ group.best.weight != null ? group.best.weight + 'kg' : '' }}
                      × {{ group.best.reps }}
                    </span>
                  </div>
                  @if (hasNotes(group)) {
                    <div class="exercise-notes-coach">
                      @for (set of group.sets; track set.set_number) {
                        @if (set.notes) {
                          <div class="coach-note-item">
                            <span class="note-icon">💬</span>
                            <span class="note-text">{{ set.notes }}</span>
                          </div>
                        }
                      }
                    </div>
                  }
                }
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .history-container { padding: 16px; }

    .session-card {
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      margin-bottom: 12px;
      overflow: hidden;
      cursor: pointer;
      background: rgba(255,255,255,0.02);
      transition: all 0.2s;
    }

    .session-card:hover {
      border-color: rgba(29, 158, 117, 0.3);
      background: rgba(255,255,255,0.04);
    }

    .session-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
    }

    .session-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .session-date {
      font-size: 15px;
      font-weight: 700;
      color: white;
      text-transform: capitalize;
    }

    .session-routine {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }

    .session-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .duration-badge {
      font-size: 11px;
      background: rgba(29, 158, 117, 0.1);
      color: #1D9E75;
      padding: 4px 10px;
      border-radius: 20px;
      font-weight: 600;
    }

    .expand-icon {
      font-size: 20px;
      color: #444;
      transition: transform 0.3s;
      line-height: 1;
    }

    .expand-icon.open {
      transform: rotate(90deg);
      color: #1D9E75;
    }

    .sets-table {
      border-top: 1px solid rgba(255,255,255,0.04);
      background: rgba(0,0,0,0.2);
      padding: 12px 16px;
      animation: slideDown 0.3s ease-out;
    }
    
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

    .sets-header {
      display: grid;
      grid-template-columns: 1fr 80px 100px;
      font-size: 10px;
      color: #444;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      margin-bottom: 8px;
      font-weight: 700;
    }

    .exercise-row {
      display: grid;
      grid-template-columns: 1fr 80px 100px;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.03);
      font-size: 13px;
    }

    .exercise-row:last-child { border-bottom: none; }

    .ex-name { color: #ccc; font-weight: 600; }
    .ex-sets { color: #666; font-size: 12px; }
    .ex-best {
      color: #1D9E75;
      font-size: 12px;
      font-weight: 700;
      text-align: right;
    }

    .text-right { text-align: right; }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 80px 20px;
      color: #444;
    }

    .empty-icon { font-size: 40px; }

    .skeleton-session {
      height: 70px;
      border-radius: 16px;
      background: rgba(255,255,255,0.02);
      margin-bottom: 12px;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    .exercise-notes-coach {
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.15);
      border-radius: 8px;
      margin: 4px 0 12px 0;
      font-size: 12px;
      color: #aaa;
    }

    .coach-note-item {
      display: flex;
      gap: 6px;
      align-items: flex-start;
      margin-bottom: 4px;
    }
    .coach-note-item:last-child {
      margin-bottom: 0;
    }
    .note-icon {
      font-size: 14px;
    }
    .note-text {
      line-height: 1.4;
      font-style: italic;
    }
  `]
})
export class ClientHistoryComponent implements OnInit {
  @Input({ required: true }) clientId!: string;

  private sb = supabase;

  loading = signal(true);
  sessions = signal<SessionLog[]>([]);

  async ngOnInit() {
    await this.loadHistory();
  }

  async loadHistory() {
    this.loading.set(true);

    const { data, error } = await this.sb
      .from('workout_logs')
      .select(`
        id,
        logged_date,
        duration_seconds,
        day_id,
        set_logs (
          set_number,
          weight_kg,
          reps_done,
          exercise_name,
          notes
        )
      `)
      .eq('client_id', this.clientId)
      .eq('completed', true)
      .order('logged_date', { ascending: false })
      .limit(30);

    if (error || !data) {
      console.error('Error loading history:', error);
      this.loading.set(false);
      return;
    }

    const mapped: SessionLog[] = (data as any[]).map(log => ({
      id: log.id,
      date: log.logged_date,
      dayName: 'Entrenamiento', // Placeholder, se podría traer de routine_days si existiera el join
      routineName: '', // Placeholder
      duration: log.duration_seconds
        ? Math.round(log.duration_seconds / 60)
        : null,
      sets: (log.set_logs ?? []).map((s: any) => ({
        exercise: s.exercise_name ?? 'Ejercicio',
        weight: s.weight_kg,
        reps: s.reps_done,
        set_number: s.set_number,
        notes: s.notes,
      })),
      expanded: false,
    }));

    this.sessions.set(mapped);
    this.loading.set(false);
  }

  toggleSession(session: SessionLog) {
    this.sessions.update(sessions =>
      sessions.map(s =>
        s.id === session.id ? { ...s, expanded: !s.expanded } : s
      )
    );
  }

  groupedSets(session: SessionLog) {
    const map = new Map<string, { exercise: string; sets: SetLog[]; best: SetLog }>();
    for (const set of session.sets) {
      if (!map.has(set.exercise)) {
        map.set(set.exercise, { exercise: set.exercise, sets: [], best: set });
      }
      const group = map.get(set.exercise)!;
      group.sets.push(set);
      if ((set.weight ?? 0) > (group.best.weight ?? 0)) {
        group.best = set;
      }
    }
    return Array.from(map.values());
  }

  hasNotes(group: { sets: SetLog[] }): boolean {
    return group.sets.some(s => !!s.notes && s.notes.trim() !== '');
  }
}
