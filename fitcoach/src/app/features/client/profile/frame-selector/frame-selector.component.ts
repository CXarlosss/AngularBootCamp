import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../profile.service';
import { RankService } from '../../../../core/services/rank.service';
import { ToastService } from '../../../../shared/services/toast/toast.service';
import { ProfileBannerComponent } from '../profile-banner/profile-banner.component';
import {
  FRAME_CATALOG, Frame, RARITY_LABELS, RARITY_COLORS,
  getFrameById, isFrameUnlocked
} from '../frame-catalog';

@Component({
  selector: 'app-frame-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileBannerComponent],
  template: `
    <div class="frame-selector">
      <!-- Header -->
      <div class="selector-header">
        <button class="back-btn" (click)="goBack()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="header-title">
          <h1>Marcos de Avatar</h1>
          <p class="subtitle">Personaliza tu foto de perfil y destaca tu progreso</p>
        </div>
        <div class="user-xp-badge">
          <span class="xp-icon">⚡</span>
          <span class="xp-value">{{ userXp() | number }} XP</span>
        </div>
      </div>

      <!-- Vista previa interactiva en tiempo real -->
      <div class="banner-preview-card">
        <div class="preview-badge-label">Vista previa del banner</div>
        <app-profile-banner 
          [useCurrentUser]="true"
          [equippedFrame]="selectedFrame()?.id ?? currentFrame()"
          size="md"
        ></app-profile-banner>
      </div>

      <!-- Categories Tabs -->
      <div class="categories-tabs">
        @for (cat of categories; track cat.id) {
          <button 
            class="tab-btn" 
            [class.active]="activeCategory() === cat.id"
            (click)="activeCategory.set(cat.id)"
          >
            {{ cat.label }}
          </button>
        }
      </div>

      <!-- Grid of Frames -->
      <div class="frames-grid">
        @for (frame of filteredFrames(); track frame.id) {
          <button 
            class="frame-card"
            [class]="'rarity-' + frame.rarity"
            [class.equipped]="currentFrame() === frame.id"
            [class.locked]="!isUnlocked(frame)"
            [class.selected]="selectedFrame()?.id === frame.id"
            (click)="selectFrame(frame)"
          >
            <!-- Rarity accent line at top -->
            <div class="rarity-accent" [style.background]="getRarityColor(frame.rarity)"></div>

            <!-- Preview circle -->
            <div class="frame-preview">
              <div 
                class="preview-border" 
                [style.background]="frame.previewGradient"
              ></div>
              <div class="preview-avatar">
                @if (!isUnlocked(frame)) {
                  <span class="lock-icon">🔒</span>
                } @else {
                  <span class="check-icon">{{ currentFrame() === frame.id ? '✓' : '' }}</span>
                }
              </div>
            </div>

            <!-- Frame Name -->
            <span class="frame-name">{{ frame.name }}</span>
            <span 
              class="rarity-badge" 
              [style.color]="getRarityColor(frame.rarity)"
            >
              {{ getRarityLabel(frame.rarity) }}
            </span>

            <!-- Progress or unlock conditions inside card -->
            <div class="card-progress-section">
              @if (!isUnlocked(frame)) {
                @if (frame.unlockXp) {
                  <div class="mini-progress-track">
                    <div class="mini-progress-fill" [style.width.%]="getProgressPercent(frame)"></div>
                  </div>
                  <span class="progress-text">{{ userXp() }}/{{ frame.unlockXp }} XP</span>
                } @else if (frame.unlockRank) {
                  <span class="progress-text">Rango: {{ frame.unlockRank }}</span>
                }
              } @else {
                <span class="unlocked-badge">✨ Desbloqueado</span>
              }
            </div>
          </button>
        }
      </div>

      <!-- Detailed Info & Equip Section -->
      @if (selectedFrame(); as frame) {
        <div class="details-panel fade-in">
          <div class="details-content">
            <!-- Vista previa en tiempo real en tamaño grande -->
            <div class="avatar-preview-container">
              <div class="avatar-frame-wrapper frame-lg" [class]="'frame-' + frame.id">
                @if (profileService.profile()?.avatar_url; as avatarUrl) {
                  <img [src]="avatarUrl" alt="Avatar" />
                } @else {
                  <div class="avatar-placeholder">{{ initials() }}</div>
                }
              </div>
            </div>

            <div class="details-text">
              <div class="details-title-row">
                <h3>{{ frame.name }}</h3>
                <span class="rarity-pill" 
                      [style.background]="getRarityColor(frame.rarity) + '20'"
                      [style.color]="getRarityColor(frame.rarity)"
                      [style.border-color]="getRarityColor(frame.rarity) + '40'">
                  {{ getRarityLabel(frame.rarity) }}
                </span>
              </div>
              <p class="desc">{{ frame.description }}</p>
              @if (!isUnlocked(frame)) {
                <div class="lock-requirement">
                  <span class="warning-icon">🔒 Requiere:</span>
                  @if (frame.unlockXp) {
                    <span class="req-item">{{ frame.unlockXp }} XP (Faltan {{ frame.unlockXp - userXp() }} XP)</span>
                  }
                  @if (frame.unlockRank) {
                    <span class="req-item">Rango {{ frame.unlockRank }}</span>
                  }
                </div>
              } @else {
                <div class="unlocked-requirement">
                  <span class="success-icon">✨ Disponible para equipar</span>
                </div>
              }
            </div>
            
            <button 
              class="equip-btn"
              [disabled]="!isUnlocked(frame) || currentFrame() === frame.id || loading()"
              (click)="equipFrame(frame)"
            >
              @if (loading()) {
                Actualizando...
              } @else if (currentFrame() === frame.id) {
                Equipado
              } @else if (!isUnlocked(frame)) {
                Bloqueado
              } @else {
                Equipar Marco
              }
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .frame-selector {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #080a0f;
      color: #e8e6df;
      padding: 16px 20px 80px;
      overflow-y: auto;
    }

    .selector-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      padding-top: 10px;
    }

    .back-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #e8e6df;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .back-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateX(-2px);
    }

    .header-title {
      flex: 1;
    }

    .header-title h1 {
      font-size: 20px;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(135deg, #fff, #a5b4fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      font-size: 12px;
      color: #94a3b8;
      margin: 2px 0 0;
    }

    .user-xp-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.3);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      color: #c084fc;
    }

    .banner-preview-card {
      margin-bottom: 24px;
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 14px;
      position: relative;
    }

    .preview-badge-label {
      position: absolute;
      top: -10px;
      left: 18px;
      background: #1e1b4b;
      border: 1px solid #4338ca;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #c7d2fe;
      padding: 2px 8px;
      border-radius: 8px;
      z-index: 10;
    }

    .categories-tabs {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      margin-bottom: 20px;
      padding-bottom: 4px;
      scrollbar-width: none;
    }

    .categories-tabs::-webkit-scrollbar {
      display: none;
    }

    .tab-btn {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: #94a3b8;
      padding: 8px 16px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
    }

    .tab-btn:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #fff;
    }

    .tab-btn.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: #fff;
      box-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
    }

    .frames-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    .frame-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 16px 8px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .rarity-accent {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      opacity: 0.4;
    }

    .frame-card:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    .frame-card:hover .rarity-accent {
      opacity: 0.8;
    }

    /* Rarity selective coloring */
    .frame-card.rarity-common { border-color: rgba(156, 163, 175, 0.08); }
    .frame-card.rarity-uncommon { border-color: rgba(34, 197, 94, 0.08); }
    .frame-card.rarity-rare { border-color: rgba(59, 130, 246, 0.08); }
    .frame-card.rarity-epic { border-color: rgba(168, 85, 247, 0.08); }
    .frame-card.rarity-legendary { border-color: rgba(245, 158, 11, 0.08); }

    .frame-card.selected.rarity-common { border-color: rgba(156, 163, 175, 0.5); background: rgba(156, 163, 175, 0.03); }
    .frame-card.selected.rarity-uncommon { border-color: rgba(34, 197, 94, 0.5); background: rgba(34, 197, 94, 0.03); }
    .frame-card.selected.rarity-rare { border-color: rgba(59, 130, 246, 0.5); background: rgba(59, 130, 246, 0.03); }
    .frame-card.selected.rarity-epic { border-color: rgba(168, 85, 247, 0.5); background: rgba(168, 85, 247, 0.03); }
    .frame-card.selected.rarity-legendary { border-color: rgba(245, 158, 11, 0.5); background: rgba(245, 158, 11, 0.03); }

    .frame-card.equipped {
      border-color: rgba(34, 197, 94, 0.5);
      box-shadow: inset 0 0 10px rgba(34, 197, 94, 0.05);
    }

    .frame-card.locked {
      opacity: 0.65;
    }

    .frame-preview {
      width: 52px;
      height: 52px;
      position: relative;
      margin-bottom: 8px;
    }

    .preview-border {
      position: absolute;
      inset: -2px;
      border-radius: 50%;
      padding: 2px;
    }

    .preview-avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #11141e;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1;
    }

    .lock-icon {
      font-size: 11px;
      color: #94a3b8;
    }

    .check-icon {
      font-size: 13px;
      font-weight: bold;
      color: #22c55e;
    }

    .frame-name {
      font-size: 12px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 4px;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .rarity-badge {
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .card-progress-section {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      margin-top: auto;
    }

    .mini-progress-track {
      width: 80%;
      height: 3px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 2px;
      overflow: hidden;
    }

    .mini-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #60a5fa);
      border-radius: 2px;
    }

    .progress-text {
      font-size: 9px;
      color: #64748b;
      font-weight: 600;
    }

    .unlocked-badge {
      font-size: 9px;
      color: #10b981;
      font-weight: 700;
    }

    .details-panel {
      margin-top: auto;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 18px;
      backdrop-filter: blur(16px);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
      z-index: 10;
    }

    .details-content {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .avatar-preview-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 72px;
      height: 72px;
      flex-shrink: 0;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1e293b, #0f172a);
      color: #e2e8f0;
      font-size: 18px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .details-text {
      flex: 1;
      min-width: 0;
    }

    .details-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .details-title-row h3 {
      font-size: 17px;
      font-weight: 800;
      margin: 0;
    }

    .rarity-pill {
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 2px 6px;
      border-radius: 8px;
      border: 1px solid currentColor;
    }

    .desc {
      font-size: 12px;
      color: #94a3b8;
      margin: 0;
      line-height: 1.4;
    }

    .lock-requirement {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-top: 6px;
      font-size: 11px;
      color: #fbbf24;
      font-weight: 600;
    }

    .req-item {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #f3f4f6;
      opacity: 0.85;
      font-size: 10px;
    }

    .unlocked-requirement {
      margin-top: 6px;
      font-size: 11px;
      color: #10b981;
      font-weight: 700;
    }

    .equip-btn {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border: none;
      color: #fff;
      padding: 10px 18px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.2);
    }

    .equip-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.35);
    }

    .equip-btn:disabled {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.03);
      color: #475569;
      cursor: not-allowed;
      box-shadow: none;
    }

    .fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class FrameSelectorComponent implements OnInit {
  profileService = inject(ProfileService);
  rankSvc = inject(RankService);
  private toastSvc = inject(ToastService);

  categories = [
    { id: 'all', label: 'Todos' },
    { id: 'basic', label: 'Básico' },
    { id: 'neon', label: 'Neón' },
    { id: 'premium', label: 'Premium' },
    { id: 'elemental', label: 'Elemental' },
    { id: 'special', label: 'Especial' }
  ];

  activeCategory = signal<string>('all');
  selectedFrame = signal<Frame | null>(null);
  loading = signal<boolean>(false);

  // Signals reactivos del perfil global
  currentFrame = this.profileService.equippedFrame;
  userXp = computed(() => this.profileService.profile()?.xp || this.rankSvc.athleteRank()?.xpTotal || 0);
  userRank = computed(() => this.profileService.profile()?.rank || this.rankSvc.fullRank()?.rank?.name || 'Rookie');

  initials = computed(() => {
    const name = this.profileService.profile()?.full_name ?? '';
    return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  });

  filteredFrames = computed(() => {
    const category = this.activeCategory();
    if (category === 'all') return FRAME_CATALOG;
    return FRAME_CATALOG.filter(f => f.category === category);
  });

  async ngOnInit() {
    await this.rankSvc.load();
    await this.profileService.load();
    
    // Autoseleccionar el marco equipado actual en el panel de detalle
    const equippedId = this.currentFrame();
    const frame = FRAME_CATALOG.find(f => f.id === equippedId);
    if (frame) {
      this.selectedFrame.set(frame);
    }
  }

  isUnlocked(frame: Frame): boolean {
    // Si el usuario es Coach, tiene absolutamente todo desbloqueado
    const isCoach = this.profileService.profile()?.height_cm === -1;
    if (isCoach) return true;

    return isFrameUnlocked(frame, this.userXp(), this.userRank());
  }

  getProgressPercent(frame: Frame): number {
    if (!frame.unlockXp) return 100;
    return Math.min(100, Math.round((this.userXp() / frame.unlockXp) * 100));
  }

  selectFrame(frame: Frame) {
    this.selectedFrame.set(frame);
  }

  async equipFrame(frame: Frame) {
    if (!isFrameUnlocked(frame, this.userXp(), this.userRank())) return;
    this.loading.set(true);
    try {
      await this.profileService.updateEquippedFrame(frame.id);
      this.toastSvc.success('¡Marco equipado!', `Has equipado el marco "${frame.name}" correctamente.`);
    } catch (err: any) {
      console.error(err);
      this.toastSvc.error('Error', 'No se pudo equipar el marco. Inténtalo de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }

  getRarityLabel(rarity: Frame['rarity']): string {
    return RARITY_LABELS[rarity];
  }

  getRarityColor(rarity: Frame['rarity']): string {
    return RARITY_COLORS[rarity];
  }

  goBack() {
    window.history.back();
  }
}
