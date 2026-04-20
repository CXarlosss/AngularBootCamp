import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface WorkoutCompletedEvent {
  clientId:   string;
  coachId:    string;
  totalSets:  number;
  totalVolume: number;
  clientName: string;
}

@Injectable({ providedIn: 'root' })
export class WorkoutEventsService {
  readonly workoutCompleted$ = new Subject<WorkoutCompletedEvent>();

  emit(event: WorkoutCompletedEvent): void {
    this.workoutCompleted$.next(event);
  }
}
