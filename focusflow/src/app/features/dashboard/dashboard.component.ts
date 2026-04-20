import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskStore } from '../../state/task.store';
import { AiService } from '../../core/services/ai.service';
import { AuthService } from '../../core/auth/auth.service';
import { EnergyLevel } from '../../core/models/task.model';
import { TaskCardComponent } from '../../shared/components/task-card.component';
import { EnergyPickerComponent } from './energy-picker.component';

@Component({
  selector: 'ff-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TaskCardComponent, EnergyPickerComponent],
  template: `
    <div class="dashboard">

      <header class="dashboard-header">
        <h1>Hola, {{ userName() }}</h1>
        <p class="subtitle">{{ greeting() }}</p>
      </header>

      @if (aiMessage()) {
        <div class="ai-suggestion" role="status">
          <span class="ai-icon">✦</span>
          <p>{{ aiMessage() }}</p>
        </div>
      }

      <ff-energy-picker
        [current]="store.currentEnergy()"
        (energyChange)="onEnergyChange($event)"
      />

      <section class="task-list">
        @for (task of store.todayTasks(); track task.id) {
          <ff-task-card
            [task]="task"
            (complete)="onComplete(task.id)"
            (focus)="onFocus(task.id)"
          />
        } @empty {
          <div class="empty-state">
            <p>Bandeja limpia. Añade tareas o revisa tu inbox.</p>
          </div>
        }
      </section>

    </div>
  `,
})
export class DashboardComponent implements OnInit {
  store    = inject(TaskStore);
  aiSvc    = inject(AiService);
  auth     = inject(AuthService);
  router   = inject(Router);

  aiMessage = signal('');

  userName = computed(() => this.auth.currentUser()?.name ?? 'amigo');

  greeting = computed(() => {
    const hour = new Date().getHours();
    const done = this.store.completedToday();
    if (hour < 12) return `Buenos días. ${done} tareas completadas hoy.`;
    if (hour < 18) return `Buenas tardes. ${done} tareas completadas hoy.`;
    return `Buenas noches. ${done} tareas completadas hoy.`;
  });

  ngOnInit(): void {
    const userId = this.auth.currentUser()?.id;
    if (userId) {
      this.store.loadTasks(userId).then(() => this.loadAiSuggestion());
    }
  }

  private loadAiSuggestion(): void {
    const top5 = this.store.todayTasks().slice(0, 5);
    if (!top5.length) return;

    this.aiSvc
      .streamSuggestion(top5, this.store.currentEnergy())
      .subscribe({
        next:     token => this.aiMessage.update(msg => msg + token),
        error:    ()    => this.aiMessage.set(''),
        complete: ()    => {},
      });
  }

  onEnergyChange(level: EnergyLevel): void {
    this.store.setEnergy(level);
    this.aiMessage.set('');
    setTimeout(() => this.loadAiSuggestion(), 200);
  }

  onComplete(taskId: string): void {
    this.store.completeTask(taskId);
  }

  onFocus(taskId: string): void {
    this.router.navigate(['/focus', taskId]);
  }
}
