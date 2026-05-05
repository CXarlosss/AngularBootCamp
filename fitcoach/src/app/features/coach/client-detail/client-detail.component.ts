import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CoachClientService } from './coach-client.service';
import { ClientKPIs, WeekDay, ExerciseProgress } from './client-detail.types';
import { WeightEntry } from '../../../shared/components/weight-chart/weight-chart.component';
import { ClientSummaryComponent } from './components/client-summary/client-summary.component';
import { ClientProgressComponent } from './components/client-progress/client-progress.component';
import { ClientPhotosComponent } from './components/client-photos/client-photos.component';
import { ClientHistoryComponent } from './components/client-history/client-history.component';
import { ClientIdentityViewComponent } from './components/client-identity-view/client-identity-view.component';
import { supabase } from '../../../core/supabase.client';

type Tab = 'summary' | 'progress' | 'photos' | 'history' | 'identity';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ClientSummaryComponent,
    ClientProgressComponent,
    ClientPhotosComponent,
    ClientHistoryComponent,
    ClientIdentityViewComponent
  ],
  template: `
    <div class="detail-screen">
      <!-- Topbar -->
      <header class="topbar">
        <button class="back-btn" routerLink="/coach/dashboard">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        
        <div class="avatar">{{ clientInitials() }}</div>
        
        <div class="client-info">
          <h2>{{ clientName() }}</h2>
          <div class="sub">
            <span>{{ activeRoutine() || 'Sin rutina asignada' }}</span>
            <span class="dot-sep">•</span>
            <span class="badge" [class.active]="isActiveToday()">
              {{ isActiveToday() ? 'Activo hoy' : 'Sin actividad hoy' }}
            </span>
          </div>
        </div>
        
        <div class="actions">
          <button class="icon-btn chat-btn" (click)="goToChat()">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Tabs -->
      <nav class="tab-row">
        @for (tab of tabs; track tab.key) {
          <button
            class="tab"
            [class.active]="activeTab() === tab.key"
            (click)="setTab(tab.key)">
            {{ tab.label }}
          </button>
        }
      </nav>

      <!-- Content -->
      <div class="tab-content" [class.loading]="loading()">
        @if (loading()) {
          <div class="loader-wrap">
            <div class="loader"></div>
          </div>
        } @else {
          @switch (activeTab()) {
            @case ('summary') {
              <app-client-summary
                [kpis]="kpis()"
                [weekDays]="weekDays()"
                [exerciseProgress]="exerciseProgress()"
                [weightHistory]="weightHistory()"
                [loading]="loading()"
                [clientId]="clientId()" />
            }
            @case ('progress') {
              <app-client-progress [clientId]="clientId()" />
            }
            @case ('photos') {
              <app-client-photos [clientId]="clientId()" />
            }
            @case ('history') {
              <app-client-history [clientId]="clientId()" />
            }
            @case ('identity') {
              <app-client-identity-view [clientId]="clientId()" [clientName]="clientName()" />
            }
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .detail-screen { min-height: 100vh; background: #080a0f; color: white; padding-bottom: 40px; }

    /* Topbar */
    .topbar { display: flex; align-items: center; padding: 16px; gap: 12px; position: sticky; top: 0; background: rgba(8,10,15,0.8); backdrop-filter: blur(10px); z-index: 10; }
    .back-btn { background: none; border: none; color: #888; cursor: pointer; padding: 4px; }
    .avatar { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #1D9E75, #158062); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; color: white; }
    .client-info { flex: 1; }
    .client-info h2 { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
    .sub { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #666; margin-top: 2px; }
    .dot-sep { opacity: 0.3; }
    .badge { padding: 2px 8px; border-radius: 6px; background: rgba(255,255,255,0.05); font-weight: 600; font-size: 10px; text-transform: uppercase; }
    .badge.active { background: rgba(29, 158, 117, 0.1); color: #1D9E75; }

    .actions { display: flex; gap: 8px; }
    .icon-btn { background: rgba(255,255,255,0.05); border: none; color: white; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
    .chat-btn:hover { background: rgba(29, 158, 117, 0.2); color: #1D9E75; }

    /* Tabs */
    .tab-row { display: flex; padding: 4px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); overflow-x: auto; scrollbar-width: none; }
    .tab-row::-webkit-scrollbar { display: none; }
    .tab { background: none; border: none; color: #555; padding: 12px 16px; font-size: 14px; font-weight: 600; cursor: pointer; position: relative; white-space: nowrap; transition: 0.2s; }
    .tab.active { color: #1D9E75; }
    .tab.active::after { content: ''; position: absolute; bottom: 0; left: 16px; right: 16px; height: 3px; background: #1D9E75; border-radius: 3px 3px 0 0; }

    /* Content */
    .tab-content { min-height: 300px; position: relative; }
    .tab-content.loading { opacity: 0.5; }
    
    .loader-wrap { position: absolute; top: 100px; left: 0; right: 0; display: flex; justify-content: center; }
    .loader { width: 30px; height: 30px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #1D9E75; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .placeholder-view { padding: 80px 40px; text-align: center; color: #444; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .placeholder-view p { font-size: 14px; font-weight: 500; }
  `]
})
export class ClientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private coachClient = inject(CoachClientService);

  clientId = signal<string>('');
  clientName = signal<string>('Cargando...');
  activeRoutine = signal<string | null>(null);
  isActiveToday = signal<boolean>(false);
  activeTab = signal<Tab>('summary');
  loading = signal(true);

  kpis = signal<ClientKPIs | null>(null);
  weekDays = signal<WeekDay[]>([]);
  exerciseProgress = signal<ExerciseProgress[]>([]);
  weightHistory = signal<WeightEntry[]>([]);

  tabs: { key: Tab; label: string }[] = [
    { key: 'summary', label: 'Resumen' },
    { key: 'progress', label: 'Progreso' },
    { key: 'photos', label: 'Fotos' },
    { key: 'history', label: 'Historial' },
    { key: 'identity', label: 'Identidad' },
  ];

  clientInitials = computed(() => {
    const name = this.clientName();
    if (name === 'Cargando...') return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  });

  ngOnInit() {
    // Usamos 'clientId' como está en coach.routes.ts actual
    const id = this.route.snapshot.paramMap.get('clientId') || this.route.snapshot.paramMap.get('id') || '';
    if (!id) {
      this.router.navigate(['/coach/dashboard']);
      return;
    }
    this.clientId.set(id);
    this.loadClientInfo(id);
    this.loadData(id);
  }

  async loadClientInfo(id: string) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', id)
      .single();
    
    if (data) {
      this.clientName.set(data.full_name);
    }

    // Consultar rutina activa (simplificado)
    const { data: routine } = await supabase
      .from('client_routines')
      .select('routines(name)')
      .eq('client_id', id)
      .eq('status', 'active')
      .maybeSingle();
    
    if (routine) {
      this.activeRoutine.set((routine as any).routines?.name);
    }

    // Consultar si ha entrenado hoy
    const today = new Date().toISOString().split('T')[0];
    const { data: todayDone } = await supabase
      .from('completed_days')
      .select('id')
      .eq('user_id', id)
      .gte('completed_at', today)
      .maybeSingle();
    
    this.isActiveToday.set(!!todayDone);
  }

  loadData(clientId: string) {
    this.loading.set(true);
    
    forkJoin([
      this.coachClient.getClientKPIs(clientId),
      this.coachClient.getCurrentWeekDays(clientId),
      this.coachClient.getExerciseProgress(clientId),
      this.coachClient.getWeightHistory(clientId),
    ]).subscribe(([kpis, days, progress, weights]) => {
      this.kpis.set(kpis);
      this.weekDays.set(days);
      this.exerciseProgress.set(progress);
      this.weightHistory.set(weights);
      this.loading.set(false);
    });
  }

  setTab(tab: Tab) {
    this.activeTab.set(tab);
  }

  goToChat() {
    this.router.navigate(['/coach/inbox'], { queryParams: { client: this.clientId() } });
  }
}
