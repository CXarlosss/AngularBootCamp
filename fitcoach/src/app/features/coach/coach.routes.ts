import { Routes } from '@angular/router';

export const COACH_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/coach-dashboard.component')
        .then(m => m.CoachDashboardComponent),
  },
  {
    path: 'routine-builder',
    loadComponent: () =>
      import('./routine-builder/routine-builder.component')
        .then(m => m.RoutineBuilderComponent),
  },
  {
    path: 'routine-builder/:id',    // editar rutina existente
    loadComponent: () =>
      import('./routine-builder/routine-builder.component')
        .then(m => m.RoutineBuilderComponent),
  },
  {
    path: 'clients',
    loadComponent: () =>
      import('./clients/coach-clients.component')
        .then(m => m.CoachClientsComponent),
  },
  {
    path: 'clients/:clientId',
    loadComponent: () =>
      import('./client-detail/client-detail.component')
        .then(m => m.ClientDetailComponent),
  },
  {
    path: 'inbox',
    loadComponent: () =>
      import('./inbox/coach-inbox.component')
        .then(m => m.CoachInboxComponent),
  },
  {
    path: 'invite-codes',
    loadComponent: () =>
      import('./invite-codes/invite-codes.component')
        .then(m => m.InviteCodesComponent),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
