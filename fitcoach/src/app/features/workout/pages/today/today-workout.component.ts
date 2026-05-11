// src/app/features/workout/pages/today/today-workout.component.ts
import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetInputComponent } from '../../quick-log/components/set-input/set-input.component';
import { QuickLogService } from '../../quick-log/services/quick-log.service';
import { UndoService } from '../../quick-log/services/undo.service';
import { FeatureFlagService } from '../../../core/services/feature-flag.service';
import { TelemetryService } from '../../../core/services/telemetry.service';
import { MissionEngineService, MissionType } from '../../../../gamification/services/mission-engine.service';
import { StreakWeeklyService } from '../../../../gamification/services/streak-weekly.service';
import { XpQualityService } from '../../../../gamification/services/xp-quality.service';
import { MissionCardComponent } from '../../../../gamification/components/mission-card/mission-card.component';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-today-workout',
  standalone: true,
  imports: [CommonModule, SetInputComponent, MissionCardComponent],
  template: `
    <div class="workout-page">
      <!-- Header -->
      <div class="workout-header">
        <h1>{{ routineName() }}</h1>
        <div class="day-badge">Día {{ currentDay() }}</div>
      </div>

      <!-- MISIONES ACTIVAS (Sprint 3) -->
      @if (gamificationEnabled() && activeMissions().length > 0) {
        <div class="missions-section">
          <h3 class="section-title">Misiones de la semana</h3>
          @for (mission of activeMissions(); track mission.id) {
            <app-mission-card 
              [mission]="mission"
              (onClaim)="claimMissionXp($event)" />
          }
        </div>
      }

      <!-- RACHA SEMANAL (Sprint 3) -->
      @if (gamificationEnabled() && streak(); as s) {
        <div class="streak-banner" [class.at-risk]="s.isAtRisk">
          <div class="streak-info">
            <span class="streak-icon">🔥</span>
            <span class="streak-count">{{ s.currentStreak }} semanas</span>
            @if (s.freezeUsed) {
              <span class="freeze-badge">❄️ Freeze usado</span>
            }
          </div>
          <div class="week-progress">
            <div class="progress-bar">
              <div class="fill" [style.width.%]="s.weekProgress"></div>
            </div>
            <span class="progress-text">{{ s.daysCompleted }}/{{ s.targetDays }} días</span>
          </div>
          @if (s.isAtRisk) {
            <span class="risk-warning">⚠️ Necesitas {{ s.targetDays - s.daysCompleted }} días más esta semana</span>
          }
        </div>
      }

      <!-- Lista de ejercicios -->
      @for (exercise of exercises(); track exercise.id) {
        <div class="exercise-section">
          <div class="exercise-header">
            <h3>{{ exercise.name }}</h3>
            <span class="exercise-meta">
              {{ exercise.sets }} series × {{ exercise.targetReps }} reps
            </span>
          </div>
          <div class="sets-container">
            @for (set of exercise.setsList; track set.setIndex) {
              <app-set-input
                [config]="set.config"
                (onSave)="onSetSaved($event, exercise.id)"
                (onUndo)="onSetUndone($event, exercise.id)" />
            }
          </div>
        </div>
      }

      <!-- Resumen y finalización -->
      @if (allSetsCompleted()) {
        <div class="completion-section">
          <div class="xp-summary">
            <span class="xp-total">+{{ totalSessionXp() }} XP</span>
            @if (xpBreakdown(); as breakdown) {
              <div class="xp-details">
                <span>Base: {{ breakdown.baseXp }}</span>
                <span>Adherencia: +{{ breakdown.adherenceBonus }}</span>
                @if (breakdown.prBonus > 0) {
                  <span>PRs: +{{ breakdown.prBonus }}</span>
                }
                @if (breakdown.streakBonus > 0) {
                  <span>Racha: +{{ breakdown.streakBonus }}</span>
                }
              </div>
            }
          </div>
          <button class="finish-btn" (click)="finishWorkout()" [disabled]="isFinishing()">
            {{ isFinishing() ? 'Guardando...' : 'Finalizar entrenamiento' }}
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .workout-page { padding: 16px; max-width: 600px; margin: 0 auto; }
    
    .workout-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .workout-header h1 { margin: 0; font-size: 20px; color: #fff; }
    .day-badge { background: #4CAF50; color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    
    /* Misiones */
    .missions-section { margin-bottom: 20px; }
    .section-title { font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    
    /* Racha */
    .streak-banner {
      background: linear-gradient(135deg, #2d2d44, #1e1e2e);
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 20px;
      border: 2px solid #4CAF50;
    }
    .streak-banner.at-risk { border-color: #ff9800; }
    .streak-info { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
    .streak-icon { font-size: 24px; }
    .streak-count { font-size: 18px; font-weight: 700; color: #fff; }
    .freeze-badge { background: #3d3d5c; color: #64b5f6; padding: 4px 10px; border-radius: 12px; font-size: 12px; }
    .week-progress { display: flex; align-items: center; gap: 10px; }
    .progress-bar { flex: 1; height: 8px; background: #2d2d44; border-radius: 4px; overflow: hidden; }
    .fill { height: 100%; background: linear-gradient(90deg, #4CAF50, #8BC34A); border-radius: 4px; transition: width 0.3s; }
    .progress-text { font-size: 12px; color: #888; min-width: 60px; }
    .risk-warning { display: block; margin-top: 8px; color: #ff9800; font-size: 12px; }
    
    /* XP Summary */
    .xp-details { display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap; }
    .xp-details span { font-size: 12px; color: #888; }
    
    .finish-btn { width: 100%; padding: 16px; background: #4CAF50; color: #fff; border: none; border-radius: 14px; font-weight: 700; font-size: 16px; cursor: pointer; margin-top: 20px; }
    .finish-btn:disabled { background: #2d2d44; color: #666; }
  `]
})
export class TodayWorkoutComponent {
  private supabase = inject(SupabaseClient);
  private quickLog = inject(QuickLogService);
  private undoService = inject(UndoService);
  private telemetry = inject(TelemetryService);
  private featureFlags = inject(FeatureFlagService);
  private auth = inject(AuthService);
  
