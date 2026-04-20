import { Routes } from '@angular/router';

export const CLIENT_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/client-dashboard.component')
        .then(m => m.ClientDashboardComponent),
  },
  {
    path: 'workout',
    loadComponent: () =>
      import('./today-workout/today-workout.component')
        .then(m => m.TodayWorkoutComponent),
  },
  {
    path: 'progress',
    loadComponent: () =>
      import('./progress/client-progress.component')
        .then(m => m.ClientProgressComponent),
  },
  {
    path: 'chat',
    loadComponent: () =>
      import('./chat/client-chat.component')
        .then(m => m.ClientChatComponent),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
