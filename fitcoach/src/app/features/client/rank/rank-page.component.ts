import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RankService, RANKS, DIVISIONS } from '../../../core/services/rank.service';

@Component({
  selector: 'app-rank-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="rank-page">
      <header class="rank-header">
        <button class="btn-back" (click)="router.navigate(['/client/dashboard'])">←</button>
        <h1>Camino al Olimpo</h1>
        <div class="header-spacer"></div>
      </header>

      @if (svc.athleteRank(); as rank) {
        @if (svc.fullRank(); as fr) {
          <div class="scroll-container">
            <!-- Hero Section -->
            <section class="rank-hero" [style.border-color]="fr.rank.color + '40'">
              <div class="hero-glow" [style.background]="fr.rank.color + '10'"></div>
              
              <div class="hero-content">
                <div class="hero-emblem" [style.border-color]="fr.rank.color + '40'">
                  {{ fr.rank.emoji }}
                </div>
                <div class="hero-text">
                  <h2 [style.color]="fr.rank.color">
                    {{ fr.rank.name }} {{ fr.divLabel }}
                  </h2>
                  <p class="hero-title">{{ fr.rank.title }}</p>
                  <p class="hero-quote">{{ fr.rank.quote }}</p>
                </div>
              </div>

              <div class="hero-progress">
                <div class="xp-labels">
                  <span>{{ fr.pct }}% en División {{ fr.divLabel }}</span>
                  @if (fr.nextLabel) {
                    <span>{{ fr.xpToNext | number }} XP para {{ fr.nextLabel }}</span>
                  }
                </div>
                <div class="xp-track">
                  <div class="xp-fill" [style.width.%]="fr.pct" [style.background]="fr.rank.color"></div>
                </div>
              </div>

              <div class="stats-grid">
                <div class="stat-card">
                  <span class="stat-val">{{ rank.daysXp }}</span>
                  <span class="stat-lbl">Entrenamientos</span>
                </div>
                <div class="stat-card">
                  <span class="stat-val">{{ rank.setsXp }}</span>
                  <span class="stat-lbl">Series Totales</span>
                </div>
                <div class="stat-card">
                  <span class="stat-val">{{ rank.progressXp }}</span>
                  <span class="stat-lbl">Kg Mejorados</span>
                </div>
              </div>
            </section>

            <!-- Ladder Section -->
            <section class="ladder-section">
              <h3>Los 6 Rangos del Atleta</h3>
              <div class="ladder">
                @for (r of allRanks; track r.level) {
                  <div class="rung" 
                       [class.active]="r.level === fr.rank.level"
                       [class.locked]="r.level > fr.rank.level"
                       [style.border-color]="r.level === fr.rank.level ? r.color + '50' : ''">
                    
                    <div class="rung-emblem" [style.color]="r.level <= fr.rank.level ? r.color : ''">
                      {{ r.emoji }}
                    </div>
                    <div class="rung-info">
                      <p class="rung-name" [style.color]="r.level <= fr.rank.level ? r.color : ''">
                        {{ r.name }}
                      </p>
                      
                      <!-- PIPS DE DIVISIÓN EN LADDER -->
                      <div class="rung-pips">
                        @for (d of divisions; track d; let di = $index) {
                          <div class="rung-pip"
                               [style.background]="
                                 r.level < fr.rank.level || (r.level === fr.rank.level && di <= fr.division)
                                   ? r.color : 'rgba(255,255,255,0.05)'">
                          </div>
                        }
                      </div>
                    </div>

                    @if (r.level < fr.rank.level) {
                      <span class="status-pill done">Completado</span>
                    } @else if (r.level === fr.rank.level) {
                      <span class="status-pill current" 
                            [style.background]="r.color + '20'" 
                            [style.color]="r.color">
                        {{ fr.divLabel }}
                      </span>
                    } @else {
                      <span class="status-pill locked">Bloqueado</span>
                    }
                  </div>
                }
              </div>
            </section>

            <!-- Guide Section -->
            <section class="guide-section">
              <h3>Cómo Ganar XP</h3>
              <div class="guide-grid">
                <div class="guide-item">
                  <span class="guide-icon">⚔️</span>
                  <div class="guide-text">
                    <p>+10 XP por día</p>
                    <span>Por cada entrenamiento finalizado</span>
                  </div>
                </div>
                <div class="guide-item">
                  <span class="guide-icon">💪</span>
                  <div class="guide-text">
                    <p>+1 XP por serie</p>
                    <span>Por cada set registrado con éxito</span>
                  </div>
                </div>
                <div class="guide-item">
                  <span class="guide-icon">📈</span>
                  <div class="guide-text">
                    <p>+50 XP por mejora</p>
                    <span>Por cada kg extra sobre tu récord</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        }
      }
    </div>
  `,
  styleUrls: ['./rank-page.component.scss']
})
export class RankPageComponent implements OnInit {
  readonly svc = inject(RankService);
  readonly router = inject(Router);
  readonly allRanks = RANKS;
  readonly divisions = DIVISIONS;

  async ngOnInit() {
    await this.svc.load();
  }
}
