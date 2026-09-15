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
        <button class="save-btn" 
          [class.saving]="saving()"
          [class.saved]="saveSuccess()"
          (click)="saveWithCelebration()" 
          [disabled]="!canSave()">
          {{ saving() ? 'Guardando...' : canSave() ? 'Guardar Cambios' : 'Guardado ✓' }}
        </button>
      </header>

      <div class="selector-body">

        <!-- Vista previa en tiempo real -->
        <div class="preview-wrap">
          <app-profile-banner
            [class.equipping]="previewFlash()"
            [name]="profileName()"
            [initials]="initials()"
            [rankLevel]="rankSvc.fullRank()?.rank?.level ?? 0"
            [rankName]="rankSvc.fullRank()?.rank?.name ?? 'Recruta'"
            [rankEmoji]="rankSvc.fullRank()?.rank?.emoji ?? '⚔️'"
            [divLabel]="rankSvc.fullRank()?.divLabel ?? 'IV'"
            [xpTotal]="rankSvc.athleteRank()?.xpTotal ?? 0"
            [bannerColor]="selectedColor()"
            [bannerPattern]="selectedPattern()"
            [glowColor]="previewGlow()"
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
            @for (c of filteredColors(); track c.id; let idx = $index) {
              <button
                class="color-swatch"
                [class.on]="selectedColor() === c.id"
                [class.locked]="!isUnlocked(c.id)"
                [style.background]="c.gradient"
                [style.--swatch-glow]="c.gradient"
                [style.animation-delay]="getStaggerDelay(idx)"
                [title]="c.label + (!isUnlocked(c.id) ? ' — 🔒 ' + c.req : '')"
                (click)="selectColorEnhanced(c.id, $event)">

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
            @for (p of filteredPatterns(); track p.id; let idx = $index) {
              <button
                class="pattern-card"
                [class.on]="selectedPattern() === p.id"
                [class.locked]="!isUnlocked(p.id)"
                [style.animation-delay]="getStaggerDelay(idx)"
                [title]="p.label + (!isUnlocked(p.id) ? ' — 🔒 ' + p.req : '')"
                (click)="selectPatternEnhanced(p.id, $event)">

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
  unlockedIds = signal<string[]>([
    ...BANNER_COLORS.filter(c => c.reqType === 'free').map(c => c.id),
    ...BANNER_PATTERNS.filter(p => p.reqType === 'free').map(p => p.id)
  ]);
  // Estado actual guardado en BD
  savedColor   = signal('c0');
  savedPattern = signal('p0');

  // Estado en preview (puede diferir del guardado, incluye bloqueados para previsualización)
  selectedColor   = signal('c0');
  selectedPattern = signal('p0');

  saving      = signal(false);
  isLockedOpen = signal(false);
  isCoach     = signal(false);
  previewFlash = signal(false);
  saveSuccess = signal(false);
  private confettiContainer: HTMLElement | null = null;

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

  previewGlow = computed(() => {
    const bg = this.previewBg();
    // Extraemos el primer color del gradiente para usarlo como glow
    const match = bg.match(/(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/);
    if (match) {
      // Si es hex, lo convertimos visualmente usando box-shadow, pero para simplificar
      // pasaremos el color crudo y dejaremos que CSS haga el glow.
      return match[1];
    }
    return 'rgba(29,158,117,0.15)';
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
    return this.saveWithCelebration();
  }

  flashPreview() {
    this.previewFlash.set(true);
    setTimeout(() => this.previewFlash.set(false), 400);
  }

  handleSwatchRipple(event: MouseEvent | TouchEvent, element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.left = (clientX - rect.left - 5) + 'px';
    ripple.style.top = (clientY - rect.top - 5) + 'px';
    ripple.style.width = '10px';
    ripple.style.height = '10px';

    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  }

  spawnConfetti(originElement: HTMLElement) {
    const colors = ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
    const rect = originElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 20; i++) {
      const piece = document.createElement('div');
      piece.classList.add('confetti-piece');
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = centerX + 'px';
      piece.style.top = centerY + 'px';
      piece.style.width = (4 + Math.random() * 4) + 'px';
      piece.style.height = (4 + Math.random() * 4) + 'px';

      const angle = (Math.PI * 2 * i) / 20;
      const velocity = 40 + Math.random() * 60;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity - 40;
      const rot = Math.random() * 720;

      piece.style.setProperty('--tx', tx + 'px');
      piece.style.setProperty('--ty', ty + 'px');
      piece.style.setProperty('--rot', rot + 'deg');
      piece.style.animation = `confettiFall ${0.6 + Math.random() * 0.4}s ease-out forwards`;

      piece.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg)`, opacity: 0.8 },
        { transform: `translate(${tx * 1.2}px, ${ty + 80}px) rotate(${rot * 1.5}deg)`, opacity: 0 }
      ], {
        duration: 800 + Math.random() * 400,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards'
      });

      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 1200);
    }
  }

  async saveWithCelebration() {
    const userId = this.auth.user()?.id;
    if (!userId || !this.canSave()) return;

    this.saving.set(true);
    this.saveSuccess.set(false);

    await this.sb
      .from('profiles')
      .update({
        banner_color:     this.selectedColor(),
        banner_pattern:   this.selectedPattern(),
        unlocked_banners: this.unlockedIds(),
      })
      .eq('id', userId);

    this.savedColor.set(this.selectedColor());
    this.savedPattern.set(this.selectedPattern());

    await this.auth.loadProfile(userId);
    await this.profileSvc.load();

    this.saving.set(false);
    this.saveSuccess.set(true);

    const saveBtn = document.querySelector('.save-btn') as HTMLElement;
    if (saveBtn) this.spawnConfetti(saveBtn);

    setTimeout(() => this.saveSuccess.set(false), 2000);
  }

  selectColorEnhanced(id: string, event?: MouseEvent | TouchEvent) {
    const isUnlock = this.isUnlocked(id);
    if (!isUnlock) return;

    this.selectedColor.set(id);
    this.flashPreview();

    if (event) {
      const target = event.currentTarget as HTMLElement;
      if (target) this.handleSwatchRipple(event, target);
    }
  }

  selectPatternEnhanced(id: string, event?: MouseEvent | TouchEvent) {
    const isUnlock = this.isUnlocked(id);
    if (!isUnlock) return;

    this.selectedPattern.set(id);
    this.flashPreview();

    if (event) {
      const target = event.currentTarget as HTMLElement;
      if (target) this.handleSwatchRipple(event, target);
    }
  }

  getStaggerDelay(index: number): string {
    return `${index * 0.03}s`;
  }
}
