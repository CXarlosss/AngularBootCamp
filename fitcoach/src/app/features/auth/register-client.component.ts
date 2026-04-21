import {
  Component, signal, inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

type CodeStatus = 'idle' | 'checking' | 'valid' | 'invalid';

@Component({
  selector: 'fc-register-client',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-screen">
      <div class="auth-card">

        <a routerLink="/auth/login" class="back-link">← Volver</a>
        <h1 class="auth-title">Unirme a mi entrenador</h1>
        <p class="auth-sub">Tu entrenador te habrá enviado un código de acceso.</p>

        @if (error()) {
          <div class="auth-error">{{ error() }}</div>
        }

        <!-- Código de invitación — lo primero, bloquea el resto -->
        <div class="field-group">
          <label class="field-label">Código de invitación</label>
          <div class="code-input-wrap">
            <input
              type="text"
              placeholder="CARLOS-A3F7"
              maxlength="12"
              style="text-transform: uppercase; letter-spacing: .1em; font-weight: 500"
              [ngModel]="inviteCode()"
              (ngModelChange)="onCodeChange($event)"
            />
            <div class="code-status" [class]="codeStatus()">
              @switch (codeStatus()) {
                @case ('checking') { <span class="spinner"></span> }
                @case ('valid')    { <span class="check-icon">✓</span> }
                @case ('invalid')  { <span class="x-icon">✗</span> }
              }
            </div>
          </div>
          @if (codeStatus() === 'valid') {
            <div class="coach-reveal">
              <div class="coach-reveal-av">
                {{ coachName().split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase() }}
              </div>
              <div>
                <div class="coach-reveal-text">Tu entrenador es</div>
                <div class="coach-reveal-name">{{ coachName() }}</div>
              </div>
            </div>
          }
          @if (codeStatus() === 'invalid') {
            <p class="code-hint-err">Código no válido o expirado</p>
          }
        </div>

        <!-- Resto del formulario, solo visible si el código es válido -->
        @if (codeStatus() === 'valid') {
          <div class="field-group">
            <label class="field-label">Tu nombre</label>
            <input type="text" placeholder="María López" [(ngModel)]="name" />
          </div>

          <div class="field-group">
            <label class="field-label">Email</label>
            <input type="email" placeholder="maria@email.com" [(ngModel)]="email" />
          </div>

          <div class="field-group">
            <label class="field-label">Contraseña</label>
            <input type="password" placeholder="Mínimo 8 caracteres" [(ngModel)]="password" />
          </div>

          <button
            class="btn-auth"
            [disabled]="loading() || !isValid()"
            (click)="onRegister()"
          >
            {{ loading() ? 'Creando cuenta...' : 'Crear cuenta y empezar' }}
          </button>
        }

      </div>
    </div>
  `,
  styleUrl: './auth.css'
})
export class RegisterClientComponent {
  private auth = inject(AuthService);

  inviteCode = signal('');
  coachName  = signal('');
  codeStatus = signal<CodeStatus>('idle');

  name     = '';
  email    = '';
  password = '';
  loading  = signal(false);
  error    = signal('');

  private debounceTimer: any;

  onCodeChange(value: string): void {
    const code = value.toUpperCase();
    this.inviteCode.set(code);
    this.coachName.set('');

    if (code.length < 6) {
      this.codeStatus.set('idle');
      return;
    }

    // Debounce 600ms para no disparar una query por cada tecla
    clearTimeout(this.debounceTimer);
    this.codeStatus.set('checking');
    this.debounceTimer = setTimeout(() => this.checkCode(code), 600);
  }

  private async checkCode(code: string): Promise<void> {
    try {
      const result = await this.auth.validateInviteCode(code);
      this.coachName.set(result.coachName);
      this.codeStatus.set('valid');
    } catch {
      this.codeStatus.set('invalid');
    }
  }

  isValid(): boolean {
    return this.codeStatus() === 'valid'
      && this.name.trim().length > 2
      && this.email.includes('@')
      && this.password.length >= 8;
  }

  async onRegister(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.registerClient(
        this.email, this.password,
        this.name, this.inviteCode()
      );
    } catch (e: any) {
      this.error.set(e.message);
      this.loading.set(false);
    }
  }
}
