// src/app/core/services/rank-change-detector.service.ts

import { Injectable, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast/toast.service';
import { UnlockCelebrationService } from '../../shared/services/unlock-celebration/unlock-celebration.service';
import { RankService, FullRank } from './rank.service';

interface StoredRankState {
  tierId: string;
  division: string;
  xpTotal: number;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class RankChangeDetectorService {
  private rankSvc = inject(RankService);
  private toast = inject(ToastService);
  private celebration = inject(UnlockCelebrationService);
  private router = inject(Router);

  private readonly STORAGE_KEY = 'way_last_rank_state';

  constructor() {
    // Effect: detectar cambios cada vez que el rank se actualiza
    effect(() => {
      const current = this.rankSvc.fullRank();
      const athlete = this.rankSvc.athleteRank();
      if (current && athlete) {
        this.checkForChanges(current, athlete.xpTotal);
      }
    });
  }

  /**
   * Llamar esto al iniciar sesión o al entrar al dashboard
   */
  initialize() {
    const current = this.rankSvc.fullRank();
    const athlete = this.rankSvc.athleteRank();
    if (current && athlete) {
      this.checkForChanges(current, athlete.xpTotal, true);
    }
  }

  private checkForChanges(current: FullRank, xpTotal: number, isInit = false) {
    const stored = this.getStoredState();
    
    if (!stored) {
      this.saveState(current, xpTotal);
      return;
    }

    // Detectar subida de tier
    if (current.rank.id !== stored.tierId) {
      this.handleTierUpgrade(stored, current, isInit);
      this.saveState(current, xpTotal);
      return;
    }

    // Detectar subida de división
    if (current.divLabel !== stored.division && this.isHigherDivision(current.divLabel, stored.division)) {
      this.handleDivisionUpgrade(stored, current, isInit);
      this.saveState(current, xpTotal);
      return;
    }

    // Solo XP nuevo
    if (isInit && xpTotal > stored.xpTotal) {
      const gained = xpTotal - stored.xpTotal;
      this.toast.info(`+${gained} XP`, '¡Bienvenido de vuelta, Guerrero!');
    }

    this.saveState(current, xpTotal);
  }

  private handleTierUpgrade(previous: StoredRankState, current: FullRank, isInit: boolean) {
    const newRank = current.rank;
    
    this.celebration.celebrate({
      id: `rank_${newRank.id}`,
      type: 'rank',
      name: `${newRank.name} ${current.divLabel}`,
      emoji: newRank.emoji,
      rarity: this.tierToRarity(newRank.id),
      description: `¡Has ascendido al rango de ${newRank.name}! ${newRank.quote}`,
    });

    setTimeout(() => {
      this.toast.unlock(
        `¡${newRank.emoji} ${newRank.name}!`,
        `Nivel superado: ${this.getTierName(previous.tierId)}`
      );
    }, 800);

    if (isInit) {
      setTimeout(() => {
        this.router.navigate(['/client/profile/frames']);
      }, 5000);
    }
  }

  private handleDivisionUpgrade(previous: StoredRankState, current: FullRank, isInit: boolean) {
    this.toast.success(
      `¡División ${current.divLabel}!`,
      `Has ascendido en la legión de ${current.rank.name}`
    );
  }

  private getStoredState(): StoredRankState | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private saveState(full: FullRank, xp: number) {
    const state: StoredRankState = {
      tierId: full.rank.id,
      division: full.divLabel,
      xpTotal: xp,
      timestamp: Date.now(),
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  }

  private getTierName(tierId: string): string {
    const names: Record<string, string> = {
      recruit: 'Recruta',
      legionary: 'Legionario',
      centurion: 'Centurión',
      tribune: 'Tribuno',
      demigod: 'Semidiós',
      zeus: 'Zeus Eterno',
    };
    return names[tierId] ?? tierId;
  }

  private tierToRarity(tierId: string): 'common' | 'rare' | 'epic' | 'legendary' {
    const map: Record<string, any> = {
      recruit: 'common',
      legionary: 'rare',
      centurion: 'rare',
      tribune: 'epic',
      demigod: 'legendary',
      zeus: 'legendary',
    };
    return map[tierId] ?? 'common';
  }

  private isHigherDivision(current: string, previous: string): boolean {
    const order = ['IV', 'III', 'II', 'I'];
    return order.indexOf(current) > order.indexOf(previous);
  }

  reset() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
