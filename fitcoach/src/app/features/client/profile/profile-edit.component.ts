import {
  Component, OnInit, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService, Goal, Level } from './profile.service';
import { WeightLogService } from '../progress/weight-bottom-sheet/weight-log.service';

interface GoalOption { value: Goal; label: string; emoji: string; }
interface LevelOption { value: Level; label: string; sub: string; emoji: string; }

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-edit.component.html',
  styleUrl:    './profile-edit.component.scss',
})
export class ProfileEditComponent implements OnInit {
  private profileSvc = inject(ProfileService);
  private weightSvc  = inject(WeightLogService);
  protected router     = inject(Router);

  // Form state
  name      = signal('');
  weightKg  = signal<number | null>(null);
  heightCm  = signal<number | null>(null);
  birthDate = signal('');
  goal      = signal<Goal | null>(null);
  level     = signal<Level | null>(null);

  saving  = signal(false);
  saved   = signal(false);
  error   = signal('');

  readonly goals: GoalOption[] = [
    { value: 'fat_loss',    label: 'Perder grasa',   emoji: '🔥' },
    { value: 'muscle_gain', label: 'Ganar músculo',  emoji: '💪' },
    { value: 'strength',    label: 'Fuerza máxima',  emoji: '🏋️' },
    { value: 'health',      label: 'Salud general',  emoji: '🌱' },
  ];

  readonly levels: LevelOption[] = [
    { value: 'beginner',     label: 'Principiante', sub: 'Menos de 1 año',    emoji: '🌱' },
    { value: 'intermediate', label: 'Intermedio',   sub: '1–3 años',           emoji: '⚡' },
    { value: 'advanced',     label: 'Avanzado',     sub: '3+ años',            emoji: '🔱' },
  ];

  async ngOnInit() {
    const p = await this.profileSvc.load();
    if (p) {
      this.name.set(p.full_name ?? '');
      this.heightCm.set(p.height_cm);
      this.birthDate.set(p.birth_date ?? '');
      this.goal.set(p.goal);
      this.level.set(p.level);
    }
    // Cargar último peso registrado
    const lastEntry = await this.weightSvc.getLastEntry();
    if (lastEntry) this.weightKg.set(lastEntry.weight_kg);
  }

  setGoal(g: Goal)   { this.goal.set(g); }
  setLevel(l: Level) { this.level.set(l); }

  async save() {
    this.saving.set(true);
    this.error.set('');

    try {
      // Guardar perfil
      await this.profileSvc.save({
        full_name:  this.name().trim() || undefined,
        height_cm:  this.heightCm() ?? undefined,
        birth_date: this.birthDate() || undefined,
        goal:       this.goal() ?? undefined,
        level:      this.level() ?? undefined,
      } as any);

      // Si hay peso nuevo, guardarlo en weight_logs
      if (this.weightKg()) {
        await this.weightSvc.logWeight(this.weightKg()!);
      }

      this.saved.set(true);
      setTimeout(() => this.router.navigate(['/client']), 1200); // Redirigir a client, que es la ruta raíz del cliente

    } catch (e: any) {
      this.error.set('Error guardando. Inténtalo de nuevo.');
      this.saving.set(false);
    }
  }
}
