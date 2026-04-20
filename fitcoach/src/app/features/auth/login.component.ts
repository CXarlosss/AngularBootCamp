import {
  Component, signal, inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'fc-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-screen">
      <div class="auth-card">

        <div class="auth-logo">Fit<span>Coach</span></div>

        <h1 class="auth-title">Bienvenido de nuevo</h1>
        <p class="auth-sub">Entra a tu cuenta para continuar</p>

        @if (error()) {
          <div class="auth-error" role="alert">{{ error() }}</div>
        }

        <div class="field-group">
          <label class="field-label">Email</label>
          <input
            type="email"
            autocomplete="email"
            placeholder="tu@email.com"
            [(ngModel)]="email"
          />
        </div>

        <div class="field-group">
          <label class="field-label">Contraseña</label>
          <input
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            [(ngModel)]="password"
            (keydown.enter)="onLogin()"
          />
        </div>

        <button
          class="btn-auth"
          [disabled]="loading()"
          (click)="onLogin()"
        >
          {{ loading() ? 'Entrando...' : 'Entrar' }}
        </button>

        <div class="auth-divider">¿Primera vez aquí?</div>

        <a routerLink="/auth/register-coach" class="btn-secondary-auth">
          Soy entrenador — crear cuenta
        </a>
        <a routerLink="/auth/register-client" class="btn-secondary-auth">
          Soy cliente — tengo un código
        </a>

      </div>
    </div>
  `,
  styleUrl: './auth.css'
})
export class LoginComponent {
  private auth = inject(AuthService);

  email    = '';
  password = '';
  loading  = signal(false);
  error    = signal('');

  async onLogin(): Promise<void> {
    if (!this.email || !this.password) {
      this.error.set('Completa todos los campos');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.login(this.email, this.password);
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.loading.set(false);
    }
  }
}
