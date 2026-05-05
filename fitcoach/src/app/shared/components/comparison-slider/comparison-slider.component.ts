// src/app/shared/components/comparison-slider/comparison-slider.component.ts

import { Component, ElementRef, ViewChild, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comparison-slider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cs-wrap" #wrap>
      <!-- El contenido "Después" va al fondo -->
      <div class="cs-after">
        <ng-content select="[after]"></ng-content>
      </div>

      <!-- El contenido "Antes" se recorta con clip-path -->
      <div class="cs-before" [style.clipPath]="clipPath()">
        <ng-content select="[before]"></ng-content>
      </div>

      <!-- El controlador central -->
      <div
        class="cs-handle"
        [style.left.%]="sliderPos()"
        (mousedown)="startDrag()"
        (touchstart)="startDrag()">
        <div class="cs-handle-btn">
          <span class="cs-arrow">←</span>
          <span class="cs-arrow">→</span>
        </div>
        <div class="cs-handle-line"></div>
      </div>
      
      <!-- Etiquetas opcionales -->
      <div class="cs-labels">
        <span class="cs-label-before" [style.opacity]="labelOpacity()">ANTES</span>
        <span class="cs-label-after" [style.opacity]="1 - labelOpacity()">DESPUÉS</span>
      </div>
    </div>
  `,
  styles: [`
    .cs-wrap {
      position: relative;
      width: 100%;
      height: 220px;
      border-radius: 20px;
      overflow: hidden;
      border: 0.5px solid var(--c-border);
      background: var(--c-bg);
      user-select: none;
      box-shadow: var(--c-shadow);
    }

    .cs-after, .cs-before {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cs-before {
      z-index: 2;
    }

    /* ===== HANDLE ===== */
    .cs-handle {
      position: absolute;
      top: 0; bottom: 0;
      width: 2px;
      background: var(--c-green);
      cursor: ew-resize;
      z-index: 10;
      transform: translateX(-50%);
      box-shadow: 0 0 15px var(--c-green-glow);
    }

    .cs-handle-btn {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 40px;
      height: 40px;
      background: var(--c-green);
      border: 3px solid var(--c-surface);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      transition: transform 0.2s;
    }

    .cs-handle:hover .cs-handle-btn {
      transform: translate(-50%, -50%) scale(1.1);
    }

    .cs-arrow {
      font-size: 14px;
      font-weight: 800;
      line-height: 1;
    }

    /* ===== LABELS ===== */
    .cs-labels {
      position: absolute;
      bottom: 12px;
      left: 12px;
      right: 12px;
      display: flex;
      justify-content: space-between;
      pointer-events: none;
      z-index: 11;
    }

    .cs-label-before, .cs-label-after {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      padding: 4px 10px;
      border-radius: 8px;
      color: white;
      border: 0.5px solid rgba(255,255,255,0.1);
    }
  `]
})
export class ComparisonSliderComponent implements OnInit, OnDestroy {
  @ViewChild('wrap') wrapRef!: ElementRef<HTMLDivElement>;
  
  sliderPos = signal(50);
  clipPath = signal('inset(0 50% 0 0)');
  labelOpacity = signal(0.8);
  private dragging = false;

  private moveHandler = (e: MouseEvent | TouchEvent) => this.handleMove(e);
  private endHandler = () => this.handleEnd();

  startDrag() {
    this.dragging = true;
  }

  handleMove(e: MouseEvent | TouchEvent) {
    if (!this.dragging) return;
    const rect = this.wrapRef.nativeElement.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    
    this.sliderPos.set(pct);
    this.clipPath.set(`inset(0 ${100 - pct}% 0 0)`);
    this.labelOpacity.set(pct > 20 ? 0.8 : 0);
  }

  handleEnd() {
    this.dragging = false;
  }

  ngOnInit() {
    window.addEventListener('mousemove', this.moveHandler);
    window.addEventListener('mouseup', this.endHandler);
    window.addEventListener('touchmove', this.moveHandler);
    window.addEventListener('touchend', this.endHandler);
  }

  ngOnDestroy() {
    window.removeEventListener('mousemove', this.moveHandler);
    window.removeEventListener('mouseup', this.endHandler);
    window.removeEventListener('touchmove', this.moveHandler);
    window.removeEventListener('touchend', this.endHandler);
  }
}
