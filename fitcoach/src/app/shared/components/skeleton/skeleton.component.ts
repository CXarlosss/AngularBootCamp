import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

type SkeletonType = 'text' | 'title' | 'circle' | 'rect' | 'exercise-card';

@Component({
  selector: 'fc-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (type()) {
      @case ('exercise-card') {
        <div class="skeleton-exercise-card">
          <div class="skeleton-header">
            <div class="skeleton-indicator shimmer"></div>
            <div class="skeleton-meta">
              <div class="skeleton-title shimmer"></div>
              <div class="skeleton-subtitle shimmer"></div>
            </div>
            <div class="skeleton-badge shimmer"></div>
          </div>
          <div class="skeleton-logger shimmer"></div>
        </div>
      }
      @case ('circle') {
        <div class="skeleton-circle shimmer" [style.width.px]="size()" [style.height.px]="size()"></div>
      }
      @case ('rect') {
        <div class="skeleton-rect shimmer" [style.width]="width()" [style.height.px]="height()"></div>
      }
      @case ('title') {
        <div class="skeleton-text shimmer" [style.width]="width()" style="height: 16px; margin-bottom: 8px;"></div>
      }
      @default {
        <div class="skeleton-text shimmer" [style.width]="width()" [style.height.px]="height()"></div>
      }
    }
  `,
  styles: [`
    :host { display: block; width: 100%; }
    
    /* ── Base shimmer ── */
    .shimmer {
      position: relative;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 6px;
    }

    .shimmer::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.06) 50%,
        transparent 100%
      );
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.6s infinite ease-in-out;
    }

    @keyframes skeleton-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* ── Exercise card layout ── */
    .skeleton-exercise-card {
      background: #13161f;
      border: 0.5px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      padding: 14px;
      margin-bottom: 12px;
    }

    .skeleton-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .skeleton-indicator {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .skeleton-meta { flex: 1; }
    
    .skeleton-title {
      width: 60%;
      height: 15px;
      border-radius: 4px;
      margin-bottom: 6px;
    }

    .skeleton-subtitle {
      width: 40%;
      height: 12px;
      border-radius: 3px;
    }

    .skeleton-badge {
      width: 40px;
      height: 24px;
      border-radius: 6px;
    }

    .skeleton-logger {
      height: 80px;
      border-radius: 10px;
      background: rgba(255,255,255,0.02);
    }

    /* ── Generic shapes ── */
    .skeleton-circle { border-radius: 50%; }
    
    .skeleton-rect { border-radius: 8px; }
    
    .skeleton-text { border-radius: 4px; }
  `]
})
export class SkeletonComponent {
  type = input<SkeletonType>('text');
  width = input<string>('100%');
  height = input<number>(12);
  size = input<number>(40);
}
