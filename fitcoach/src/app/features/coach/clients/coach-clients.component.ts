import {
  Component, inject, signal,
  ChangeDetectionStrategy, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CoachService } from '../../../core/services/coach.service';
import { AuthService }  from '../../../core/auth/auth.service';
import { Profile }      from '../../../core/models/profile.model';

@Component({
  selector: 'fc-coach-clients',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="clients-page">
      <div class="page-header">
        <h1 class="page-title">Mis clientes</h1>
        <button class="btn-invite" (click)="router.navigate(['/coach/invite-codes'])">
          + Invitar cliente
        </button>
      </div>

      @if (loading()) {
        <div class="loading">Cargando...</div>
      }

      @for (client of clients(); track client.id) {
        <div class="client-card" (click)="router.navigate(['/coach/routine-builder'])">
          <div class="client-av">{{ initials(client.fullName) }}</div>
          <div class="client-info">
            <span class="client-name">{{ client.fullName }}</span>
            <span class="client-meta">Cliente activo</span>
          </div>
          <button class="btn-routine"
            (click)="$event.stopPropagation(); router.navigate(['/coach/routine-builder'])">
            Asignar rutina
          </button>
        </div>
      }

      @if (!loading() && clients().length === 0) {
        <div class="empty">
          <p>Aún no tienes clientes vinculados.</p>
          <button class="btn-invite" (click)="router.navigate(['/coach/invite-codes'])">
            Compartir código de invitación
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .clients-page { padding: 24px; background: #0f1117; min-height: 100vh; color: #e8e6df; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .page-title { font-size: 20px; font-weight: 500; color: #fff; }
    .btn-invite { padding: 8px 16px; background: #0F6E56; color: #9FE1CB; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; }
    .client-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #1a1d27; border: 0.5px solid rgba(255,255,255,0.08); border-radius: 12px; margin-bottom: 10px; cursor: pointer; transition: border-color .15s; }
    .client-card:hover { border-color: rgba(255,255,255,0.2); }
    .client-av { width: 40px; height: 40px; border-radius: 50%; background: #0F6E56; color: #9FE1CB; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; flex-shrink: 0; }
    .client-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .client-name { font-size: 14px; font-weight: 500; color: #e8e6df; }
    .client-meta { font-size: 12px; color: #5F5E5A; }
    .btn-routine { padding: 7px 14px; background: rgba(29,158,117,0.15); color: #1D9E75; border: none; border-radius: 7px; font-size: 12px; font-weight: 500; cursor: pointer; }
    .empty { text-align: center; padding: 48px; color: #5F5E5A; }
    .empty p { margin-bottom: 16px; }
    .loading { color: #5F5E5A; padding: 24px; }
  `],
})
export class CoachClientsComponent implements OnInit {
  router     = inject(Router);
  private auth      = inject(AuthService);
  private coachSvc  = inject(CoachService);

  clients = signal<Profile[]>([]);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    const id = this.auth.profile()?.id;
    if (id) {
      this.clients.set(await this.coachSvc.getClients(id));
    }
    this.loading.set(false);
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }
}
