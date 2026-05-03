import {
  Component, Output, EventEmitter, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvitationService, Invitation } from '../../../invitations/invitation.service';

@Component({
  selector: 'app-invite-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="backdrop" (click)="close.emit()"></div>

    <div class="sheet">
      <div class="handle"></div>

      @if (!invitation()) {
        <!-- Formulario -->
        <h2 class="title">Invitar cliente</h2>
        <p class="subtitle">Genera un enlace único. El cliente lo abre, se registra y aparece en tu dashboard.</p>

        <label class="field-label">Email del cliente (opcional)</label>
        <input
          class="field-input"
          type="email"
          [(ngModel)]="email"
          placeholder="cliente@email.com"
          autocomplete="off" />

        <p class="field-hint">Si lo añades, el cliente verá su nombre pre-rellenado al registrarse.</p>

        <button class="btn-primary" [disabled]="loading()" (click)="generate()">
          {{ loading() ? 'Generando...' : 'Generar invitación' }}
        </button>

      } @else {
        <!-- Resultado -->
        <div class="success-icon">✓</div>
        <h2 class="title">Invitación lista</h2>
        <p class="subtitle">Caduca en 7 días. Comparte el enlace o el código.</p>

        <!-- Enlace -->
        <div class="copy-row" (click)="copy('url')">
          <div class="copy-content">
            <span class="copy-label">Enlace de registro</span>
            <span class="copy-value">{{ shortUrl() }}</span>
          </div>
          <span class="copy-btn">{{ copied() === 'url' ? '✓' : 'Copiar' }}</span>
        </div>

        <!-- Código -->
        <div class="copy-row" (click)="copy('code')">
          <div class="copy-content">
            <span class="copy-label">Código manual</span>
            <span class="copy-value code">{{ invitation()!.code }}</span>
          </div>
          <span class="copy-btn">{{ copied() === 'code' ? '✓' : 'Copiar' }}</span>
        </div>

        <!-- Share nativo -->
        @if (canShare()) {
          <button class="btn-share" (click)="share()">
            Compartir por WhatsApp / SMS
          </button>
        }

        <button class="btn-secondary" (click)="reset()">
          Generar otra invitación
        </button>
        <button class="btn-text" (click)="close.emit()">
          Cerrar
        </button>
      }
    </div>
  `,
  styleUrl: './invite-modal.component.scss',
})
export class InviteModalComponent {
  @Output() close = new EventEmitter<void>();

  private svc = inject(InvitationService);

  email      = '';
  loading    = signal(false);
  invitation = signal<Invitation | null>(null);
  copied     = signal<'url' | 'code' | null>(null);

  canShare = () => !!navigator.share;

  shortUrl(): string {
    const inv = this.invitation();
    if (!inv) return '';
    const url = this.svc.buildInviteUrl(inv.code);
    return url.replace('https://', '').replace('http://', '');
  }

  async generate() {
    this.loading.set(true);
    try {
      const inv = await this.svc.createInvitation(this.email || undefined);
      this.invitation.set(inv);
    } catch (e: any) {
      console.error('Error generando invitación:', e.message);
    } finally {
      this.loading.set(false);
    }
  }

  copy(type: 'url' | 'code') {
    const inv = this.invitation();
    if (!inv) return;

    const text = type === 'url'
      ? this.svc.buildInviteUrl(inv.code)
      : inv.code;

    navigator.clipboard.writeText(text);
    this.copied.set(type);
    setTimeout(() => this.copied.set(null), 2000);
  }

  async share() {
    const inv = this.invitation();
    if (!inv) return;
    await navigator.share({
      title: 'FitCoach — Tu acceso',
      text:  `Tu entrenador te ha invitado a FitCoach. Usa el código ${inv.code} o entra aquí:`,
      url:   this.svc.buildInviteUrl(inv.code),
    });
  }

  reset() {
    this.invitation.set(null);
    this.email = '';
  }
}
