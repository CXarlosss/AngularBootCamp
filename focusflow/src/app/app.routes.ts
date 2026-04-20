import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/tasks/task-list.component')
        .then(m => m.TaskListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'focus/:taskId',
    loadComponent: () =>
      import('./features/focus/focus-mode.component')
        .then(m => m.FocusModeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/login.component')
        .then(m => m.LoginComponent),
  },
];
