import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        loadChildren: () => 
          import('./features/overview/overview.routes')
            .then(m => m.OVERVIEW_ROUTES),
        title: 'Overview — Analytics Dashboard'
      },
      {
        path: 'traffic',
        loadChildren: () => 
          import('./features/traffic/traffic.routes')
            .then(m => m.TRAFFIC_ROUTES),
        title: 'Traffic — Analytics Dashboard'
      },
      {
        path: 'reports',
        loadChildren: () => 
          import('./features/reports/reports.routes')
            .then(m => m.REPORTS_ROUTES),
        title: 'Reports — Analytics Dashboard'
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => 
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent),
    title: 'Login'
  },
  { path: '**', redirectTo: '' }
];