  // Sprint 3 services
  private missionEngine = inject(MissionEngineService);
  private streakService = inject(StreakWeeklyService);
  private xpQuality = inject(XpQualityService);
  
  // Estado
  protected routineName = signal('Push Day A');
  protected currentDay = signal(1);
  protected exercises = signal<any[]>([]);
  protected completedSets = signal(0);
  protected totalSessionXp = signal(0);
  protected isFinishing = signal(false);
  protected loggedSets = signal<any[]>([]);
  protected startTime = Date.now();
  
  protected allSetsCompleted = computed(() => {
    if (this.exercises().length === 0) return false;
    const totalExpected = this.exercises().reduce((acc, ex) => acc + (ex.sets || 0), 0);
    return this.completedSets() >= totalExpected;
  });
  
  // Sprint 3 estado
  protected gamificationEnabled = signal(false);
  protected activeMissions = this.missionEngine.activeMissions;
  protected streak = signal<any>(null);
  protected xpBreakdown = signal<any>(null);
  
  // Feature flag check
  constructor() {
    const userId = this.auth.user()?.id;
    if (userId) {
      this.gamificationEnabled.set(this.featureFlags.isEnabled('gamification_v2', userId));
      
      // Cargar datos Sprint 3 si está activo
      if (this.gamificationEnabled()) {
        this.loadGamificationData(userId);
      }
    }
  }

  async loadGamificationData(clientId: string): Promise<void> {
    // Generar misiones si es lunes y no tiene
    await this.missionEngine.generateWeeklyMissions(clientId);
    await this.missionEngine.loadMissions(clientId);
    
    // Calcular racha
    const streakData = await this.streakService.calculateStreak(clientId);
    this.streak.set(streakData);
  }

