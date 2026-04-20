import {
  Component, inject, signal, OnInit,
  ChangeDetectionStrategy, output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoachService } from '../../../core/services/coach.service';
import { Profile } from '../../../core/models/profile.model';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'fc-assign-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop">
      <div class="modal-box">
        <h3 class="modal-title">Asignar rutina a clientes</h3>
        <p class="modal-sub">Selecciona uno o varios clientes. La rutina empieza hoy.</p>

        <div class="client-list">
          @for (client of clients(); track client.id) {
            <label class="client-item" [class.selected]="selected().has(client.id)">
              <div class="client-av">{{ initials(client.fullName) }}</div>
              <span class="client-name">{{ client.fullName }}</span>
              <input
                type="checkbox"
                [checked]="selected().has(client.id)"
                (change)="toggle(client.id)"
              />
            </label>
          }
        </div>

        @if (clients().length === 0 && !loading()) {
          <p class="no-clients">Aún no tienes clientes vinculados.</p>
        }

        <div class="modal-actions">
          <button class="btn-secondary" (click)="cancelled.emit()">Cancelar</button>
          <button
            class="btn-primary"
            [disabled]="selected().size === 0"
            (click)="onConfirm()"
          >
            Asignar a {{ selected().size }}
            {{ selected().size === 1 ? 'cliente' : 'clientes' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AssignModalComponent implements OnInit {
  private coachSvc = inject(CoachService);
  private auth     = inject(AuthService);

  confirmed = output<string[]>();
  cancelled = output<void>();

  clients  = signal<Profile[]>([]);
  selected = signal<Set<string>>(new Set());
  loading  = signal(true);

  async ngOnInit(): Promise<void> {
    const coachId = this.auth.profile()!.id;
    const clients = await this.coachSvc.getClients(coachId);
    this.clients.set(clients);
    this.loading.set(false);
  }

  toggle(clientId: string): void {
    this.selected.update(s => {
      const next = new Set(s);
      next.has(clientId) ? next.delete(clientId) : next.add(clientId);
      return next;
    });
  }

  onConfirm(): void {
    this.confirmed.emit([...this.selected()]);
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }
}
