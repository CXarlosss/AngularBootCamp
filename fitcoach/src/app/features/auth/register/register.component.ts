import {
  Component, OnInit, inject, signal
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvitationService } from '../../invitations/invitation.service';
import { SupabaseService } from '../../../core/supabase.service';

type Step = 'validating' | 'invalid' | 'form' | 'success';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="register-screen">
      <div class="register-card">

        <!-- Logo -->
        <div class="logo">
          <span class="logo-icon">💪</span>
          <span class="logo-text">FitCoach</span>
        </div>

        @switch (step()) {

          @case ('validating') {
            <div class="state-center">
              <div class="spinner"></div>
              <p>Verificando invitación...</p>
            </div>
          }

          @case ('invalid') {
            <div class="state-center">
              <span class="state-icon">⚠️</span>
              <h2>Invitación no válida</h2>
              <p>El enlace ha caducado o ya fue utilizado.</p>
              <p>Pide a tu entrenador que genere uno nuevo.</p>
            </div>
          }

          @case ('form') {
            <h2 class="form-title">Crea tu cuenta</h2>
            <p class="form-sub">Código de acceso: <strong>{{ code() }}</strong></p>

            <label class="field-label">Nombre completo</label>
            <input class="field-input" type="text"
              [(ngModel)]="name"
              placeholder="Tu nombre"
              autocomplete="name" />

            <label class="field-label">Email</label>
            <input class="field-input" type="email"
              [(ngModel)]="email"
              [readonly]="!!prefillEmail()"
              placeholder="tu@email.com"
              autocomplete="email" />

            <label class="field-label">Contraseña</label>
            <input class="field-input" type="password"
              [(ngModel)]="password"
              placeholder="Mínimo 8 caracteres"
              autocomplete="new-password" />

            @if (error()) {
              <p class="error-msg">{{ error() }}</p>
            }

            <button class="btn-primary"
              [disabled]="loading() || !isValid()"
              (click)="register()">
              {{ loading() ? 'Creando cuenta...' : 'Empezar a entrenar' }}
            </button>

            <p class="login-link">
              ¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a>
            </p>
          }

          @case ('success') {
            <div class="state-center">
              <div class="success-circle">✓</div>
              <h2>¡Bienvenido!</h2>
              <p>Tu cuenta está lista. Tu entrenador te asignará tu rutina en breve.</p>
            </div>
          }

        }
      </div>
    </div>
  `,
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private invSvc = inject(InvitationService);
  private sb     = inject(SupabaseService).client;

  step         = signal<Step>('validating');
  code         = signal('');
  prefillEmail = signal('');
  error        = signal('');
  loading      = signal(false);

  name     = '';
  email    = '';
  password = '';

  async ngOnInit() {
    const codeParam = this.route.snapshot.queryParamMap.get('code') ?? '';
    this.code.set(codeParam.toUpperCase());

    if (!codeParam) { this.step.set('invalid'); return; }

    const invitation = await this.invSvc.validateCode(codeParam);
    if (!invitation) { this.step.set('invalid'); return; }

    // Pre-rellenar email si el coach lo especificó
    if (invitation.client_email) {
      this.email = invitation.client_email;
      this.prefillEmail.set(invitation.client_email);
    }

    this.step.set('form');
  }

  isValid(): boolean {
    return this.name.trim().length >= 2
      && this.email.includes('@')
      && this.password.length >= 8;
  }

  async register() {
    if (!this.isValid()) return;
    this.loading.set(true);
    this.error.set('');

    try {
      // 1. Crear usuario en Supabase Auth
      const { data, error: authError } = await this.sb.auth.signUp({
        email:    this.email.trim(),
        password: this.password,
        options: {
          data: { full_name: this.name.trim(), role: 'client' }
        }
      });

      if (authError) throw authError;
      if (!data.user) throw new Error('Error creando usuario');

      // 2. Crear perfil en profiles
      const { error: profileError } = await this.sb.from('profiles').upsert({
        id:        data.user.id,
        full_name: this.name.trim(),
        email:     this.email.trim(),
        role:      'client',
      });

      if (profileError) throw profileError;

      // 3. Marcar invitación como usada
      await this.invSvc.markAsUsed(this.code());

      // 4. Éxito — redirigir tras 2 segundos
      this.step.set('success');
      setTimeout(() => this.router.navigate(['/client']), 2000); // Redirigir a la ruta del cliente

    } catch (e: any) {
      this.error.set(
        e.message?.includes('already registered')
          ? 'Este email ya tiene una cuenta. Inicia sesión.'
          : 'Error al crear la cuenta. Inténtalo de nuevo.'
      );
      this.loading.set(false);
    }
  }
}
