import { Component, inject, signal, computed } from '@angular/core';
import { FcmService } from '../../../core/services/fcm.service';

@Component({
  selector: 'app-push-permission-banner',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="fixed bottom-4 left-4 right-4 z-50 sm:max-w-md sm:left-auto sm:right-4">
        <div class="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-4 flex gap-4 items-start animate-slide-up">
          <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span class="text-2xl">🔔</span>
          </div>
          
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-gray-900 text-sm">¿Quieres que te avisemos?</h4>
            <p class="text-xs text-gray-500 mt-1 leading-relaxed">
              Te notificaremos cuando tu coach te envíe un mensaje o tengas una rutina pendiente.
            </p>
            
            <div class="flex gap-2 mt-3">
              <button 
                (click)="activate()"
                class="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
              >
                Activar
              </button>
              <button 
                (click)="dismiss()"
                class="px-4 py-2 text-gray-500 text-xs font-medium hover:text-gray-700 transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>
          
          <button (click)="dismiss()" class="text-gray-400 hover:text-gray-600 p-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes slide-up {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-slide-up {
      animation: slide-up 0.3s ease-out;
    }
  `]
})
export class PushPermissionBannerComponent {
  private fcm = inject(FcmService);
  
  private dismissed = signal<boolean>(
    localStorage.getItem('fitcoach_push_banner_dismissed') === 'true'
  );
  
  visible = computed(() => {
    if (this.dismissed()) return false;
    return this.fcm.shouldShowBanner();
  });
  
  async activate() {
    const granted = await this.fcm.requestPermission();
    if (granted) {
      this.dismissed.set(true);
      localStorage.setItem('fitcoach_push_banner_dismissed', 'true');
    }
  }
  
  dismiss() {
    this.dismissed.set(true);
    localStorage.setItem('fitcoach_push_banner_dismissed', 'true');
  }
}
