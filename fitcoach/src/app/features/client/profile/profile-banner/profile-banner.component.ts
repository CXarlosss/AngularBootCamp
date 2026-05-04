import {
  Component, Input, computed, input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarFrameComponent } from '../../../../shared/components/avatar-frame/avatar-frame.component';
import { BANNER_COLORS, BANNER_PATTERNS } from './banner.types';

@Component({
  selector: 'app-profile-banner',
  standalone: true,
  imports: [CommonModule, AvatarFrameComponent],
  template: `
    <div class="banner" [style]="bannerStyle()">

      <!-- Capa de patrón -->
      <div class="banner-pattern" [class]="patternClass()"></div>

      <!-- Gradiente oscuro inferior para legibilidad -->
      <div class="banner-overlay"></div>

      <!-- Contenido -->
      <div class="banner-content">
        <app-avatar-frame
          [initials]="initials()"
          [rankLevel]="rankLevel()"
          [equippedSpecial]="equippedFrame()"
          [size]="52"
          [showBadge]="true" />

        <div class="banner-info">
          <h2 class="banner-name">{{ name() }}</h2>
          <p class="banner-meta">
            {{ rankEmoji() }} {{ rankName() }}
            @if (divLabel()) { <span class="div-label">{{ divLabel() }}</span> }
          </p>
          @if (goal()) {
            <p class="banner-goal">{{ goalEmoji() }} {{ goal() }}</p>
          }
        </div>

        <div class="banner-xp">{{ xpTotal() | number }} XP</div>
      </div>
    </div>
  `,
  styleUrl: './profile-banner.component.scss',
})
export class ProfileBannerComponent {
  name          = input.required<string>();
  initials      = input.required<string>();
  rankLevel     = input(0);
  rankName      = input('Recruta');
  rankEmoji     = input('⚔️');
  divLabel      = input('IV');
  xpTotal       = input(0);
  goal          = input<string | null>(null);
  goalEmoji     = input('');
  equippedFrame = input<string | null>(null);
  bannerColor   = input('c0');
  bannerPattern = input('p0');

  bannerStyle = computed(() => {
    const color = BANNER_COLORS.find(c => c.id === this.bannerColor())
      ?? BANNER_COLORS[0];
    return `background: ${color.gradient}`;
  });

  patternClass = computed(() => {
    const pattern = BANNER_PATTERNS.find(p => p.id === this.bannerPattern())
      ?? BANNER_PATTERNS[0];
    return `banner-pattern ${pattern.cssClass}`;
  });
}
