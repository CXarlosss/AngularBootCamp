import {
  Component, OnInit, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../core/supabase.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AvatarFrameComponent } from '../../../../shared/components/avatar-frame/avatar-frame.component';
import { FRAME_DEFS, FrameDef, FrameId } from '../../../../shared/components/avatar-frame/avatar-frame.types';
import { RankService } from '../../../../core/services/rank.service';

@Component({
  selector: 'app-frame-selector',
  standalone: true,
  imports: [CommonModule, AvatarFrameComponent],
  template: `
    <div class="selector-screen">

      <header class="selector-header">
        <button class="back-btn" (click)="goBack()">←</button>
        <h1>Mi marco</h1>
        <span></span>
      </header>

      <!-- Preview -->
      <div class="preview-section">
        <app-avatar-frame
          [initials]="initials()"
          [rankLevel]="rankSvc.fullRank()?.rank?.level ?? 0"
          [equippedSpecial]="selected()"
          [size]="80"
          [showBadge]="true" />
        <div class="preview-info">
          <p class="preview-rank">{{ rankSvc.fullRank()?.rank?.name }} {{ rankSvc.fullRank()?.divLabel }}</p>
          @if (selectedDef()) {
            <p class="preview-special">+ {{ selectedDef()!.name }} {{ selectedDef()!.emoji }}</p>
          }
        </div>
      </div>

      <!-- Marcos de rango (solo lectura) -->
      <p class="section-lbl">Marco de rango (automático)</p>
      <div class="frame-grid">
        @for (f of rankFrames; track f.id) {
          <div class="frame-item"
               [class.active]="isCurrentRankFrame(f)"
               [class.locked]="isLocked(f)">
            <app-avatar-frame
              [initials]="initials()"
              [rankLevel]="rankFrameLevel(f)"
              [size]="52"
              [showBadge]="false" />
            <p class="frame-name">{{ f.name }}</p>
            @if (isLocked(f)) {
              <span class="frame-tag locked">{{ f.req }}</span>
            } @else if (isCurrentRankFrame(f)) {
              <span class="frame-tag active">Activo</span>
            } @else {
              <span class="frame-tag done">✓</span>
            }
          </div>
        }
      </div>

      <!-- Marcos especiales -->
      <p class="section-lbl">Marcos especiales</p>
      <div class="frame-grid">
        @for (f of specialFrames; track f.id) {
          <div class="frame-item"
               [class.selected]="selected() === f.id"
               [class.locked]="!isUnlocked(f.id)"
               (click)="isUnlocked(f.id) ? equip(f.id) : null">
            <app-avatar-frame
              [initials]="initials()"
              [rankLevel]="rankSvc.fullRank()?.rank?.level ?? 0"
              [equippedSpecial]="f.id"
              [size]="52"
              [showBadge]="false" />
            <p class="frame-name">{{ f.name }}</p>
            @if (!isUnlocked(f.id)) {
              <span class="frame-tag locked">{{ f.req }}</span>
            } @else if (selected() === f.id) {
              <span class="frame-tag active">Equipado</span>
            } @else {
              <span class="frame-tag done">Equipar</span>
            }
          </div>
        }
      </div>

      <!-- Quitar especial -->
      @if (selected() && selected() !== 'rank') {
        <button class="btn-remove" (click)="equip(null)">
          Quitar marco especial
        </button>
      }

    </div>
  `,
  styleUrl: './frame-selector.component.scss',
})
export class FrameSelectorComponent implements OnInit {
  private sb      = inject(SupabaseService).client;
  private auth    = inject(AuthService);
  readonly rankSvc = inject(RankService);

  initials       = signal('');
  selected       = signal<string | null>(null);
  unlockedFrames = signal<string[]>([]);

  readonly rankFrames    = FRAME_DEFS.filter(f => !f.isSpecial);
  readonly specialFrames = FRAME_DEFS.filter(f => f.isSpecial);

  selectedDef = () => this.selected() && this.selected() !== 'rank'
    ? FRAME_DEFS.find(f => f.id === this.selected())
    : null;

  async ngOnInit() {
    await this.rankSvc.load();
    const userId = this.auth.user()?.id;
    if (!userId) return;

    const { data } = await this.sb
      .from('profiles')
      .select('full_name, role, equipped_frame, unlocked_frames')
      .eq('id', userId)
      .single();

    if (data) {
      const name = data.full_name ?? '';
      this.initials.set(name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2));
      this.selected.set(data.equipped_frame ?? null);
      
      if (data.role === 'coach') {
        // Desbloquear todos los marcos
        const allFrames = FRAME_DEFS.map(f => f.id);
        this.unlockedFrames.set(allFrames);
      } else {
        this.unlockedFrames.set(data.unlocked_frames ?? []);
      }
    }
  }

  isCurrentRankFrame(f: FrameDef): boolean {
    const level = this.rankSvc.fullRank()?.rank?.level ?? 0;
    return f.id === `rank_${level}`;
  }

  rankFrameLevel(f: FrameDef): number {
    return parseInt(f.id.replace('rank_', '')) || 0;
  }

  isLocked(f: FrameDef): boolean {
    if (!f.isSpecial) {
      const level = this.rankSvc.fullRank()?.rank?.level ?? 0;
      return this.rankFrameLevel(f) > level;
    }
    return !this.isUnlocked(f.id);
  }

  isUnlocked(id: string): boolean {
    return this.unlockedFrames().includes(id);
  }

  async equip(frameId: string | null) {
    const userId = this.auth.user()?.id;
    if (!userId) return;

    this.selected.set(frameId);

    await this.sb
      .from('profiles')
      .update({ equipped_frame: frameId ?? 'rank' })
      .eq('id', userId);
  }

  goBack() { window.history.back(); }
}