  onSetSaved(event: { weight: number; reps: number; setIndex: number }, exerciseId: string): void {
    console.log('[TodayWorkout] onSetSaved called:', event, exerciseId);
    this.completedSets.update(n => n + 1);
    
    const userId = this.auth.user()?.id;
    
    // Sprint 3: Actualizar misión de volumen
    if (this.gamificationEnabled() && userId) {
      this.missionEngine.updateProgress(userId, 'volume', 1);
    }
    
    // Guardar en el buffer local para el cálculo de calidad final
    const exercise = this.exercises().find(e => e.id === exerciseId);
    this.loggedSets.update(sets => [...sets, {
      exercise_id: exerciseId,
      set_number: event.setIndex,
      weight: event.weight,
      reps: event.reps,
      targetWeight: exercise?.targetWeight || 0,
      targetReps: exercise?.targetReps || 0
    }]);
    
    // Telemetry
    this.telemetry.track('set_saved', {
      exercise_id: exerciseId,
      weight: event.weight,
      reps: event.reps,
      set_index: event.setIndex
    });
  }

  async finishWorkout(): Promise<void> {
    this.isFinishing.set(true);
    const userId = this.auth.user()?.id;
    if (!userId) {
      console.error('[TodayWorkout] finishWorkout: No userId found');
      this.isFinishing.set(false);
      return;
    }
    
    try {
      // 1. Crear workout_log
      const { data: workout, error: wError } = await this.supabase
        .from('workout_logs')
        .insert({
          client_id: userId,
          routine_id: 'routine-id', // TODO: Obtener real
          day_number: this.currentDay(),
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (wError) throw wError;
      
      // 2. Sprint 3: Calcular XP con calidad
      const sets = this.getCompletedSets(); // Extraer del estado
      const streakWeeks = this.streak()?.currentStreak || 0;
      
      const breakdown = this.xpQuality.calculateQualityXp(
        sets.map(s => ({
          weight: s.weight,
          reps: s.reps,
          targetWeight: s.targetWeight
        })),
        streakWeeks
      );
      
      this.xpBreakdown.set(breakdown);
      this.totalSessionXp.set(breakdown.totalXp);
      
      // 3. Guardar XP en athlete_ranks
      await this.supabase.rpc('add_xp', {
        p_client_id: userId,
        p_total_xp: breakdown.totalXp
      });
      
      // 4. Sprint 3: Actualizar misiones y racha
      if (this.gamificationEnabled()) {
        await this.missionEngine.updateProgress(userId, 'frequency', 1);
        await this.streakService.recordDay(userId);
        
        // Recargar datos
        await this.loadGamificationData(userId);
      }
      
      // 5. Undo
      await this.undoService.createWorkoutUndo(workout.id, this.supabase, {
        revertWorkoutXP: async (id: string) => {
          await this.supabase.rpc('revert_xp', { p_workout_id: id });
        }
      });
      
      // 6. Telemetry
      this.telemetry.track('workout_completed', {
        total_xp: breakdown.totalXp,
        sets_count: sets.length,
        duration_ms: this.getWorkoutDuration()
      });
      
      // 7. Limpiar
      this.quickLog.clear();
      
    } finally {
      this.isFinishing.set(false);
    }
  }

  async claimMissionXp(missionId: string): Promise<void> {
    const userId = this.auth.user()?.id;
    if (!userId) return;
    const xpEarned = await this.missionEngine.claimXp(userId, missionId);
    
    if (xpEarned > 0) {
      this.telemetry.track('mission_xp_claimed', {
        mission_id: missionId,
        xp_earned: xpEarned
      });
      
      // Toast de confirmación
      this.showToast(`+${xpEarned} XP reclamado!`);
    }
  }

  // Helpers
  private getCompletedSets(): any[] { 
    return this.loggedSets(); 
  }
  
  private getWorkoutDuration(): number { 
    return Date.now() - this.startTime; 
  }
  
  private showToast(msg: string): void { 
    console.log('Toast:', msg); 
  }
  
  protected onSetUndone(event: { setIndex: number }, exerciseId: string): void {
    this.completedSets.update(n => Math.max(0, n - 1));
    this.loggedSets.update(sets => 
      sets.filter(s => !(s.exercise_id === exerciseId && s.set_number === event.setIndex))
    );
    
    this.telemetry.track('undo_triggered', {
      action_type: 'set',
      exercise_id: exerciseId,
      set_index: event.setIndex
    });
  }
}
