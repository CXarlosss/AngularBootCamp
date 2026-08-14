import { Component, input, output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-collapsible-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white border-b border-gray-100 last:border-b-0">
      <button 
        (click)="toggle()"
        class="w-full px-4 py-4 flex items-center justify-between focus:outline-none hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center gap-2">
          <span class="font-semibold text-gray-800">{{ title() }}</span>
          @if (badge() !== undefined && badge() !== null) {
            <span class="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {{ badge() }}
            </span>
          }
        </div>
        <svg 
          class="w-5 h-5 text-gray-400 transition-transform duration-300"
          [class.rotate-180]="isOpen()"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      @if (isOpen()) {
        <div class="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <ng-content></ng-content>
        </div>
      }
    </div>
  `
})
export class CollapsibleSectionComponent {
  title = input.required<string>();
  badge = input<number | string | null>();
  sectionId = input.required<string>(); // Used for session storage key
  clientId = input.required<string>();
  forceOpen = input<boolean>(false);
  
  toggled = output<boolean>();

  isOpen = signal(false);

  constructor() {
    effect(() => {
      // Sync state on load, prioritize forceOpen if true
      if (this.forceOpen()) {
        this.isOpen.set(true);
        return;
      }

      const key = `fitcoach_accordion_${this.clientId()}_${this.sectionId()}`;
      const saved = sessionStorage.getItem(key);
      if (saved) {
        this.isOpen.set(saved === 'true');
      }
    }, { allowSignalWrites: true });
  }

  toggle() {
    const newState = !this.isOpen();
    this.isOpen.set(newState);
    
    const key = `fitcoach_accordion_${this.clientId()}_${this.sectionId()}`;
    sessionStorage.setItem(key, String(newState));
    
    this.toggled.emit(newState);
  }
}
