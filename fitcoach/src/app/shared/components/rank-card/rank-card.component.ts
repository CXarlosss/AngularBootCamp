import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RankService, DIVISIONS } from '../../../core/services/rank.service';

@Component({
  selector: 'app-rank-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (svc.rankedUp(); as label) {
      <div class="rankup-banner">
        <span class="rankup-icon">⚡</span>
        <div class="rankup-text">
          <p class="rankup-title">¡ASCENSO!</p>
          <p class="rankup-sub">Has alcanzado {{ label }}</p>
        </div>
      </div>
    }

    @if (svc.fullRank(); as fr) {
      <div class="rank-card" routerLink="/client/rank"
           [style.border-color]="fr.rank.color + '40'">

        <div class="rank-glow"
             [style.background]="'radial-gradient(circle at 50% 0%, ' + fr.rank.color + '15, transparent)'">
        </div>

        <div class="rank-top">
          <div class="rank-emblem"
               [style.border-color]="fr.rank.color + '30'"
               [style.background]="fr.rank.color + '08'">
            {{ fr.rank.emoji }}
          </div>
          <div class="rank-meta">
            <div class="rank-header-row">
              <p class="rank-name" [style.color]="fr.rank.color">
                {{ fr.rank.name }}
              </p>
              <span class="div-badge" 
                    [style.color]="fr.rank.color"
                    [style.border-color]="fr.rank.color + '40'">
                {{ fr.divLabel }}
              </span>
            </div>
            <p class="rank-title">{{ fr.rank.title }}</p>
            
            <!-- PIPS DE DIVISIÓN -->
            <div class="pips">
              @for (d of divisions; track d; let i = $index) {
                <div class="pip"
                     [style.background]="i <= fr.division ? fr.rank.color : 'rgba(255,255,255,0.05)'">
                </div>
              }
            </div>
          </div>
        </div>

        <div class="xp-labels">
          <span class="xp-cur" [style.color]="fr.rank.color">
            {{ fr.pct }}% en Div. {{ fr.divLabel }}
          </span>
          @if (fr.nextLabel) {
            <span class="xp-nxt">{{ svc.athleteRank()?.xpTotal | number }} XP total</span>
          }
        </div>

        <div class="xp-track">
          <div class="xp-fill"
               [style.width.%]="fr.pct"
               [style.background]="fr.rank.color">
          </div>
        </div>

        @if (fr.nextLabel) {
          <p class="xp-hint">Faltan {{ fr.xpToNext | number }} XP para {{ fr.nextLabel }}</p>
        } @else {
          <p class="xp-hint">Rango máximo alcanzado 👑</p>
        }

        <div class="xp-breakdown">
          <span>⚔️ {{ svc.athleteRank()?.daysXp }} d</span>
          <span>💪 {{ svc.athleteRank()?.setsXp }} s</span>
          <span>📈 {{ svc.athleteRank()?.progressXp }} kg</span>
        </div>

      </div>
    }
  `,
  styleUrls: ['./rank-card.component.scss']
})
export class RankCardComponent implements OnInit {
  readonly svc = inject(RankService);
  readonly divisions = DIVISIONS;

  async ngOnInit() {
    await this.svc.load();
  }
}
