import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { UnreadMessagesService } from '../messages/unread-messages.service';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from './profile/profile.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationToastComponent } from '../../core/components/notification-toast/notification-toast.component';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';
import { UnlockCelebrationComponent } from '../../shared/components/unlock-celebration/unlock-celebration.component';
import { RankChangeDetectorService } from '../../core/services/rank-change-detector.service';
import { FcButtonDirective } from '../../shared/components/button/fc-button.directive';

@Component({
  selector: 'fc-client-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterModule, 
    NotificationToastComponent,
    ToastContainerComponent,
    UnlockCelebrationComponent,
    FcButtonDirective
  ],
  template: `
    <!-- Capas de feedback (Z-Index alto pero no bloqueantes) -->
    <app-notification-toast />
    <app-toast-container />
    <app-unlock-celebration />

    <main class="content-area">
      <router-outlet></router-outlet>
    </main>

    <nav class="bottom-nav">
      <a 
        fcButton variant="nav" 
        routerLink="/client/dashboard"
        routerLinkActive="active"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        <span>Inicio</span>
      </a>

      <a 
        fcButton variant="nav" 
        routerLink="/client/workout"
        routerLinkActive="active"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 5v14M18 5v14M2 9h4M18 9h4M2 15h4M18 15h4"/></svg>
        <span>Entreno</span>
      </a>

      <a 
        fcButton variant="nav" 
        routerLink="/client/progress"
        routerLinkActive="active"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
        <span>Progreso</span>
      </a>

      <a 
        fcButton variant="nav" 
        routerLink="/client/chat"
        routerLinkActive="active"
      >
        <div class="icon-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          @if (unreadSvc.totalUnread() > 0) {
            <span class="unread-badge">{{ unreadSvc.totalUnread() }}</span>
          }
        </div>
        <span>Chat</span>
      </a>
      <a 
        fcButton variant="nav" 
        routerLink="/client/profile"
        routerLinkActive="active"
      >
        <div class="icon-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          @if (!profileSvc.profile()?.profile_completed) {
            <span class="nav-badge-dot"></span>
          }
        </div>
        <span>Perfil</span>
      </a>
    </nav>
  `,
  styles: [`
    :host {
      height: 100vh;
      height: 100dvh;
      display: flex;
      flex-direction: column;
      background: var(--c-bg);
      position: relative;
      overflow: hidden;
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
      scroll-behavior: smooth;
      display: flex;
      flex-direction: column;
    }

    .icon-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
    
    .unread-badge {
      position: absolute;
      top: -6px; right: -8px;
      background: #E24B4A;
      color: white;
      font-size: 9px;
      font-weight: 600;
      min-width: 16px; height: 16px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid #000;
      padding: 0 4px;
    }
    .nav-badge-dot {
      position: absolute;
      top: -2px; right: -2px;
      width: 8px; height: 8px;
      background: #1D9E75;
      border-radius: 50%;
      border: 1.5px solid #000;
    }
  `]
})
export class ClientLayoutComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private auth = inject(AuthService);
  unreadSvc = inject(UnreadMessagesService);
  profileSvc = inject(ProfileService);
  private notifSvc = inject(NotificationService);
  private rankDetector = inject(RankChangeDetectorService);

  async ngOnInit() {
    const userId = this.auth.profile()?.id;
    if (userId) {
      this.unreadSvc.loadUnread(userId);
      this.unreadSvc.subscribeRealtime(userId);
      
      await this.notifSvc.load();
      this.notifSvc.subscribe();
      this.rankDetector.initialize();
    }
  }

  ngOnDestroy() {
    this.unreadSvc.unsubscribe();
    this.notifSvc.unsubscribe();
  }
}
