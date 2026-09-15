import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { WorkoutStore } from '../../../state/workout.store';
import { AuthService } from '../../../core/auth/auth.service';
import { WorkoutDetailModalComponent } from './workout-detail-modal.component';
import { WorkoutLog } from '../../../core/models/workout-log.model';
import { HistoryEmptyStateComponent } from './history-empty-state.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-workout-history-page',
  standalone: true,
  imports: [CommonModule, DatePipe, WorkoutDetailModalComponent, HistoryEmptyStateComponent],
  template: `
    <div class="history-page ptr-container" 
         [class.pulling]="isPulling" 
         [class.refreshing]="isRefreshing"
         (touchstart)="onTouchStart($event)"
         (touchmove)="onTouchMove($event)"
         (touchend)="onTouchEnd()">
         
      <div class="ptr-indicator">
        <div class="ptr-spinner"></div>
        <span class="ptr-text">Actualizando...</span>
      </div>

      <div class="header">
        <button class="back-btn" (click)="goBack()">←</button>
        <h1>Historial de Entrenamientos</h1>
      </div>

      @if (store.loading() && store.history().length === 0) {
        <div class="loading">Cargando historial...</div>
      } @else if (store.history().length === 0) {
        <fc-history-empty-state (startWorkout)="goStartWorkout()" />
      } @else {
        <div class="history-list">
          @for (log of store.history(); track log.id) {
            <button class="hc-card" (click)="openDetail(log)">
              <div class="hc-header">
                <div class="hc-icon-wrap">
                  <span class="hc-icon">🏋️</span>
                </div>
                <div class="hc-title-group">
                  <h3 class="hc-title">{{ log.loggedDate | date:'fullDate' }}</h3>
                  <span class="hc-subtitle">Completado ✓</span>
                </div>
                <span class="hc-arrow">→</span>
              </div>
              <div class="hc-last-stats">
                <div class="hc-stat highlight">
                  <span class="hc-stat-value">{{ log.sets.length }}</span>
                  <span class="hc-stat-label">Series</span>
                </div>
              </div>
            </button>
          }
        </div>
      }
      
      @if (selectedLog) {
        <app-workout-detail-modal 
          [log]="selectedLog" 
          (close)="closeDetail()" 
        />
      }
    </div>
  `,
  styleUrl: './workout-history.page.scss'
})
export class WorkoutHistoryPageComponent implements OnInit {
  store = inject(WorkoutStore);
  private auth = inject(AuthService);
  private router = inject(Router);
  
  selectedLog: WorkoutLog | null = null;

  // PTR state
  isPulling = false;
  isRefreshing = false;
  private touchStartY = 0;

  async ngOnInit() {
    const userId = this.auth.user()?.id;
    if (userId) {
      await this.store.loadHistory(userId);
    }
  }

  goBack() {
    window.history.back();
  }

  goStartWorkout() {
    this.router.navigate(['/client/dashboard']);
  }

  openDetail(log: WorkoutLog) {
    this.selectedLog = log;
  }

  closeDetail() {
    this.selectedLog = null;
  }

  // Pull to refresh logic
  onTouchStart(e: TouchEvent) {
    if (window.scrollY === 0) {
      this.touchStartY = e.touches[0].clientY;
    }
  }

  onTouchMove(e: TouchEvent) {
    if (this.touchStartY > 0 && !this.isRefreshing) {
      const diff = e.touches[0].clientY - this.touchStartY;
      if (diff > 30) {
        this.isPulling = true;
      }
    }
  }

  async onTouchEnd() {
    if (this.isPulling && !this.isRefreshing) {
      this.isPulling = false;
      this.isRefreshing = true;
      const userId = this.auth.user()?.id;
      if (userId) {
        await this.store.loadHistory(userId);
      }
      this.isRefreshing = false;
    }
    this.touchStartY = 0;
  }
}
