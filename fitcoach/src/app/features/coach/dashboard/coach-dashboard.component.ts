import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { UnreadMessagesService } from '../../messages/unread-messages.service';
import { CoachDashboardService } from './coach-dashboard.service';
import { ClientCardComponent } from './components/client-card/client-card.component';
import { supabase } from '../../../core/supabase.client';
import { InviteModalComponent } from './invite-modal/invite-modal.component';

@Component({
  selector: 'fc-coach-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ClientCardComponent, InviteModalComponent],
  templateUrl: './coach-dashboard.component.html',
  styleUrl: './coach-dashboard.component.css',
})
export class CoachDashboardComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private dashboard = inject(CoachDashboardService);
  readonly unreadSvc = inject(UnreadMessagesService);
  private sb = supabase;
  private router = inject(Router);

  profile = this.auth.profile;
  today = new Date();

  clients = signal<any[]>([]);
  loading = signal(true);
  inviteCode = signal<string>('—');
  sessionsThisWeek = signal(0);
  recentActivity = signal<any[]>([]);
  showInviteModal = signal(false);

  greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 20) return 'Buenas tardes';
    return 'Buenas noches';
  };

  async ngOnInit() {
    const coachId = this.auth.profile()?.id;
    if (!coachId) return;

    try {
      // Cargar todo en paralelo
      const [clientsData, _] = await Promise.all([
        this.dashboard.getClients(coachId),
        this.unreadSvc.loadUnread(coachId),
        this.loadStats(coachId)
      ]);

      this.clients.set(clientsData);
      this.loading.set(false);

      // Suscribir realtime
      this.unreadSvc.subscribeRealtime(coachId);
    } catch (e) {
      console.error('Error loading dashboard:', e);
      this.loading.set(false);
    }
  }

  private async loadStats(coachId: string) {
    // Código de invitación
    const { data: code } = await this.sb
      .from('invite_codes')
      .select('code')
      .eq('coach_id', coachId)
      .limit(1)
      .maybeSingle();
    if (code) this.inviteCode.set(code.code);

    // Sesiones esta semana (proxy simplificado)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count } = await this.sb
      .from('workout_logs')
      .select('id', { count: 'exact', head: true })
      .eq('completed', true)
      .gte('logged_date', weekAgo.toISOString().split('T')[0]);
    this.sessionsThisWeek.set(count ?? 0);
  }

  ngOnDestroy() {
    this.unreadSvc.unsubscribe();
  }

  copyCode(): void {
    navigator.clipboard?.writeText(this.inviteCode());
  }

  shareCode(): void {
    const text = `Únete a mis entrenamientos con el código: ${this.inviteCode()}`;
    if (navigator.share) navigator.share({ text });
    else this.copyCode();
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
}
