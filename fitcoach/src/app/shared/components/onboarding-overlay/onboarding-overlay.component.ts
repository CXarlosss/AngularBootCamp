import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnboardingStep } from '../../../core/services/onboarding.service';

@Component({
  selector: 'app-onboarding-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="fixed inset-0 z-[70] flex flex-col justify-end sm:justify-center items-center bg-black/60 backdrop-blur-sm transition-opacity duration-300" (click)="onBackdropClick($event)">
        
        <!-- Tooltip / Card -->
        <div 
          class="bg-white rounded-2xl shadow-2xl mx-4 mb-8 sm:mb-0 max-w-sm w-full p-6 transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
          (click)="$event.stopPropagation()"
        >
          <!-- Indicador de paso -->
          <div class="flex gap-1.5 mb-4">
            @for (s of allSteps; track s) {
              <div class="h-1.5 flex-1 rounded-full transition-colors duration-300" 
                [class.bg-blue-600]="isCurrentOrPast(s)"
                [class.bg-gray-200]="!isCurrentOrPast(s)">
              </div>
            }
          </div>
          
          <!-- Contenido -->
          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ currentTitle() }}</h3>
          <p class="text-sm text-gray-600 mb-6 leading-relaxed">{{ currentDescription() }}</p>
          
          <!-- Acciones -->
          <div class="flex gap-3">
            @if (!isFirstStep()) {
              <button (click)="prev()" class="flex-1 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Atrás
              </button>
            }
            <button (click)="next()" class="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-md">
              {{ isLastStep() ? '¡Entendido!' : 'Siguiente' }}
            </button>
          </div>
          
          <!-- Saltar -->
          <button (click)="onDismiss()" class="w-full mt-4 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider">
            Saltar tutorial
          </button>
        </div>
        
        <!-- Flecha indicadora (posicionada absolutamente hacia el target) -->
        @if (targetSelector() && arrowPosition()) {
          <div class="absolute w-4 h-4 bg-white rotate-45 transform origin-center shadow-sm" 
            [style.top.px]="arrowPosition()?.top"
            [style.left.px]="arrowPosition()?.left">
          </div>
        }
      </div>
    }
  `
})
export class OnboardingOverlayComponent {
  step = input.required<OnboardingStep>();
  targetSelector = input<string | null>(null);
  
  completed = output<OnboardingStep>();
  dismissed = output<void>();
  
  visible = signal(true);
  arrowPosition = signal<{ top: number, left: number } | null>(null);
  
  allSteps: OnboardingStep[] = ['welcome', 'quickButtons', 'firstMission'];
  
  private stepContent: Record<OnboardingStep, { title: string; description: string }> = {
    welcome: {
      title: '¡Bienvenido a tu rutina!',
      description: 'Aquí verás tu entrenamiento de hoy. Toca "Entrenar" cuando estés listo en el gimnasio.'
    },
    quickButtons: {
      title: 'Ajusta peso sin teclado',
      description: 'Usa los botones + y - para cambiar el peso rápidamente. Es más preciso y evita errores.'
    },
    firstMission: {
      title: 'Completa tu primera misión',
      description: 'Al terminar tu entreno, reclama tu misión "Primer Entreno" por +100 XP. ¡Así subes de rango!'
    }
  };

  currentTitle = computed(() => this.stepContent[this.step()].title);
  currentDescription = computed(() => this.stepContent[this.step()].description);
  
  isFirstStep = computed(() => this.step() === 'welcome');
  isLastStep = computed(() => this.step() === 'firstMission');

  constructor() {
    effect(() => {
      if (this.visible() && this.targetSelector()) {
        // Retrasar ligeramente para asegurar que el DOM ha renderizado
        setTimeout(() => this.calculateArrowPosition(), 100);
      }
    });
  }

  isCurrentOrPast(s: OnboardingStep): boolean {
    const currentIndex = this.allSteps.indexOf(this.step());
    const stepIndex = this.allSteps.indexOf(s);
    return stepIndex <= currentIndex;
  }

  prev() {
    // Para simplificar, en este flujo de tutoriales modales (que aparecen condicionalmente en diferentes páginas),
    // el botón "Atrás" generalmente solo descarta o retrocede si es multi-paso en la misma vista.
    // Dado que aquí están ligados a diferentes vistas (Dashboard vs Workout vs Mission),
    // el botón atrás simplemente oculta el popup para no estorbar, o retrocede visualmente.
    // En la implementación real para flujos multi-página es mejor usar dismiss o navegar de regreso.
    this.visible.set(false);
  }

  next() {
    this.completed.emit(this.step());
    this.visible.set(false);
  }

  onDismiss() {
    this.dismissed.emit();
    this.visible.set(false);
  }

  onBackdropClick(event: MouseEvent) {
    // Si queremos ser estrictos (No bloqueante pero el click fuera no lo cierra)
    // No hacemos nada en el backdrop click.
  }

  private calculateArrowPosition() {
    const selector = this.targetSelector();
    if (!selector) return;

    const targetEl = document.querySelector(selector);
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      // Posicionar la flecha apuntando al centro superior del elemento objetivo
      // (Asumiendo que el elemento está en la parte inferior de la pantalla)
      this.arrowPosition.set({
        top: rect.top - 8, // Ligeramente arriba del elemento
        left: rect.left + (rect.width / 2) - 8
      });
    }
  }
}
