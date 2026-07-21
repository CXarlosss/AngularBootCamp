import {
  Component, OnInit, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileService } from './profile.service';
import { AvatarFrameComponent } from '../../../shared/components/avatar-frame/avatar-frame.component';
import { InitialsPipe }         from '../../../shared/pipes/initials.pipe';
import { RankService }          from '../../../core/services/rank.service';
import { AuthService }          from '../../../core/auth/auth.service';
import { ProfileBannerComponent } from './profile-banner/profile-banner.component';
import { ThemeService, ThemePreference } from '../../../core/services/theme.service';
import { FcCardComponent } from '../../../shared/components/card/fc-card.component';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, InitialsPipe, RouterModule, ProfileBannerComponent, FcCardComponent],
  providers: [ProfileService],
  template: `
    <div class="client-dash">
      <header class="client-header">
        <div class="header-logo">Fit<span>Coach</span></div>
        <button class="back-btn" [routerLink]="isCoach() ? '/coach/dashboard' : '/client/dashboard'">←</button>
      </header>

      <div class="profile-scroll">
        <!-- Banner Reutilizado (Igual que el dashboard) -->
        @if (profile(); as p) {
          <div style="margin: 16px 20px 12px;">
            <app-profile-banner
              [name]="p.full_name"
              [initials]="p.full_name | initials"
              [rankLevel]="rankSvc.fullRank()?.rank?.level ?? 0"
              [rankName]="rankSvc.fullRank()?.rank?.name ?? 'Recruta'"
              [rankEmoji]="rankSvc.fullRank()?.rank?.emoji ?? '⚔️'"
              [divLabel]="rankSvc.fullRank()?.divLabel ?? 'IV'"
              [xpTotal]="rankSvc.athleteRank()?.xpTotal ?? 0"
              [goal]="profileSvc.goalLabel(p.goal)"
              [goalEmoji]="profileSvc.goalEmoji(p.goal)"
              [bannerColor]="p.banner_color ?? 'c0'"
              [bannerPattern]="p.banner_pattern ?? 'p0'"
              [equippedFrame]="p.equipped_frame ?? null" />
          </div>
        }

        <!-- Card de Rango Detallada -->
        <fc-card class="profile-card">
          <div class="xp-container">
            <div class="xp-header">
              <span>Nivel {{ rankSvc.fullRank()?.rank?.level }}</span>
              <span>{{ rankSvc.athleteRank()?.xpTotal | number }} XP</span>
            </div>
            <div class="xp-bar-bg">
              <div class="xp-bar-fill" [style.width.%]="rankSvc.fullRank()?.pct"></div>
            </div>
            <p class="xp-next">Faltan {{ rankSvc.fullRank()?.xpToNext | number }} XP para el siguiente rango</p>
          </div>
        </fc-card>

        <fc-card title="Ajustes de App" class="profile-card">
          <div class="theme-toggle">
            <span class="theme-icon">🌓</span>
            <div class="theme-info">
              <span class="theme-title">Apariencia</span>
            </div>
            <select [value]="themeService.preference()" (change)="onThemeChange($event)" class="theme-select">
              <option value="system">Sistema</option>
              <option value="dark">Oscuro</option>
              <option value="light">Claro</option>
            </select>
          </div>
        </fc-card>

        <!-- Opciones de Personalización -->
        <p class="section-lbl" style="margin-left: 24px;">Personalización</p>
        
        <div class="nav-cards" style="padding: 0 20px;">
          <button class="menu-item" routerLink="frames">
            <span class="menu-icon">🖼️</span>
            <div class="menu-text">
              <span class="menu-title">Marcos de Avatar</span>
              <span class="menu-sub">Cambia el estilo de tu foto</span>
            </div>
            <span class="menu-arrow">→</span>
          </button>

          <button class="menu-item" routerLink="banner">
            <span class="menu-icon">🎨</span>
            <div class="menu-text">
              <span class="menu-title">Banner de Perfil</span>
              <span class="menu-sub">Colores y patrones de fondo</span>
            </div>
            <span class="menu-arrow">→</span>
          </button>
        </div>

        <div style="padding: 32px 20px;">
          <button class="logout-btn" (click)="auth.logout()">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './profile-edit.component.scss',
})
export class ProfileEditComponent implements OnInit {
  auth    = inject(AuthService);
  profileSvc = inject(ProfileService);
  rankSvc = inject(RankService);
  themeService = inject(ThemeService);
  profile = this.profileSvc.profile; 
  isCoach = signal(false);

  async ngOnInit() {
    await this.rankSvc.load();
    await this.profileSvc.load();
    
    // Detectar si es coach para el botón de volver
    const role = (this.auth as any).userRole?.() ?? 'client';
    this.isCoach.set(role === 'coach');
  }

  onThemeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const pref = select.value as ThemePreference;
    this.themeService.setPreference(pref);
  }
}
