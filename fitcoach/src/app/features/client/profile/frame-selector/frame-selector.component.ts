import {
  Component, OnInit, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../core/supabase.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AvatarFrameComponent } from '../../../../shared/components/avatar-frame/avatar-frame.component';
import { RankService } from '../../../../core/services/rank.service';
import { ToastService } from '../../../../shared/services/toast/toast.service';
import { RankProgressComponent } from '../../rank/rank-progress/rank-progress.component';
import { FrameCardComponent, FrameDef } from '../components/frame-card/frame-card.component';

@Component({
  selector: 'app-frame-selector',
  standalone: true,
  imports: [
    CommonModule, 
    AvatarFrameComponent, 
    RankProgressComponent, 
    FrameCardComponent
  ],
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

      <!-- PROGRESO DE RANGO -->
      <div style="margin: 0 16px 24px;">
        <app-rank-progress
          [totalXp]="rankSvc.athleteRank()?.xpTotal ?? 0"
          (onMotivate)="goToWorkouts()"
          (onShare)="shareProgress()" />
      </div>

      <!-- Marcos especiales -->
      <div class="fs-section">
        <p class="section-lbl">✨ Marcos Especiales</p>
        
        <div class="frame-grid">
          @for (f of specialFrames(); track f.id) {
            <app-frame-card
              [frame]="f"
              [isEquipped]="selected() === f.id"
              [isUnlocked]="isUnlocked(f.id)"
              [progress]="getFrameProgress(f.id)"
              (equip)="equip($event)"
              (unequip)="equip(null)" />
          }
        </div>
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
  private toast   = inject(ToastService);
  readonly rankSvc = inject(RankService);

  initials       = signal('');
  selected       = signal<string | null>(null);
  unlockedFrames = signal<string[]>([]);

  specialFrames = signal<FrameDef[]>([
    {
      id: 'llama_eterna',
      name: 'Llama Eterna',
      emoji: '🔥',
      description: 'Racha de 30 días sin fallar ningún entrenamiento',
      requirement: '30 días de racha',
      animation: 'flame',
      rarity: 'epic',
    },
    {
      id: 'record_olympic',
      name: 'Récord Olímpico',
      emoji: '🏆',
      description: '10 récords personales en un mes',
      requirement: '10 récords/mes',
      animation: 'gold',
      rarity: 'legendary',
    },
    {
      id: 'fav_coach',
      name: 'Favorito del Coach',
      emoji: '⭐',
      description: 'El coach lo otorga manualmente',
      requirement: 'Reconocimiento del coach',
      animation: 'emerald',
      rarity: 'rare',
    },
  ]);

  selectedDef = computed(() => {
    const sel = this.selected();
    return sel ? this.specialFrames().find(f => f.id === sel) : null;
  });

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
        const allFrames = this.specialFrames().map(f => f.id);
        this.unlockedFrames.set(allFrames);
      } else {
        this.unlockedFrames.set(data.unlocked_frames ?? []);
      }
    }
  }


  isUnlocked(id: string): boolean {
    return this.unlockedFrames().includes(id);
  }

  getFrameProgress(id: string): number {
    // Lógica simulada de progreso
    if (id === 'llama_eterna') return 60;
    if (id === 'record_olympic') return 30;
    return 0;
  }

  async equip(frameId: string | null) {
    const userId = this.auth.user()?.id;
    if (!userId) return;

    this.selected.set(frameId);
    
    if (frameId) {
      const frame = this.specialFrames().find(f => f.id === frameId);
      this.toast.success('Marco equipado', `${frame?.name} ${frame?.emoji} activo`);
    } else {
      this.toast.info('Marco eliminado', 'Has vuelto al marco de rango');
    }

    await this.sb
      .from('profiles')
      .update({ equipped_frame: frameId ?? 'rank' })
      .eq('id', userId);
  }

  goToWorkouts() {
    this.toast.info('Redirigiendo...', 'Cargando tus entrenamientos recomendados');
  }

  shareProgress() {
    this.toast.success('¡Progreso copiado!', 'Listo para compartir con tu coach');
  }

  goBack() { window.history.back(); }
}
