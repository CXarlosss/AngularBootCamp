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

@Component({
  selector: 'app-banner-selector',
  standalone: true,
  imports: [CommonModule, ProfileBannerComponent],
  template: `
    <div class="selector-screen">

      <header class="sel-header">
        <button class="back-btn" (click)="router.navigate([isCoach() ? '/coach/dashboard' : '/client/dashboard'])">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1>
          Personalizar Banner
          @if (isCoach()) {
            <span class="coach-badge">👑 Coach (Desbloqueado)</span>
          }
        </h1>
        <button class="save-btn" (click)="save()" [disabled]="!canSave()">
          {{ saving() ? 'Guardando...' : canSave() ? 'Guardar Cambios' : 'Guardado ✓' }}
        </button>
      </header>

      <div class="selector-body">

        <!-- Vista previa en tiempo real -->
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

          @if (isDirty() && !isColorLocked() && !isPatternLocked()) {
            <div class="preview-badge highlight">
              <span class="preview-dot gold"></span>
              Cambios sin guardar — pulsa Guardar
            </div>
          } @else if (isColorLocked() || isPatternLocked()) {
            <div class="preview-badge locked-warning">
              <span class="preview-dot red"></span>
              Vista previa (Bloqueado)
            </div>
          }
        </div>

        <!-- Sección de Colores -->
        <div class="section-container">
          <div class="section-header-row">
            <p class="section-lbl">Colores del Banner</p>
            <div class="category-tabs mini">
              @for (cat of colorCategories; track cat.id) {
                <button 
                  class="tab-pill" 
                  [class.active]="activeColorCategory() === cat.id"
                  (click)="activeColorCategory.set(cat.id)"
                >
                  {{ cat.label }}
                </button>
              }
            </div>
          </div>

          <div class="color-row">
            @for (c of filteredColors(); track c.id) {
              <button
                class="color-swatch"
                [class.on]="selectedColor() === c.id"
                [class.locked]="!isUnlocked(c.id)"
                [style.background]="c.gradient"
                [title]="c.label + (!isUnlocked(c.id) ? ' — 🔒 ' + c.req : '')"
                (click)="selectColor(c.id)">

                @if (!isUnlocked(c.id)) {
                  <span class="swatch-lock">🔒</span>
                } @else if (selectedColor() === c.id) {
                  <span class="swatch-check">✓</span>
                }
              </button>
            }
          </div>

          <p class="selected-hint">
            <span>Color: <strong>{{ selectedColorLabel() }}</strong></span>
            @if (isColorLocked()) {
              <span class="locked-indicator">🔒 Bloqueado ({{ selectedColorItem()?.req }})</span>
            }
          </p>
        </div>

        <!-- Sección de Texturas -->
        <div class="section-container">
          <div class="section-header-row">
            <p class="section-lbl">Texturas de Fondo</p>
            <div class="category-tabs mini">
              @for (cat of patternCategories; track cat.id) {
                <button 
                  class="tab-pill" 
                  [class.active]="activePatternCategory() === cat.id"
                  (click)="activePatternCategory.set(cat.id)"
                >
                  {{ cat.label }}
                </button>
              }
            </div>
          </div>

          <div class="pattern-row">
            @for (p of filteredPatterns(); track p.id) {
              <button
                class="pattern-card"
                [class.on]="selectedPattern() === p.id"
                [class.locked]="!isUnlocked(p.id)"
                [title]="p.label + (!isUnlocked(p.id) ? ' — 🔒 ' + p.req : '')"
                (click)="selectPattern(p.id)">

                <div class="pat-preview"
                  [class]="p.cssClass"
                  [style.background]="previewBg()">
                </div>

                @if (!isUnlocked(p.id)) {
                  <div class="lock-overlay"><span>🔒</span></div>
                } @else if (selectedPattern() === p.id) {
                  <div class="active-overlay"><span>✓</span></div>
                }
              </button>
            }
          </div>

          <p class="selected-hint">
            <span>Textura: <strong>{{ selectedPatternLabel() }}</strong></span>
            @if (isPatternLocked()) {
              <span class="locked-indicator">🔒 Bloqueado ({{ selectedPatternItem()?.req }})</span>
            }
          </p>
        </div>

        <!-- Panel de Requisitos de Bloqueo si aplica -->
        @if (isColorLocked() || isPatternLocked()) {
          <div class="lock-detail-panel fade-in">
            <div class="lock-card-header">
              <span class="lock-badge-icon">🔒</span>
              <div class="lock-header-text">
                <h3>Elemento Bloqueado</h3>
                <p>Equipa elementos desbloqueados para poder guardar tus cambios.</p>
              </div>
            </div>

            <div class="lock-items-list">
              @if (isColorLocked()) {
                @if (selectedColorItem(); as c) {
                  <div class="lock-item-progress">
                    <div class="lock-item-info">
                      <span class="lock-item-name">🎨 Color: {{ c.label }}</span>
                      <span class="lock-item-requirement">Requisito: {{ c.req }}</span>
                    </div>
                    <div class="progress-container">
                      <div class="progress-bar-track">
                        <div class="progress-bar-fill" [style.width.%]="getProgressPercent(c)"></div>
                      </div>
                      <span class="progress-percentage-text">{{ getProgressPercent(c) }}%</span>
                    </div>
                  </div>
                }
              }

              @if (isPatternLocked()) {
                @if (selectedPatternItem(); as p) {
                  <div class="lock-item-progress">
                    <div class="lock-item-info">
                      <span class="lock-item-name">💎 Textura: {{ p.label }}</span>
                      <span class="lock-item-requirement">Requisito: {{ p.req }}</span>
                    </div>
                    <div class="progress-container">
                      <div class="progress-bar-track">
                        <div class="progress-bar-fill" [style.width.%]="getProgressPercent(p)"></div>
                      </div>
                      <span class="progress-percentage-text">{{ getProgressPercent(p) }}%</span>
                    </div>
                  </div>
                }
              }
            </div>
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
  public  auth      = inject(AuthService);
  public  profileSvc = inject(ProfileService);
  readonly rankSvc  = inject(RankService);

  profileName = signal('');
  initials    = signal('');
  unlockedIds = signal<string[]>(['c0','c1','c2','c8','c12','c13','p0','p1','p2','p6','p7']);

  // Estado actual guardado en BD
  savedColor   = signal('c0');
  savedPattern = signal('p0');

  // Estado en preview (puede diferir del guardado, incluye bloqueados para previsualización)
  selectedColor   = signal('c0');
  selectedPattern = signal('p0');

  saving      = signal(false);
  isLockedOpen = signal(false);
  isCoach     = signal(false);

  // Categorías de filtro
  activeColorCategory = signal<string>('all');
  colorCategories = [
    { id: 'all', label: 'Todos' },
    { id: 'free', label: 'Básicos' },
    { id: 'neon', label: 'Neón' },
    { id: 'rank', label: 'Rango' },
    { id: 'xp', label: 'Especiales XP' }
  ];

  activePatternCategory = signal<string>('all');
  patternCategories = [
    { id: 'all', label: 'Todos' },
    { id: 'free', label: 'Básicos' },
    { id: 'special', label: 'Especiales' }
  ];

  readonly colors   = BANNER_COLORS;
  readonly patterns = BANNER_PATTERNS;

  // Reactivos para previsualización bloqueada
  selectedColorItem = computed(() => BANNER_COLORS.find(c => c.id === this.selectedColor()));
  selectedPatternItem = computed(() => BANNER_PATTERNS.find(p => p.id === this.selectedPattern()));

  isColorLocked = computed(() => !this.isUnlocked(this.selectedColor()));
  isPatternLocked = computed(() => !this.isUnlocked(this.selectedPattern()));

  // Detecta si hay cambios sin guardar
  isDirty = computed(() =>
    this.selectedColor() !== this.savedColor() ||
    this.selectedPattern() !== this.savedPattern()
  );

  canSave = computed(() => 
    this.isDirty() && 
    !this.isColorLocked() && 
    !this.isPatternLocked() && 
    !this.saving()
  );

  selectedColorLabel = computed(() =>
    BANNER_COLORS.find(c => c.id === this.selectedColor())?.label ?? ''
  );

  selectedPatternLabel = computed(() =>
    BANNER_PATTERNS.find(p => p.id === this.selectedPattern())?.label ?? ''
  );

  previewBg = computed(() => {
    const color = BANNER_COLORS.find(c => c.id === this.selectedColor());
    return color?.gradient ?? '';
  });

  filteredColors = computed(() => {
    const cat = this.activeColorCategory();
    if (cat === 'all') return BANNER_COLORS;
    if (cat === 'free') return BANNER_COLORS.filter(c => c.reqType === 'free');
    if (cat === 'neon') return BANNER_COLORS.filter(c => c.id.startsWith('cn') || c.id === 'c7' || c.id.includes('supernova') || c.id.includes('cyberpunk'));
    if (cat === 'rank') return BANNER_COLORS.filter(c => c.reqType === 'rank' && !c.id.startsWith('cn') && !c.id.includes('cyberpunk') && !c.id.includes('quantum') && !c.id.includes('hyperdrive'));
    if (cat === 'xp') return BANNER_COLORS.filter(c => c.reqType === 'xp' && c.id !== 'c7' || c.id.includes('matrix'));
    return BANNER_COLORS;
  });

  filteredPatterns = computed(() => {
    const cat = this.activePatternCategory();
    if (cat === 'all') return BANNER_PATTERNS;
    if (cat === 'free') return BANNER_PATTERNS.filter(p => p.reqType === 'free');
    if (cat === 'special') return BANNER_PATTERNS.filter(p => p.reqType !== 'free');
    return BANNER_PATTERNS;
  });

  lockedItems = computed(() =>
    [...BANNER_COLORS, ...BANNER_PATTERNS].filter(i => !this.isUnlocked(i.id))
  );

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

      const color   = data.banner_color   ?? 'c0';
      const pattern = data.banner_pattern ?? 'p0';

      this.savedColor.set(color);
      this.savedPattern.set(pattern);
      this.selectedColor.set(color);
      this.selectedPattern.set(pattern);

      if (this.isCoach()) {
        const allIds = [
          ...BANNER_COLORS.map(c => c.id),
          ...BANNER_PATTERNS.map(p => p.id),
        ];
        this.unlockedIds.set(allIds);
      } else {
        if (data.unlocked_banners?.length) {
          this.unlockedIds.set(data.unlocked_banners);
        }
        this.autoUnlockByRank();
      }
    }
  }

  private autoUnlockByRank() {
    const level   = this.rankSvc.fullRank()?.rank?.level ?? 0;
    const xp      = this.rankSvc.athleteRank()?.xpTotal  ?? 0;
    const current = new Set(this.unlockedIds());

    [...BANNER_COLORS, ...BANNER_PATTERNS].forEach(item => {
      if (item.reqType === 'rank' && level >= item.reqValue) current.add(item.id);
      if (item.reqType === 'xp'   && xp   >= item.reqValue) current.add(item.id);
    });

    this.unlockedIds.set(Array.from(current));
  }

  isUnlocked(id: string): boolean {
    return this.unlockedIds().includes(id);
  }

  getProgressPercent(item: any): number {
    if (!item) return 0;
    if (item.reqType === 'free') return 100;
    
    if (item.reqType === 'xp') {
      const xp = this.rankSvc.athleteRank()?.xpTotal ?? 0;
      return Math.min(100, Math.round((xp / item.reqValue) * 100));
    } else if (item.reqType === 'rank') {
      const currentLevel = this.rankSvc.fullRank()?.rank?.level ?? 0;
      return Math.min(100, Math.round((currentLevel / item.reqValue) * 100));
    }
    return 0;
  }

  selectColor(id: string) {
    this.selectedColor.set(id);
  }

  selectPattern(id: string) {
    this.selectedPattern.set(id);
  }

  getGradient(id: string): string {
    return BANNER_COLORS.find(c => c.id === id)?.gradient ?? '#1a1a1a';
  }

  getPatternClass(id: string): string {
    return BANNER_PATTERNS.find(p => p.id === id)?.cssClass ?? '';
  }

  async save() {
    const userId = this.auth.user()?.id;
    if (!userId || !this.canSave()) return;

    this.saving.set(true);

    await this.sb
      .from('profiles')
      .update({
        banner_color:     this.selectedColor(),
        banner_pattern:   this.selectedPattern(),
        unlocked_banners: this.unlockedIds(),
      })
      .eq('id', userId);

    // Marcar como guardado
    this.savedColor.set(this.selectedColor());
    this.savedPattern.set(this.selectedPattern());

    await this.auth.loadProfile(userId);
    await this.profileSvc.load();

    this.saving.set(false);
  }
}
