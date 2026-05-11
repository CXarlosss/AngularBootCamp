import { Injectable, signal, computed } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

interface UndoableAction {
  id: string;
  type: 'set_logged' | 'workout_completed' | 'weight_recorded';
  payload: any;
  timestamp: number;
  graceMs: number;
  undoFn: () => Promise<boolean>;
  isProcessing?: boolean; // 🔒 Lock para evitar race conditions
  metadata?: Record<string, any>;
}

@Injectable({ providedIn: 'root' })
export class UndoService {
  private actions = signal<UndoableAction[]>([]);
  private readonly DEFAULT_GRACE_MS = 5000;
  
  readonly activeActions = computed(() => 
    this.actions().filter(a => Date.now() - a.timestamp < a.graceMs)
  );
  
  readonly hasUndoableWorkout = computed(() => 
    this.activeActions().some(a => a.type === 'workout_completed')
  );

  /**
   * Registrar una acción undoable
   */
  async registerAction(action: Omit<UndoableAction, 'timestamp'>): Promise<string> {
    const fullAction: UndoableAction = {
      ...action,
      timestamp: Date.now()
    };
    
    this.actions.update(list => [...list, fullAction]);
    
    // Auto-limpiar después del grace period
    setTimeout(() => {
      this.actions.update(list => list.filter(a => a.id !== fullAction.id));
    }, fullAction.graceMs);
    
    return fullAction.id;
  }

  /**
   * Ejecutar undo
   */
  async undo(actionId: string): Promise<boolean> {
    const action = this.actions().find(a => a.id === actionId);
    if (!action) {
      throw new Error('Grace period expired or action not found');
    }
    
    // 🔒 Lock para evitar doble-click o race condition
    if (action.isProcessing) return false;
    action.isProcessing = true;
    
    try {
      const success = await action.undoFn();
      
      if (success) {
        this.actions.update(list => list.filter(a => a.id !== actionId));
      } else {
        // Liberar lock si falló
        action.isProcessing = false;
      }
      
      return success;
    } catch (err) {
      action.isProcessing = false;
      throw err;
    }
  }

  /**
   * Crear undo para finalización de entrenamiento
   */
  createWorkoutUndo(
    workoutLogId: string,
    supabase: SupabaseClient,
    xpService: any
  ): Promise<string> {
    return this.registerAction({
      id: `workout_${workoutLogId}`,
      type: 'workout_completed',
      payload: { workoutLogId },
      graceMs: this.DEFAULT_GRACE_MS,
      undoFn: async () => {
        try {
          // Soft delete: marcar como cancelled
          const { error } = await supabase
            .from('workout_logs')
            .update({ 
              status: 'cancelled', 
              cancelled_at: new Date().toISOString() 
            })
            .eq('id', workoutLogId);
          
          if (error) throw error;
          
          // Revertir XP (llamar a edge function)
          await xpService.revertWorkoutXP(workoutLogId);
          
          return true;
        } catch (err) {
          console.error('Undo failed:', err);
          return false;
        }
      }
    });
  }
}
