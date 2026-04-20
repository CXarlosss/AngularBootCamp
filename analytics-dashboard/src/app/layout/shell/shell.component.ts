import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <!-- Sidebar Navigation -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <span class="logo-icon">✨</span>
            <span class="logo-text">DataDash</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <span class="nav-section-title">Main Menu</span>
            
            <a routerLink="/overview" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📊</span>
              <span>Overview</span>
            </a>
            
            <a routerLink="/traffic" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">🌐</span>
              <span>Traffic</span>
            </a>
            
            <a routerLink="/reports" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📄</span>
              <span>Reports</span>
            </a>
          </div>
        </nav>

        <div class="sidebar-footer">
          <button class="nav-item logout-btn">
            <span class="nav-icon">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      height: 100vh;
      background: #f1f5f9;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
    }

    /* Sidebar Styles */
    .sidebar {
      width: 280px;
      background: white;
      border-right: 1px solid rgba(226, 232, 240, 0.8);
      display: flex;
      flex-direction: column;
      z-index: 10;
      box-shadow: 1px 0 10px rgba(0,0,0,0.02);
    }

    .sidebar-header {
      padding: 2rem 1.5rem;
      border-bottom: 1px solid rgba(241, 245, 249, 1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      font-size: 1.5rem;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text;
      background-clip: text;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.025em;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1.5rem 1rem;
      overflow-y: auto;
    }

    .nav-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .nav-section-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 700;
      color: #94a3b8;
      margin-bottom: 0.5rem;
      padding: 0 0.75rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      color: #64748b;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
    }

    .nav-item:hover {
      background: #f8fafc;
      color: #0f172a;
    }

    .nav-item.active {
      background: rgba(59, 130, 246, 0.1);
      color: #2563eb;
    }

    .nav-item.active .nav-icon {
      opacity: 1;
    }

    .nav-icon {
      font-size: 1.2rem;
      opacity: 0.7;
      transition: opacity 0.2s ease;
    }

    .sidebar-footer {
      padding: 1.5rem 1rem;
      border-top: 1px solid rgba(241, 245, 249, 1);
    }

    .logout-btn {
      color: #ef4444;
    }

    .logout-btn:hover {
      background: #fef2f2;
      color: #dc2626;
    }

    /* Main Content Styles */
    .main-content {
      flex: 1;
      overflow-y: auto;
      scroll-behavior: smooth;
    }
    
    .main-content::-webkit-scrollbar {
      width: 8px;
    }
    .main-content::-webkit-scrollbar-track {
      background: transparent;
    }
    .main-content::-webkit-scrollbar-thumb {
      background-color: #cbd5e1;
      border-radius: 20px;
    }
  `]
})
export class ShellComponent {}
