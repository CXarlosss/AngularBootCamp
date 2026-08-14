import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../profile.service';
import { RankService } from '../../../../core/services/rank.service';
import { getFrameById } from '../frame-catalog';
import { BANNER_COLORS, BANNER_PATTERNS } from './banner.types';

@Component({
  selector: 'app-profile-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="profile-banner" 
      [class]="sizeClass()"
      [style.background]="bannerGradient()"
      [style.--banner-glow]="glowColor()"
    >
      <!-- Capa de brillo premium animada -->
      <div class="banner-shine"></div>

      <!-- Capa de textura -->
      @if (patternClass()) {
        <div class="banner-pattern" [class]="patternClass()"></div>
      }

      <!-- Gradiente oscuro inferior para legibilidad -->
      <div class="banner-overlay"></div>

      <div class="banner-content">
        <!-- Avatar con soporte de marcos premium animados -->
        <div 
          class="avatar-container"
          [style.width.px]="avatarSize()"
          [style.height.px]="avatarSize()"
        >
          <div 
            class="avatar-frame-wrapper" 
            [class]="frameClass()"
            [class.frame-lg]="size() !== 'sm'"
          >
            @if (avatarUrl() && !imgError()) {
              <img [src]="avatarUrl()" alt="Profile photo" (error)="imgError.set(true)" />
            } @else {
              <div class="avatar-placeholder" [style.font-size.px]="placeholderFontSize()">
                {{ initials() }}
              </div>
            }
          </div>
        </div>

        <!-- Información del atleta -->
        <div class="athlete-info">
          <h2 class="display-name">{{ name() }}</h2>
          @if (size() !== 'sm') {
            <div class="rank-badge" 
                 [style.border-color]="rankColor() + '40'" 
                 [style.background]="'linear-gradient(135deg, ' + rankColor() + '1e, rgba(255,255,255,0.03))'">
              <span class="rank-emoji">{{ rankEmoji() }}</span>
              <span class="rank-name">{{ rankName() }} {{ division() }}</span>
              <span class="rank-level" [style.border-left-color]="rankColor() + '30'">Nivel {{ rankLevel() }}</span>
            </div>
            @if (bio()) {
              <p class="bio">{{ bio() }}</p>
            }
            @if (goal()) {
              <p class="banner-goal">{{ goalEmoji() }} {{ goal() }}</p>
            }
          }
        </div>

        <!-- XP total solo en tamaño lg -->
        @if (size() === 'lg' && xp()) {
          <div class="xp-badge" [style.border-color]="rankColor() + '30'">
            <span class="xp-label">EXPERIENCIA</span>
            <span class="xp-num" [style.color]="rankColor()">{{ xp() | number }} XP</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .profile-banner {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      color: #fff;
      display: flex;
      align-items: center;
      padding: 16px 20px;
      min-height: 100px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px var(--banner-glow, transparent);
      backdrop-filter: blur(10px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .profile-banner::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1px;
      background: linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.02));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }

    .profile-banner.sm  { padding: 8px 12px; min-height: 60px; border-radius: 12px; }
    .profile-banner.md  { padding: 14px 18px; min-height: 95px; border-radius: 16px; }
    .profile-banner.lg  {
      padding: 24px; min-height: 145px;
      flex-direction: column; align-items: flex-start; justify-content: flex-end;
      gap: 12px; border-radius: 24px;
    }

    @keyframes shine {
      0% { transform: translateX(-150%) skewX(-15deg); }
      50% { transform: translateX(150%) skewX(-15deg); }
      100% { transform: translateX(150%) skewX(-15deg); }
    }

    .banner-shine {
      position: absolute;
      top: 0; left: 0; width: 50%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
      transform: translateX(-150%) skewX(-15deg);
      animation: shine 8s ease-in-out infinite;
      z-index: 2;
      pointer-events: none;
    }

    .banner-pattern {
      position: absolute; inset: 0;
      opacity: 0.22;
      pointer-events: none;
      z-index: 1;
    }

    .banner-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,.7) 0%, rgba(0,0,0,.2) 65%, transparent 100%);
      z-index: 2;
      pointer-events: none;
    }

    .banner-content {
      position: relative; z-index: 3;
      display: flex; align-items: center; gap: 18px; width: 100%;
    }

    .profile-banner.lg .banner-content {
      flex-direction: row; align-items: flex-end; justify-content: space-between;
    }

    .avatar-container {
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; position: relative; z-index: 4;
    }

    .avatar-frame-wrapper { width: 100%; height: 100%; position: relative; }
    .avatar-frame-wrapper img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }

    .avatar-placeholder {
      width: 100%; height: 100%;
      background: linear-gradient(135deg, rgba(255,255,255,.12), rgba(255,255,255,.03));
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 700; border-radius: 50%;
      border: 1px solid rgba(255,255,255,.15);
      box-shadow: inset 0 2px 4px rgba(0,0,0,.25);
    }

    .athlete-info { flex: 1; min-width: 0; }

    .display-name {
      font-size: 20px; font-weight: 800; margin: 0;
      text-shadow: 0 2px 8px rgba(0,0,0,.6);
      letter-spacing: -0.02em;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .profile-banner.sm .display-name { font-size: 14px; }

    .rank-badge {
      display: inline-flex; align-items: center; gap: 6px;
      margin: 6px 0 0; font-size: 11px; font-weight: 700;
      color: rgba(255,255,255,.9);
      border: 1px solid rgba(255,255,255,.08);
      padding: 3px 10px; border-radius: 12px; backdrop-filter: blur(8px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    .rank-emoji {
      font-size: 12px;
    }

    .rank-level {
      opacity: .8; border-left: 1px solid rgba(255,255,255,.2); padding-left: 6px;
    }

    .bio {
      margin: 8px 0 0; font-size: 11px; color: rgba(255,255,255,.75);
      line-height: 1.4; max-width: 340px;
      display: -webkit-box; -webkit-line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden;
      text-shadow: 0 1px 3px rgba(0,0,0,.5);
    }

    .banner-goal {
      font-size: 11px; color: rgba(255,255,255,.8); margin: 6px 0 0;
      display: flex; align-items: center; gap: 4px;
      text-shadow: 0 1px 3px rgba(0,0,0,.5);
    }

    .xp-badge {
      display: flex; flex-direction: column; align-items: flex-end;
      background: rgba(0, 0, 0, 0.45); border: 1px solid rgba(255,255,255,.08);
      padding: 6px 12px; border-radius: 14px; backdrop-filter: blur(8px);
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .xp-label { font-size: 8px; font-weight: 700; color: rgba(255,255,255,.55); letter-spacing: 1px; }
    .xp-num   { font-size: 13px; font-weight: 800; }

    /* ── Patrones ─────────────────────────────────────────────────────────── */

    /* Gratuitos */
    .pat-solid { /* solo color */ }

    .pat-marble {
      background-image: repeating-linear-gradient(
        45deg, rgba(255,255,255,.06) 0px, rgba(255,255,255,.06) 1px,
        transparent 1px, transparent 10px
      );
    }

    .pat-stone {
      background-image:
        repeating-linear-gradient(0deg,  rgba(0,0,0,.08) 0px, rgba(0,0,0,.08) 1px, transparent 1px, transparent 6px),
        repeating-linear-gradient(90deg, rgba(0,0,0,.08) 0px, rgba(0,0,0,.08) 1px, transparent 1px, transparent 6px);
    }

    .pat-waves {
      background-image: repeating-linear-gradient(
        -45deg, transparent, transparent 5px,
        rgba(255,255,255,.1) 5px, rgba(255,255,255,.1) 6px
      );
    }

    .pat-dots {
      background-image: radial-gradient(circle, rgba(255,255,255,.2) 1.5px, transparent 1.5px);
      background-size: 10px 10px;
    }

    /* Nivel 1 */
    .pat-stars {
      background-image: radial-gradient(circle, rgba(255,255,255,.25) 1px, transparent 1px);
      background-size: 16px 16px;
    }

    .pat-diag {
      background-image: repeating-linear-gradient(
        60deg, rgba(255,255,255,.08) 0px, rgba(255,255,255,.08) 1px,
        transparent 1px, transparent 12px
      );
    }

    /* Nivel 2 */
    .pat-bigdots {
      background-image: radial-gradient(circle, rgba(255,255,255,.18) 3px, transparent 3px);
      background-size: 18px 18px;
    }

    .pat-diamond {
      background-image:
        repeating-linear-gradient(45deg,  rgba(255,255,255,.06) 0px, rgba(255,255,255,.06) 1px, transparent 1px, transparent 14px),
        repeating-linear-gradient(-45deg, rgba(255,255,255,.06) 0px, rgba(255,255,255,.06) 1px, transparent 1px, transparent 14px);
    }

    /* Nivel 3 */
    .pat-fire {
      background-image:
        radial-gradient(ellipse at 20% 100%, rgba(255,80,0,.45)  0%, transparent 45%),
        radial-gradient(ellipse at 80% 100%, rgba(220,38,38,.45) 0%, transparent 45%),
        radial-gradient(ellipse at 50% 70%,  rgba(255,150,0,.2)  0%, transparent 35%);
    }

    .pat-hex {
      background-image:
        linear-gradient(120deg, rgba(255,255,255,.06) 25%, transparent 25%),
        linear-gradient(60deg,  rgba(255,255,255,.06) 25%, transparent 25%);
      background-size: 16px 27px;
    }

    .pat-sinewave {
      background-image:
        repeating-linear-gradient(
          -30deg, transparent, transparent 8px,
          rgba(255,255,255,.08) 8px, rgba(255,255,255,.08) 9px,
          transparent 9px, transparent 18px
        ),
        repeating-linear-gradient(
          30deg, transparent, transparent 8px,
          rgba(255,255,255,.05) 8px, rgba(255,255,255,.05) 9px,
          transparent 9px, transparent 18px
        );
    }

    /* XP alto / Zeus */
    .pat-cross {
      background:
        radial-gradient(circle, transparent 20%, rgba(0,0,0,.15) 20%, rgba(0,0,0,.15) 80%, transparent 80%) 0 0,
        radial-gradient(circle, transparent 20%, rgba(0,0,0,.15) 20%, rgba(0,0,0,.15) 80%, transparent 80%) 25px 25px,
        linear-gradient(rgba(255,255,255,.04) 2px, transparent 2px) 0 -1px,
        linear-gradient(90deg, rgba(255,255,255,.04) 2px, transparent 2px) -1px 0;
      background-size: 50px 50px, 50px 50px, 25px 25px, 25px 25px;
    }

    .pat-circuit {
      background-image:
        repeating-linear-gradient(0deg,  rgba(29,158,117,.12) 0px, rgba(29,158,117,.12) 1px, transparent 1px, transparent 20px),
        repeating-linear-gradient(90deg, rgba(29,158,117,.12) 0px, rgba(29,158,117,.12) 1px, transparent 1px, transparent 20px);
    }

    .pat-olympus {
      background-image: repeating-linear-gradient(
        135deg, rgba(255,215,0,.1) 0px, rgba(255,215,0,.1) 1px,
        transparent 1px, transparent 14px
      );
    }
  `]
})
export class ProfileBannerComponent {
  private profileSvc = inject(ProfileService);
  private rankSvc = inject(RankService);

  useCurrentUser = input<boolean>(false);
  profileData    = input<any>(null);
  size           = input<'sm' | 'md' | 'lg'>('md');

  // Inputs individuales clásicos (retrocompatibles)
  nameInput          = input<string | null>(null, { alias: 'name' });
  initialsInput      = input<string | null>(null, { alias: 'initials' });
  rankLevelInput     = input<number | null>(null, { alias: 'rankLevel' });
  rankNameInput      = input<string | null>(null, { alias: 'rankName' });
  rankEmojiInput     = input<string | null>(null, { alias: 'rankEmoji' });
  divLabelInput      = input<string | null>(null, { alias: 'divLabel' });
  xpTotalInput       = input<number | null>(null, { alias: 'xpTotal' });
  goalInput          = input<string | null>(null, { alias: 'goal' });
  goalEmojiInput     = input<string | null>(null, { alias: 'goalEmoji' });
  equippedFrameInput = input<string | null>(null, { alias: 'equippedFrame' });
  bannerColorInput   = input<string | null>(null, { alias: 'bannerColor' });
  bannerPatternInput = input<string | null>(null, { alias: 'bannerPattern' });
  glowColor          = input<string>('rgba(29,158,117,0.15)');

  resolvedProfile = computed(() => {
    if (this.useCurrentUser()) return this.profileSvc.profile();
    if (this.profileData())    return this.profileData();
    return null;
  });

  name = computed(() => this.resolvedProfile()?.full_name ?? this.nameInput() ?? 'Atleta');

  initials = computed(() => {
    if (this.initialsInput()) return this.initialsInput()!;
    return this.name().split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  });

  avatarUrl  = computed(() => this.resolvedProfile()?.avatar_url ?? null);
  imgError   = signal(false);

  athleteRank = computed(() => {
    const profile = this.resolvedProfile();
    
    // Si es el usuario actual, priorizar los datos en tiempo real de RankService
    if (this.useCurrentUser()) {
      const liveRank = this.rankSvc.athleteRank();
      if (liveRank) {
        return this.rankSvc.calcFullRank(liveRank.xpTotal);
      }
    }
    
    // Si no, calcular en base al XP del perfil provisto
    if (profile) {
      const xp = profile.xp ?? 0;
      return this.rankSvc.calcFullRank(xp);
    }
    
    // Si no hay perfil pero hay XP input
    const xpInput = this.xpTotalInput() ?? 0;
    return this.rankSvc.calcFullRank(xpInput);
  });

  rankLevel = computed(() => this.athleteRank()?.rank.level ?? this.rankLevelInput() ?? 0);
  rankName = computed(() => this.athleteRank()?.rank.name ?? this.rankNameInput() ?? 'Recruta');
  division = computed(() => this.athleteRank()?.divLabel ?? this.divLabelInput() ?? '');
  rankColor = computed(() => this.athleteRank()?.rank.color ?? '#3b82f6');
  rankEmoji = computed(() => this.athleteRank()?.rank.emoji ?? '⚔️');

  equippedFrame = computed(() => this.equippedFrameInput() ?? this.resolvedProfile()?.equipped_frame ?? 'none');

  bannerColor = computed(() =>
    this.bannerColorInput() ?? this.resolvedProfile()?.banner_color ?? 'c0'
  );

  bannerPattern = computed(() =>
    this.bannerPatternInput() ?? this.resolvedProfile()?.banner_pattern ?? 'p0'
  );

  xp = computed(() => {
    if (this.useCurrentUser()) {
      const liveRank = this.rankSvc.athleteRank();
      if (liveRank) return liveRank.xpTotal;
    }
    return this.resolvedProfile()?.xp ?? this.xpTotalInput() ?? 0;
  });

  bio      = computed(() => this.resolvedProfile()?.bio ?? null);
  goal     = computed(() => this.goalInput() ?? null);
  goalEmoji = computed(() => this.goalEmojiInput() ?? '');

  sizeClass         = computed(() => `profile-banner ${this.size()}`);
  avatarSize        = computed(() => ({ sm: 40, md: 52, lg: 68 }[this.size()]));
  placeholderFontSize = computed(() => ({ sm: 14, md: 18, lg: 22 }[this.size()]));

  bannerGradient = computed(() => {
    const color = BANNER_COLORS.find(c => c.id === this.bannerColor()) ?? BANNER_COLORS[0];
    return color.gradient;
  });

  patternClass = computed(() => {
    const pattern = BANNER_PATTERNS.find(p => p.id === this.bannerPattern());
    return pattern?.cssClass ?? '';
  });

  frameClass = computed(() => {
    const frame = getFrameById(this.equippedFrame());
    return frame.cssClass;
  });
}
