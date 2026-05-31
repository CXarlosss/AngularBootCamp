import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-photo-comparison',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[60] bg-black flex flex-col">
      <!-- Header del lightbox -->
      <div class="flex justify-between items-center p-4 text-white">
        <div>
          <p class="text-xs text-white/70 uppercase tracking-wider font-semibold">Comparación</p>
          <p class="font-bold text-sm mt-0.5">{{ beforeDate() | date:'dd MMM yyyy' }} <span class="text-blue-400 mx-1">→</span> {{ afterDate() | date:'dd MMM yyyy' }}</p>
        </div>
        <button (click)="close.emit()" class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- Área comparativa -->
      <div class="flex-1 relative overflow-hidden bg-black/90" (touchstart)="onTouchStart($event)" (touchmove)="onTouchMove($event)">
        <!-- Imagen AFTER (fondo, completa) -->
        <img [src]="afterUrl()" class="absolute inset-0 w-full h-full object-contain" alt="Después" (error)="onError('after')" />
        
        <!-- Imagen BEFORE (recortada por slider) -->
        <div class="absolute inset-0 overflow-hidden" [style.width.%]="sliderPosition()">
          <!-- Se usa width en viewport maximo para que la imagen de fondo no se comprima al reducir el wrapper -->
          <img [src]="beforeUrl()" class="absolute inset-0 h-full object-contain max-w-none" [style.width.px]="containerWidth()" alt="Antes" (error)="onError('before')" />
        </div>
        
        <!-- Slider control -->
        <div 
          class="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize touch-none z-10"
          [style.left.%]="sliderPosition()"
        >
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-black text-xs font-bold ring-4 ring-white/20">
            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l-4 4 4 4m8-8l4 4-4 4"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Footer táctil -->
      <div class="p-5 text-center text-white/60 text-sm font-medium tracking-wide">
        Desliza para comparar
      </div>
    </div>
  `
})
export class PhotoComparisonComponent {
  beforeUrl = input.required<string>();
  afterUrl = input.required<string>();
  beforeDate = input.required<string>();
  afterDate = input.required<string>();
  
  close = output<void>();
  reloadUrl = output<'before' | 'after'>(); // Para cuando expira la URL
  
  sliderPosition = signal(50); // 0-100%
  containerWidth = signal(window.innerWidth);
  
  private touchStartX = 0;
  private startSlider = 50;
  
  constructor() {
    window.addEventListener('resize', () => {
      this.containerWidth.set(window.innerWidth);
    });
  }
  
  onTouchStart(e: TouchEvent) {
    this.touchStartX = e.touches[0].clientX;
    this.startSlider = this.sliderPosition();
  }
  
  onTouchMove(e: TouchEvent) {
    const container = (e.target as HTMLElement).closest('.relative');
    if (!container) return;
    
    const width = container.clientWidth;
    const deltaX = e.touches[0].clientX - this.touchStartX;
    const deltaPercent = (deltaX / width) * 100;
    
    // Clamp entre 5% y 95% para que no desaparezca el handle
    const newPos = Math.max(5, Math.min(95, this.startSlider + deltaPercent));
    this.sliderPosition.set(newPos);
  }
  
  onError(type: 'before' | 'after') {
    // Si la URL caduca, se lanza un error en el img, el componente padre (client-progress) 
    // debe encargarse de hacer un re-fetch a ProgressPhotoService.getSignedUrl
    console.warn(`[PhotoComparison] URL expirada o error de carga para: ${type}`);
    this.reloadUrl.emit(type);
  }
}
