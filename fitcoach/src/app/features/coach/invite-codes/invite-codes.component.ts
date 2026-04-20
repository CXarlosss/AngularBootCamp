import {
  Component, inject, signal,
  ChangeDetectionStrategy, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';

interface CodeRow {
  code:      string;
  usedBy:    string | null;
  expiresAt: Date;
}

@Component({
  selector: 'fc-invite-codes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="codes-panel">

      <div class="codes-header">
        <div>
          <h2 class="panel-title">Códigos de invitación</h2>
          <p class="panel-sub">Comparte el código con tu cliente por WhatsApp o SMS</p>
        </div>
        <button class="btn-new-code" (click)="generateNew()" [disabled]="generating()">
          {{ generating() ? 'Generando...' : '+ Nuevo código' }}
        </button>
      </div>

      <div class="codes-list">
        @for (row of codes(); track row.code) {
          <div class="code-row" [class.used]="row.usedBy">

            <div class="code-badge" [class.used-badge]="row.usedBy">
              {{ row.code }}
            </div>

            <div class="code-meta">
              @if (row.usedBy) {
                <span class="used-label">Utilizado</span>
              } @else {
                <span class="available-label">Disponible</span>
                <span class="expires-label">
                  Expira {{ row.expiresAt | date:'dd MMM' }}
                </span>
              }
            </div>

            @if (!row.usedBy) {
              <div class="code-actions">
                <button class="btn-copy" (click)="copy(row.code)">
                  {{ copied() === row.code ? '¡Copiado!' : 'Copiar' }}
                </button>
                <button class="btn-share" (click)="share(row.code)">
                  Compartir
                </button>
              </div>
            }

          </div>
        }

        @if (codes().length === 0) {
          <div class="codes-empty">
            Genera tu primer código para invitar a un cliente.
          </div>
        }
      </div>

    </div>
  `,
  styleUrl: '../../auth/auth.css'
})
export class InviteCodesComponent implements OnInit {
  private auth = inject(AuthService);

  codes      = signal<CodeRow[]>([]);
  generating = signal(false);
  copied     = signal('');

  async ngOnInit(): Promise<void> {
    this.codes.set(await this.auth.getMyInviteCodes());
  }

  async generateNew(): Promise<void> {
    const profile = this.auth.profile();
    if (!profile) return;
    this.generating.set(true);
    try {
      await this.auth.generateInviteCode(profile.id, profile.fullName);
      this.codes.set(await this.auth.getMyInviteCodes());
    } finally {
      this.generating.set(false);
    }
  }

  copy(code: string): void {
    navigator.clipboard.writeText(code);
    this.copied.set(code);
    setTimeout(() => this.copied.set(''), 2000);
  }

  share(code: string): void {
    const text = `Hola! Usa este código para unirte a mi app de entrenamiento: ${code}`;
    if (navigator.share) {
      navigator.share({ text });          // Web Share API — nativo en móvil
    } else {
      this.copy(code);
    }
  }
}
