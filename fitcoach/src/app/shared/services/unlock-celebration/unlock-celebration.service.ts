// src/app/shared/services/unlock-celebration/unlock-celebration.service.ts

import { Injectable, signal } from '@angular/core';

export type UnlockType = 'color' | 'pattern' | 'frame' | 'rank' | 'badge';

export interface UnlockItem {
  id: string;
  type: UnlockType;
  name: string;
  emoji: string;
  description?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

@Injectable({ providedIn: 'root' })
export class UnlockCelebrationService {
  activeUnlock = signal<UnlockItem | null>(null);

  /**
   * Dispara la celebración épica
   */
  celebrate(item: UnlockItem) {
    this.activeUnlock.set(item);
  }

  /**
   * Cierra el overlay
   */
  dismiss() {
    this.activeUnlock.set(null);
  }
}
