import {
  Component, inject, ChangeDetectionStrategy, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ChatStore } from '../../state/chat.store';
import { UnreadMessagesService } from '../messages/unread-messages.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationToastComponent } from '../../core/components/notification-toast/notification-toast.component';
import { NotificationBellComponent } from '../../core/components/notification-bell/notification-bell.component';

@Component({
  selector: 'fc-coach-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, NotificationToastComponent, NotificationBellComponent],
  template: `
    <app-notification-toast />
    <div class="dash-layout">
      <!-- ── Sidebar ── -->
      <nav class="sidebar">
        <div class="sidebar-logo">Fit<span>Coach</span></div>
        
        <!-- Campana de notificaciones en sidebar para coach -->
        <div style="padding: 0 16px 16px;">
          <app-notification-bell />
        </div>

        <div class="nav-section">
          <button class="nav-item" 
            [class.active]="isActive('/coach/dashboard')"
            (click)="goTo('/coach/dashboard')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </button>
          <button class="nav-item" 
            [class.active]="isActive('/coach/clients')"
            (click)="goTo('/coach/clients')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Clientes
          </button>
          <button class="nav-item" 
            [class.active]="isActive('/coach/routine-builder')"
            (click)="goTo('/coach/routine-builder')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6M12 18v-6M9 15h6"/>
            </svg>
            Rutinas
          </button>
          <button class="nav-item" 
            [class.active]="isActive('/coach/inbox')"
            (click)="goTo('/coach/inbox')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Mensajes
            @if (unreadSvc.totalUnread() > 0) {
              <span class="nav-badge">{{ unreadSvc.totalUnread() }}</span>
            }
          </button>
        </div>

        <div class="sidebar-bottom">
          <div class="sidebar-profile">
            <div class="sidebar-av">{{ initials(profile()?.fullName ?? 'CC') }}</div>
            <div>
              <div class="sidebar-name">{{ profile()?.fullName }}</div>
              <div class="sidebar-role">Entrenador</div>
            </div>
          </div>
        </div>
      </nav>

      <!-- ── Main content ── -->
      <main class="dash-main">
        <router-outlet />
      </main>
    </div>
  `,
  styleUrl: './dashboard/coach-dashboard.component.css'
})
export class CoachLayoutComponent implements OnInit {
  auth   = inject(AuthService);
  store  = inject(ChatStore);
  unreadSvc = inject(UnreadMessagesService);
  router = inject(Router);
  private notifSvc = inject(NotificationService);

  profile = this.auth.profile;

  async ngOnInit(): Promise<void> {
    const id = this.profile()?.id;
    if (id) {
      await this.store.loadConversations(id);
      
      // Notificaciones
      await this.notifSvc.load();
      this.notifSvc.subscribe();
    }
  }

  ngOnDestroy() {
    this.notifSvc.unsubscribe();
  }

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }
}
