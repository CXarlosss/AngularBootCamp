import {
  Component, OnInit, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../../core/supabase.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { RankService } from '../../../../core/services/rank.service';
import { ProfileService } from '../profile.service';
import { ProfileBannerComponent } from '../profile-banner/profile-banner.component';
import {
  BANNER_COLORS, BANNER_PATTERNS,
  BannerColor, BannerPattern
} from '../profile-banner/banner.types';
import { ToastService } from '../../../../shared/services/toast/toast.service';
import { QuickActionsComponent, QuickFilter } from '../../../../shared/components/quick-actions/quick-actions.component';

@Component({
  selector: 'app-banner-selector',
  standalone: true,
  imports: [CommonModule, ProfileBannerComponent, QuickActionsComponent],
  template: `
    <div class="selector-screen">

      <header class="sel-header">
        <button class="back-btn" (click)="router.navigate([isCoach() ? '/coach/dashboard' : '/client/dashboard'])">←</button>
        <h1>
          Mi banner
          @if (isCoach()) {
            <span class="coach-badge">👑 Todo desbloqueado</span>
          }
        </h1>
        <button class="save-btn" (click)="save()" [disabled]="saving()">
          {{ saving() ? '...' : 'Guardar' }}
        </button>
      </header>

      <div class="selector-body">
        <!-- Preview -->
        <div class="preview-wrap">
          <app-profile-banner
            [name]="profileName()"
            [initials]="initials()"
            [rankLevel]="rankSvc.fullRank()?.rank?.level ?? 0"
            [rankName]="rankSvc.fullRank()?.rank?.name ?? 'Recruta'"
            [rankEmoji]="rankSvc.fullRank()?.rank?.emoji ?? '⚔️'"
            [divLabel]="rankSvc.fullRank()?.divLabel ?? 'IV'"
            [xpTotal]="rankSvc.athleteRank()?.xpTotal ?? 0"
            [bannerColor]="selectedColor()"
            [bannerPattern]="selectedPattern()"
            [equippedFrame]="auth.profile()?.equippedFrame ?? null" />
        </div>

        <!-- Colores -->
        <div class="section-header-flex">
          <p class="section-lbl">Personalizar</p>
        </div>
        
        <app-quick-actions
          (filterChange)="onFilterChange($event)"
          (random)="randomize()" />

        <p class="section-lbl" style="margin-top: 16px;">Colores</p>
        <div class="color-row">
          @for (c of filteredColors(); track c.id) {
            <div class="color-swatch"
              [class.on]="selectedColor() === c.id"
              [class.locked]="!isUnlocked(c.id)"
              [style.background]="c.gradient"
              (click)="isUnlocked(c.id) && selectColor(c.id)">
              
              @if (!isUnlocked(c.id)) {
                <span class="swatch-lock">🔒</span>
              } @else if (selectedColor() === c.id) {
                <span class="swatch-check">✓</span>
              }
              <span class="swatch-label">{{ c.label }}</span>
            </div>
          }
        </div>

        <p class="section-lbl">Patrones</p>
        <div class="pattern-row">
          @for (p of filteredPatterns(); track p.id) {
            <div class="pattern-card"
              [class.on]="selectedPattern() === p.id"
              [class.locked]="!isUnlocked(p.id)"
              (click)="isUnlocked(p.id) && selectPattern(p.id)">
              
              <div class="pat-preview" [class]="p.cssClass"
                [style.background]="previewStyle()">
              </div>
              <p class="pat-name">{{ p.label }}</p>

              @if (!isUnlocked(p.id)) {
                <div class="lock-overlay">
                  <span>🔒</span>
                </div>
              }
            </div>
          }
        </div>

        <!-- Por desbloquear (Colapsable) -->
        <button class="collapsible-header" (click)="isLockedOpen.set(!isLockedOpen())">
          <p class="section-lbl" style="margin: 0; padding: 0;">Por desbloquear</p>
          <span class="chevron" [class.open]="isLockedOpen()">▼</span>
        </button>

        @if (isLockedOpen()) {
          <div class="locked-list fade-in">
            @for (item of lockedItems(); track item.id) {
              <div class="locked-row">
                <div class="locked-preview" [style.background]="getGradient(item.id)"></div>
                <div class="locked-info">
                  <p class="locked-name">{{ item.label }}</p>
                  <p class="locked-req">{{ item.req }}</p>
                </div>
                <span class="locked-icon">🔒</span>
              </div>
            }
          </div>
        }
      </div>

    </div>
  `,
  styleUrl: './banner-selector.component.scss',
})
export class BannerSelectorComponent implements OnInit {
  readonly router   = inject(Router);
  private sb        = inject(SupabaseService).client;
  public auth      = inject(AuthService);
  public profileSvc = inject(ProfileService);
  readonly rankSvc  = inject(RankService);
  private toast     = inject(ToastService);

  profileName = signal('');
  initials    = signal('');
  unlockedIds = signal<string[]>(['c0','c1','c2','c8','c12','c13','p0','p1','p2','p6','p7']);

  selectedColor   = signal('c0');
  selectedPattern = signal('p0');
  saving          = signal(false);
  isLockedOpen    = signal(false);
  isCoach         = signal(false);
  activeFilter    = signal<QuickFilter>('all');

  readonly colors   = BANNER_COLORS;
  readonly patterns = BANNER_PATTERNS;

  filteredColors = computed(() => {
    const f = this.activeFilter();
    return BANNER_COLORS.filter(c => {
      if (f === 'unlocked') return this.isUnlocked(c.id);
      if (f === 'locked')   return !this.isUnlocked(c.id);
      return true;
    });
  });

  filteredPatterns = computed(() => {
    const f = this.activeFilter();
    return BANNER_PATTERNS.filter(p => {
      if (f === 'unlocked') return this.isUnlocked(p.id);
      if (f === 'locked')   return !this.isUnlocked(p.id);
      return true;
    });
  });

  async ngOnInit() {
    await this.rankSvc.load();
    const userId = this.auth.user()?.id;
    if (!userId) return;

    const { data } = await this.sb
      .from('profiles')
      .select('full_name, role, banner_color, banner_pattern, unlocked_banners')
      .eq('id', userId)
      .single();

    if (data) {
      this.isCoach.set(data.role === 'coach');
      this.profileName.set(data.full_name ?? '');
      this.initials.set(
        (data.full_name ?? '').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
      );
      this.selectedColor.set(data.banner_color ?? 'c0');
      this.selectedPattern.set(data.banner_pattern ?? 'p0');
      
      if (this.isCoach()) {
        // Coach ve TODO desbloqueado
        const allIds = [
          ...BANNER_COLORS.map(c => c.id),
          ...BANNER_PATTERNS.map(p => p.id),
        ];
        this.unlockedIds.set(allIds);
      } else {
        if (data.unlocked_banners?.length) {
          this.unlockedIds.set(data.unlocked_banners);
        }
        // Desbloquear automáticamente según rango
        this.autoUnlockByRank();
      }
    }
  }

  private autoUnlockByRank() {
    const level = this.rankSvc.fullRank()?.rank?.level ?? 0;
    const xp    = this.rankSvc.athleteRank()?.xpTotal ?? 0;
    const current = new Set(this.unlockedIds());

    [...BANNER_COLORS, ...BANNER_PATTERNS].forEach(item => {
      if (item.reqType === 'rank' && level >= item.reqValue) current.add(item.id);
      if (item.reqType === 'xp'   && xp >= item.reqValue)    current.add(item.id);
    });

    this.unlockedIds.set(Array.from(current));
  }

  isUnlocked(id: string): boolean {
    return this.unlockedIds().includes(id);
  }

  async selectColor(id: string) {
    this.selectedColor.set(id);
    await this.save();
  }

  async selectPattern(id: string) {
    this.selectedPattern.set(id);
    await this.save();
  }

  onFilterChange(f: QuickFilter) {
    this.activeFilter.set(f);
  }

  randomize() {
    const freeColors   = BANNER_COLORS.filter(c => this.isUnlocked(c.id));
    const freePatterns = BANNER_PATTERNS.filter(p => this.isUnlocked(p.id));

    const randColor   = freeColors[Math.floor(Math.random() * freeColors.length)];
    const randPattern = freePatterns[Math.floor(Math.random() * freePatterns.length)];

    this.selectedColor.set(randColor.id);
    this.selectedPattern.set(randPattern.id);
    this.toast.info('Combinación aleatoria', `${randColor.label} + ${randPattern.label}`);
    this.save();
  }

  previewStyle = computed(() => {
    const color = BANNER_COLORS.find(c => c.id === this.selectedColor());
    return color ? `background: ${color.gradient}` : '';
  });

  getGradient(id: string): string {
    return BANNER_COLORS.find(c => c.id === id)?.gradient ?? '#1a1a1a';
  }

  lockedItems = computed(() =>
    [...BANNER_COLORS, ...BANNER_PATTERNS].filter(i => !this.isUnlocked(i.id))
  );

  async save() {
    const userId = this.auth.user()?.id;
    if (!userId) return;

    this.saving.set(true);
    try {
      await this.sb
        .from('profiles')
        .update({
          banner_color:     this.selectedColor(),
          banner_pattern:   this.selectedPattern(),
          unlocked_banners: this.unlockedIds(),
        })
        .eq('id', userId);

      // Actualizar localmente para que se vea al volver
      await this.auth.loadProfile(userId);
      await this.profileSvc.load();
      
      this.toast.success('Banner guardado', 'Tu nuevo look ya está activo');
    } catch (e) {
      this.toast.error('Error al guardar', 'Inténtalo de nuevo');
    } finally {
      this.saving.set(false);
    }
  }
}
