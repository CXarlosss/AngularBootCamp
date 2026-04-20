import {
  Component, signal, inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'fc-register-coach',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-screen">
      <div class="auth-card">

        <a routerLink="/auth/login" class="back-link">← Volver</a>
        <h1 class="auth-title">Crear cuenta de entrenador</h1>
        <p class="auth-sub">
          Recibirás un código único para invitar a tus clientes.
        </p>

        @if (error()) {
          <div class="auth-error">{{ error() }}</div>
        }

        <div class="field-group">
          <label class="field-label">Tu nombre completo</label>
          <input type="text" placeholder="Carlos García" [(ngModel)]="name" />
        </div>

        <div class="field-group">
          <label class="field-label">Email profesional</label>
          <input type="email" placeholder="carlos@tugimnasio.com" [(ngModel)]="email" />
        </div>

        <div class="field-group">
          <label class="field-label">Contraseña</label>
          <input
            type="password"
            placeholder="Mínimo 8 caracteres"
            [(ngModel)]="password"
          />
        </div>

        <button
          class="btn-auth"
          [disabled]="loading() || !isValid()"
          (click)="onRegister()"
        >
          {{ loading() ? 'Creando cuenta...' : 'Crear cuenta y obtener código' }}
        </button>

      </div>
    </div>
  `,
  styleUrl: './auth.css'
})
export class RegisterCoachComponent {
  private auth = inject(AuthService);

  name     = '';
  email    = '';
  password = '';
  loading  = signal(false);
  error    = signal('');

  isValid(): boolean {
    return this.name.trim().length > 2
      && this.email.includes('@')
      && this.password.length >= 8;
  }

  async onRegister(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.registerCoach(this.email, this.password, this.name);
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.loading.set(false);
    }
  }
}
