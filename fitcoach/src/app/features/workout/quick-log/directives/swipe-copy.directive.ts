import { Directive, ElementRef, output, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appSwipeCopy]',
  standalone: true
})
export class SwipeCopyDirective implements OnInit, OnDestroy {
  readonly onSwipeRight = output<void>();
  
  private startX = 0;
  private startY = 0;
  private readonly THRESHOLD = 80; // px mínimos para considerar swipe
  private readonly MAX_VERTICAL = 50; // px máximos verticales (evitar scroll accidental)

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    const element = this.el.nativeElement;
    element.addEventListener('touchstart', this.onTouchStart, { passive: true });
    element.addEventListener('touchmove', this.onTouchMove, { passive: true });
    element.addEventListener('touchend', this.onTouchEnd, { passive: true });
  }

  ngOnDestroy(): void {
    const element = this.el.nativeElement;
    element.removeEventListener('touchstart', this.onTouchStart);
    element.removeEventListener('touchmove', this.onTouchMove);
    element.removeEventListener('touchend', this.onTouchEnd);
  }

  private onTouchStart = (e: TouchEvent) => {
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
  };

  private onTouchMove = (e: TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - this.startX;
    
    // Solo mover si es hacia la derecha y no es un scroll vertical dominante
    if (deltaX > 20 && deltaX < this.THRESHOLD) {
      this.el.nativeElement.style.transform = `translateX(${deltaX * 0.3}px)`;
      this.el.nativeElement.style.transition = 'none';
    }
  };

  private onTouchEnd = (e: TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    
    const deltaX = endX - this.startX;
    const deltaY = Math.abs(endY - this.startY);
    
    // Reset visual con transición suave
    this.el.nativeElement.style.transform = '';
    this.el.nativeElement.style.transition = 'transform 0.2s ease';
    
    // Swipe derecho válido
    if (deltaX > this.THRESHOLD && deltaY < this.MAX_VERTICAL) {
      // Feedback háptico si disponible
      if (navigator.vibrate) navigator.vibrate(50);
      this.onSwipeRight.emit();
    }
  };
}
