import {
  Component, inject, signal,
  ChangeDetectionStrategy, OnInit
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CoachService } from '../../../core/services/coach.service';
import { Profile } from '../../../core/models/profile.model';
import { supabase } from '../../../core/supabase.client';

@Component({
  selector: 'fc-coach-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe],
  templateUrl: './coach-dashboard.component.html',
  styleUrl: './coach-dashboard.component.css',
})
export class CoachDashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private coachSvc = inject(CoachService);
  private router = inject(Router);
  private sb = supabase;

  profile        = this.auth.profile;
  clients        = signal<Profile[]>([]);
  inviteCode     = signal<string>('—');
  unreadCount    = signal(0);
  sessionCount   = signal(0);
  recentActivity = signal<any[]>([]);
  today          = new Date();

  greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 20) return 'Buenas tardes';
    return 'Buenas noches';
  };

  initials = (name: string) =>
    name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();

  async ngOnInit(): Promise<void> {
    const id = this.profile()?.id;
    if (!id) return;

    try {
      // Cargar clientes
      const clients = await this.coachSvc.getClients(id);
      this.clients.set(clients);

      // Cargar código de invitación activo — si no hay, generar uno nuevo
      const { data: codes } = await this.sb
        .from('invite_codes')
        .select('code')
        .eq('coach_id', id)
        .is('used_by', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (codes?.length) {
        this.inviteCode.set(codes[0].code);
      } else {
        // No hay código disponible → generar uno nuevo automáticamente
        const newCode = await this.generateNewInviteCode(id);
        if (newCode) this.inviteCode.set(newCode);
      }

      // Contar mensajes no leídos
      const { count } = await this.sb
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', id)
        .neq('status', 'read');
      this.unreadCount.set(count ?? 0);

      // Cargar actividad reciente (mensajes de sistema)
      const { data: msgs } = await this.sb
        .from('messages')
        .select('id, content, created_at')
        .eq('receiver_id', id)
        .eq('type', 'system')
        .order('created_at', { ascending: false })
        .limit(5);

      this.recentActivity.set(
        (msgs ?? []).map(m => ({
          id:        m.id,
          content:   m.content,
          createdAt: new Date(m.created_at),
        }))
      );

      // Sesiones esta semana
      const monday = new Date();
      monday.setDate(monday.getDate() - monday.getDay() + 1);
      monday.setHours(0, 0, 0, 0);
      
      if (clients && clients.length > 0) {
        const { count: sessions } = await this.sb
          .from('workout_logs')
          .select('id', { count: 'exact', head: true })
          .in('client_id', clients.map(c => c.id))
          .eq('completed', true)
          .gte('logged_date', monday.toISOString().split('T')[0]);
        this.sessionCount.set(sessions ?? 0);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  /** Genera un nuevo código de invitación único en Supabase */
  private async generateNewInviteCode(coachId: string): Promise<string | null> {
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    const name = (this.profile()?.fullName ?? 'COACH').split(' ')[0].toUpperCase();
    const code = `${name}-${suffix}`;
    const { error } = await this.sb
      .from('invite_codes')
      .insert({ code, coach_id: coachId });
    if (error) {
      console.error('❌ Error generando código:', error.message, '| code:', error.code);
      return null;
    }
    console.log('✅ Nuevo código generado:', code);
    return code;
  }

  formatTime(date: Date): string {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60)  return `hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `hace ${hrs}h`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }

  goTo(path: string): void { this.router.navigate([path]); }

  copyCode(): void {
    navigator.clipboard?.writeText(this.inviteCode());
  }

  shareCode(): void {
    const text = `Únete a mis entrenamientos con el código: ${this.inviteCode()}`;
    if (navigator.share) navigator.share({ text });
    else this.copyCode();
  }
}
