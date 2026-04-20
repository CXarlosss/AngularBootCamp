import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Task, EnergyLevel } from '../models/task.model';
import { environment } from '../../../environments/environment';

export interface AiSuggestion {
  taskId: string;
  reason: string;
  estimatedFocus: number;
}

export interface AiInsight {
  message: string;
  type: 'suggestion' | 'pattern' | 'celebration';
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private http = inject(HttpClient);

  streamSuggestion(
    tasks: Task[],
    energy: EnergyLevel
  ): Observable<string> {
    const subject = new Subject<string>();

    const url = `${environment.supabaseUrl}/functions/v1/ai-suggest`;

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${environment.supabaseAnonKey}`,
      },
      body: JSON.stringify({
        tasks: tasks.slice(0, 10).map(t => ({
          id: t.id,
          title: t.title,
          energyRequired: t.context.energyRequired,
          estimatedMinutes: t.context.estimatedMinutes,
          deadline: t.deadline,
          status: t.status,
        })),
        currentEnergy: energy,
      }),
    }).then(async (res) => {
      if (!res.ok || !res.body) {
        subject.error(new Error('AI request failed'));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) { subject.complete(); break; }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const token = line.slice(6);
          if (token === '[DONE]') { subject.complete(); return; }
          subject.next(token);
        }
      }
    }).catch(err => subject.error(err));

    return subject.asObservable();
  }

  getWeeklyInsights(tasks: Task[]): Observable<AiInsight[]> {
    return this.http.post<AiInsight[]>(
      `${environment.supabaseUrl}/functions/v1/ai-insights`,
      { tasks }
    );
  }
}
