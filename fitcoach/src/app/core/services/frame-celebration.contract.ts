import { InjectionToken } from '@angular/core';
import { StreakMilestoneEvent } from '../models/streak.model';

export interface FrameCelebrationServiceLike {
  celebrate(event: StreakMilestoneEvent | Record<string, unknown>): void;
}

export const FRAME_CELEBRATION_SERVICE = new InjectionToken<FrameCelebrationServiceLike>(
  'FRAME_CELEBRATION_SERVICE'
);
