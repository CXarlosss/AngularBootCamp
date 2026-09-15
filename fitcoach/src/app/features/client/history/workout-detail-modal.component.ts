import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutLog, SetLog } from '../../../core/models/workout-log.model';
import { SetEditorComponent } from './set-editor.component';
import { WorkoutStore } from '../../../state/workout.store';

@Component({
  selector: 'app-workout-detail-modal',
  standalone: true,
  imports: [CommonModule, SetEditorComponent],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Detalle del Entrenamiento</h3>
          <button class="close-btn" (click)="close.emit()">×</button>
        </div>
        
        <div class="modal-body">
          @for (ex of getGroupedSets(); track ex.exerciseId) {
            <div class="exercise-group">
              <h4 class="ex-name">{{ ex.exerciseName }}</h4>
              <div class="sets-list">
                @for (set of ex.sets; track set.id) {
                  <!-- Swipe to delete wrapper -->
                  <div class="set-row-wrapper" 
                       (touchstart)="onTouchStart($event, set.id)"
                       (touchmove)="onTouchMove($event, set.id)"
                       (touchend)="onTouchEnd(set.id)">
                    
                    <div class="delete-bg">
                      <span>Borrar</span>
                    </div>
                    
                    <button class="set-row" 
                            [style.transform]="'translateX(' + getSwipeOffset(set.id) + 'px)'"
                            [class.swiping]="swipingId === set.id"
                            (click)="editSet(set)">
                      <span class="set-num">Serie {{ set.setNumber }}</span>
                      <span class="set-val">{{ set.weightKg }} kg</span>
                      <span class="set-val">{{ set.repsDone }} reps</span>
                      <span class="edit-icon">✏️</span>
                    </button>
                    
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>

    @if (editingSet) {
      <app-set-editor 
        [set]="editingSet"
        (save)="onSaveSet($event)"
        (close)="editingSet = null"
      />
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: flex-end;
    }
    .modal-content {
      background: #0f172a;
      width: 100%;
      max-height: 85vh;
      border-radius: 24px 24px 0 0;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s ease-out;
    }
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    .modal-header {
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .modal-header h3 {
      margin: 0;
      font-size: 18px;
      color: white;
    }
    .close-btn {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 24px;
      cursor: pointer;
    }
    .modal-body {
      padding: 16px;
      overflow-y: auto;
      flex: 1;
    }
    .exercise-group {
      margin-bottom: 24px;
    }
    .ex-name {
      color: #93c5fd;
      margin: 0 0 12px 0;
      font-size: 15px;
    }
    .sets-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    /* Swipe to delete styles */
    .set-row-wrapper {
      position: relative;
      overflow: hidden;
      border-radius: 12px;
      background: #ef4444; /* Rojo de fondo para el delete */
    }
    .delete-bg {
      position: absolute;
      top: 0; right: 0; bottom: 0; left: 0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 20px;
      color: white;
      font-weight: bold;
    }
    .set-row {
      position: relative;
      background: rgba(30, 41, 59, 1);
      width: 100%;
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      transition: transform 0.2s ease-out;
      cursor: pointer;
    }
    .set-row.swiping {
      transition: none; /* Disable transition while finger is moving */
    }
    .set-num {
      color: #94a3b8;
      font-size: 13px;
      width: 60px;
      text-align: left;
    }
    .set-val {
      font-size: 16px;
      font-weight: bold;
      flex: 1;
      text-align: center;
    }
    .edit-icon {
      font-size: 14px;
      opacity: 0.5;
    }
  `]
})
export class WorkoutDetailModalComponent {
  @Input({ required: true }) log!: WorkoutLog;
  @Output() close = new EventEmitter<void>();

  store = inject(WorkoutStore);

  editingSet: SetLog | null = null;

  // Swipe logic
  private touchStartX = 0;
  swipingId: string | null = null;
  swipeOffsets: Record<string, number> = {};

  getGroupedSets() {
    const freshLog = this.store.history().find(l => l.id === this.log.id) || this.log;

    const groups: Record<string, { exerciseId: string, exerciseName: string, sets: SetLog[] }> = {};
    for (const set of freshLog.sets) {
      if (!groups[set.exerciseId]) {
        groups[set.exerciseId] = {
          exerciseId: set.exerciseId,
          exerciseName: set.exerciseName,
          sets: []
        };
      }
      groups[set.exerciseId].sets.push(set);
    }
    return Object.values(groups);
  }

  editSet(set: SetLog) {
    this.editingSet = set;
  }

  onSaveSet(data: { weightKg: number, repsDone: number }) {
    if (this.editingSet) {
      this.store.editCompletedSet(this.log.id, this.editingSet.id, data.weightKg, data.repsDone);
    }
    this.editingSet = null;
  }

  onTouchStart(event: TouchEvent, setId: string) {
    this.touchStartX = event.touches[0].clientX;
    this.swipingId = setId;
    this.swipeOffsets[setId] = 0;
  }

  onTouchMove(event: TouchEvent, setId: string) {
    if (this.swipingId !== setId) return;
    const touch = event.touches[0];
    const diff = touch.clientX - this.touchStartX;
    if (diff < 0) {
      this.swipeOffsets[setId] = Math.max(diff, -100); 
    }
  }

  onTouchEnd(setId: string) {
    if (this.swipingId !== setId) return;
    this.swipingId = null;
    
    if (this.swipeOffsets[setId] < -70) {
      this.store.deleteCompletedSet(this.log.id, setId);
      this.swipeOffsets[setId] = 0;
    } else {
      this.swipeOffsets[setId] = 0;
    }
  }

  getSwipeOffset(setId: string): number {
    return this.swipeOffsets[setId] || 0;
  }
}
