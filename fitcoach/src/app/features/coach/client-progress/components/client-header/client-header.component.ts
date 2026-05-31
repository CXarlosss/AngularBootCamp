import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ClientHeaderInputs {
  profile: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    rank: string;
    xp: number;
  };
  isAtRisk: boolean;
  daysSince: number | null;
  lastActive: string | null;
}

export type HeaderAction = 'chat' | 'adjust-routine' | 'send-reminder';

@Component({
  selector: 'app-client-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="sticky top-0 z-50 bg-white shadow-sm">
      <!-- Fila 1: Navegación + Identidad + Chat -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button class="p-2 text-gray-500 hover:text-gray-900 rounded-full" (click)="goBack()">
          <span class="sr-only">Volver</span>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div class="flex flex-col items-center flex-1 mx-4">
          <div class="flex items-center gap-3">
            @if (profile().avatar_url) {
              <img [src]="profile().avatar_url" loading="lazy" alt="Avatar" class="w-10 h-10 rounded-full object-cover">
            } @else {
              <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                {{ getInitials(profile().full_name) }}
              </div>
            }
            <div class="flex flex-col">
              <h1 class="text-base font-bold text-gray-900 leading-tight">
                {{ profile().full_name }}
              </h1>
              <div class="text-sm text-gray-500 flex items-center gap-1">
                <span>{{ profile().rank }}</span>
                <span>&bull;</span>
                <span>{{ profile().xp | number }} XP</span>
              </div>
            </div>
          </div>
        </div>

        <button class="p-2 text-blue-600 hover:bg-blue-50 rounded-full" (click)="action.emit('chat')">
          <span class="sr-only">Chat</span>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      </div>

      <!-- Fila 2: Alerta Contextual y Fila 3: Acciones -->
      <div [ngClass]="alertStyles()" class="border-l-4 px-4 py-2 flex flex-col justify-center transition-all duration-200">
        <div class="flex items-center gap-2">
          <span>{{ alertIcon() }}</span>
          <span class="font-medium text-sm">{{ alertMessage() }}</span>
        </div>
        
        @if (isAtRisk()) {
          <div class="flex items-center gap-3 mt-3">
            <button 
              class="flex-1 bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-md shadow-sm hover:bg-red-700 active:scale-95 transition-all"
              (click)="action.emit('adjust-routine')"
            >
              Ajustar Rutina
            </button>
            <button 
              class="flex-1 bg-white text-red-700 border border-red-200 text-sm font-medium py-2 px-4 rounded-md shadow-sm hover:bg-red-50 active:scale-95 transition-all"
              (click)="action.emit('send-reminder')"
            >
              Enviar Recordatorio
            </button>
          </div>
        }
      </div>
    </header>
  `
})
export class ClientHeaderComponent {
  profile = input.required<ClientHeaderInputs['profile']>();
  isAtRisk = input.required<boolean>();
  daysSince = input.required<number | null>();
  lastActive = input.required<string | null>();

  action = output<HeaderAction>();

  alertState = computed(() => {
    if (this.isAtRisk() && this.daysSince() !== null && this.daysSince()! >= 4) {
      return 'red';
    } else if (this.daysSince() === 2 || this.daysSince() === 3) {
      return 'yellow';
    } else {
      return 'green';
    }
  });

  alertStyles = computed(() => {
    const state = this.alertState();
    if (state === 'red') return 'border-red-500 bg-red-50 text-red-700';
    if (state === 'yellow') return 'border-yellow-400 bg-yellow-50 text-yellow-800';
    return 'border-green-500 bg-green-50 text-green-700 h-10'; // Compact line when green
  });

  alertIcon = computed(() => {
    const state = this.alertState();
    if (state === 'red') return '🔴';
    if (state === 'yellow') return '⚠️';
    return '🟢';
  });

  alertMessage = computed(() => {
    const state = this.alertState();
    if (state === 'red') return \`Sin entreno desde hace \${this.daysSince()} días\`;
    if (state === 'yellow') return \`Último entreno hace \${this.daysSince()} días\`;
    return 'Activo • Último entreno hoy/ayer';
  });

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  goBack() {
    window.history.back();
  }
}
