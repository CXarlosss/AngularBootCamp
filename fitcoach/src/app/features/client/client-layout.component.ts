import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'fc-client-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="client-layout">
      
      <main class="content-area">
        <router-outlet></router-outlet>
      </main>

      <nav class="bottom-nav">
        <button 
          class="nav-btn" 
          [class.active]="isActive('/client/dashboard')"
          (click)="navigate('/client/dashboard')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span>Inicio</span>
        </button>

        <button 
          class="nav-btn" 
          [class.active]="isActive('/client/workout')"
          (click)="navigate('/client/workout')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 5v14M18 5v14M2 9h4M18 9h4M2 15h4M18 15h4"/></svg>
          <span>Entreno</span>
        </button>

        <button 
          class="nav-btn" 
          [class.active]="isActive('/client/progress')"
          (click)="navigate('/client/progress')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
          <span>Progreso</span>
        </button>

        <button 
          class="nav-btn" 
          [class.active]="isActive('/client/chat')"
          (click)="navigate('/client/chat')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>Chat</span>
        </button>
      </nav>

    </div>
  `,
  styles: [`
    .client-layout {
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
      /* Espacio para el footer */
      padding-bottom: 20px; 
    }

    /* La bottom-nav ya tiene estilos globales en styles.css, 
       pero nos aseguramos de que aquí se vea bien */
    .bottom-nav {
      flex-shrink: 0;
    }
  `]
})
export class ClientLayoutComponent {
  private router = inject(Router);

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }
}
