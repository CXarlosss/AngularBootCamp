import {
  Component, Input, computed, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RankService, RANKS } from '../../../core/services/rank.service';
import { FrameDef, FRAME_DEFS, FrameId } from './avatar-frame.types';

@Component({
  selector: 'app-avatar-frame',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="avatar-frame-wrap"
      [class]="frameClass()"
      [style.width.px]="size"
      [style.height.px]="size">

      <!-- Marco especial activo (capa extra) -->
      @if (specialFrameDef()) {
        <div class="special-layer" [class]="specialFrameDef()!.cssClass + '-layer'">
          <span class="special-badge">{{ specialFrameDef()!.emoji }}</span>
        </div>
      }

      <!-- Avatar -->
      <div class="avatar-inner" [style.font-size.px]="size * 0.35">
        @if (avatarUrl) {
          <img [src]="avatarUrl" [alt]="initials" class="avatar-img" />
        } @else {
          <span class="avatar-initials">{{ initials }}</span>
        }
      </div>

      <!-- Badge de rango en esquina -->
      @if (showBadge) {
        <div class="rank-badge">{{ rankEmoji() }}</div>
      }
    </div>
  `,
  styleUrl: './avatar-frame.component.scss',
})
export class AvatarFrameComponent {
  @Input({ required: true }) initials!: string;
  @Input() avatarUrl: string | null = null;
  @Input() size = 48;
  @Input() showBadge = true;

  // Marco base por rango (automático)
  @Input() rankLevel = 0;

  // Marco especial equipado (elegido por el usuario)
  @Input() equippedSpecial: string | null = null;

  frameClass = computed(() => {
    const base = `frame-rank-${Math.min(this.rankLevel, 5)}`;
    return `avatar-frame ${base}`;
  });

  specialFrameDef = computed((): FrameDef | null => {
    if (!this.equippedSpecial || this.equippedSpecial === 'rank') return null;
    return FRAME_DEFS.find(f => f.id === this.equippedSpecial) ?? null;
  });

  rankEmoji = computed(() => {
    return RANKS[Math.min(this.rankLevel, RANKS.length - 1)]?.emoji ?? '⚔️';
  });
}
